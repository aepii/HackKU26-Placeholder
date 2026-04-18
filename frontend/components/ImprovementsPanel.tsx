import { View, Text, StyleSheet } from "react-native";
import { theme } from "../constants/theme";

export default function ImprovementsPanel({
  improvements,
}: {
  improvements: string[];
}) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>✦ Changes Made</Text>
      {improvements.map((item, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>✓</Text>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: "#f0faf4",
    borderRadius: theme.radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: "#b6dfc8",
  },
  heading: {
    fontFamily: theme.fonts.display,
    fontSize: 22,
    color: "#1a4731",
    marginBottom: 14,
  },
  item: { flexDirection: "row", gap: 10, marginBottom: 12 },
  bullet: {
    fontFamily: theme.fonts.hand,
    fontSize: 18,
    color: theme.colors.accent,
    fontWeight: "700",
    lineHeight: 22,
  },
  text: {
    flex: 1,
    fontFamily: theme.fonts.body,
    fontSize: 13,
    lineHeight: 21,
    color: "#1e4d35",
  },
});
