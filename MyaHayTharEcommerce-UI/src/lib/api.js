import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { Accept: 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('haythar_token')
  const guestToken = localStorage.getItem('haythar_guest_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  if (guestToken && !token) config.headers['X-Guest-Token'] = guestToken
  return config
})

export const getProducts = (params = {}) => api.get('/products', { params }).then((r) => r.data)
export const getProduct = (slug) => api.get(`/products/${slug}`).then((r) => r.data)
export const getCategories = () => api.get('/categories').then((r) => r.data)
export const subscribeNewsletter = (email) => api.post('/newsletter', { email }).then((r) => r.data)
export const placeOrder = (data) => api.post('/orders', data).then((r) => r.data)
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
export const adminUpdateOrder = (id, data) => api.patch(`/admin/orders/${id}`, data).then((r) => r.data)
export const adminRefundOrder = (id, data) => api.post(`/admin/orders/${id}/refund`, data).then((r) => r.data)
export const adminProducts = () => api.get('/admin/products').then((r) => r.data)
export const adminUpdateProduct = (id, data) => api.patch(`/admin/products/${id}`, data).then((r) => r.data)
export const adminCustomers = (params) => api.get('/admin/customers', { params }).then((r) => r.data)
export const adminDiscounts = () => api.get('/admin/discounts').then((r) => r.data)
export const adminCreateDiscount = (data) => api.post('/admin/discounts', data).then((r) => r.data)
export const adminSalesReport = (period) => api.get('/admin/reports/sales', { params: { period } }).then((r) => r.data)
export const adminProductReport = () => api.get('/admin/reports/products').then((r) => r.data)
export const adminNewsletter = () => api.get('/admin/newsletter').then((r) => r.data)

export default api
