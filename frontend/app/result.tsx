import { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArchSchema, ImprovedSchema } from "../types/chart.types";
import { improveArchitecture } from "../api";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";
import ImprovementsPanel from "../components/ImprovementsPanel";

const SHARE_BASE = "http://localhost:8081/share";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const router = useRouter();
  const schema: ArchSchema = JSON.parse(raw);

  const [improved, setImproved] = useState<ImprovedSchema | null>(null);
  const [improving, setImproving] = useState(false);

  const current = improved ?? schema;

  const copyShareLink = async () => {
    if (!schema.share_token) return;
    await Clipboard.setStringAsync(`${SHARE_BASE}/${schema.share_token}`);
    Alert.alert("Copied!", "Share link copied to clipboard.");
  };

  const handleImprove = async () => {
    setImproving(true);
    try {
      const result = await improveArchitecture(
        current.nodes,
        current.edges,
        current.feedback,
      );
      setImproved(result);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Something went wrong");
    } finally {
      setImproving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.canvasCard}>
        <ArchCanvas
          nodes={current.nodes}
          edges={current.edges}
          zones={current.zones ?? []}
        />
      </View>

      <View style={styles.row}>
        {schema.share_token && (
          <TouchableOpacity style={styles.shareBtn} onPress={copyShareLink}>
            <Text style={styles.shareBtnText}>🔗 Copy Share Link</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.improveBtn, improving && styles.disabled]}
          onPress={handleImprove}
          disabled={improving}
        >
          {improving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.improveBtnText}>✨ Improve</Text>
          )}
        </TouchableOpacity>
      </View>

      {improved && <ImprovementsPanel improvements={improved.improvements} />}
      <FeedbackPanel feedback={current.feedback} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 16 },
  canvasCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    height: 350,
  },
  row: { flexDirection: "row", gap: 10 },
  shareBtn: {
    flex: 1,
    backgroundColor: "#0ea5e9",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  improveBtn: {
    flex: 1,
    backgroundColor: "#1d9e75",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  improveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  disabled: { opacity: 0.6 },
});
