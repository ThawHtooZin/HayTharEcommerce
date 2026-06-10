import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function NotFound() {
  const { reduceMotion } = useApp()
  const M = reduceMotion ? 'div' : motion.div

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
      <M
        {...(!reduceMotion && {
          animate: { y: [0, -12, 0], rotate: [0, 5, -5, 0] },
          transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
        })}
        className="text-7xl"
      >
        🥺
      </M>

      <h1 className="mt-6 font-display text-5xl font-bold text-plum">404</h1>
      <p className="mt-2 font-display text-xl text-pink">Oopsie! Page got lost~</p>
      <p className="mt-3 text-sm leading-relaxed text-plum/60">
        This page wandered off to find more cute stuff and never came back.
        Let's get you somewhere cozy instead!
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-3 text-sm font-semibold text-white hover:bg-pink-dark"
        >
          <Home size={16} /> Back home
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 rounded-full border border-blush bg-white px-6 py-3 text-sm font-semibold text-plum hover:border-pink hover:text-pink"
        >
          <Search size={16} /> Browse shop
        </Link>
      </div>

      <p className="mt-8 text-xs text-plum/40">
        Error code: too-cute-not-found ✨
      </p>
    </div>
  )
}
