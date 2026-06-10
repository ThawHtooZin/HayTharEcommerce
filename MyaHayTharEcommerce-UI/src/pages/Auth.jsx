import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Auth() {
  const { login, register, showToast, user } = useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    const email = searchParams.get('email')
    if (email) setForm((f) => ({ ...f, email }))
  }, [searchParams])

  useEffect(() => {
    if (user) navigate(redirect, { replace: true })
  }, [user, redirect, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(form.email, form.password)
      } else {
        await register(form.name, form.email, form.password, form.password_confirmation)
      }
      showToast(`Welcome back, cutie! 💖`)
      navigate(redirect, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed'
      showToast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (user) return null

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-4 py-16">
      <div className="rounded-3xl bg-white p-8 shadow-sm">
        <h1 className="text-center font-display text-2xl font-bold text-plum">
          {mode === 'login' ? 'Welcome back 💖' : 'Join HayThar'}
        </h1>
        <p className="mt-1 text-center text-sm text-plum/60">
          {redirect === '/checkout'
            ? 'Sign in or create an account to complete your order'
            : mode === 'login'
              ? 'Sign in to track orders & wishlists'
              : 'Create an account for the cutest shopping experience'}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              required
              className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm outline-none focus:border-pink"
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm outline-none focus:border-pink"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            minLength={8}
            className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm outline-none focus:border-pink"
          />
          {mode === 'register' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={form.password_confirmation}
              onChange={(e) => update('password_confirmation', e.target.value)}
              required
              className="w-full rounded-2xl border border-blush bg-cream px-4 py-3 text-sm outline-none focus:border-pink"
            />
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-pink py-3 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-plum/60">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('register')} className="font-semibold text-pink hover:underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')} className="font-semibold text-pink hover:underline">Sign in</button></>
          )}
        </p>

        {mode === 'login' && (
          <p className="mt-3 text-center text-xs text-plum/40">
            Demo: demo@haythar.com / password
          </p>
        )}
      </div>
    </div>
  )
}
