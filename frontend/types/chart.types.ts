export interface NodeSchema {
  id: string
  type: string
  label: string
  description: string
}

export interface EdgeSchema {
  source: string
  target: string
  label: string
}

export interface ArchSchema {
  nodes: NodeSchema[]
  edges: EdgeSchema[]
  feedback: string[]
}

// Represents a single item in the history of uploaded architecture diagrams, including its extracted nodes, edges, feedback, and associated image filename (if any)
export interface HistoryItem {
  id: string
  nodes: NodeSchema[]
  edges: EdgeSchema[]
  feedback: string[]
  image_filename: string | null
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ArchSchema {
  nodes: NodeSchema[]
  edges: EdgeSchema[]
  feedback: string[]
  image_filename?: string   // ← add this (returned from validate endpoint)
}

// Extended schema that includes improvement suggestions based on the analysis of the architecture diagram, in addition to the original nodes, edges, and feedback
export interface ImprovedSchema extends ArchSchema {
  improvements: string[]
}