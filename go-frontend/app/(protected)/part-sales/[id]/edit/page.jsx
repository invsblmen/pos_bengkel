'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import api from '@services/api'

function toIntOrNil(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return Math.trunc(parsed)
}

export default function PartSaleEditPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [seed, setSeed] = useState({ customers: [], parts: [] })
  const [loadingSeed, setLoadingSeed] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    customer_id: '',
    sale_date: '',
    part_id: '',
    quantity: '1',
    unit_price: '0',
    status: 'draft',
    paid_amount: '0',
    notes: '',
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoadingSeed(true)
      setError('')
      try {
        const res = await api.get(`/part-sales/${id}/edit`)
        if (!mounted) return

        const sale = res?.data?.sale || {}
        const firstDetail = sale.details?.[0]

        setSeed({
          customers: Array.isArray(res?.data?.customers) ? res.data.customers : [],
          parts: Array.isArray(res?.data?.parts) ? res.data.parts : [],
        })

        setForm({
          customer_id: String(sale.customer_id || ''),
          sale_date: sale.sale_date || '',
          part_id: firstDetail?.part_id ? String(firstDetail.part_id) : '',
          quantity: firstDetail?.quantity ? String(firstDetail.quantity) : '1',
          unit_price: firstDetail?.unit_price ? String(firstDetail.unit_price) : '0',
          status: sale.status || 'draft',
          paid_amount: String(sale.paid_amount || 0),
          notes: sale.notes || '',
        })
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat data edit part sale.')
      } finally {
        if (mounted) setLoadingSeed(false)
      }
    }

    if (id) load()
    return () => {
      mounted = false
    }
  }, [id])

  const onChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      customer_id: toIntOrNil(form.customer_id),
      sale_date: form.sale_date,
      items: [{
        part_id: toIntOrNil(form.part_id),
        quantity: Math.max(1, Number(form.quantity || 1)),
        unit_price: Math.max(0, Number(form.unit_price || 0)),
        discount_type: 'none',
        discount_value: 0,
      }],
      discount_type: 'none',
      discount_value: 0,
      tax_type: 'none',
      tax_value: 0,
      paid_amount: Math.max(0, Number(form.paid_amount || 0)),
      status: form.status || 'draft',
      notes: form.notes || '',
    }

    try {
      await api.put(`/part-sales/${id}`, payload)
      router.push(`/part-sales/${id}`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal memperbarui part sale.'
      const firstError = Object.values(err?.response?.data?.errors || {})?.[0]
      setError(Array.isArray(firstError) && firstError[0] ? `${msg} ${firstError[0]}` : msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Native Next Route</p>
        <h1 className="text-2xl font-semibold text-slate-900">Part Sale Edit</h1>
      </header>

      <div>
        <Link href={`/part-sales/${id}`} className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Kembali ke part sale</Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        {loadingSeed ? <p className="mb-3 text-sm text-slate-600">Memuat data referensi...</p> : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">Customer
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.customer_id} onChange={onChange('customer_id')}>
              <option value="">Pilih customer</option>
              {seed.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700">Tanggal Penjualan
            <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.sale_date} onChange={onChange('sale_date')} />
          </label>
          <label className="text-sm text-slate-700">Part
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.part_id} onChange={onChange('part_id')}>
              <option value="">Pilih part</option>
              {seed.parts.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.part_number || '-'})</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700">Qty
            <input type="number" min="1" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.quantity} onChange={onChange('quantity')} />
          </label>
          <label className="text-sm text-slate-700">Unit Price
            <input type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.unit_price} onChange={onChange('unit_price')} />
          </label>
          <label className="text-sm text-slate-700">Status
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.status} onChange={onChange('status')}>
              <option value="draft">draft</option>
              <option value="confirmed">confirmed</option>
              <option value="waiting_stock">waiting_stock</option>
              <option value="ready_to_notify">ready_to_notify</option>
              <option value="waiting_pickup">waiting_pickup</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">Paid Amount
            <input type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.paid_amount} onChange={onChange('paid_amount')} />
          </label>
        </div>

        <label className="mt-3 block text-sm text-slate-700">Catatan
          <textarea rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.notes} onChange={onChange('notes')} />
        </label>

        <div className="mt-4">
          <button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? 'Menyimpan...' : 'Perbarui Part Sale'}
          </button>
        </div>
      </form>
    </section>
  )
}
