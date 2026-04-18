import { View, StyleSheet, Platform } from "react-native";
import WebView from "react-native-webview";
import { NodeSchema, EdgeSchema, ZoneSchema } from "../types/chart.types";

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

const NODE_ICONS: Record<string, string> = {
  database: "🗄️",
  server: "🖥️",
  queue: "📨",
  cache: "⚡",
  client: "📱",
  loadbalancer: "⚖️",
  cdn: "🌐",
  other: "📦",
};

const ZONE_COLORS: Record<
  string,
  { bg: string; border: string; label: string }
> = {
  blue: { bg: "rgba(59,130,246,0.06)", border: "#3b82f6", label: "#1d4ed8" },
  green: { bg: "rgba(16,185,129,0.06)", border: "#10b981", label: "#065f46" },
  orange: { bg: "rgba(245,158,11,0.06)", border: "#f59e0b", label: "#92400e" },
  purple: { bg: "rgba(139,92,246,0.06)", border: "#8b5cf6", label: "#4c1d95" },
  red: { bg: "rgba(239,68,68,0.06)", border: "#ef4444", label: "#991b1b" },
  slate: { bg: "rgba(148,163,184,0.06)", border: "#94a3b8", label: "#334155" },
};

function buildHtml(
  nodes: NodeSchema[],
  edges: EdgeSchema[],
  zones: ZoneSchema[] = [],
): string {
  const data = JSON.stringify({ nodes, edges, zones });
  const nodeColors = JSON.stringify(NODE_COLORS);
  const nodeIcons = JSON.stringify(NODE_ICONS);
  const zoneColors = JSON.stringify(ZONE_COLORS);

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:100vw; height:100vh; background:#f8fafc; overflow:hidden; font-family: 'Segoe UI', system-ui, sans-serif; }
  #root { width:100%; height:100%; }

  .node-box {
    padding: 10px 16px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-align: center;
    min-width: 120px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border: 1.5px solid rgba(255,255,255,0.2);
  }
  .node-icon { font-size: 18px; line-height: 1; }
  .node-label { font-size: 12px; font-weight: 700; letter-spacing: 0.01em; }
  .node-type {
    font-size: 9px;
    font-weight: 500;
    opacity: 0.8;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(0,0,0,0.15);
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 2px;
  }

  .zone-node .react-flow__node-default {
    background: transparent !important;
    border: none !important;
  }

  .react-flow__edge-label {
    font-size: 10px !important;
    font-weight: 600 !important;
  }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/reactflow@11/dist/umd/index.js"></script>
<link rel="stylesheet" href="https://unpkg.com/reactflow@11/dist/style.css"/>
<script>
const NODE_COLORS = ${nodeColors};
const NODE_ICONS  = ${nodeIcons};
const ZONE_COLORS = ${zoneColors};
const RAW = ${data};

// ── Layout ──────────────────────────────────────────────────────────────────
function computeLayout(nodes, edges, zones) {
  // Separate zone group nodes from regular nodes
  const regularNodes = nodes.filter(n => true); // all nodes get laid out

  const children = {}, inDegree = {};
  regularNodes.forEach(n => { children[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (children[e.source]) children[e.source].push(e.target);
    if (e.target in inDegree) inDegree[e.target]++;
  });

  // Topological sort → levels
  const levels = {};
  const queue = regularNodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  queue.forEach(id => levels[id] = 0);
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    (children[cur] || []).forEach(child => {
      if (!(child in levels)) { levels[child] = levels[cur] + 1; queue.push(child); }
    });
  }
  regularNodes.forEach(n => { if (!(n.id in levels)) levels[n.id] = 0; });

  // Group by zone within each level for tighter clustering
  const byLevel = {};
  Object.entries(levels).forEach(([id, lv]) => {
    if (!byLevel[lv]) byLevel[lv] = [];
    byLevel[lv].push(id);
  });

  const X_GAP = 180, Y_GAP = 130;
  const positions = {};
  Object.entries(byLevel).forEach(([lv, ids]) => {
    // Sort ids so same-zone nodes cluster together
    const sorted = [...ids].sort((a, b) => {
      const na = nodes.find(n => n.id === a);
      const nb = nodes.find(n => n.id === b);
      return (na?.zone || '').localeCompare(nb?.zone || '');
    });
    const totalW = sorted.length * X_GAP;
    sorted.forEach((id, i) => {
      positions[id] = { x: i * X_GAP - totalW / 2 + X_GAP / 2, y: lv * Y_GAP };
    });
  });

  return positions;
}

// ── Zone group bounds ────────────────────────────────────────────────────────
function computeZoneBounds(zoneId, nodePositions, nodes) {
  const members = nodes.filter(n => n.zone === zoneId);
  if (members.length === 0) return null;

  const PAD = 40;
  const NODE_W = 140, NODE_H = 80;

  const xs = members.map(n => nodePositions[n.id]?.x ?? 0);
  const ys = members.map(n => nodePositions[n.id]?.y ?? 0);

  const minX = Math.min(...xs) - PAD;
  const minY = Math.min(...ys) - PAD - 20; // extra top for label
  const maxX = Math.max(...xs) + NODE_W + PAD;
  const maxY = Math.max(...ys) + NODE_H + PAD;

  return {
    x: minX,
    y: minY,
    width:  maxX - minX,
    height: maxY - minY,
  };
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { nodes, edges, zones } = RAW;
  const positions = computeLayout(nodes, edges, zones);

  // Build zone group nodes first (rendered behind regular nodes)
  const zoneNodes = (zones || []).map(zone => {
    const bounds = computeZoneBounds(zone.id, positions, nodes);
    if (!bounds) return null;
    const colors = ZONE_COLORS[zone.color] || ZONE_COLORS.slate;
    return {
      id: 'zone-' + zone.id,
      type: 'group',
      position: { x: bounds.x, y: bounds.y },
      style: {
        width:  bounds.width,
        height: bounds.height,
        backgroundColor: colors.bg,
        border: '2px dashed ' + colors.border,
        borderRadius: 14,
        zIndex: -1,
      },
      data: {
        label: React.createElement('div', {
          style: {
            position: 'absolute',
            top: 8,
            left: 14,
            fontSize: 11,
            fontWeight: 700,
            color: colors.label,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            pointerEvents: 'none',
          }
        }, zone.label)
      },
      draggable: false,
      selectable: false,
    };
  }).filter(Boolean);

  // Build regular nodes, offset so they're relative to their zone group
  const rfNodes = nodes.map(n => {
    const pos = positions[n.id] || { x: 0, y: 0 };
    const color = NODE_COLORS[n.type] || NODE_COLORS.other;
    const icon  = NODE_ICONS[n.type]  || NODE_ICONS.other;

    let finalPos = pos;
    let parentNode = undefined;
    let extent = undefined;

    if (n.zone) {
      const bounds = computeZoneBounds(n.zone, positions, nodes);
      if (bounds) {
        finalPos = {
          x: pos.x - bounds.x,
          y: pos.y - bounds.y,
        };
        parentNode = 'zone-' + n.zone;
        extent = 'parent';
      }
    }

    return {
      id: n.id,
      position: finalPos,
      parentNode,
      extent,
      data: {
        label: React.createElement('div', {
          className: 'node-box',
          style: { background: color }
        },
          React.createElement('div', { className: 'node-icon' }, icon),
          React.createElement('div', { className: 'node-label' }, n.label),
          React.createElement('div', { className: 'node-type'  }, n.type),
        )
      },
      style: { background: 'transparent', border: 'none', padding: 0 },
    };
  });

  // Build edges with protocol labels + bidirectional markers
  const rfEdges = edges.map((e, i) => {
    const label = [e.protocol, e.label].filter(Boolean).join(' · ') || undefined;
    return {
      id: 'e' + i,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: !!e.protocol && ['WebSocket','AMQP'].includes(e.protocol),
      markerEnd:   { type: 'ArrowClosed', color: '#64748b', width: 16, height: 16 },
      markerStart: e.bidirectional
        ? { type: 'ArrowClosed', color: '#64748b', width: 16, height: 16 }
        : undefined,
      label,
      style: { stroke: '#94a3b8', strokeWidth: 1.5 },
      labelStyle: { fontSize: 10, fontWeight: 600, fill: '#475569' },
      labelBgStyle: { fill: '#f8fafc', fillOpacity: 0.9, rx: 4 },
      labelBgPadding: [4, 6],
    };
  });

  const allNodes = [...zoneNodes, ...rfNodes];

  const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;
  return React.createElement(ReactFlow, {
    defaultNodes: allNodes,
    defaultEdges: rfEdges,
    fitView: true,
    fitViewOptions: { padding: 0.25 },
    nodesDraggable: true,
    minZoom: 0.1,
    maxZoom: 2,
    proOptions: { hideAttribution: true },
  },
    React.createElement(Background, { color: '#e2e8f0', gap: 24, size: 1 }),
    React.createElement(Controls, { showInteractive: false }),
    React.createElement(MiniMap, {
      nodeColor: n => {
        if (n.id.startsWith('zone-')) return '#e2e8f0';
        return NODE_COLORS[n.data?.type] || '#94a3b8';
      },
      style: { borderRadius: 8, border: '1px solid #e2e8f0' },
      maskColor: 'rgba(248,250,252,0.8)',
    }),
  );
}

setTimeout(() => {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
}, 50);
</script>
</body>
</html>`;
}

export default function ArchCanvas({
  nodes,
  edges,
  zones = [],
}: {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  zones?: ZoneSchema[];
}) {
  const html = buildHtml(nodes, edges, zones);

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={html}
          style={{ width: "100%", height: "100%", border: "none" }}
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: "" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 400 },
  webview: { flex: 1 },
});
