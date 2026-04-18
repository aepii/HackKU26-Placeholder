import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'System Architect Validator' }} />
      <Stack.Screen name="result" options={{ title: 'Analysis Result' }} />
      <Stack.Screen name="history" options={{ title: 'Scan History' }} />
    </Stack>
  )
}