import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export default function SummaryCard({ summary }: { summary: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>📋 Architecture Summary</Text>
      <Text style={styles.text}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.board,
    borderRadius: theme.radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.boardDark,
    gap: 8,
  },
  label: {
    fontFamily: theme.fonts.hand,
    fontSize: 11,
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  text: {
    fontFamily: theme.fonts.body,
    fontSize: 17,
    color: theme.colors.chalk,
    lineHeight: 24,
  },
});
