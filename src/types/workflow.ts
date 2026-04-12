export type NodeStatus = 'idle' | 'active' | 'complete' | 'error'

export interface WorkflowNode {
  id: string
  label: string
  icon: string
  type: 'trigger' | 'process' | 'output'
  status: NodeStatus
  // Populated by ELK layout
  x?: number
  y?: number
  z?: number
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  active: boolean
}

export interface WorkflowData {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export const STATUS_COLORS: Record<NodeStatus, string> = {
  idle: '#2a2a4a',
  active: '#4080ff',
  complete: '#40ff80',
  error: '#ff4060',
}

export const STATUS_EMISSIVE: Record<NodeStatus, number> = {
  idle: 0,
  active: 0.5,
  complete: 0.3,
  error: 0.4,
}
