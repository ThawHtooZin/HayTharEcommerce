import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BarChart3, LayoutDashboard, Package, ShoppingBag, Tag, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/discounts', label: 'Promotions', icon: Tag },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export default function AdminLayout() {
  const { user, logout } = useApp()
  const navigate = useNavigate()

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-xl font-bold text-slate-800">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in with an admin account to continue.</p>
          <Link to="/auth?redirect=/admin" className="mt-4 inline-block rounded-full bg-pink px-5 py-2 text-sm font-semibold text-white">
            Sign in
          </Link>
          <p className="mt-3 text-xs text-slate-400">admin@haythar.com / password</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-56 shrink-0 border-r border-slate-200 bg-white p-4 md:block">
        <Link to="/" className="font-display text-lg font-bold text-plum">
          <span className="text-pink">Hay</span>Thar Admin
        </Link>
        <nav className="mt-6 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? 'bg-pink/10 text-pink' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <Icon size={16} /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="mt-6 px-3 text-sm text-slate-400 hover:text-pink">
          Sign out
        </button>
      </aside>

      <div className="flex-1 overflow-auto">
        <header className="border-b border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">Logged in as <span className="font-semibold text-slate-700">{user.name}</span></p>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
