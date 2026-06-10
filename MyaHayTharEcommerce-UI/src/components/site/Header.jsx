import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { CURRENCIES } from '../../lib/products'

const navLinks = [
  { to: '/shop', label: 'Shop' },
  { to: '/about', label: 'About' },
]

export default function Header() {
  const { cartCount, wishlist, currency, setCurrency, isAdmin } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const linkClass = ({ isActive }) =>
    `font-medium transition-colors hover:text-pink ${isActive ? 'text-pink' : 'text-plum/70'}`

  return (
    <>
      <div className="bg-pink py-2 text-center text-sm font-medium text-white">
        Free worldwide shipping on orders over $49.99 — Extra 10% off when you buy 2 items 💖
      </div>

      <header className="sticky top-0 z-50 border-b border-blush/60 bg-cream/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight">
            <span className="text-pink">Hay</span>
            <span className="text-plum">Thar</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="hidden rounded-full border border-blush bg-white px-3 py-1.5 text-sm font-medium text-plum sm:block"
              aria-label="Currency"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-full p-2 text-plum transition-colors hover:bg-blush"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            <Link to="/account" className="rounded-full p-2 text-plum transition-colors hover:bg-blush" aria-label="Account">
              <User size={20} />
            </Link>

            {isAdmin && (
              <Link to="/admin" className="hidden rounded-full bg-plum/10 px-3 py-1 text-xs font-semibold text-plum hover:bg-plum/20 sm:block">
                Admin
              </Link>
            )}

            <Link to="/wishlist" className="relative rounded-full p-2 text-plum transition-colors hover:bg-blush" aria-label="Wishlist">
              <Heart size={20} />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative rounded-full p-2 text-plum transition-colors hover:bg-blush" aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="rounded-full p-2 text-plum md:hidden"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-blush/60 px-4 py-3">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`
              }}
              className="mx-auto flex max-w-xl gap-2"
            >
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cute stuff..."
                className="flex-1 rounded-full border border-blush bg-white px-4 py-2 text-sm outline-none focus:border-pink"
                autoFocus
              />
              <button type="submit" className="rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white hover:bg-pink-dark">
                Search
              </button>
            </form>
          </div>
        )}

        {mobileOpen && (
          <nav className="flex flex-col gap-3 border-t border-blush/60 px-4 py-4 md:hidden">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClass} onClick={() => setMobileOpen(false)}>
                {link.label}
              </NavLink>
            ))}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="rounded-full border border-blush bg-white px-3 py-2 text-sm font-medium text-plum"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </nav>
        )}
      </header>
    </>
  )
}
