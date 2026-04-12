import ELK from 'elkjs/lib/elk.bundled.js'
import type { WorkflowData, WorkflowNode } from '@/types/workflow'

const elk = new ELK()

const SCALE = 0.05
const Y_SCALE = -0.03

export async function layoutWorkflow(
  data: WorkflowData
): Promise<WorkflowNode[]> {
  const graph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.spacing.nodeNode': '80',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.edgeRouting': 'SPLINES',
    },
    children: data.nodes.map((n) => ({
      id: n.id,
      width: 80,
      height: 50,
    })),
    edges: data.edges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const layout = await elk.layout(graph)

  // Find center for centering the graph
  let cx = 0
  let cy = 0
  const children = layout.children ?? []
  for (const child of children) {
    cx += (child.x ?? 0) + (child.width ?? 0) / 2
    cy += (child.y ?? 0) + (child.height ?? 0) / 2
  }
  cx /= children.length
  cy /= children.length

  return data.nodes.map((node) => {
    const layoutNode = children.find((c) => c.id === node.id)
    const rawX = (layoutNode?.x ?? 0) + (layoutNode?.width ?? 0) / 2
    const rawY = (layoutNode?.y ?? 0) + (layoutNode?.height ?? 0) / 2

    return {
      ...node,
      x: (rawX - cx) * SCALE,
      y: (rawY - cy) * Y_SCALE,
      z: 0,
    }
  })
}
