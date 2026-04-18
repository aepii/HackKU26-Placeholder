import { View, ScrollView, StyleSheet } from "react-native";
import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ArchSchema } from "../types/chart.types";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();

  const initialSchema: ArchSchema = raw
    ? JSON.parse(raw)
    : {
        nodes: [],
        edges: [],
        feedback: [],
      };

  const [nodes, setNodes] = useState(initialSchema.nodes);
  const [edges] = useState(initialSchema.edges);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.canvasCard}>
        <ArchCanvas nodes={nodes} edges={edges} setNodes={setNodes} />
      </View>
      <FeedbackPanel feedback={initialSchema.feedback} />
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
});