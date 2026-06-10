'use client'

import type { CustomRequest } from '@/lib/types'

const STEPS = [
  { key: 'intake', label: 'Intake & Feasibility' },
  { key: 'design', label: 'Design' },
  { key: 'pricing', label: 'Materials & Pricing' },
  { key: 'listing', label: 'Listing' },
] as const

function stepStatus(request: CustomRequest, step: typeof STEPS[number]['key']) {
  switch (step) {
    case 'intake': return request.intake_status
    case 'design': return request.design_status
    case 'pricing': return request.pricing_status
    case 'listing': return request.listing_status
  }
}

interface Props {
  request: CustomRequest
  onRunStep: (step: string) => void
  loading?: string | null
}

export function PipelineStatus({ request, onRunStep, loading }: Props) {
  return (
    <div className="space-y-2">
      {STEPS.map((step, i) => {
        const status = stepStatus(request, step.key)
        const isPending = status === 'pending'
        const isProcessing = status === 'processing' || loading === step.key
        const isComplete = status === 'complete' || status === 'feasible' || status === 'needs_splitting'
        const isFailed = status === 'failed'
        const isRejected = status === 'rejected'

        const prevComplete = i === 0
          ? true
          : (['complete', 'feasible'] as string[]).includes(stepStatus(request, STEPS[i - 1].key))

        const canRun = isPending && prevComplete && !loading

        return (
          <div
            key={step.key}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              isComplete ? 'bg-green-50' :
              isFailed || isRejected ? 'bg-red-50' :
              isProcessing ? 'bg-blue-50' : 'bg-gray-50'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
              isComplete ? 'bg-green-500 text-white' :
              isFailed || isRejected ? 'bg-red-500 text-white' :
              isProcessing ? 'bg-blue-500 text-white animate-pulse' :
              'bg-gray-200 text-gray-500'
            }`}>
              {isComplete ? '✓' : isFailed || isRejected ? '✗' : isProcessing ? '…' : i + 1}
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700">{step.label}</span>
            {canRun && (
              <button
                onClick={() => onRunStep(step.key)}
                className="text-xs px-3 py-1 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Run
              </button>
            )}
            {isProcessing && (
              <span className="text-xs text-blue-600">Running…</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
