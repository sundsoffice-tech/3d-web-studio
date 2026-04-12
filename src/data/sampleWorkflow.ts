import type { WorkflowData } from '@/types/workflow'

export const sampleWorkflow: WorkflowData = {
  nodes: [
    { id: 'webhook', label: 'Webhook', icon: '\u26A1', type: 'trigger', status: 'idle' },
    { id: 'validate', label: 'Validate', icon: '\uD83D\uDD0D', type: 'process', status: 'idle' },
    { id: 'transform', label: 'Transform', icon: '\u2699\uFE0F', type: 'process', status: 'idle' },
    { id: 'filter', label: 'Filter', icon: '\uD83D\uDCCB', type: 'process', status: 'idle' },
    { id: 'database', label: 'Database', icon: '\uD83D\uDDC4\uFE0F', type: 'output', status: 'idle' },
    { id: 'notify', label: 'Notify', icon: '\uD83D\uDCE7', type: 'output', status: 'idle' },
  ],
  edges: [
    { id: 'e1', source: 'webhook', target: 'validate', active: false },
    { id: 'e2', source: 'validate', target: 'transform', active: false },
    { id: 'e3', source: 'validate', target: 'filter', active: false },
    { id: 'e4', source: 'transform', target: 'database', active: false },
    { id: 'e5', source: 'filter', target: 'notify', active: false },
  ],
}
