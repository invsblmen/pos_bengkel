import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '@services/api'

export default function ServiceOrderShow() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [warrantyRegistrations, setWarrantyRegistrations] = useState({})
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
        setOrder(res?.data?.order || null)
        setWarrantyRegistrations(res?.data?.warrantyRegistrations || {})
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat detail service order.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (id) {
      load()
    }

    return () => {
      mounted = false
    }
  }, [id])

  const details = Array.isArray(order?.details) ? order.details : []

  return (
    <section className="space-y-4">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-slate-500">Parity Critical Screen</p>
        <h1 className="text-2xl font-semibold text-slate-900">Service Order Detail</h1>
        <p className="text-sm text-slate-600">ID: {id}</p>
      </header>

      <div>
        <Link to="/service-orders" className="text-sm font-medium text-slate-700 underline">Kembali ke service order index</Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Memuat detail...</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : !order ? (
          <p className="text-sm text-slate-600">Service order tidak ditemukan.</p>
        ) : (
          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div>
              <dt className="text-slate-500">Nomor Order</dt>
              <dd className="font-medium text-slate-900">{order.order_number || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd className="font-medium text-slate-900">{order.status || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tanggal</dt>
              <dd className="font-medium text-slate-900">{order.created_at || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Customer</dt>
              <dd className="font-medium text-slate-900">{order.customer?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Kendaraan</dt>
              <dd className="font-medium text-slate-900">{order.vehicle?.plate_number || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Mekanik</dt>
              <dd className="font-medium text-slate-900">{order.mechanic?.name || '-'}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Labor Cost</dt>
              <dd className="font-medium text-slate-900">{Number(order.labor_cost || 0).toLocaleString('id-ID')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Material Cost</dt>
              <dd className="font-medium text-slate-900">{Number(order.material_cost || 0).toLocaleString('id-ID')}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Grand Total</dt>
              <dd className="font-semibold text-slate-900">{Number(order.grand_total || order.total || 0).toLocaleString('id-ID')}</dd>
            </div>
            <div className="md:col-span-3">
              <dt className="text-slate-500">Catatan</dt>
              <dd className="font-medium text-slate-900">{order.notes || '-'}</dd>
            </div>
          </dl>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Item Detail</h2>
        {loading ? (
          <p className="text-sm text-slate-600">Memuat item detail...</p>
        ) : details.length === 0 ? (
          <p className="text-sm text-slate-600">Belum ada item detail pada service order ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-3 py-2">Item</th>
                  <th className="px-3 py-2">Jenis</th>
                  <th className="px-3 py-2">Qty</th>
                  <th className="px-3 py-2">Harga</th>
                  <th className="px-3 py-2">Final</th>
                  <th className="px-3 py-2">Garansi</th>
                </tr>
              </thead>
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
        )}
      </div>
    </section>
  )
}
