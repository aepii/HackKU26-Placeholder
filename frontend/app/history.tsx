import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { getHistory, deleteHistoryItem } from "../api";
import { HistoryItem } from "../types/chart.types";

const BASE = "http://localhost:8000";

// This screen displays the history of scanned architecture diagrams, allowing users to view details or delete entries.
export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Load history items from the backend
  const load = useCallback(async () => {
    try {
      const data = await getHistory();
      // newest first
      setItems(data.reverse());
    } catch {
      Alert.alert("Error", "Could not load history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load history on component mount
  useEffect(() => {
    load();
  }, [load]);

  // Handler for pull-to-refresh action
  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  // Handler for deleting a history item, with confirmation prompt
  const handleDelete = (id: string) => {
    console.log("Deleting id:", id);
    Alert.alert("Delete scan?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteHistoryItem(id);
            setItems((prev) => prev.filter((i) => i.id !== id));
          } catch {
            Alert.alert("Error", "Could not delete item.");
          }
        },
      },
    ]);
  };

  // Handler for opening a history item to view its details
  const handleOpen = (item: HistoryItem) => {
    router.push({
      pathname: "/result",
      params: {
        schema: JSON.stringify({
          nodes: item.nodes,
          edges: item.edges,
          zones: item.zones ?? [], // ← add
          feedback: item.feedback,
          image_filename: item.image_filename,
          share_token: item.share_token,
        }),
      },
    });
  };

  // Show loading indicator while fetching data
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1d9e75" />
      </View>
    );
  }

  // Show empty state if there are no history items
  if (items.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>🗂️</Text>
        <Text style={styles.emptyTitle}>No scans yet</Text>
        <Text style={styles.emptySubtitle}>
          Analyze an architecture diagram to see it here.
        </Text>
      </View>
    );
  }

  // Render the list of history items
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#1d9e75"
        />
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => handleOpen(item)}
        >
          {/* Thumbnail */}
          {item.image_filename ? (
            <Image
              source={{ uri: `${BASE}/uploads/${item.image_filename}` }}
              style={styles.thumb}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 28 }}>🖼</Text>
            </View>
          )}

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.nodeCount}>
              {item.nodes.length} node{item.nodes.length !== 1 ? "s" : ""} ·{" "}
              {item.edges.length} edge{item.edges.length !== 1 ? "s" : ""}
            </Text>
            <Text style={styles.preview} numberOfLines={2}>
              {item.feedback[0] ?? "No feedback"}
            </Text>
            <View style={styles.tags}>
              {Array.from(new Set(item.nodes.map((n) => n.type)))
                .slice(0, 4)
                .map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>{t}</Text>
                  </View>
                ))}
            </View>
          </View>

          {/* Delete */}
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.deleteText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

// Styles for the History screen components
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8 },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: "#1e293b" },
  emptySubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    alignItems: "center",
  },
  thumb: { width: 90, height: 90 },
  thumbPlaceholder: {
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, padding: 12, gap: 4 },
  nodeCount: { fontSize: 12, fontWeight: "600", color: "#1d9e75" },
  preview: { fontSize: 13, color: "#374151", lineHeight: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: {
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: { fontSize: 11, color: "#64748b", fontWeight: "500" },
  deleteBtn: { padding: 16 },
  deleteText: { fontSize: 14, color: "#94a3b8" },
});
