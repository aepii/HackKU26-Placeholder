import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArchSchema } from "../types/chart.types";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";

const SHARE_BASE = "http://localhost:8081/share"; // swap for production domain

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const schema: ArchSchema = JSON.parse(raw);

  const copyShareLink = async () => {
    if (!schema.share_token) return;
    await Clipboard.setStringAsync(`${SHARE_BASE}/${schema.share_token}`);
    Alert.alert("Copied!", "Share link copied to clipboard.");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.canvasCard}>
        <ArchCanvas nodes={schema.nodes} edges={schema.edges} />
      </View>

      {schema.share_token && (
        <TouchableOpacity style={styles.shareBtn} onPress={copyShareLink}>
          <Text style={styles.shareBtnText}>🔗 Copy Share Link</Text>
        </TouchableOpacity>
      )}

      <FeedbackPanel feedback={schema.feedback} />
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
  shareBtn: {
    backgroundColor: "#1d9e75",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  shareBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});
