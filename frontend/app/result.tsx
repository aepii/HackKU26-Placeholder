import { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArchSchema, ImprovedSchema, NodeSchema } from "../types/chart.types";
import { improveArchitecture } from "../api";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";
import ImprovementsPanel from "../components/ImprovementsPanel";
import AskPanel from "../components/AskPanel";
import SummaryCard from "../components/SummaryCard";
import { theme } from "../constants/theme";

const SHARE_BASE = "http://localhost:8081/share";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const schema: ArchSchema = JSON.parse(raw);

  const [nodes, setNodes] = useState<NodeSchema[]>(schema.nodes);
  const [improved, setImproved] = useState<ImprovedSchema | null>(null);
  const [improving, setImproving] = useState(false);
  const [threatMode, setThreatMode] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  // When improved, use improved nodes/edges/zones/feedback but keep local node state for annotations
  const currentEdges = improved?.edges ?? schema.edges;
  const currentZones = improved?.zones ?? schema.zones ?? [];
  const currentFeedback = improved?.feedback ?? schema.feedback;
  const currentSummary = improved?.summary ?? schema.summary;

  const copyShareLink = async () => {
    if (!schema.share_token) return;
    await Clipboard.setStringAsync(`${SHARE_BASE}/${schema.share_token}`);
    alert("Share link copied!");
  };

  const handleImprove = async () => {
    setImproving(true);
    try {
      const result = await improveArchitecture(
        nodes,
        currentEdges,
        currentFeedback,
      );
      setImproved(result);
      // Merge improved nodes with any local annotations already saved
      setNodes((prev) =>
        result.nodes.map((n) => {
          const existing = prev.find((p) => p.id === n.id);
          return existing?.annotation
            ? { ...n, annotation: existing.annotation }
            : n;
        }),
      );
    } catch (e: any) {
      alert(e.response?.data?.detail || "Something went wrong");
    } finally {
      setImproving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Confidence banner */}
      {schema.confidence !== undefined && (
        <View
          style={[
            styles.confidenceBanner,
            schema.confidence >= 0.85
              ? styles.confHigh
              : schema.confidence >= 0.6
                ? styles.confMed
                : styles.confLow,
          ]}
        >
          <View style={styles.confLeft}>
            <Text style={styles.confLabel}>Diagram Confidence</Text>
            <Text style={styles.confReason} numberOfLines={2}>
              {schema.confidence_reason || "Analyzed by Gemini Vision"}
            </Text>
          </View>
          <View style={styles.confRight}>
            <Text style={styles.confScore}>
              {Math.round(schema.confidence * 100)}%
            </Text>
            <Text style={styles.confEmoji}>
              {schema.confidence >= 0.85
                ? "✓"
                : schema.confidence >= 0.6
                  ? "~"
                  : "!"}
            </Text>
          </View>
        </View>
      )}

      {(schema.image_url || schema.image_filename) && (
        <TouchableOpacity
          style={styles.originalToggle}
          onPress={() => setShowOriginal((s) => !s)}
        >
          <Text style={styles.originalToggleText}>
            {showOriginal ? "📊 Show Diagram" : "📷 Show Original"}
          </Text>
        </TouchableOpacity>
      )}

      {/* Canvas */}
      <View style={styles.canvasCard}>
        {showOriginal && (schema.image_url || schema.image_filename) ? (
          <Image
            source={{
              uri:
                schema.image_url ??
                `http://localhost:8000/uploads/${schema.image_filename}`,
            }}
            style={{ width: "100%", height: "100%" }}
            resizeMode="contain"
          />
        ) : (
          <ArchCanvas
            nodes={nodes}
            edges={currentEdges}
            zones={currentZones}
            threatMode={threatMode}
            setNodes={setNodes}
          />
        )}
      </View>

      {currentSummary && <SummaryCard summary={currentSummary} />}

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
      <FeedbackPanel feedback={currentFeedback} />
      <AskPanel nodes={nodes} edges={currentEdges} zones={currentZones} />
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
  confidenceBanner: {
    borderRadius: theme.radius.md,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
  },
  confHigh: { backgroundColor: "#f0faf4", borderColor: "#b6dfc8" },
  confMed: { backgroundColor: "#fffbeb", borderColor: "#fde68a" },
  confLow: { backgroundColor: "#fef2f2", borderColor: "#fecaca" },
  confLeft: { flex: 1, gap: 3 },
  confLabel: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  confReason: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  confRight: { alignItems: "center", gap: 2, paddingLeft: 12 },
  confScore: {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    color: theme.colors.text,
    lineHeight: 32,
  },
  confEmoji: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  originalToggle: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  originalToggleText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
