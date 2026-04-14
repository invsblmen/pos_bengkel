'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import api from '@services/api'
import { connectRealtime } from '@services/realtime'

const STATUS_TONE = {
  scheduled: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export default function AppointmentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [stats, setStats] = useState(null)
  const [mechanics, setMechanics] = useState([])
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || 1))
  const [lastPage, setLastPage] = useState(1)
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [mechanicID, setMechanicID] = useState(searchParams.get('mechanic_id') || 'all')
  const [perPage, setPerPage] = useState(Number(searchParams.get('per_page') || 20))
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState('')
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [realtimeReconnecting, setRealtimeReconnecting] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!autoRefresh) return undefined
    const interval = setInterval(() => setRefreshTick((tick) => tick + 1), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    const disconnect = connectRealtime({
      domains: ['appointments'],
      onOpen: () => {
        setRealtimeConnected(true)
        setRealtimeReconnecting(null)
      },
      onClose: () => setRealtimeConnected(false),
      onReconnecting: (attempt, delay) => setRealtimeReconnecting({ attempt, delay }),
      onEvent: (event) => {
        if (!event) return
        const isDomain = event.domain === 'appointments'
        const isType = typeof event.type === 'string' && event.type.startsWith('appointment.')
        if (!isDomain && !isType) return
        const incomingStatus = event?.data?.status || event?.data?.new_status || null
        const incomingID = event?.id || event?.data?.id || null
        if (incomingID && incomingStatus) {
          setRows((prevRows) => prevRows.map((row) => (
            String(row.id) === String(incomingID) ? { ...row, status: incomingStatus } : row
          )))
        }
        setLastRealtimeEvent(`${event.type || 'event'} @ ${new Date().toLocaleTimeString('id-ID')}`)
        setLastUpdatedAt(new Date())
        setRefreshTick((tick) => tick + 1)
      },
    })

    return () => disconnect()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search.trim() !== '') params.set('search', search.trim())
    if (status !== 'all') params.set('status', status)
    if (mechanicID !== 'all') params.set('mechanic_id', mechanicID)
    if (perPage !== 20) params.set('per_page', String(perPage))
    if (currentPage > 1) params.set('page', String(currentPage))
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }, [currentPage, search, status, mechanicID, perPage, pathname, router])

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const params = { page: currentPage, per_page: perPage }
        if (search.trim() !== '') params.search = search.trim()
        if (status !== 'all') params.status = status
        if (mechanicID !== 'all') params.mechanic_id = mechanicID
        const res = await api.get('/appointments', { params })
        if (!mounted) return
        const payload = res?.data || {}
        const appointments = payload?.appointments || {}
        const list = appointments?.data || []
        setRows(Array.isArray(list) ? list : [])
        setTotal(Number(appointments?.total || 0))
        setStats(payload?.stats || null)
        setMechanics(Array.isArray(payload?.mechanics) ? payload.mechanics : [])
        setCurrentPage(Number(appointments?.current_page || 1))
        setLastPage(Number(appointments?.last_page || 1))
        setFrom(appointments?.from ?? null)
        setTo(appointments?.to ?? null)
        setLastUpdatedAt(new Date())
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
  }, [currentPage, search, status, mechanicID, perPage, refreshTick])

  const onApplyFilters = (event) => {
    event.preventDefault()
    setCurrentPage(1)
  }

  const onResetFilters = () => {
    setSearch('')
    setStatus('all')
    setMechanicID('all')
    setPerPage(20)
    setCurrentPage(1)
  }

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < lastPage

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
        <h1 className="text-2xl font-semibold text-slate-900">Appointments</h1>
        <p className="text-sm text-slate-600">Total data: {total}{from !== null && to !== null ? ` | Menampilkan ${from}-${to}` : ''}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <label className="inline-flex items-center gap-2 text-slate-700">
            <input className="h-4 w-4 rounded border-slate-300" type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
            Auto refresh (30s)
          </label>
          <span className="text-slate-500">{lastUpdatedAt ? `Last updated: ${lastUpdatedAt.toLocaleTimeString('id-ID')}` : 'Belum ada refresh'}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${realtimeConnected ? 'bg-emerald-50 text-emerald-700' : (realtimeReconnecting ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700')}`}>
            {realtimeConnected ? 'Realtime connected' : (realtimeReconnecting ? `Reconnecting (attempt ${realtimeReconnecting.attempt})` : 'Realtime disconnected')}
          </span>
          {lastRealtimeEvent ? <span className="text-slate-500">{lastRealtimeEvent}</span> : null}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-slate-500">Today</p><p className="mt-1 text-xl font-semibold text-slate-900">{stats?.today ?? 0}</p></article>
        <article className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-amber-700">Scheduled</p><p className="mt-1 text-xl font-semibold text-amber-900">{stats?.scheduled ?? 0}</p></article>
        <article className="rounded-xl border border-sky-200 bg-sky-50 p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-sky-700">Confirmed</p><p className="mt-1 text-xl font-semibold text-sky-900">{stats?.confirmed ?? 0}</p></article>
        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-emerald-700">Completed</p><p className="mt-1 text-xl font-semibold text-emerald-900">{stats?.completed ?? 0}</p></article>
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm"><p className="text-xs uppercase tracking-wide text-rose-700">Cancelled</p><p className="mt-1 text-xl font-semibold text-rose-900">{stats?.cancelled ?? 0}</p></article>
      </div>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5" onSubmit={onApplyFilters}>
        <input type="text" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Cari customer, plate, phone" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={mechanicID} onChange={(event) => setMechanicID(event.target.value)}><option value="all">Semua mekanik</option>{mechanics.map((mechanic) => (<option key={mechanic.id} value={String(mechanic.id)}>{mechanic.name || `Mekanik ${mechanic.id}`}</option>))}</select>
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={String(perPage)} onChange={(event) => setPerPage(Number(event.target.value) || 20)}><option value="10">10 per halaman</option><option value="20">20 per halaman</option><option value="50">50 per halaman</option></select>
        <div className="flex gap-2"><button type="submit" className="w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Terapkan</button><button type="button" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={onResetFilters}>Reset</button></div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? <p className="p-4 text-sm text-slate-600">Memuat data...</p> : null}
        {error ? <p className="p-4 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && rows.length === 0 ? <p className="p-4 text-sm text-slate-600">Belum ada appointment.</p> : null}
        {!loading && !error && rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-left text-slate-600"><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Jadwal</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Customer</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Kendaraan</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Mekanik</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Aksi</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">{item.scheduled_at || '-'}</td>
                    <td className="px-4 py-3">{item.customer?.name || '-'}</td>
                    <td className="px-4 py-3">{item.vehicle?.plate_number || '-'}</td>
                    <td className="px-4 py-3">{item.mechanic?.name || '-'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[item.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>{item.status || '-'}</span></td>
                    <td className="px-4 py-3"><Link className="inline-flex rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100" href={`/appointments/${item.id}`}>Detail</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-sm text-slate-600">Halaman {currentPage} dari {lastPage}</p>
        <div className="flex gap-2">
          <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canGoPrev || loading} onClick={() => canGoPrev && setCurrentPage((page) => page - 1)}>Sebelumnya</button>
          <button type="button" className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50" disabled={!canGoNext || loading} onClick={() => canGoNext && setCurrentPage((page) => page + 1)}>Berikutnya</button>
        </div>
      </div>
    </section>
  )
}
