import { useState } from "react";
import {
  View, Text, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { validateArchitecture } from "../api";
import { Platform } from "react-native";

export default function HomeScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [webFile, setWebFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const pickImage = async (useCamera: boolean) => {
    const fn = useCamera
      ? ImagePicker.launchCameraAsync
      : ImagePicker.launchImageLibraryAsync;
    const result = await fn({ mediaTypes: ["images"], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setImageUri(asset.uri);
    if (Platform.OS === "web" && (asset as any).file) {
      setWebFile((asset as any).file);
    }
  };

  const analyze = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const schema = await validateArchitecture(imageUri, webFile ?? undefined);
      router.push({ pathname: "/result", params: { schema: JSON.stringify(schema) } });
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* History button */}
      <TouchableOpacity style={styles.historyBtn} onPress={() => router.push("/history")}>
        <Text style={styles.historyBtnText}>🕘 History</Text>
      </TouchableOpacity>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={() => pickImage(true)}>
        <Text style={styles.btnText}>📷 Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, styles.secondary]} onPress={() => pickImage(false)}>
        <Text style={styles.btnText}>🖼 Pick from Library</Text>
      </TouchableOpacity>
      {imageUri && (
        <TouchableOpacity
          style={[styles.btn, styles.primary, loading && styles.disabled]}
          onPress={analyze}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Analyze Architecture</Text>}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  historyBtn: { position: "absolute", top: 16, right: 16, backgroundColor: "#e2e8f0", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  historyBtnText: { color: "#374151", fontWeight: "500", fontSize: 13 },
  placeholder: { width: 300, height: 200, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#e2e8f0", borderStyle: "dashed" },
  placeholderText: { color: "#94a3b8", fontSize: 14 },
  preview: { width: 300, height: 200, borderRadius: 12 },
  btn: { width: 260, padding: 14, borderRadius: 10, backgroundColor: "#64748b", alignItems: "center" },
  secondary: { backgroundColor: "#475569" },
  primary: { backgroundColor: "#1d9e75" },
  disabled: { opacity: 0.6 },
  btnText: { color: "#fff", fontWeight: "500", fontSize: 15 },
});