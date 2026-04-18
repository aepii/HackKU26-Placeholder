import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { validateArchitecture } from "../api";
import { theme } from "../constants/theme";

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
      router.push({
        pathname: "/result",
        params: { schema: JSON.stringify(schema) },
      });
    } catch (e: any) {
      alert(e.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* History pill */}
      <TouchableOpacity
        style={styles.historyBtn}
        onPress={() => router.push("/history")}
      >
        <Text style={styles.historyBtnText}>📋 Past Scans</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🏗️</Text>
        <Text style={styles.heroTitle}>ArchLens</Text>
        <Text style={styles.heroSub}>
          Photograph your whiteboard.{"\n"}We'll review the architecture.
        </Text>
      </View>

      {/* Image preview / drop zone */}
      {imageUri ? (
        <View style={styles.previewWrapper}>
          <Image source={{ uri: imageUri }} style={styles.preview} />
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => {
              setImageUri(null);
              setWebFile(null);
            }}
          >
            <Text style={styles.clearBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.dropZone}>
          <Text style={styles.dropIcon}>📷</Text>
          <Text style={styles.dropText}>No photo yet</Text>
          <Text style={styles.dropHint}>Take or pick one below</Text>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.btn} onPress={() => pickImage(true)}>
          <Text style={styles.btnText}>📷 Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={() => pickImage(false)}
        >
          <Text style={styles.btnText}>🖼 Library</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <TouchableOpacity
          style={[styles.analyzeBtn, loading && styles.disabled]}
          onPress={analyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.chalk} />
          ) : (
            <Text style={styles.analyzeBtnText}>✦ Analyze Architecture</Text>
          )}
        </TouchableOpacity>
      )}

      <Text style={styles.footer}>
        Powered by Gemini · Built at HackKU 2026
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  historyBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  historyBtnText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 13,
    color: theme.colors.textMuted,
  },

  hero: { alignItems: "center", gap: 4 },
  heroIcon: { fontSize: 44, marginBottom: 4 },
  heroTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 48,
    color: theme.colors.text,
    lineHeight: 52,
  },
  heroSub: {
    fontFamily: theme.fonts.body,
    fontSize: 15,
    color: theme.colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },

  dropZone: {
    width: 300,
    height: 180,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  dropIcon: { fontSize: 32 },
  dropText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 15,
    color: theme.colors.textMuted,
  },
  dropHint: {
    fontFamily: theme.fonts.body,
    fontSize: 12,
    color: theme.colors.textLight,
  },

  previewWrapper: { position: "relative" },
  preview: {
    width: 300,
    height: 180,
    borderRadius: theme.radius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  clearBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: theme.colors.accentRed,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  clearBtnText: { color: "white", fontSize: 12, fontWeight: "700" },

  btnRow: { flexDirection: "row", gap: 10 },
  btn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgDeep,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    alignItems: "center",
  },
  btnSecondary: {},
  btnText: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 14,
    color: theme.colors.text,
  },

  analyzeBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.board,
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.accent,
  },
  analyzeBtnText: {
    fontFamily: theme.fonts.display,
    fontSize: 22,
    color: theme.colors.chalk,
    letterSpacing: 0.5,
  },
  disabled: { opacity: 0.6 },

  footer: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textLight,
    position: "absolute",
    bottom: 16,
  },
});
