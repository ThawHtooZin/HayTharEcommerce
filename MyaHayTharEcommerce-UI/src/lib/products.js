export function productImage(image) {
  return new URL(`../assets/products/${image}`, import.meta.url).href
}

export const FREE_SHIPPING_THRESHOLDS = {
  USD: 49.99,
  AUD: 150,
  EUR: 45,
  GBP: 40,
  JPY: 7500,
  MMK: 105000,
}

export const SHIPPING_COST = 6.99
export const BULK_DISCOUNT_PERCENT = 10
export const BULK_DISCOUNT_MIN_ITEMS = 2

export const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  AUD: { symbol: 'A$', rate: 1.55 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  JPY: { symbol: '¥', rate: 150 },
  MMK: { symbol: 'K', rate: 2100 },
}

export function getFreeShippingThreshold(currency = 'USD') {
  return FREE_SHIPPING_THRESHOLDS[currency] ?? FREE_SHIPPING_THRESHOLDS.USD
}

export function formatPrice(amount, currency = 'USD') {
  const { symbol, rate } = CURRENCIES[currency] || CURRENCIES.USD
  const converted = amount * rate
  if (currency === 'JPY' || currency === 'MMK') {
    return `${symbol}${Math.round(converted).toLocaleString()}`
  }
  return `${symbol}${converted.toFixed(2)}`
}

export function calcCartTotals(items, currency = 'USD') {
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  let discount = 0
  if (totalItems >= BULK_DISCOUNT_MIN_ITEMS) {
    discount = subtotal * (BULK_DISCOUNT_PERCENT / 100)
  }
  const afterDiscount = Math.max(0, subtotal - discount)
  const threshold = getFreeShippingThreshold(currency)
  const shipping = afterDiscount >= threshold ? 0 : SHIPPING_COST
  const total = afterDiscount + shipping
  const freeShippingRemaining = Math.max(0, threshold - afterDiscount)

  return { subtotal, discount, shipping, total, freeShippingRemaining, totalItems, afterDiscount, threshold }
}

export const AESTHETICS = [
  { slug: 'soft-girl', name: 'Soft Girl', description: 'Dreamy, romantic, easy to wear' },
  { slug: 'y2k', name: 'Y2K', description: 'Chrome hearts & butterfly clips' },
  { slug: 'fairy-kei', name: 'Fairy Kei', description: 'Pastel fairycore softness' },
  { slug: 'pastel-goth', name: 'Pastel Goth', description: 'Black + pink, always' },
]

export const PRICE_FILTERS = [
  { label: 'Under $20', value: 20 },
  { label: 'Under $35', value: 35 },
  { label: 'Under $50', value: 50 },
  { label: 'Under $100', value: 100 },
]
