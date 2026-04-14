'use client'

import Can from '@components/Can'

export default function AdminPage() {
  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
        <h1 className="text-2xl font-semibold text-slate-900">Admin Panel</h1>
        <p className="text-sm text-slate-600">Panel ini tetap dibatasi permission seperti aplikasi legacy.</p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Can
          permissions={['users-access', 'roles-access', 'permissions-access']}
          fallback={<p className="text-sm text-slate-600">You do not have access to this section.</p>}
        >
          <p className="text-sm text-slate-700">This page is restricted by Laravel-style permissions.</p>
        </Can>
      </div>
    </section>
  )
}
