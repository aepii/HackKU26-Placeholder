import { Stack } from "expo-router";

// This is the root layout for the app. It defines the navigation structure and shared components (if any).
export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: "System Architect Validator" }}
      />
      <Stack.Screen name="result" options={{ title: "Analysis Result" }} />
      <Stack.Screen
        name="share/[token]"
        options={{ title: "Shared Architecture" }}
      />
      <Stack.Screen name="history" options={{ title: "Upload History" }} />
    </Stack>
  );
}
