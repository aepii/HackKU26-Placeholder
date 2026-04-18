// Represents a single node in the architecture diagram, including its unique identifier, type (e.g., component, service, database), label for display purposes, and a description of its role in the system
export interface NodeSchema {
  id: string;
  type: string;
  label: string;
  description: string;
}

// Represents a directed connection between two nodes in the architecture diagram, with an optional label describing the relationship
export interface EdgeSchema {
  source: string;
  target: string;
  label: string;
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ArchSchema {
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  feedback: string[];
  image_filename?: string;
  share_token?: string;
}

// Represents a single item in the history of uploaded architecture diagrams, including its extracted nodes, edges, feedback, and associated image filename (if any)
export interface HistoryItem {
  id: string;
  nodes: NodeSchema[];
  edges: EdgeSchema[];
  feedback: string[];
  image_filename: string | null;
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ImprovedSchema extends ArchSchema {
  improvements: string[];
}
