import { useState } from 'react'
import { motion } from 'framer-motion'
import { subscribeNewsletter } from '../../lib/api'
import { useApp } from '../../context/AppContext'

export default function Newsletter() {
  const { showToast, reduceMotion } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await subscribeNewsletter(email)
      showToast('Welcome! Check your inbox for 10% off 💖')
      setEmail('')
    } catch {
      showToast('Already subscribed or invalid email', 'error')
    } finally {
      setLoading(false)
    }
  }

  const Wrapper = reduceMotion ? 'div' : motion.div

  return (
    <Wrapper
      {...(!reduceMotion && {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.5 },
      })}
      className="mx-auto max-w-3xl rounded-3xl bg-blush/60 px-6 py-12 text-center sm:px-12"
    >
      <h2 className="font-display text-3xl font-bold text-plum sm:text-4xl">
        Join the cuteness club
      </h2>
      <p className="mt-2 text-plum/70">
        Get 10% off your first order, restock alerts and secret drops.
      </p>
      <form onSubmit={handleSubmit} className="mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="flex-1 rounded-full border border-blush bg-white px-5 py-3 text-sm outline-none focus:border-pink"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-pink-dark disabled:opacity-50"
        >
          Get 10% off
        </button>
      </form>
    </Wrapper>
  )
}
