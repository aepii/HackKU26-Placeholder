import { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArchSchema, ImprovedSchema } from "../types/chart.types";
import { improveArchitecture } from "../api";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";
import ImprovementsPanel from "../components/ImprovementsPanel";
import { theme } from "../constants/theme";

const SHARE_BASE = "http://localhost:8081/share";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const schema: ArchSchema = JSON.parse(raw);

  const [improved, setImproved] = useState<ImprovedSchema | null>(null);
  const [improving, setImproving] = useState(false);
  const [threatMode, setThreatMode] = useState(false);

  const current = improved ?? schema;

  const copyShareLink = async () => {
    if (!schema.share_token) return;
    await Clipboard.setStringAsync(`${SHARE_BASE}/${schema.share_token}`);
    alert("Share link copied!");
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
      alert(e.response?.data?.detail || "Something went wrong");
    } finally {
      setImproving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Canvas — full chalkboard */}
      <View style={styles.canvasCard}>
        <ArchCanvas
          nodes={current.nodes}
          edges={current.edges}
          zones={current.zones ?? []}
          threatMode={threatMode}
        />
      </View>

      {/* Action pills */}
      <View style={styles.pillRow}>
        {schema.share_token && (
          <TouchableOpacity style={styles.pill} onPress={copyShareLink}>
            <Text style={styles.pillText}>🔗 Share</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.pill, threatMode && styles.pillThreat]}
          onPress={() => setThreatMode((t) => !t)}
        >
          <Text style={[styles.pillText, threatMode && styles.pillThreatText]}>
            🛡️ {threatMode ? "Threat ON" : "Threat"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Improve button */}
      <TouchableOpacity
        style={[styles.improveBtn, improving && styles.disabled]}
        onPress={handleImprove}
        disabled={improving}
      >
        {improving ? (
          <ActivityIndicator color={theme.colors.chalk} />
        ) : (
          <Text style={styles.improveBtnText}>✦ Improve Architecture</Text>
        )}
      </TouchableOpacity>

      {improved && <ImprovementsPanel improvements={improved.improvements} />}
      <FeedbackPanel feedback={current.feedback} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 16, gap: 14 },
  canvasCard: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    height: 420,
    borderWidth: 2,
    borderColor: theme.colors.boardDark,
  },

  pillRow: { flexDirection: "row", gap: 8 },
  pill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  pillText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 14,
    color: theme.colors.text,
  },
  pillThreat: {
    backgroundColor: theme.colors.accentRed,
    borderColor: theme.colors.accentRed,
  },
  pillThreatText: { color: "white" },

  improveBtn: {
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.board,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  improveBtnText: {
    fontFamily: theme.fonts.display,
    fontSize: 22,
    color: theme.colors.chalk,
  },
  disabled: { opacity: 0.6 },
});
