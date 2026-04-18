import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export default function FeedbackPanel({ feedback }: { feedback: string[] }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>✏️ Architect Notes</Text>
      {feedback.map((f, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>—</Text>
          <Text style={styles.text}>{f}</Text>
        </View>
      ))}
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
  },
  heading: {
    fontFamily: theme.fonts.display,
    fontSize: 22,
    color: theme.colors.text,
    marginBottom: 14,
  },
  item: { flexDirection: "row", gap: 10, marginBottom: 12 },
  bullet: {
    fontFamily: theme.fonts.hand,
    fontSize: 20,
    color: theme.colors.accent,
    lineHeight: 22,
  },
  text: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: theme.colors.text,
  },
});
