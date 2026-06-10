import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast, reduceMotion } = useApp()

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -20 }}
          className={`fixed left-1/2 top-24 z-[90] -translate-x-1/2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg ${
            toast.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
          }`}
        >
          {toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
