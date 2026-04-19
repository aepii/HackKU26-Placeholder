import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { confirm, showAlert } from "../utils/alert";
import { useRouter } from "expo-router";
import { getHistory, deleteHistoryItem, searchHistory } from "../api";
import { HistoryItem } from "../types/chart.types";
import { theme } from "../constants/theme";

const BASE = "http://localhost:8000";

export default function HistoryScreen() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HistoryItem[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const displayItems = searchResults ?? items;

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const results = await searchHistory(q);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const load = useCallback(async () => {
    try {
      const data = await getHistory();
      setItems(data.reverse());
    } catch {
      showAlert("Error", "Could not load history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleDelete = async (id: string) => {
    const accepted = await confirm("Delete scan?", "This cannot be undone.");

    if (!accepted) return;

    try {
      await deleteHistoryItem(id);

      setItems((prev) => prev.filter((i) => i.id !== id));

      if (searchResults) {
        setSearchResults((prev) => prev!.filter((i) => i.id !== id));
      }
    } catch {
      showAlert("Error", "Could not delete item.");
    }
  };

  const handleOpen = (item: HistoryItem) => {
    router.push({
      pathname: "/result",
      params: {
        schema: JSON.stringify({
          nodes: item.nodes,
          edges: item.edges,
          zones: item.zones ?? [],
          feedback: item.feedback,
          summary: item.summary,
          image_filename: item.image_filename,
          share_token: item.share_token,
        }),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      {/* Search + Stats row */}
      <View style={styles.topBar}>
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search diagrams..."
            placeholderTextColor={theme.colors.textLight}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searching && (
            <ActivityIndicator
              color={theme.colors.accent}
              style={styles.searchSpinner}
            />
          )}
        </View>
        <TouchableOpacity
          style={styles.statsBtn}
          onPress={() => router.push("/stats")}
        >
          <Text style={styles.statsBtnText}>📊</Text>
        </TouchableOpacity>
      </View>

      {/* No search results message */}
      {searchResults !== null && searchResults.length === 0 && (
        <View style={styles.noResults}>
          <Text style={styles.noResultsText}>
            No diagrams match "{searchQuery}"
          </Text>
        </View>
      )}

      {/* Empty state — only when not searching */}
      {displayItems.length === 0 && searchResults === null && (
        <View style={styles.center}>
          <Text style={styles.emptyIcon}>🗂️</Text>
          <Text style={styles.emptyTitle}>No scans yet</Text>
          <Text style={styles.emptySubtitle}>
            Analyze an architecture diagram to see it here.
          </Text>
        </View>
      )}

      <FlatList
        data={displayItems}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.accent}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.85}
            onPress={() => handleOpen(item)}
          >
            {/* Thumbnail */}
            {item.image_url || item.image_filename ? (
              <Image
                source={{
                  uri:
                    item.image_url ?? `${BASE}/uploads/${item.image_filename}`,
                }}
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
              {item.summary ? (
                <Text style={styles.summary} numberOfLines={2}>
                  {item.summary}
                </Text>
              ) : (
                <Text style={styles.preview} numberOfLines={2}>
                  {item.feedback[0] ?? "No feedback"}
                </Text>
              )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.colors.bg,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    color: theme.colors.text,
  },
  emptySubtitle: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: "center",
    paddingHorizontal: 32,
  },

  topBar: { flexDirection: "row", gap: 8, padding: 16, paddingBottom: 8 },
  searchWrapper: { flex: 1, position: "relative" },
  searchInput: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.text,
  },
  searchSpinner: { position: "absolute", right: 12, top: 12 },
  statsBtn: {
    backgroundColor: theme.colors.board,
    width: 46,
    height: 46,
    borderRadius: theme.radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.colors.accent,
  },
  statsBtnText: { fontSize: 20 },
  noResults: { padding: 16, alignItems: "center" },
  noResultsText: {
    fontFamily: theme.fonts.body,
    fontSize: 14,
    color: theme.colors.textMuted,
  },

  list: { padding: 16, gap: 12 },
  card: {
    flexDirection: "row",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    overflow: "hidden",
    alignItems: "center",
  },
  thumb: { width: 90, height: 90 },
  thumbPlaceholder: {
    backgroundColor: theme.colors.bgDeep,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { flex: 1, padding: 12, gap: 5 },
  nodeCount: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 12,
    color: theme.colors.accent,
  },
  summary: {
    fontFamily: theme.fonts.hand,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  preview: {
    fontFamily: theme.fonts.body,
    fontSize: 13,
    color: theme.colors.text,
    lineHeight: 18,
  },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 },
  tag: {
    backgroundColor: theme.colors.bgDeep,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagText: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  deleteBtn: { padding: 16 },
  deleteText: { fontSize: 14, color: theme.colors.textLight },
});
