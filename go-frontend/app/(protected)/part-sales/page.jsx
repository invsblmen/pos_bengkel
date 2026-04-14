'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import api from '@services/api'

const STATUS_TONE = {
  draft: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  confirmed: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  waiting_stock: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200',
  ready_to_notify: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  waiting_pickup: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
}

const PAYMENT_TONE = {
  unpaid: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  partial: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
}

export default function PartSalesPage() {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await api.get('/part-sales')
        if (!mounted) return

        const list = res?.data?.sales?.data || []
        setRows(Array.isArray(list) ? list : [])
        setTotal(Number(res?.data?.sales?.total || 0))
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.message || 'Gagal memuat data part sales.')
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
    <section className="space-y-5">
      <header className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
          <h1 className="text-2xl font-semibold text-slate-900">Part Sales</h1>
          <p className="text-sm text-slate-600">Total data: {total}</p>
        </div>
        <Link href="/part-sales/create" className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-3 py-2 text-sm font-semibold text-white hover:from-primary-600 hover:to-primary-700">
          Buat Penjualan
        </Link>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-4 text-sm text-slate-600">Memuat data...</p>
        ) : error ? (
          <p className="p-4 text-sm text-rose-600">{error}</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-slate-600">Belum ada part sales.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Nomor</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Customer</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Payment</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Total</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.sale_number || '-'}</td>
                    <td className="px-4 py-3">{item.customer?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_TONE[item.status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>
                        {item.status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_TONE[item.payment_status] || 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'}`}>
                        {item.payment_status || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{Number(item.grand_total || 0).toLocaleString('id-ID')}</td>
                    <td className="px-4 py-3">
                      <Link className="inline-flex rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100" href={`/part-sales/${item.id}`}>Detail</Link>
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
