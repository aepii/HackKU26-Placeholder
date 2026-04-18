import { useState } from "react";
import { View, ScrollView, StyleSheet, TouchableOpacity,
         Text, ActivityIndicator, Alert, Image, useWindowDimensions } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArchSchema, ImprovedSchema } from "../types/chart.types";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";
import ImprovementsPanel from "../components/ImprovementsPanel";
import { improveArchitecture } from "../api";

const BASE = "http://localhost:8000";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const schema: ArchSchema = JSON.parse(raw);
  const { width } = useWindowDimensions();
  const isWide = width > 700;

  const [improved, setImproved] = useState<ImprovedSchema | null>(null);
  const [improving, setImproving] = useState(false);

  const handleImprove = async () => {
    setImproving(true);
    try {
      const result = await improveArchitecture(schema.nodes, schema.edges, schema.feedback);
      setImproved(result);
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Could not improve diagram.");
    } finally {
      setImproving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Original image — always visible */}
      {schema.image_filename && (
        <Image
          source={{ uri: `${BASE}/uploads/${schema.image_filename}` }}
          style={styles.originalImage}
          resizeMode="contain"
        />
      )}

      {/* Diagrams: side-by-side when improved + wide screen, stacked otherwise */}
      <View style={[styles.diagramRow, !isWide && styles.diagramRowStacked]}>
        <View style={[styles.diagramCard, improved && isWide && styles.diagramCardHalf]}>
          <Text style={styles.diagramLabel}>Original</Text>
          <ArchCanvas nodes={schema.nodes} edges={schema.edges} />
        </View>

        {improved && (
          <View style={[styles.diagramCard, isWide && styles.diagramCardHalf]}>
            <Text style={styles.diagramLabel}>Improved</Text>
            <ArchCanvas nodes={improved.nodes} edges={improved.edges} />
          </View>
        )}
      </View>

      {/* Improve button or loading */}
      {!improved && (
        <TouchableOpacity
          style={[styles.improveBtn, improving && styles.disabled]}
          onPress={handleImprove}
          disabled={improving}
        >
          {improving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.improveBtnText}>✦ Improve Diagram</Text>
          }
        </TouchableOpacity>
      )}

      {/* Improvements made panel */}
      {improved && <ImprovementsPanel improvements={improved.improvements} />}

      {/* Feedback panel — shows current schema's feedback; switches to improved feedback when available */}
      <FeedbackPanel feedback={improved ? improved.feedback : schema.feedback} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16, gap: 16 },
  originalImage: {
    width: "100%", height: 220, borderRadius: 12,
    backgroundColor: "#e2e8f0",
  },
  diagramRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  diagramRowStacked: { flexDirection: "column" },
  diagramCard: {
    backgroundColor: "#fff", borderRadius: 12,
    borderWidth: 1, borderColor: "#e2e8f0",
    overflow: "hidden", flex: 1,
  },
  diagramCardHalf: { flex: 1 },
  diagramLabel: {
    fontSize: 12, fontWeight: "600", color: "#64748b",
    paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4,
  },
  improveBtn: {
    backgroundColor: "#1d9e75", padding: 16,
    borderRadius: 12, alignItems: "center",
  },
  disabled: { opacity: 0.6 },
  improveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
});