import { useRef } from "react";
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
  threatMode: boolean = false,
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
  body { width:100vw; height:100vh; background:#2d4a3e; overflow:hidden; }
  #root { width:100%; height:100%; }
<<<<<<< HEAD

  .node-box {
    position: relative;
    padding: 10px 16px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    color: white;
    text-align: center;
    min-width: 120px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    border: 1.5px solid rgba(255,255,255,0.25);
    backdrop-filter: blur(4px);
    cursor: pointer;
  }
  .node-icon  { font-size:18px; line-height:1; }
  .node-label { font-size:12px; font-weight:700; letter-spacing:0.01em; }
  .node-type  {
    font-size:9px; font-weight:500; opacity:0.8; text-transform:uppercase;
    letter-spacing:0.08em; background:rgba(0,0,0,0.15);
    padding:2px 6px; border-radius:4px; margin-top:2px;
  }

  .threat-badge {
    position:absolute; top:-8px; right:-8px;
    width:18px; height:18px; border-radius:50%;
    border:2px solid white; display:flex;
    align-items:center; justify-content:center;
    font-size:9px; font-weight:800; color:white;
    box-shadow:0 2px 6px rgba(0,0,0,0.25);
    z-index:10; cursor:default;
  }

  #threat-legend {
    position:absolute; bottom:12px; left:12px; z-index:999;
    background:white; border:1px solid #e2e8f0; border-radius:10px;
    padding:10px 14px; display:flex; flex-direction:column; gap:6px;
    box-shadow:0 4px 12px rgba(0,0,0,0.1);
    font-size:11px; font-family:system-ui,sans-serif;
  }
  #threat-legend .legend-title { font-weight:700; color:#1e293b; font-size:12px; margin-bottom:2px; }
  #threat-legend .legend-row   { display:flex; align-items:center; gap:8px; color:#374151; }
  #threat-legend .legend-dot   { width:10px; height:10px; border-radius:50%; flex-shrink:0; }

  /* Annotation popup */
  .annotation-popup {
    position: absolute;
    background: white;
    border-radius: 10px;
    padding: 12px;
    width: 230px;
    box-shadow: 0 6px 20px rgba(0,0,0,0.25);
    font-family: system-ui, sans-serif;
    font-size: 12px;
    z-index: 9999;
    user-select: none;
  }
  .annotation-popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    cursor: grab;
  }
  .annotation-popup-header:active { cursor: grabbing; }
  .annotation-popup-title { font-weight: 700; color: #1e293b; font-size: 13px; }
  .annotation-popup-close {
    cursor: pointer; font-weight: 700; padding: 2px 6px;
    color: #64748b; font-size: 16px; line-height: 1;
  }
  .annotation-popup textarea {
    width: 100%; font-size: 11px; border-radius: 6px;
    padding: 6px; border: 1px solid #e2e8f0; resize: vertical;
    min-height: 70px; font-family: system-ui, sans-serif;
    color: #1e293b; outline: none;
  }
  .annotation-popup textarea:focus { border-color: #94a3b8; }

  @keyframes pulse-stroke {
    0%,100% { stroke-opacity:1; }
    50%      { stroke-opacity:0.4; }
  }
  .threat-edge-high { animation: pulse-stroke 1.5s ease-in-out infinite; }
=======
  .node-box {
    padding:8px 14px;
    border-radius:8px;
    font-family:system-ui,sans-serif;
    font-size:12px;
    font-weight:600;
    color:white;
    text-align:center;
    min-width:110px;
    box-shadow:0 2px 6px rgba(0,0,0,0.15);
  }
  .node-type {
    font-size:10px;
    opacity:0.75;
    margin-top:3px;
  }
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
</style>
</head>
<body>
<div id="root"></div>

<script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/reactflow@11/dist/umd/index.js"></script>
<link rel="stylesheet" href="https://unpkg.com/reactflow@11/dist/style.css"/>
<<<<<<< HEAD
=======

<script>
const COLORS = ${colors};
const RAW = ${data};
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f

<script>
const NODE_COLORS  = ${nodeColors};
const NODE_ICONS   = ${nodeIcons};
const ZONE_COLORS  = ${zoneColors};
const RAW          = ${data};
const THREAT_MODE  = ${threatMode ? "true" : "false"};

// ── Threat definitions ───────────────────────────────────────────────────────
const NODE_THREATS = {
  database:     { level:'high',   label:'SQL Injection / Data Exposure',   stride:'T,I,D' },
  server:       { level:'high',   label:'RCE / Auth Bypass',               stride:'S,T,R' },
  queue:        { level:'medium', label:'Message Tampering / Replay',       stride:'T,R'   },
  cache:        { level:'medium', label:'Cache Poisoning / Info Leakage',   stride:'I,T'   },
  client:       { level:'high',   label:'XSS / CSRF / Client Hijacking',    stride:'S,T'   },
  loadbalancer: { level:'medium', label:'DDoS Target / SSL Termination',    stride:'D,S'   },
  cdn:          { level:'low',    label:'Cache Poisoning',                  stride:'T'     },
  other:        { level:'low',    label:'Review Required',                  stride:'?'     },
};

const EDGE_THREATS = {
  HTTP:      { level:'high',   label:'Unencrypted — MitM Risk' },
  TCP:       { level:'medium', label:'No App-Layer Auth' },
  WebSocket: { level:'medium', label:'Origin Validation Required' },
  SQL:       { level:'high',   label:'Direct DB Access — Avoid Exposure' },
  AMQP:      { level:'medium', label:'Broker Auth Required' },
  HTTPS:     { level:'low',    label:'Encrypted ✓' },
  gRPC:      { level:'low',    label:'TLS Recommended' },
  Redis:     { level:'medium', label:'No Auth by Default' },
};

const THREAT_COLORS = { high:'#ef4444', medium:'#f59e0b', low:'#10b981' };
const THREAT_LABELS = { high:'!', medium:'~', low:'✓' };

// ── Layout ───────────────────────────────────────────────────────────────────
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
      if (!(child in levels)) {
        levels[child] = levels[cur] + 1;
        queue.push(child);
      }
    });
  }

  nodes.forEach(n => { if (!(n.id in levels)) levels[n.id] = 0; });

  const byLevel = {};
  Object.entries(levels).forEach(([id, lv]) => {
    if (!byLevel[lv]) byLevel[lv] = [];
    byLevel[lv].push(id);
  });

