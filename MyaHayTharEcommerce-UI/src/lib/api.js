import axios from 'axios'

/** API list responses must be arrays; nginx SPA fallback can return HTML and crash .map() */
export const ensureArray = (data) => {
  if (Array.isArray(data)) return data
  if (data && Array.isArray(data.data)) return data.data
  return []
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { Accept: 'application/json' },
})

/** Origin for uploaded files (/storage/...) — API server, not the React dev server */
export const apiOrigin = () => {
  const base = import.meta.env.VITE_API_URL || ''
  if (base.startsWith('http')) return base.replace(/\/api\/?$/, '')
  return ''
}

/** Turn /storage/... or bad localhost URLs into a loadable image URL */
export const resolveStorageUrl = (url) => {
  if (!url) return url
  if (url.startsWith('/storage/')) {
    const origin = apiOrigin()
    return origin ? `${origin}${url}` : url
  }
  if (url.startsWith('http://localhost/storage') || url.startsWith('http://localhost:80/storage')) {
    const origin = apiOrigin() || 'http://127.0.0.1:8000'
    return url.replace(/^http:\/\/localhost(?::80)?/, origin)
  }
  return url
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('haythar_token')
  const guestToken = localStorage.getItem('haythar_guest_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (guestToken && !token) config.headers['X-Guest-Token'] = guestToken
  return config
})

export const getProducts = (params = {}) =>
  api.get('/products', { params }).then((r) => ensureArray(r.data))
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data)
export const getCategories = () =>
  api.get('/categories').then((r) => ensureArray(r.data))
export const getPaymentMethods = () => api.get('/payment-methods').then((r) => ensureArray(r.data))
export const subscribeNewsletter = (email) => api.post('/newsletter', { email }).then((r) => r.data)

export const placeOrder = (data, paymentSlip = null) => {
  if (paymentSlip) {
    const form = new FormData()
    Object.entries(data).forEach(([key, value]) => {
      if (value == null || value === '') return
      if (key === 'items') form.append(key, JSON.stringify(value))
      else form.append(key, value)
    })
    form.append('payment_slip', paymentSlip)
    return api.post('/orders', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
  }
  return api.post('/orders', data).then((r) => r.data)
}

export const uploadPaymentSlip = ({ order_number, email, payment_slip }) => {
  const form = new FormData()
  form.append('order_number', order_number)
  form.append('email', email)
  form.append('payment_slip', payment_slip)
  return api.post('/orders/payment-slip', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data)
}
export const claimAccount = (data) => api.post('/orders/claim-account', data).then((r) => r.data)
export const trackOrder = (orderNumber, email) =>
  api.get('/orders/track', { params: { order_number: orderNumber, email } }).then((r) => r.data)
export const getGuestMe = () => api.get('/guest/me').then((r) => r.data)
export const getGuestOrders = () => api.get('/guest/orders').then((r) => r.data)
export const upgradeGuest = (data) => api.post('/guest/upgrade', data).then((r) => r.data)
export const login = (email, password) => api.post('/login', { email, password }).then((r) => r.data)
export const register = (name, email, password, password_confirmation) =>
  api.post('/register', { name, email, password, password_confirmation }).then((r) => r.data)
export const logout = () => api.post('/logout')
export const getMe = () => api.get('/me').then((r) => r.data)
export const getOrders = () => api.get('/orders').then((r) => r.data)
export const getWishlist = () => api.get('/wishlist').then((r) => r.data)
export const addToWishlist = (productId) => api.post('/wishlist', { product_id: productId })
export const removeFromWishlist = (productId) => api.delete(`/wishlist/${productId}`)
export const addReview = (productId, data) => api.post(`/products/${productId}/reviews`, data)

export const adminDashboard = () => api.get('/admin/dashboard').then((r) => r.data)
export const adminOrders = (params) => api.get('/admin/orders', { params }).then((r) => r.data)
export const adminOrder = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data)
export const adminUpdateOrder = (id, data) => api.patch(`/admin/orders/${id}`, data).then((r) => r.data)
export const adminRefundOrder = (id, data) => api.post(`/admin/orders/${id}/refund`, data).then((r) => r.data)
export const adminConfirmPayment = (id) => api.post(`/admin/orders/${id}/confirm-payment`).then((r) => r.data)
export const adminRejectPayment = (id, data) => api.post(`/admin/orders/${id}/reject-payment`, data).then((r) => r.data)
export const adminProducts = () => api.get('/admin/products').then((r) => r.data)
export const adminCreateProduct = (data) => api.post('/admin/products', data).then((r) => r.data)
export const adminProduct = (id) => api.get(`/admin/products/${id}`).then((r) => r.data)
export const adminCategories = () => api.get('/admin/categories').then((r) => r.data)
export const adminCreateCategory = (data) => api.post('/admin/categories', data).then((r) => r.data)
export const adminUpdateCategory = (id, data) => api.patch(`/admin/categories/${id}`, data).then((r) => r.data)
export const adminDeleteCategory = (id) => api.delete(`/admin/categories/${id}`).then((r) => r.data)
export const adminUpdateProduct = (id, data) => api.patch(`/admin/products/${id}`, data).then((r) => r.data)
export const adminCustomers = (params) => api.get('/admin/customers', { params }).then((r) => r.data)
export const adminDiscounts = () => api.get('/admin/discounts').then((r) => r.data)
export const adminCreateDiscount = (data) => api.post('/admin/discounts', data).then((r) => r.data)
export const adminSalesReport = (period) => api.get('/admin/reports/sales', { params: { period } }).then((r) => r.data)
export const adminProductReport = () => api.get('/admin/reports/products').then((r) => r.data)
export const adminNewsletter = () => api.get('/admin/newsletter').then((r) => r.data)

export default api
