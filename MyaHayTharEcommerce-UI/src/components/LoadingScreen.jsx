import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'

export default function LoadingScreen() {
  const { reduceMotion } = useApp()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), reduceMotion ? 0 : 1800)
    return () => clearTimeout(timer)
  }, [reduceMotion])

  if (reduceMotion) return null

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-cream"
        >
          <motion.img
            src="/logo.png"
            alt="Hay Thar"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-24 w-auto object-contain sm:h-28"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-1 text-sm text-plum/50"
          >
            Loading cute stuff...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
