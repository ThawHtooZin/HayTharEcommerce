import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, MessageCircle, Video } from 'lucide-react'
import { subscribeNewsletter } from '../../lib/api'
import { useApp } from '../../context/AppContext'

export default function Footer() {
  const { showToast } = useApp()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      await subscribeNewsletter(email)
      showToast('Welcome to the cuteness club! 💖')
      setEmail('')
    } catch {
      showToast('Already subscribed or invalid email', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="mt-auto bg-blush/50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 lg:grid-cols-4 lg:px-8">
        <div>
          <Link to="/" className="font-display text-2xl font-bold">
            <span className="text-pink">Hay</span>
            <span className="text-plum">Thar</span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-plum/70">
            Curated kawaii goods, trendy streetwear and the softest accessories. Shipped worldwide with love.
          </p>
          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 rounded-full border border-blush bg-white px-4 py-2 text-sm outline-none focus:border-pink"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-pink px-4 py-2 text-sm font-semibold text-white hover:bg-pink-dark disabled:opacity-50"
            >
              Join
            </button>
          </form>
        </div>

        <div>
          <h4 className="font-display font-semibold text-plum">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-plum/70">
            <li><Link to="/shop" className="hover:text-pink">All products</Link></li>
            <li><Link to="/shop?category=apparel" className="hover:text-pink">Apparel</Link></li>
            <li><Link to="/shop?category=car-accessories" className="hover:text-pink">Car Accessories</Link></li>
            <li><Link to="/shop?category=blind-boxes" className="hover:text-pink">Blind Boxes</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-plum">Help</h4>
          <ul className="mt-3 space-y-2 text-sm text-plum/70">
            <li><Link to="/about" className="hover:text-pink">Contact</Link></li>
            <li><Link to="/account" className="hover:text-pink">My account</Link></li>
            <li><Link to="/track-order" className="hover:text-pink">Track order</Link></li>
            <li><a href="#shipping" className="hover:text-pink">Shipping</a></li>
            <li><a href="#returns" className="hover:text-pink">Returns</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-semibold text-plum">Follow</h4>
          <div className="mt-3 flex gap-3">
            {[Share2, MessageCircle, Video].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-blush bg-white text-plum transition-colors hover:border-pink hover:text-pink"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-blush/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-plum/50 sm:flex-row lg:px-8">
          <p>© {new Date().getFullYear()} HayThar Ecommerce. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-pink">Privacy Policy</a>
            <a href="#terms" className="hover:text-pink">Terms of Service</a>
            <a href="#returns" className="hover:text-pink">Refund Policy</a>
          </div>
          <p>Made with ❤️ for cuteness lovers</p>
        </div>
      </div>
    </footer>
  )
}
