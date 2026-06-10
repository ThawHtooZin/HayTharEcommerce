import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './site/Header'
import Footer from './site/Footer'
import Toast from './Toast'
import AccessibilityWidget from './AccessibilityWidget'
import { useApp } from '../context/AppContext'

export default function Layout() {
  const location = useLocation()
  const { reduceMotion } = useApp()
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <Toast />
      <AccessibilityWidget />
    </div>
  )
}
