import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { buildMenu } from '@/utils/menu'

export default function DashboardLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, canAny } = useAuth()
  const menu = buildMenu(canAny)

  const onLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4">
          <h1 className="text-xl font-bold text-primary-600">pos-bengkel</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">GO - Local First</p>
        </div>
        <nav className="mt-8 px-3">
          {menu.map((section) => (
            <div key={section.title} className="mb-6">
              <p className="px-2 mb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  if (!item.path) {
                    return (
                      <div
                        key={item.title}
                        className="rounded-lg px-3 py-2 text-sm text-slate-400 cursor-not-allowed"
                      >
                        {item.title}
                        <span className="ml-2 text-[10px] uppercase">soon</span>
                      </div>
                    )
                  }

                  const active = location.pathname === item.path
                  return (
                    <Link
                      key={item.title}
                      to={item.path}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium ${active ? 'bg-primary-50 text-primary-700' : 'text-slate-700 hover:bg-slate-100'}`}
                    >
                      {item.title}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 shadow-sm flex items-center justify-between">
          <h1 className="text-lg font-semibold">Workshop Management</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">{user?.email || 'Unknown user'}</span>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700"
            >
              Logout
            </button>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
