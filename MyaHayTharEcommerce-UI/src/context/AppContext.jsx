import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  getGuestMe,
  getMe,
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
} from '../lib/api'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [guest, setGuest] = useState(null)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('haythar_cart') || '[]') } catch { return [] }
  })
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('haythar_wishlist') || '[]') } catch { return [] }
  })
  const [currency, setCurrency] = useState(() => localStorage.getItem('haythar_currency') || 'USD')
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('haythar_reduce_motion') === 'true')
  const [largeText, setLargeText] = useState(() => localStorage.getItem('haythar_large_text') === 'true')
  const [invertColors, setInvertColors] = useState(() => localStorage.getItem('haythar_invert') === 'true')
  const [readingMask, setReadingMask] = useState(() => localStorage.getItem('haythar_reading_mask') === 'true')
  const [toast, setToast] = useState(null)

  useEffect(() => { localStorage.setItem('haythar_cart', JSON.stringify(cart)) }, [cart])
  useEffect(() => { localStorage.setItem('haythar_wishlist', JSON.stringify(wishlist)) }, [wishlist])
  useEffect(() => { localStorage.setItem('haythar_currency', currency) }, [currency])

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('reduce-motion', reduceMotion)
    root.classList.toggle('a11y-large-text', largeText)
    root.classList.toggle('a11y-invert', invertColors)
    localStorage.setItem('haythar_reduce_motion', reduceMotion)
    localStorage.setItem('haythar_large_text', largeText)
    localStorage.setItem('haythar_invert', invertColors)
    localStorage.setItem('haythar_reading_mask', readingMask)
  }, [reduceMotion, largeText, invertColors, readingMask])

  const loadSession = useCallback(() => {
    const token = localStorage.getItem('haythar_token')
    const guestToken = localStorage.getItem('haythar_guest_token')

    if (token) {
      getMe()
        .then((u) => { setUser(u); setGuest(null) })
        .catch(() => localStorage.removeItem('haythar_token'))
      return
    }

    if (guestToken) {
      getGuestMe()
        .then(setGuest)
        .catch(() => {
          localStorage.removeItem('haythar_guest_token')
          setGuest(null)
        })
    }
  }, [])

  useEffect(() => { loadSession() }, [loadSession])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const setGuestSession = useCallback((guestToken, guestData) => {
    localStorage.setItem('haythar_guest_token', guestToken)
    localStorage.removeItem('haythar_token')
    setUser(null)
    setGuest(guestData || { type: 'guest' })
  }, [])

  const setUserFromAuth = useCallback((data) => {
    localStorage.setItem('haythar_token', data.token)
    localStorage.removeItem('haythar_guest_token')
    setGuest(null)
    setUser(data.user)
    return data
  }, [])

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { product, quantity }]
    })
    showToast('Added to cart 🛍️')
  }, [showToast])

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId))
  }, [])

  const updateCartQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return
    setCart((prev) => prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i)))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((p) => p.id === product.id)
      if (exists) {
        showToast('Removed from wishlist')
        return prev.filter((p) => p.id !== product.id)
      }
      showToast('Saved to wishlist 💖')
      return [...prev, product]
    })
  }, [showToast, user])

  const isInWishlist = useCallback((productId) => wishlist.some((p) => p.id === productId), [wishlist])

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password)
    return setUserFromAuth(data)
  }, [setUserFromAuth])

  const register = useCallback(async (name, email, password, passwordConfirmation) => {
    const data = await apiRegister(name, email, password, passwordConfirmation)
    return setUserFromAuth(data)
  }, [setUserFromAuth])

  const logout = useCallback(async () => {
    try { await apiLogout() } catch { /* ignore */ }
    localStorage.removeItem('haythar_token')
    setUser(null)
  }, [])

  const logoutGuest = useCallback(() => {
    localStorage.removeItem('haythar_guest_token')
    setGuest(null)
  }, [])

  const cartCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart])
  const isAdmin = user?.role === 'admin'
  const isGuest = !!guest && !user
  const isMember = !!user
  const displayName = user?.name?.split(' ')[0] || guest?.name?.split(' ')[0] || 'cutie'

  const value = {
    user, guest, cart, wishlist, currency, reduceMotion, largeText, invertColors, readingMask,
    toast, cartCount, isAdmin, isGuest, isMember, displayName,
    setCurrency, setReduceMotion, setLargeText, setInvertColors, setReadingMask,
    setUser, setGuestSession, setUserFromAuth, showToast, loadSession,
    addToCart, removeFromCart, updateCartQuantity, clearCart,
    toggleWishlist, isInWishlist, login, register, logout, logoutGuest,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
