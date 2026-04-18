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