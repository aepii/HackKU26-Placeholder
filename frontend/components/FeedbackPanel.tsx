import { View, Text, StyleSheet } from 'react-native'

export default function FeedbackPanel({ feedback }: { feedback: string[] }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Architect Feedback</Text>
      {feedback.map((f, i) => (
        <View key={i} style={styles.item}>
          <Text style={styles.bullet}>›</Text>
          <Text style={styles.text}>{f}</Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  panel:   { backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  heading: { fontSize: 15, fontWeight: '600', marginBottom: 12, color: '#1e293b' },
  item:    { flexDirection: 'row', gap: 8, marginBottom: 10 },
  bullet:  { color: '#1d9e75', fontSize: 18, fontWeight: '700', lineHeight: 20 },
  text:    { flex: 1, fontSize: 13, lineHeight: 20, color: '#374151' },
})