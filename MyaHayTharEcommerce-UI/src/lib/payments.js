export const PAYMENT_STATUS_LABELS = {
  not_required: 'Paid',
  awaiting_slip: 'Awaiting slip',
  slip_submitted: 'Pending review',
  confirmed: 'Payment confirmed',
  rejected: 'Payment rejected',
}

export const isManualPayment = (method) =>
  method && method !== 'card'

export function paymentStatusColor(status) {
  switch (status) {
    case 'slip_submitted': return 'bg-amber-100 text-amber-800'
    case 'confirmed':
    case 'not_required': return 'bg-emerald-100 text-emerald-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'awaiting_slip': return 'bg-sky-100 text-sky-800'
    default: return 'bg-slate-100 text-slate-700'
  }
}
