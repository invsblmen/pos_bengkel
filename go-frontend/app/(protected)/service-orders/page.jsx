'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import api from '@services/api'
import { connectRealtime } from '@services/realtime'

export default function ServiceOrdersPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [mechanics, setMechanics] = useState([])
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page') || 1))
  const [lastPage, setLastPage] = useState(1)
  const [from, setFrom] = useState(null)
  const [to, setTo] = useState(null)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'all')
  const [mechanicID, setMechanicID] = useState(searchParams.get('mechanic_id') || 'all')
  const [dateFrom, setDateFrom] = useState(searchParams.get('date_from') || '')
  const [dateTo, setDateTo] = useState(searchParams.get('date_to') || '')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null)
  const [lastRealtimeEvent, setLastRealtimeEvent] = useState('')
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [realtimeReconnecting, setRealtimeReconnecting] = useState(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const statusTone = useMemo(() => ({
    pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    in_progress: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
    completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    paid: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
    cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  }), [])

  useEffect(() => {
    if (!autoRefresh) return undefined
    const interval = setInterval(() => setRefreshTick((tick) => tick + 1), 30000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    const disconnect = connectRealtime({
      domains: ['service_orders'],
      onOpen: () => {
        setRealtimeConnected(true)
        setRealtimeReconnecting(null)
      },
      onClose: () => setRealtimeConnected(false),
      onReconnecting: (attempt, delay) => setRealtimeReconnecting({ attempt, delay }),
      onEvent: (event) => {
        if (!event) return
        const isDomain = event.domain === 'service_orders'
        const isType = typeof event.type === 'string' && event.type.startsWith('service_order.')
        if (!isDomain && !isType) return

        const incomingStatus = event?.data?.new_status || event?.data?.status || null
        const incomingID = event?.id || event?.data?.id || null
        if (incomingID && incomingStatus) {
          setRows((prevRows) => prevRows.map((row) => (
            String(row.id) === String(incomingID)
              ? { ...row, status: incomingStatus }
              : row
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
    if (dateFrom !== '') params.set('date_from', dateFrom)
    if (dateTo !== '') params.set('date_to', dateTo)
    if (currentPage > 1) params.set('page', String(currentPage))

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }, [currentPage, search, status, mechanicID, dateFrom, dateTo, pathname, router])

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const params = { page: currentPage }
        if (search.trim() !== '') params.search = search.trim()
        if (status !== 'all') params.status = status
        if (mechanicID !== 'all') params.mechanic_id = mechanicID
        if (dateFrom !== '') params.date_from = dateFrom
        if (dateTo !== '') params.date_to = dateTo

        const res = await api.get('/service-orders', { params })
        if (!mounted) return

        const payload = res?.data || {}
        const orders = payload?.orders || {}
        const list = orders?.data || []
        setRows(Array.isArray(list) ? list : [])
        setTotal(Number(orders?.total || 0))
        setMechanics(Array.isArray(payload?.mechanics) ? payload.mechanics : [])
        setCurrentPage(Number(orders?.current_page || 1))
        setLastPage(Number(orders?.last_page || 1))
        setFrom(orders?.from ?? null)
        setTo(orders?.to ?? null)
        setLastUpdatedAt(new Date())
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat data service order.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [currentPage, search, status, mechanicID, dateFrom, dateTo, refreshTick])

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < lastPage

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
          <h1 className="text-2xl font-semibold text-slate-900">Service Orders</h1>
          <p className="text-sm text-slate-600">
            Total data: {total}
            {from !== null && to !== null ? ` | Menampilkan ${from}-${to}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
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
        </div>
        <Link href="/service-orders/create" className="inline-flex h-10 items-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 text-sm font-semibold text-white hover:from-primary-600 hover:to-primary-700">
          Buat Service Order
        </Link>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6" onSubmit={(event) => { event.preventDefault(); setCurrentPage(1) }}>
        <input type="text" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" placeholder="Cari nomor/customer/plate" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="all">Semua status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={mechanicID} onChange={(event) => setMechanicID(event.target.value)}>
          <option value="all">Semua mekanik</option>
          {mechanics.map((mechanic) => (
            <option key={mechanic.id} value={String(mechanic.id)}>{mechanic.name || `Mekanik ${mechanic.id}`}</option>
          ))}
        </select>
        <input type="date" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} />
        <input type="date" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200" value={dateTo} onChange={(event) => setDateTo(event.target.value)} />
        <div className="flex gap-2">
          <button type="submit" className="w-full rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-700">Terapkan</button>
          <button type="button" className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={() => { setSearch(''); setStatus('all'); setMechanicID('all'); setDateFrom(''); setDateTo(''); setCurrentPage(1) }}>Reset</button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-4 text-sm text-slate-600">Memuat data...</p>
        ) : error ? (
          <p className="p-4 text-sm text-rose-600">{error}</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">Belum ada service order.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Order</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.order_number || '-'}</td>
                    <td className="px-4 py-3">{item.customer?.name || '-'}</td>
                    <td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[item.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>{item.status || '-'}</span></td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{Number(item.total || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3"><Link className="inline-flex rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100" href={`/service-orders/${item.id}`}>Detail</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
