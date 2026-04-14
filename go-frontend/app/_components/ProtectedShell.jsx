'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard' },
  { href: '/service-orders', label: 'Service Orders' },
  { href: '/part-sales', label: 'Part Sales' },
  { href: '/part-purchases', label: 'Part Purchases' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/vehicles', label: 'Vehicles' },
]

export default function ProtectedShell({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated, loading, logout } = useAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace(`/login?from=${encodeURIComponent(pathname || '/')}`)
    }
  }, [loading, isAuthenticated, pathname, router])

  if (loading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">Memuat sesi...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">POS Bengkel</p>
            <p className="text-sm font-semibold text-slate-900">GO Frontend - Next.js</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 md:inline">{user?.email || '-'}</span>
            <button
              type="button"
              onClick={async () => {
                await logout()
                router.replace('/login')
              }}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-4 p-4 md:grid-cols-[220px_1fr] md:p-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-xl px-3 py-2 text-sm font-medium ${
                    active
                      ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-100'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  )
}
