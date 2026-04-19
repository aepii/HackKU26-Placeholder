import { Stack } from "expo-router";
import {
  useFonts,
  Caveat_400Regular,
  Caveat_700Bold,
} from "@expo-google-fonts/caveat";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import { View, ActivityIndicator } from "react-native";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Caveat_400Regular,
    Caveat_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f4ef",
        }}
      >
        <ActivityIndicator color="#4a9e6b" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "ArchLens",
          headerStyle: { backgroundColor: "#f7f4ef" },
          headerTintColor: "#2c2c2c",
          headerTitleStyle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          title: "Analysis",
          headerStyle: { backgroundColor: "#f7f4ef" },
          headerTintColor: "#2c2c2c",
          headerTitleStyle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="share/[token]"
        options={{
          title: "Shared Diagram",
          headerStyle: { backgroundColor: "#f7f4ef" },
          headerTintColor: "#2c2c2c",
          headerTitleStyle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="history"
        options={{
          title: "Past Scans",
          headerStyle: { backgroundColor: "#f7f4ef" },
          headerTintColor: "#2c2c2c",
          headerTitleStyle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="stats"
        options={{
          title: "Atlas Stats",
          headerStyle: { backgroundColor: "#f7f4ef" },
          headerTintColor: "#2c2c2c",
          headerTitleStyle: { fontFamily: "Caveat_700Bold", fontSize: 22 },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
