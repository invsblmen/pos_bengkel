'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@services/api'

const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  ordered: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  received: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

export default function PartPurchaseShowPage() {
  const params = useParams()
  const id = params?.id
  const [purchase, setPurchase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get(`/part-purchases/${id}`)
        if (!mounted) return
        setPurchase(res?.data?.purchase || null)
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat detail part purchase.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (id) load()
    return () => {
      mounted = false
    }
  }, [id])

  const details = Array.isArray(purchase?.details) ? purchase.details : []

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
        <h1 className="text-2xl font-semibold text-slate-900">Part Purchase Detail</h1>
        <p className="text-sm text-slate-600">ID: {id}</p>
      </header>

      <div className="flex gap-2">
        <Link href="/part-purchases" className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Kembali ke part purchases</Link>
        <Link href={`/part-purchases/${id}/edit`} className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Edit</Link>
      </div>

      {!loading && !error && purchase ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Purchase ID</p>
              <p className="mt-1 font-semibold text-slate-900">{purchase.id || '-'}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
              <p className="mt-1"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[purchase.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>{purchase.status || '-'}</span></p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Purchase Date</p>
              <p className="mt-1 font-medium text-slate-900">{purchase.purchase_date || '-'}</p>
            </article>
            <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Grand Total</p>
              <p className="mt-1 font-semibold text-emerald-900">{Number(purchase.grand_total || purchase.total || 0).toLocaleString('id-ID')}</p>
            </article>
          </div>

          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <div><dt className="text-slate-500">Supplier</dt><dd className="font-medium text-slate-900">{purchase.supplier?.name || '-'}</dd></div>
            <div><dt className="text-slate-500">Expected Delivery</dt><dd className="font-medium text-slate-900">{purchase.expected_delivery_date || '-'}</dd></div>
            <div><dt className="text-slate-500">Margin ({purchase.margin_type || '-'})</dt><dd className="font-medium text-slate-900">{Number(purchase.margin_value || 0).toLocaleString('id-ID')}</dd></div>
          </dl>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5"><h2 className="text-lg font-semibold text-slate-900">Item Detail</h2></div>
        {loading ? <p className="p-4 text-sm text-slate-600">Memuat item detail...</p> : null}
        {error ? <p className="p-4 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && details.length === 0 ? <p className="p-4 text-sm text-slate-600">Belum ada item detail pada part purchase ini.</p> : null}
        {!loading && !error && details.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50"><tr className="border-b border-slate-200 text-left text-slate-600"><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Part</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Qty</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Unit Price</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Subtotal</th><th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                {details.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.part?.name || '-'}</td>
                    <td className="px-4 py-3">{Number(item.quantity || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">{Number(item.unit_price || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{Number(item.subtotal || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3 text-xs">{item.stock_status || 'pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}
