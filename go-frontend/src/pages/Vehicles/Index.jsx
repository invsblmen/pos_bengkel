import { useEffect, useState } from 'react'
import api from '@services/api'

export default function VehicleIndex() {
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
        const res = await api.get('/vehicles')
        if (!mounted) return

        const payload = res?.data || {}
        const list = payload?.vehicles?.data || []

        setRows(Array.isArray(list) ? list : [])
        setTotal(Number(payload?.vehicles?.total || 0))
        setStats(payload?.stats || null)
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Gagal memuat data kendaraan.')
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
        <h1 className="text-2xl font-semibold text-slate-900">Vehicle Index</h1>
        <p className="text-sm text-slate-600">Total data: {total}</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{stats?.total ?? 0}</p>
        </article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-emerald-700">Serviced</p>
          <p className="mt-1 text-xl font-semibold text-emerald-900">{stats?.serviced ?? 0}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-600">Never Serviced</p>
          <p className="mt-1 text-xl font-semibold text-slate-900">{stats?.never_serviced ?? 0}</p>
        </article>
        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-sky-700">This Month</p>
          <p className="mt-1 text-xl font-semibold text-sky-900">{stats?.this_month ?? 0}</p>
        </article>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Memuat data...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada data kendaraan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Plat</th>
                  <th className="px-3 py-2">Kendaraan</th>
                  <th className="px-3 py-2">Pelanggan</th>
                  <th className="px-3 py-2">KM</th>
                  <th className="px-3 py-2">Last Service</th>
                  <th className="px-3 py-2">Next Service</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-900">{item.plate_number || '-'}</td>
                    <td className="px-3 py-2">
                      {[item.brand, item.model, item.year].filter(Boolean).join(' ') || '-'}
                    </td>
                    <td className="px-3 py-2">{item.customer?.name || '-'}</td>
                    <td className="px-3 py-2">{Number(item.km || 0).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2">{item.last_service_date || '-'}</td>
                    <td className="px-3 py-2">{item.next_service_date || '-'}</td>
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
