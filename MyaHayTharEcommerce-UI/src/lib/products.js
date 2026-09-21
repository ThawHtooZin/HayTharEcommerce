export function productImage(image) {
  return new URL(`../assets/products/${image}`, import.meta.url).href
}

export const FREE_SHIPPING_THRESHOLD = 105000

export const SHIPPING_COST = 6.99
export const BULK_DISCOUNT_PERCENT = 10
export const BULK_DISCOUNT_MIN_ITEMS = 2

export function getFreeShippingThreshold() {
  return FREE_SHIPPING_THRESHOLD
}

export function formatPrice(amount) {
  return `K${Math.round(amount * 2100).toLocaleString()}`
}

export function calcCartTotals(items) {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  let discount = 0
  if (totalItems >= BULK_DISCOUNT_MIN_ITEMS) {
    discount = subtotal * (BULK_DISCOUNT_PERCENT / 100)
  }
  const afterDiscount = Math.max(0, subtotal - discount)
  const threshold = getFreeShippingThreshold()
  const shipping = afterDiscount >= threshold ? 0 : SHIPPING_COST
  const total = afterDiscount + shipping
  const freeShippingRemaining = Math.max(0, threshold - afterDiscount)

  return { subtotal, discount, shipping, total, freeShippingRemaining, totalItems, afterDiscount, threshold }
}

export const PRICE_FILTERS = [
  { label: 'Under K42,000', value: 20 },
  { label: 'Under K73,500', value: 35 },
  { label: 'Under K105,000', value: 50 },
  { label: 'Under K210,000', value: 100 },
]
