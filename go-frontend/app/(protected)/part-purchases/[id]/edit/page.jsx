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

export default function PartPurchaseEditPage() {
  const params = useParams()
  const id = params?.id
  const router = useRouter()
  const [seed, setSeed] = useState({ suppliers: [], parts: [] })
  const [loadingSeed, setLoadingSeed] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    supplier_id: '',
    purchase_date: '',
    expected_delivery_date: '',
    part_id: '',
    quantity: '1',
    unit_price: '0',
    margin_type: 'percent',
    margin_value: '0',
    notes: '',
  })

  useEffect(() => {
    let mounted = true

    const load = async () => {
      setLoadingSeed(true)
      setError('')
      try {
        const res = await api.get(`/part-purchases/${id}/edit`)
        if (!mounted) return

        const purchase = res?.data?.purchase || {}
        const firstDetail = purchase.details?.[0]

        setSeed({
          suppliers: Array.isArray(res?.data?.suppliers) ? res.data.suppliers : [],
          parts: Array.isArray(res?.data?.parts) ? res.data.parts : [],
        })

        setForm({
          supplier_id: String(purchase.supplier_id || ''),
          purchase_date: purchase.purchase_date || '',
          expected_delivery_date: purchase.expected_delivery_date || '',
          part_id: firstDetail?.part_id ? String(firstDetail.part_id) : '',
          quantity: firstDetail?.quantity ? String(firstDetail.quantity) : '1',
          unit_price: firstDetail?.unit_price ? String(firstDetail.unit_price) : '0',
          margin_type: firstDetail?.margin_type || purchase.margin_type || 'percent',
          margin_value: String(firstDetail?.margin_value || purchase.margin_value || 0),
          notes: purchase.notes || '',
        })
      } catch (err) {
        if (!mounted) return
        setError(err?.response?.data?.error || 'Gagal memuat data edit part purchase.')
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
      supplier_id: toIntOrNil(form.supplier_id),
      purchase_date: form.purchase_date,
      expected_delivery_date: form.expected_delivery_date || null,
      notes: form.notes || '',
      items: [{
        part_id: toIntOrNil(form.part_id),
        quantity: Math.max(1, Number(form.quantity || 1)),
        unit_price: Math.max(0, Number(form.unit_price || 0)),
        discount_type: 'none',
        discount_value: 0,
        margin_type: form.margin_type || 'percent',
        margin_value: Math.max(0, Number(form.margin_value || 0)),
        promo_discount_type: 'none',
        promo_discount_value: 0,
      }],
      discount_type: 'none',
      discount_value: 0,
      tax_type: 'none',
      tax_value: 0,
    }

    try {
      await api.put(`/part-purchases/${id}`, payload)
      router.push(`/part-purchases/${id}`)
    } catch (err) {
      const msg = err?.response?.data?.message || 'Gagal memperbarui part purchase.'
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
        <h1 className="text-2xl font-semibold text-slate-900">Part Purchase Edit</h1>
      </header>

      <div>
        <Link href={`/part-purchases/${id}`} className="inline-flex rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">Kembali ke part purchase</Link>
      </div>

      <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {error ? <p className="mb-3 text-sm text-rose-600">{error}</p> : null}
        {loadingSeed ? <p className="mb-3 text-sm text-slate-600">Memuat data referensi...</p> : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm text-slate-700">Supplier
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.supplier_id} onChange={onChange('supplier_id')}>
              <option value="">Pilih supplier</option>
              {seed.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-slate-700">Tanggal Pembelian
            <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.purchase_date} onChange={onChange('purchase_date')} />
          </label>
          <label className="text-sm text-slate-700">Estimasi Datang
            <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.expected_delivery_date} onChange={onChange('expected_delivery_date')} />
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
          <label className="text-sm text-slate-700">Margin Type
            <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.margin_type} onChange={onChange('margin_type')}>
              <option value="percent">percent</option>
              <option value="fixed">fixed</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">Margin Value
            <input type="number" min="0" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.margin_value} onChange={onChange('margin_value')} />
          </label>
        </div>

        <label className="mt-3 block text-sm text-slate-700">Catatan
          <textarea rows="3" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5" value={form.notes} onChange={onChange('notes')} />
        </label>

        <div className="mt-4">
          <button type="submit" disabled={submitting} className="rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {submitting ? 'Menyimpan...' : 'Perbarui Part Purchase'}
          </button>
        </div>
      </form>
    </section>
  )
}
