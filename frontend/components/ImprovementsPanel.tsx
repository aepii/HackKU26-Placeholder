import { View, Text, StyleSheet } from 'react-native'

export default function ImprovementsPanel({ improvements }: { improvements: string[] }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Improvements made</Text>
      {improvements.map((item, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>✓</Text>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  panel:   { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16,
             borderWidth: 1, borderColor: '#bbf7d0' },
  heading: { fontSize: 15, fontWeight: '600', marginBottom: 12, color: '#14532d' },
  item:    { flexDirection: 'row', gap: 8, marginBottom: 10 },
  bullet:  { color: '#16a34a', fontSize: 15, fontWeight: '700', lineHeight: 20 },
  text:    { flex: 1, fontSize: 13, lineHeight: 20, color: '#166534' },
})