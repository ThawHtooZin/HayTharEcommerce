const STORAGE_KEY = 'haythar_guest_orders'

export function saveGuestOrder(order) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const entry = {
      order_number: order.order_number,
      email: order.email,
      total: order.total,
      placed_at: order.created_at || new Date().toISOString(),
    }
    const filtered = existing.filter((o) => o.order_number !== entry.order_number)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([entry, ...filtered].slice(0, 10)))
  } catch { /* ignore */ }
}

export function getGuestOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}
