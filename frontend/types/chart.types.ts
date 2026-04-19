// Represents a single node in the architecture diagram, including its unique identifier, type (e.g., component, service, database), label for display purposes, and a description of its role in the system
export interface NodeSchema {
  id: string;
  type: string;
  label: string;
  description: string;
  zone?: string | null;
}

// Represents a directed connection between two nodes in the architecture diagram, with an optional label describing the relationship
export interface EdgeSchema {
  source: string;
  target: string;
  label: string;
  protocol?: string | null;
  bidirectional?: boolean;
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ArchSchema {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  zones?: ZoneSchema[];
  feedback: string[];
  summary?: string;
  image_filename?: string;
  image_url?: string;
  share_token?: string;
  confidence?: number;
  confidence_reason?: string;
  duplicate?: boolean;
}

// Represents a single item in the history of uploaded architecture diagrams, including its extracted nodes, edges, feedback, and associated image filename (if any)
export interface HistoryItem {
  id: string;
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  zones?: ZoneSchema[];
  feedback: string[];
  summary?: string;
  image_filename: string | null;
  image_url?: string;
  share_token?: string;
}

export interface ZoneSchema {
  id: string;
  label: string;
  color: string;
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ImprovedSchema extends ArchSchema {
  improvements: string[];
}

export interface ArchStats {
  total_scans: { count: number }[];
  node_type_distribution: { _id: string; count: number }[];
  protocol_usage: { _id: string; count: number }[];
  avg_complexity: { avgNodes: number; avgEdges: number; avgZones: number }[];
  scans_over_time: { _id: string; count: number }[];
}
