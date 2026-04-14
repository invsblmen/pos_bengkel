import { useEffect, useState } from 'react'
import api from '@services/api'

const STATUS_TONE = {
  scheduled: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

function statusClassName(status) {
  return STATUS_TONE[status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
}

export default function AppointmentIndex() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const res = await api.get('/appointments')
        if (!mounted) return

        const payload = res?.data || {}
        const list = payload?.appointments?.data || []

        setRows(Array.isArray(list) ? list : [])
        setTotal(Number(payload?.appointments?.total || 0))
        setStats(payload?.stats || null)
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Gagal memuat data appointment.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Parity Critical Screen</p>
        <h1 className="text-2xl font-semibold text-slate-900">Appointment Index</h1>
        <p className="text-sm text-slate-600">Total data: {total}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Today</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{stats?.today ?? 0}</p>
        </article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-amber-700">Scheduled</p>
          <p className="mt-1 text-xl font-semibold text-amber-900">{stats?.scheduled ?? 0}</p>
        </article>
        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-sky-700">Confirmed</p>
          <p className="mt-1 text-xl font-semibold text-sky-900">{stats?.confirmed ?? 0}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Completed</p>
          <p className="mt-1 text-xl font-semibold text-emerald-900">{stats?.completed ?? 0}</p>
        </article>
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-rose-700">Cancelled</p>
          <p className="mt-1 text-xl font-semibold text-rose-900">{stats?.cancelled ?? 0}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Memuat data...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada appointment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Jadwal</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Kendaraan</th>
                  <th className="px-3 py-2">Mekanik</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{item.scheduled_at || '-'}</td>
                    <td className="px-3 py-2">{item.customer?.name || '-'}</td>
                    <td className="px-3 py-2">
                      {item.vehicle?.plate_number || '-'}
                      {item.vehicle?.brand || item.vehicle?.model ? ` (${item.vehicle?.brand || ''} ${item.vehicle?.model || ''})` : ''}
                    </td>
                    <td className="px-3 py-2">{item.mechanic?.name || '-'}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClassName(item.status)}`}>
                        {item.status || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
