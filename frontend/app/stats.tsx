import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { getStats } from "../api";
import { ArchStats } from "../types/chart.types";
import { theme } from "../constants/theme";

const NODE_COLORS: Record<string, string> = {
  database: "#3b82f6",
  server: "#10b981",
  queue: "#f59e0b",
  cache: "#ec4899",
  client: "#8b5cf6",
  loadbalancer: "#f97316",
  cdn: "#06b6d4",
  other: "#94a3b8",
};

export default function StatsScreen() {
  const [stats, setStats] = useState<ArchStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  const total = stats.total_scans?.[0]?.count ?? 0;
  const complexity = stats.avg_complexity?.[0];
  const nodeTypes = stats.node_type_distribution ?? [];
  const protocols = stats.protocol_usage ?? [];
  const maxNodeCount = Math.max(...nodeTypes.map((n) => n.count), 1);
  const maxProtoCount = Math.max(...protocols.map((p) => p.count), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Headline numbers */}
      <View style={styles.headlineRow}>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineNum}>{total}</Text>
          <Text style={styles.headlineLabel}>Total Scans</Text>
        </View>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineNum}>
            {complexity ? complexity.avgNodes.toFixed(1) : "—"}
          </Text>
          <Text style={styles.headlineLabel}>Avg Nodes</Text>
        </View>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineNum}>
            {complexity ? complexity.avgEdges.toFixed(1) : "—"}
          </Text>
          <Text style={styles.headlineLabel}>Avg Edges</Text>
        </View>
        <View style={styles.headlineCard}>
          <Text style={styles.headlineNum}>
            {complexity ? complexity.avgZones.toFixed(1) : "—"}
          </Text>
          <Text style={styles.headlineLabel}>Avg Zones</Text>
        </View>
      </View>

      {/* Node type distribution */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗂 Node Types</Text>
        {nodeTypes.map((item) => (
          <View key={item._id} style={styles.barRow}>
            <Text style={styles.barLabel}>{item._id}</Text>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${(item.count / maxNodeCount) * 100}%` as any,
                    backgroundColor:
                      NODE_COLORS[item._id] ?? theme.colors.accent,
                  },
                ]}
              />
            </View>
            <Text style={styles.barCount}>{item.count}</Text>
          </View>
        ))}
      </View>

      {/* Protocol usage */}
      {protocols.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔌 Protocols</Text>
          {protocols.map((item) => (
            <View key={item._id} style={styles.barRow}>
              <Text style={styles.barLabel}>{item._id}</Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      width: `${(item.count / maxProtoCount) * 100}%` as any,
                      backgroundColor: theme.colors.accentBlue,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Scans over time */}
      {stats.scans_over_time?.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Scans Over Time</Text>
          <View style={styles.timelineList}>
            {stats.scans_over_time.map((item) => (
              <View key={item._id} style={styles.timelineRow}>
                <Text style={styles.timelineDate}>{item._id}</Text>
                <View style={styles.timelineDots}>
                  {Array.from({ length: item.count }).map((_, i) => (
                    <View key={i} style={styles.timelineDot} />
                  ))}
                </View>
                <Text style={styles.timelineCount}>{item.count}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <Text style={styles.footer}>Powered by MongoDB Atlas Aggregations</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontFamily: theme.fonts.body, color: theme.colors.textMuted },

  headlineRow: { flexDirection: "row", gap: 8 },
  headlineCard: {
    flex: 1,
    backgroundColor: theme.colors.board,
    borderRadius: theme.radius.md,
    padding: 14,
    alignItems: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.boardDark,
  },
  headlineNum: {
    fontFamily: theme.fonts.display,
    fontSize: 28,
    color: theme.colors.chalk,
    lineHeight: 32,
  },
  headlineLabel: {
    fontFamily: theme.fonts.body,
    fontSize: 10,
    color: theme.colors.accent,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },

  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    gap: 12,
  },
  sectionTitle: {
    fontFamily: theme.fonts.display,
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: 4,
  },

  barRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: {
    fontFamily: theme.fonts.bodyMed,
    fontSize: 12,
    color: theme.colors.textMuted,
    width: 80,
  },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: theme.colors.bgDeep,
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
  barCount: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    color: theme.colors.text,
    width: 28,
    textAlign: "right",
  },

  timelineList: { gap: 8 },
  timelineRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  timelineDate: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textMuted,
    width: 90,
  },
  timelineDots: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 4 },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
  },
  timelineCount: {
    fontFamily: theme.fonts.bodyBold,
    fontSize: 12,
    color: theme.colors.text,
    width: 24,
    textAlign: "right",
  },

  footer: {
    fontFamily: theme.fonts.body,
    fontSize: 11,
    color: theme.colors.textLight,
    textAlign: "center",
    marginTop: 8,
  },
});
