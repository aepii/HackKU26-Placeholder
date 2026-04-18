import { View, ScrollView, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ArchSchema } from "../types/chart.types";
import ArchCanvas from "../components/ArchCanvas";
import FeedbackPanel from "../components/FeedbackPanel";

export default function ResultScreen() {
  const { schema: raw } = useLocalSearchParams<{ schema: string }>();
  const schema: ArchSchema = JSON.parse(raw);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
  canvasCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    height: 350,
  },
});
