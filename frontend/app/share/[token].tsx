import { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { getSharedArchitecture } from "../../api";
import { ArchSchema } from "../../types/chart.types";
import ArchCanvas from "../../components/ArchCanvas";
import FeedbackPanel from "../../components/FeedbackPanel";

export default function ShareScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [schema, setSchema] = useState<ArchSchema | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSharedArchitecture(token)
      .then(setSchema)
      .catch(() => setError("This share link is invalid or has expired."));
  }, [token]);

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!schema) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d9e75" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.badge}>🔗 Shared Architecture</Text>
      <View style={styles.canvasCard}>
        <ArchCanvas nodes={schema.nodes} edges={schema.edges} />
      </View>
      <FeedbackPanel feedback={schema.feedback} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { color: "#ef4444", fontSize: 15 },
  badge: { fontSize: 13, color: "#64748b", textAlign: "center" },
  canvasCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    height: 350,
  },
});
