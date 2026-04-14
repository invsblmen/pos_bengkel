'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@services/api'

export default function ServiceOrderShowPage({ params }) {
  const { id } = params
  const [order, setOrder] = useState(null)
  const [warrantyRegistrations, setWarrantyRegistrations] = useState({})
  const [nextStatus, setNextStatus] = useState('pending')
  const [odometerKM, setOdometerKM] = useState('')
  const [statusNotes, setStatusNotes] = useState('')
  const [updating, setUpdating] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/service-orders/${id}`)
        if (!mounted) return
        const payload = res?.data?.order || null
        setOrder(payload)
        if (payload?.status) setNextStatus(payload.status)
        if (payload?.odometer_km) setOdometerKM(String(payload.odometer_km))
        setWarrantyRegistrations(res?.data?.warrantyRegistrations || {})
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat detail service order.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (id) load()
    return () => {
      mounted = false
    }
  }, [id])

  const onUpdateStatus = async () => {
    if (!id || !nextStatus) return
    setUpdating(true)
    setError('')
    setActionMessage('')

    try {
      const payload = { status: nextStatus, notes: statusNotes }
      if (odometerKM.trim() !== '') payload.odometer_km = Number(odometerKM)

      const res = await api.patch(`/service-orders/${id}/status`, payload)
      const updatedStatus = res?.data?.order?.status || nextStatus
      const updatedKM = res?.data?.order?.odometer_km

      setOrder((prev) => ({ ...(prev || {}), status: updatedStatus, odometer_km: updatedKM ?? prev?.odometer_km }))
      setNextStatus(updatedStatus)
      if (updatedKM !== null && updatedKM !== undefined) setOdometerKM(String(updatedKM))
      setActionMessage('Status service order berhasil diperbarui.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Gagal memperbarui status service order.')
    } finally {
      setUpdating(false)
    }
  }

  const details = Array.isArray(order?.details) ? order.details : []

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
        <h1 className="text-2xl font-semibold text-slate-900">Service Order Detail</h1>
        <p className="text-sm text-slate-600">ID: {id}</p>
      </header>

      <div className="flex gap-2">
        <Link href="/service-orders" className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Kembali ke service orders</Link>
        <Link href={`/service-orders/${id}/edit`} className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Edit</Link>
      </div>

      {!loading && !error && order ? (
        <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
          <select className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" value={nextStatus} onChange={(event) => setNextStatus(event.target.value)}>
            <option value="pending">pending</option>
            <option value="in_progress">in_progress</option>
            <option value="completed">completed</option>
            <option value="paid">paid</option>
            <option value="cancelled">cancelled</option>
          </select>
          <input type="number" min="0" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Odometer" value={odometerKM} onChange={(event) => setOdometerKM(event.target.value)} />
          <input type="text" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Catatan status" value={statusNotes} onChange={(event) => setStatusNotes(event.target.value)} />
          <button type="button" className="rounded-xl bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50" onClick={onUpdateStatus} disabled={updating}>{updating ? 'Menyimpan...' : 'Update Status'}</button>
          {actionMessage ? <p className="text-sm font-medium text-emerald-700 md:col-span-4">{actionMessage}</p> : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? <p className="text-sm text-slate-600">Memuat detail...</p> : null}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && order ? (
          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div><dt className="text-slate-500">Nomor Order</dt><dd className="font-medium text-slate-900">{order.order_number || '-'}</dd></div>
            <div><dt className="text-slate-500">Status</dt><dd className="font-medium text-slate-900">{order.status || '-'}</dd></div>
            <div><dt className="text-slate-500">Tanggal</dt><dd className="font-medium text-slate-900">{order.created_at || '-'}</dd></div>
            <div><dt className="text-slate-500">Customer</dt><dd className="font-medium text-slate-900">{order.customer?.name || '-'}</dd></div>
            <div><dt className="text-slate-500">Kendaraan</dt><dd className="font-medium text-slate-900">{order.vehicle?.plate_number || '-'}</dd></div>
            <div><dt className="text-slate-500">Mekanik</dt><dd className="font-medium text-slate-900">{order.mechanic?.name || '-'}</dd></div>
          </dl>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Item Detail</h2>
        {loading ? <p className="text-sm text-slate-600">Memuat item detail...</p> : null}
        {!loading && details.length === 0 ? <p className="text-sm text-slate-600">Belum ada item detail.</p> : null}
        {!loading && details.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead><tr className="border-b border-slate-200 text-left text-slate-600"><th className="px-3 py-2">Item</th><th className="px-3 py-2">Jenis</th><th className="px-3 py-2">Qty</th><th className="px-3 py-2">Harga</th><th className="px-3 py-2">Final</th><th className="px-3 py-2">Garansi</th></tr></thead>
              <tbody>
                {details.map((item) => {
                  const warranty = warrantyRegistrations?.[item.id]
                  return (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="px-3 py-2">{item.service?.name || item.part?.name || '-'}</td>
                      <td className="px-3 py-2">{item.service ? 'Service' : item.part ? 'Part' : '-'}</td>
                      <td className="px-3 py-2">{Number(item.qty || 0).toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2">{Number(item.price || 0).toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2">{Number(item.final_amount || 0).toLocaleString('id-ID')}</td>
                      <td className="px-3 py-2">{warranty?.status || '-'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
