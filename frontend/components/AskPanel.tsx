import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { askAboutArchitecture } from "../api";
import { NodeSchema, EdgeSchema, ZoneSchema } from "../types/chart.types";
import { theme } from "../constants/theme";

const QUICK_QUESTIONS = [
  "Where is the single point of failure?",
  "What are the security risks?",
  "How would this scale to 10x traffic?",
  "What is missing from this design?",
];

export default function AskPanel({
  nodes,
  edges,
  zones,
}: {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  zones: ZoneSchema[];
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ask = async (q: string) => {
    setLoading(true);
    setAnswer(null);
    try {
      const res = await askAboutArchitecture(nodes, edges, zones, q);
      setAnswer(res.answer);
    } catch {
      setAnswer("Failed to get an answer. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>💬 Ask the Architect</Text>

      {/* Quick question chips */}
      <View style={styles.chips}>
        {QUICK_QUESTIONS.map((q) => (
          <TouchableOpacity
            key={q}
            style={styles.chip}
            onPress={() => {
              setQuestion(q);
              ask(q);
            }}
          >
            <Text style={styles.chipText}>{q}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Custom question */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask anything about this architecture..."
          placeholderTextColor={theme.colors.textLight}
          value={question}
          onChangeText={setQuestion}
          onSubmitEditing={() => question.trim() && ask(question)}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, !question.trim() && styles.disabled]}
          onPress={() => question.trim() && ask(question)}
          disabled={!question.trim() || loading}
        >
          <Text style={styles.sendBtnText}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Answer */}
      {loading && (
        <View style={styles.answerBox}>
          <ActivityIndicator color={theme.colors.accent} />
        </View>
      )}
      {answer && !loading && (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>Gemini says:</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 12,
  },
  heading: {
    fontFamily: theme.fonts.display,
    fontSize: 22,
    color: theme.colors.text,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: {
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  inputRow: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.text,
  },
  sendBtn: {
    backgroundColor: theme.colors.board,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  sendBtnText: { color: theme.colors.chalk, fontSize: 18, fontWeight: "700" },
  disabled: { opacity: 0.4 },
  answerBox: {
    backgroundColor: theme.colors.bgDeep,
    borderRadius: theme.radius.md,
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.accent,
  },
  answerLabel: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 11,
    color: theme.colors.accent,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  answerText: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 20,
  },
});
