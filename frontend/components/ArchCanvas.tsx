import { useRef } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import WebView from 'react-native-webview'
import { NodeSchema, EdgeSchema } from '../types/chart.types'

const NODE_COLORS: Record<string, string> = {
  database:     '#3b82f6',
  server:       '#10b981',
  queue:        '#f59e0b',
  cache:        '#ec4899',
  client:       '#8b5cf6',
  loadbalancer: '#f97316',
  cdn:          '#06b6d4',
  other:        '#94a3b8',
}

function buildHtml(nodes: NodeSchema[], edges: EdgeSchema[]): string {
  const data = JSON.stringify({ nodes, edges })
  const colors = JSON.stringify(NODE_COLORS)

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:100vw; height:100vh; background:#f8fafc; overflow:hidden; }
  #root { width:100%; height:100%; }
  .node-box { padding:8px 14px; border-radius:8px; font-family:system-ui,sans-serif; font-size:12px; font-weight:600; color:white; text-align:center; min-width:110px; box-shadow:0 2px 6px rgba(0,0,0,0.15); }
  .node-type { font-size:10px; font-weight:400; opacity:0.75; margin-top:3px; }
</style>
</head>
<body>
<div id="root"></div>
<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/reactflow@11/dist/umd/index.js"></script>
<link rel="stylesheet" href="https://unpkg.com/reactflow@11/dist/style.css"/>
<script>
const COLORS = ${colors};
const RAW = ${data};

function computeLayout(nodes, edges) {
  const children = {}, inDegree = {};
  nodes.forEach(n => { children[n.id] = []; inDegree[n.id] = 0; });
  edges.forEach(e => {
    if (children[e.source]) children[e.source].push(e.target);
    if (e.target in inDegree) inDegree[e.target]++;
  });
  const levels = {};
  const queue = nodes.filter(n => inDegree[n.id] === 0).map(n => n.id);
  queue.forEach(id => levels[id] = 0);
  let head = 0;
  while (head < queue.length) {
    const cur = queue[head++];
    (children[cur] || []).forEach(child => {
      if (!(child in levels)) { levels[child] = levels[cur] + 1; queue.push(child); }
    });
  }
  nodes.forEach(n => { if (!(n.id in levels)) levels[n.id] = 0; });
  const byLevel = {};
  Object.entries(levels).forEach(([id, lv]) => { if (!byLevel[lv]) byLevel[lv] = []; byLevel[lv].push(id); });
  const X_GAP = 160, Y_GAP = 110, positions = {};
  Object.entries(byLevel).forEach(([lv, ids]) => {
    const totalW = ids.length * X_GAP;
    ids.forEach((id, i) => { positions[id] = { x: i * X_GAP - totalW / 2 + X_GAP / 2, y: lv * Y_GAP }; });
  });
  return positions;
}

function App() {
  const positions = computeLayout(RAW.nodes, RAW.edges);
  const rfNodes = RAW.nodes.map(n => ({
    id: n.id,
    position: positions[n.id] || { x: 0, y: 0 },
    data: { label: React.createElement('div', { className: 'node-box', style: { background: COLORS[n.type] || COLORS.other } },
      React.createElement('div', null, n.label),
      React.createElement('div', { className: 'node-type' }, n.type)
    )},
    style: { background: 'transparent', border: 'none', padding: 0 },
  }));
  const rfEdges = RAW.edges.map((e, i) => ({
    id: 'e' + i, source: e.source, target: e.target, label: e.label,
    animated: true, style: { stroke: '#94a3b8' },
    labelStyle: { fontSize: 10, fill: '#64748b' },
  }));

  const { ReactFlow, Background, Controls } = window.ReactFlow;
  return React.createElement(ReactFlow, {
    defaultNodes: rfNodes,
    defaultEdges: rfEdges,
    fitView: true,
    fitViewOptions: { padding: 0.3 },
    nodesDraggable: true,
    minZoom: 0.1,
  },
    React.createElement(Background, { color: '#e2e8f0', gap: 20 }),
    React.createElement(Controls, null),
  );
}

setTimeout(() => {
  ReactDOM.render(React.createElement(App), document.getElementById('root'));
}, 50);
</script>
</body>
</html>`
}

export default function ArchCanvas({ nodes, edges }: { nodes: NodeSchema[], edges: EdgeSchema[] }) {
  const html = buildHtml(nodes, edges)

  if (Platform.OS === 'web') {
  return (
    <View style={styles.container}>
      <iframe
        srcDoc={html}
        style={{ width: '100%', height: '100%', border: 'none' }}
        sandbox="allow-scripts allow-same-origin"
      />
    </View>
  )
}

  return (
    <View style={styles.container}>
      <WebView
        source={{ html, baseUrl: '' }}
        originWhitelist={['*']}
        javaScriptEnabled
        style={styles.webview}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { width: '100%', height: 350 },
  webview:   { flex: 1 },
})