<<<<<<< HEAD
  const X_GAP = 180, Y_GAP = 130, positions = {};
  Object.entries(byLevel).forEach(([lv, ids]) => {
    const sorted = [...ids].sort((a, b) => {
      const na = RAW.nodes.find(n => n.id === a);
      const nb = RAW.nodes.find(n => n.id === b);
      return (na?.zone || '').localeCompare(nb?.zone || '');
    });
    const totalW = sorted.length * X_GAP;
    sorted.forEach((id, i) => {
      positions[id] = { x: i * X_GAP - totalW / 2 + X_GAP / 2, y: lv * Y_GAP };
=======
  const X_GAP = 160, Y_GAP = 110, positions = {};
  Object.entries(byLevel).forEach(([lv, ids]) => {
    const totalW = ids.length * X_GAP;
    ids.forEach((id, i) => {
      positions[id] = {
        x: i * X_GAP - totalW / 2 + X_GAP / 2,
        y: lv * Y_GAP
      };
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
    });
  });

  return positions;
}

<<<<<<< HEAD
function computeZoneBounds(zoneId, nodePositions, nodes) {
  if (!zoneId || zoneId === 'null') return null;
  const members = nodes.filter(n => n.zone === zoneId);
  if (members.length === 0) return null;
  const PAD = 40, NODE_W = 140, NODE_H = 80;
  const xs = members.map(n => nodePositions[n.id]?.x ?? 0);
  const ys = members.map(n => nodePositions[n.id]?.y ?? 0);
  return {
    x: Math.min(...xs) - PAD,
    y: Math.min(...ys) - PAD - 20,
    width:  Math.max(...xs) + NODE_W + PAD - (Math.min(...xs) - PAD),
    height: Math.max(...ys) + NODE_H + PAD - (Math.min(...ys) - PAD - 20),
  };
}

// ── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { nodes, edges, zones } = RAW;
  const positions = computeLayout(nodes, edges);

  // Annotation state — initialised from node.annotation field
  const [annotations, setAnnotations] = React.useState(() => {
    const map = {};
    nodes.forEach(n => { map[n.id] = n.annotation || ''; });
    return map;
  });

  // Selected node for annotation popup
  const [selectedNode, setSelectedNode] = React.useState(null);

  // Draggable popup state
  const [popupPos, setPopupPos]   = React.useState({ x: 16, y: 16 });
  const draggingRef               = React.useRef(false);
  const offsetRef                 = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      setPopupPos({ x: e.clientX - offsetRef.current.x, y: e.clientY - offsetRef.current.y });
    };
    const onUp = () => { draggingRef.current = false; };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    };
  }, []);

  // ── Zone group nodes ──
  const zoneNodes = (zones || []).map(zone => {
    const bounds = computeZoneBounds(zone.id, positions, nodes);
    if (!bounds) return null;
    const colors     = ZONE_COLORS[zone.color] || ZONE_COLORS.slate;
    const hasHighRisk = THREAT_MODE && nodes
      .filter(n => n.zone === zone.id)
      .some(n => NODE_THREATS[n.type]?.level === 'high');

    return {
      id: 'zone-' + zone.id, type: 'group',
      position: { x: bounds.x, y: bounds.y },
      style: {
        width: bounds.width, height: bounds.height,
        backgroundColor: hasHighRisk ? 'rgba(239,68,68,0.04)' : colors.bg,
        border: '2px dashed ' + (hasHighRisk ? '#ef4444' : colors.border),
        borderRadius: 14, zIndex: -1,
      },
      data: {
        label: React.createElement('div', {
          style: {
            position:'absolute', top:8, left:14, fontSize:11, fontWeight:700,
            color: hasHighRisk ? '#ef4444' : colors.label,
            textTransform:'uppercase', letterSpacing:'0.08em', pointerEvents:'none',
          }
        }, zone.label + (hasHighRisk ? ' ⚠️' : ''))
      },
      draggable: false, selectable: false,
    };
  }).filter(Boolean);

  // ── Regular nodes ──
  const rfNodes = nodes.map(n => {
    const pos    = positions[n.id] || { x: 0, y: 0 };
    const color  = NODE_COLORS[n.type] || NODE_COLORS.other;
    const icon   = NODE_ICONS[n.type]  || NODE_ICONS.other;
    const threat = NODE_THREATS[n.type];

    let finalPos = pos, parentNode = undefined, extent = undefined;
    if (n.zone && n.zone !== 'null' && zones && zones.find(z => z.id === n.zone)) {
      const bounds = computeZoneBounds(n.zone, positions, nodes);
      if (bounds) {
        finalPos   = { x: pos.x - bounds.x, y: pos.y - bounds.y };
        parentNode = 'zone-' + n.zone;
        extent     = 'parent';
      }
    }

    const threatBadge = THREAT_MODE && threat
      ? React.createElement('div', {
          className: 'threat-badge',
          title: threat.label + ' | STRIDE: ' + threat.stride,
          style: { background: THREAT_COLORS[threat.level] }
        }, THREAT_LABELS[threat.level])
      : null;

    const nodeStyle = THREAT_MODE
      ? { background: color, opacity: threat?.level === 'low' ? 0.7 : 1 }
      : { background: color };

    return {
      id: n.id, position: finalPos, parentNode, extent,
      data: {
        label: React.createElement('div', { className:'node-box', style: nodeStyle },
          threatBadge,
          React.createElement('div', { className:'node-icon'  }, icon),
          React.createElement('div', { className:'node-label' }, n.label),
          React.createElement('div', { className:'node-type'  }, n.type),
          THREAT_MODE && threat ? React.createElement('div', {
            style: {
              fontSize:9, marginTop:3, color:'white', opacity:0.9,
              background: THREAT_COLORS[threat.level],
              padding:'1px 5px', borderRadius:3, maxWidth:110,
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            },
            title: threat.label,
          }, threat.label) : null,
        )
      },
      style: { background:'transparent', border:'none', padding:0 },
    };
  });

  // ── Edges ──
  const rfEdges = edges.map((e, i) => {
    const edgeThreat  = THREAT_MODE && e.protocol ? EDGE_THREATS[e.protocol] : null;
    const baseLabel   = [e.protocol, e.label].filter(Boolean).join(' · ') || undefined;
    const threatLabel = edgeThreat
      ? (baseLabel ? baseLabel + ' ⚠' : '⚠ ' + edgeThreat.label)
      : baseLabel;
    const strokeColor = edgeThreat ? THREAT_COLORS[edgeThreat.level] : '#94a3b8';
    const strokeWidth = edgeThreat?.level === 'high' ? 2.5 : edgeThreat?.level === 'medium' ? 2 : 1.5;

    return {
      id: 'e' + i,
      source: e.source, target: e.target,
      type: 'smoothstep',
      animated: THREAT_MODE
        ? edgeThreat?.level === 'high'
        : (!!e.protocol && ['WebSocket','AMQP'].includes(e.protocol)),
      markerEnd:   { type:'ArrowClosed', color: strokeColor, width:16, height:16 },
      markerStart: e.bidirectional
        ? { type:'ArrowClosed', color: strokeColor, width:16, height:16 }
        : undefined,
      label: threatLabel,
      style: { stroke: strokeColor, strokeWidth },
      labelStyle:   { fontSize:10, fontWeight:700, fill: edgeThreat ? THREAT_COLORS[edgeThreat.level] : '#475569' },
      labelBgStyle: { fill:'#f8fafc', fillOpacity:0.95, rx:4 },
      labelBgPadding: [4, 6],
    };
  });

  const allNodes = [...zoneNodes, ...rfNodes];
  const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;

  // ── Annotation popup ──
  const selectedRawNode = selectedNode
    ? nodes.find(n => n.id === selectedNode.id)
    : null;

  const annotationPopup = selectedRawNode ? React.createElement('div', {
    className: 'annotation-popup',
    style: { left: popupPos.x, top: popupPos.y },
  },
    // Header / drag handle
    React.createElement('div', {
      className: 'annotation-popup-header',
      onMouseDown: (e) => {
        draggingRef.current = true;
        offsetRef.current = { x: e.clientX - popupPos.x, y: e.clientY - popupPos.y };
        e.preventDefault();
      },
    },
      React.createElement('div', { className: 'annotation-popup-title' },
        (NODE_ICONS[selectedRawNode.type] || '📦') + ' ' + selectedRawNode.label
      ),
      React.createElement('div', {
        className: 'annotation-popup-close',
        onClick: () => setSelectedNode(null),
      }, '×'),
    ),
    // Description (read-only)
    selectedRawNode.description ? React.createElement('div', {
      style: { fontSize:11, color:'#64748b', marginBottom:6, lineHeight:'1.4' }
    }, selectedRawNode.description) : null,
    // Annotation textarea
    React.createElement('textarea', {
      value: annotations[selectedRawNode.id] || '',
      placeholder: 'Add notes…',
      onChange: (e) => {
        const val = e.target.value;
        setAnnotations(prev => ({ ...prev, [selectedRawNode.id]: val }));
      },
      onBlur: (e) => {
        // Send annotation back to React Native / parent
        const msg = JSON.stringify({ type:'SAVE_NOTE', nodeId: selectedRawNode.id, annotation: e.target.value });
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(msg);
        else window.parent.postMessage(msg, '*');
      },
    }),
  ) : null;

  return React.createElement('div', { style:{ width:'100%', height:'100%', position:'relative' } },
    React.createElement(ReactFlow, {
      defaultNodes: allNodes,
      defaultEdges: rfEdges,
      fitView: true,
      fitViewOptions: { padding: 0.25 },
      nodesDraggable: true,
      minZoom: 0.1, maxZoom: 2,
      proOptions: { hideAttribution: true },
      onNodeClick: (_event, node) => {
        if (node.id.startsWith('zone-')) return;
        setSelectedNode(node);
        setPopupPos({ x: 16, y: 16 });
      },
    },
      React.createElement(Background, { color:'#3d6b56', gap:28, size:1.5 }),
      React.createElement(Controls,   { showInteractive:false }),
      React.createElement(MiniMap, {
        style: { backgroundColor:'#1e3329', borderRadius:8, border:'1px solid #3d6b56' },
        maskColor: 'rgba(30,51,41,0.8)',
        nodeColor: n => n.id.startsWith('zone-') ? '#3d6b56' : (NODE_COLORS[n.type] || '#94a3b8'),
      }),
    ),

    // Annotation popup (rendered outside ReactFlow so it sits above everything)
    annotationPopup,

    // Threat legend
    THREAT_MODE ? React.createElement('div', { id:'threat-legend' },
      React.createElement('div', { className:'legend-title' }, '🛡️ STRIDE Threat View'),
      ['high','medium','low'].map(level =>
        React.createElement('div', { key:level, className:'legend-row' },
          React.createElement('div', { className:'legend-dot', style:{ background: THREAT_COLORS[level] } }),
          React.createElement('span', null,
            level === 'high' ? 'High Risk' : level === 'medium' ? 'Medium Risk' : 'Low Risk'
          ),
        )
      ),
      React.createElement('div', {
        style:{ marginTop:4, fontSize:10, color:'#94a3b8', borderTop:'1px solid #e2e8f0', paddingTop:6 }
      }, 'Spoofing · Tampering · Repudiation · Info Disclosure · DoS · Elevation')
    ) : null,
=======
function App() {
  const positions = computeLayout(RAW.nodes, RAW.edges);

  const [selectedNode, setSelectedNode] = React.useState(null);

  const [annotations, setAnnotations] = React.useState(() => {
    const map = {};
    RAW.nodes.forEach(n => {
      map[n.id] = n.description || '';
    });
    return map;
  });

  // ✅ draggable state
  const [popupPos, setPopupPos] = React.useState({ x: 10, y: 10 });
  const draggingRef = React.useRef(false);
  const offsetRef = React.useRef({ x: 0, y: 0 });

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (!draggingRef.current) return;
      setPopupPos({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y
      });
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const rfNodes = RAW.nodes.map(n => ({
    id: n.id,
    position: positions[n.id] || { x: 0, y: 0 },
    data: {
      label: React.createElement('div', {
        className: 'node-box',
        style: { background: COLORS[n.type] || COLORS.other }
      },
        React.createElement('div', null, n.label),
        React.createElement('div', { className: 'node-type' }, n.type)
      )
    },
    style: { background: 'transparent', border: 'none', padding: 0, pointerEvents: 'all', zIndex: 10 },
  }));

  const rfEdges = RAW.edges.map((e, i) => ({
    id: 'e' + i,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { stroke: '#94a3b8', pointerEvents: 'none' },
    labelStyle: { fontSize: 10, fill: '#64748b' },
  }));

  const { ReactFlow, Background, Controls } = window.ReactFlow;

  return React.createElement('div', { style: { width:'100%', height:'100%', position:'relative' } },

    React.createElement(ReactFlow, {
      defaultNodes: rfNodes,
      defaultEdges: rfEdges,
      fitView: true,
      nodesDraggable: true,

      onNodeClick: (event, node) => {
        setSelectedNode(node);

        setPopupPos({
          x: 10,
          y: 10
        });
      }

    },
      React.createElement(Background, { gap: 20 }),
      React.createElement(Controls)
    ),

    selectedNode && React.createElement(
      'div',
      {
        style: {
          position: 'absolute',
          left: popupPos.x,
          top: popupPos.y,
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          width: '220px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          fontSize: '12px',
          zIndex: 999,
          cursor: draggingRef.current ? 'grabbing' : 'default',
          userSelect: 'none'
        }
      },

      // ✅ header with close button
      React.createElement('div', {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px',
          cursor: 'grab'
        },
        onMouseDown: (e) => {
          draggingRef.current = true;
          offsetRef.current = {
            x: e.clientX - popupPos.x,
            y: e.clientY - popupPos.y
          };
        }
      },
        React.createElement('div', { style: { fontWeight: '600' } }, selectedNode.data.label.props.children[0].props.children),

        React.createElement('div', {
          style: {
            cursor: 'pointer',
            fontWeight: '700',
            padding: '2px 6px'
          },
          onClick: () => setSelectedNode(null)
        }, '×')
      ),

      React.createElement('textarea', {
        value: annotations[selectedNode.id] || '',
        placeholder: 'Add notes...',
        style: {
          width: '100%',
          fontSize: '11px',
          borderRadius: '6px',
          padding: '4px'
        },
        onChange: (e) => {
          const val = e.target.value;
          setAnnotations(prev => ({
            ...prev,
            [selectedNode.id]: val
          }));
        },
        onBlur: (e) => {
          window.parent.postMessage(JSON.stringify({
            type: 'SAVE_NOTE',
            nodeId: selectedNode.id,
            annotation: e.target.value
          }), "*");
        }
      })
    )
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
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
<<<<<<< HEAD
  zones = [],
  threatMode = false,
  setNodes,
}: {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  zones?: ZoneSchema[];
  threatMode?: boolean;
  setNodes: React.Dispatch<React.SetStateAction<NodeSchema[]>>;
}) {
  const webviewRef = useRef<any>(null);
  const html = buildHtml(nodes, edges, zones, threatMode);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent?.data ?? event.data);
      if (data.type === "SAVE_NOTE") {
        setNodes((prev) =>
          prev.map((n) =>
            n.id === data.nodeId ? { ...n, annotation: data.annotation } : n,
          ),
        );
      }
    } catch (_) {}
  };

  if (Platform.OS === "web") {
=======
  setNodes
}: {
  nodes: NodeSchema[],
  edges: EdgeSchema[],
  setNodes: React.Dispatch<React.SetStateAction<NodeSchema[]>>
}) {
  const webviewRef = useRef<any>(null)
  const html = buildHtml(nodes, edges)

  if (Platform.OS === 'web') {
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
    return (
      <View style={styles.container}>
        <iframe
          srcDoc={html}
<<<<<<< HEAD
          style={{ width: "100%", height: "100%", border: "none" }}
          sandbox="allow-scripts allow-same-origin"
          // Web iframe messaging
          ref={(frame) => {
            if (!frame) return;
            const handler = (e: MessageEvent) => {
              try {
                const data = JSON.parse(e.data);
                if (data.type === "SAVE_NOTE") {
                  setNodes((prev) =>
                    prev.map((n) =>
                      n.id === data.nodeId
                        ? { ...n, annotation: data.annotation }
                        : n,
                    ),
                  );
                }
              } catch (_) {}
            };
            window.addEventListener("message", handler);
          }}
        />
      </View>
    );
=======
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-scripts allow-same-origin"
        />
      </View>
    )
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webviewRef}
<<<<<<< HEAD
        source={{ html, baseUrl: "" }}
        originWhitelist={["*"]}
        javaScriptEnabled
        onMessage={handleMessage}
=======
        source={{ html }}
        originWhitelist={['*']}
        javaScriptEnabled
        onMessage={(event) => {
          const data = JSON.parse(event.nativeEvent.data)

          if (data.type === 'SAVE_NOTE') {
            setNodes(prev =>
              prev.map(n =>
                n.id === data.nodeId
                  ? { ...n, annotation: data.annotation }
                  : n
              )
            )
          }
        }}
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", height: 420 },
  webview: { flex: 1 },
});
