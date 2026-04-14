import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '@services/api'
import { connectRealtime } from '@services/realtime'

export default function ServiceOrderIndex() {
  const [searchParams, setSearchParams] = useSearchParams()

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
  const [refreshTick, setRefreshTick] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!autoRefresh) return undefined

    const interval = setInterval(() => {
      setRefreshTick((tick) => tick + 1)
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  useEffect(() => {
    const disconnect = connectRealtime({
      domains: ['service_orders'],
      onOpen: () => setRealtimeConnected(true),
      onClose: () => setRealtimeConnected(false),
      onEvent: (event) => {
        if (!event) return

        const isServiceOrderDomain = event.domain === 'service_orders'
        const isServiceOrderType = typeof event.type === 'string' && event.type.startsWith('service_order.')
        if (!isServiceOrderDomain && !isServiceOrderType) return

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

    return () => {
      disconnect()
    }
  }, [])

  useEffect(() => {
    const nextParams = {}

    if (search.trim() !== '') nextParams.search = search.trim()
    if (status !== 'all') nextParams.status = status
    if (mechanicID !== 'all') nextParams.mechanic_id = mechanicID
    if (dateFrom !== '') nextParams.date_from = dateFrom
    if (dateTo !== '') nextParams.date_to = dateTo
    if (currentPage > 1) nextParams.page = String(currentPage)

    setSearchParams(nextParams, { replace: true })
  }, [currentPage, search, status, mechanicID, dateFrom, dateTo, setSearchParams])

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

  const onApplyFilters = (event) => {
    event.preventDefault()
    setCurrentPage(1)
  }

  const onResetFilters = () => {
    setSearch('')
    setStatus('all')
    setMechanicID('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const canGoPrev = currentPage > 1
  const canGoNext = currentPage < lastPage

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Parity Batch 1</p>
          <h1 className="text-2xl font-semibold text-slate-900">Service Orders</h1>
          <p className="text-sm text-slate-600">
            Total data: {total}
            {from !== null && to !== null ? ` | Menampilkan ${from}-${to}` : ''}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <label className="inline-flex items-center gap-2 text-slate-700">
              <input type="checkbox" checked={autoRefresh} onChange={(event) => setAutoRefresh(event.target.checked)} />
              Auto refresh (30s)
            </label>
            <span className="text-slate-500">{lastUpdatedAt ? `Last updated: ${lastUpdatedAt.toLocaleTimeString('id-ID')}` : 'Belum ada refresh'}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${realtimeConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {realtimeConnected ? 'Realtime connected' : 'Realtime disconnected'}
            </span>
            {lastRealtimeEvent ? <span className="text-slate-500">{lastRealtimeEvent}</span> : null}
          </div>
        </div>
        <Link to="/service-orders/create" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
          Buat Service Order
        </Link>
      </header>

      <form className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6" onSubmit={onApplyFilters}>
        <input
          type="text"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          placeholder="Cari nomor/customer/plate"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="all">Semua status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="paid">Paid</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={mechanicID}
          onChange={(event) => setMechanicID(event.target.value)}
        >
          <option value="all">Semua mekanik</option>
          {mechanics.map((mechanic) => (
            <option key={mechanic.id} value={String(mechanic.id)}>{mechanic.name || `Mekanik ${mechanic.id}`}</option>
          ))}
        </select>
        <input
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <input
          type="date"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
            Terapkan
          </button>
          <button type="button" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100" onClick={onResetFilters}>
            Reset
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Memuat data...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada service order.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Order</th>
                  <th className="px-3 py-2">Customer</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Total</th>
                  <th className="px-3 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100">
                    <td className="px-3 py-2">{item.order_number || '-'}</td>
                    <td className="px-3 py-2">{item.customer?.name || '-'}</td>
                    <td className="px-3 py-2">{item.status || '-'}</td>
                    <td className="px-3 py-2">{Number(item.total || 0).toLocaleString('id-ID')}</td>
                    <td className="px-3 py-2">
                      <Link className="text-slate-700 underline" to={`/service-orders/${item.id}`}>Detail</Link>
                    </td>
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
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoPrev || loading}
            onClick={() => canGoPrev && setCurrentPage((page) => page - 1)}
          >
            Sebelumnya
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!canGoNext || loading}
            onClick={() => canGoNext && setCurrentPage((page) => page + 1)}
          >
            Berikutnya
          </button>
        </div>
      </div>
    </section>
  )
}
