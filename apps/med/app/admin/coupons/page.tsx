'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from 'lucide-react'
import { useLang } from '@/contexts/LanguageContext'
import type { NursedCoupon } from '@/lib/supabase'

// ─── Types ───────────────────────────────────────────────────────────────────

type Redemption = {
  id: string
  user_id: string
  stars_spent: number
  status: string
  coupon_code: string | null
  redeemed_at: string
  nursed_coupons: { name: string; name_vi: string | null; brand: string } | null
}

type Tab = 'coupons' | 'redemptions'

type CouponFormData = {
  id?: string
  name: string
  name_vi: string
  description: string
  description_vi: string
  brand: string
  image_url: string
  star_cost: string
  total_quantity: string
}

const EMPTY_FORM: CouponFormData = {
  name: '', name_vi: '', description: '', description_vi: '',
  brand: '', image_url: '', star_cost: '', total_quantity: '',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCouponsPage() {
  const { t, lang } = useLang()
  const [tab, setTab] = useState<Tab>('coupons')
  const [coupons, setCoupons] = useState<NursedCoupon[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CouponFormData>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const loadCoupons = async () => {
    const [couponRes, redemptionRes] = await Promise.all([
      fetch('/api/admin/coupons'),
      fetch('/api/admin/redemptions'),
    ])
    const [c, r] = await Promise.all([couponRes.json(), redemptionRes.json()])
    if (c.success) setCoupons(c.data)
    if (r.success) setRedemptions(r.data)
    setLoading(false)
  }

  useEffect(() => { loadCoupons() }, [])

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setShowForm(true)
  }

  const openEdit = (coupon: NursedCoupon) => {
    setForm({
      id: coupon.id,
      name: coupon.name,
      name_vi: coupon.name_vi ?? '',
      description: coupon.description ?? '',
      description_vi: coupon.description_vi ?? '',
      brand: coupon.brand,
      image_url: coupon.image_url ?? '',
      star_cost: String(coupon.star_cost),
      total_quantity: coupon.total_quantity != null ? String(coupon.total_quantity) : '',
    })
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.brand.trim() || !form.star_cost) {
      setFormError('Name, brand and star cost are required')
      return
    }
    setSaving(true)
    setFormError('')
    try {
      const url = form.id ? `/api/admin/coupons/${form.id}` : '/api/admin/coupons'
      const method = form.id ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          name_vi: form.name_vi.trim() || null,
          description: form.description.trim() || null,
          description_vi: form.description_vi.trim() || null,
          brand: form.brand.trim(),
          image_url: form.image_url.trim() || null,
          star_cost: Number(form.star_cost),
          total_quantity: form.total_quantity ? Number(form.total_quantity) : null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setShowForm(false)
        await loadCoupons()
      } else {
        setFormError(json.error ?? 'Error saving coupon')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (coupon: NursedCoupon) => {
    await fetch(`/api/admin/coupons/${coupon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !coupon.active }),
    })
    await loadCoupons()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
    setDeleteConfirmId(null)
    await loadCoupons()
  }

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1>{t.adminCouponsTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{t.adminCouponsSubtitle}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          {t.adminCouponAdd}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {(['coupons', 'redemptions'] as Tab[]).map((tabName) => (
          <button
            key={tabName}
            onClick={() => setTab(tabName)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === tabName
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tabName === 'coupons' ? t.adminCouponsTitle : t.adminRedemptionsTitle}
            {tabName === 'redemptions' && redemptions.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                {redemptions.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Coupon list */}
      {tab === 'coupons' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-surface animate-pulse" />)}
          </div>
        ) : coupons.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-text-muted">{t.adminNoCouponsYet}</p>
            <button onClick={openCreate} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} />
              {t.adminCouponAdd}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className={`card p-4 flex items-center gap-4 ${!coupon.active ? 'opacity-60' : ''}`}>
                {/* Brand image */}
                <div className="w-14 h-14 rounded-xl bg-surface flex items-center justify-center shrink-0 overflow-hidden border border-border">
                  {coupon.image_url
                    ? <img src={coupon.image_url} alt={coupon.name} className="w-full h-full object-contain" />
                    : <span className="text-2xl">🎁</span>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-text truncate">
                      {lang === 'vi' ? (coupon.name_vi || coupon.name) : coupon.name}
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface border border-border text-text-muted capitalize">
                      {coupon.brand}
                    </span>
                    {!coupon.active && <span className="badge-gray text-xs">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm font-bold text-yellow-600">{coupon.star_cost} ⭐</span>
                    <span className="text-xs text-text-muted">
                      {coupon.remaining !== null
                        ? t.adminCouponRemaining.replace('{n}', String(coupon.remaining))
                        : t.adminCouponUnlimited}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(coupon)}
                    className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors"
                    title={t.adminCouponEdit}
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleToggleActive(coupon)}
                    className="p-2 rounded-lg hover:bg-surface text-text-muted hover:text-text transition-colors"
                    title={coupon.active ? t.adminCouponDeactivate : t.adminCouponActivate}
                  >
                    {coupon.active ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(coupon.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-red-600 transition-colors"
                    title={t.adminCouponDelete}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Redemption log */}
      {tab === 'redemptions' && (
        loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-surface animate-pulse" />)}
          </div>
        ) : redemptions.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-text-muted">{t.adminRedemptionsEmpty}</p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t.adminColCoupon}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden sm:table-cell">{t.adminColStars}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t.adminColCode}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted">{t.adminColStatus}</th>
                  <th className="text-left px-4 py-3 font-medium text-text-muted hidden md:table-cell">{t.adminColDate}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">
                        {lang === 'vi' ? (r.nursed_coupons?.name_vi || r.nursed_coupons?.name) : r.nursed_coupons?.name}
                      </p>
                      <p className="text-xs text-text-muted capitalize">{r.nursed_coupons?.brand}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-semibold text-yellow-600">{r.stars_spent} ⭐</span>
                    </td>
                    <td className="px-4 py-3">
                      {r.coupon_code
                        ? <code className="text-xs font-bold text-primary tracking-widest bg-primary/5 px-2 py-1 rounded">{r.coupon_code}</code>
                        : <span className="text-text-muted">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <RedemptionStatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-text-muted">
                      {new Date(r.redeemed_at).toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Add/edit coupon form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text">
                {form.id ? t.adminCouponEdit : t.adminCouponAdd}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-surface text-text-muted">
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <FormField label={t.adminCouponNameEn} required>
                  <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                </FormField>
                <FormField label={t.adminCouponNameVi}>
                  <input className="input" value={form.name_vi} onChange={e => setForm(f => ({ ...f, name_vi: e.target.value }))} />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label={t.adminCouponDescEn}>
                  <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </FormField>
                <FormField label={t.adminCouponDescVi}>
                  <textarea className="input resize-none" rows={2} value={form.description_vi} onChange={e => setForm(f => ({ ...f, description_vi: e.target.value }))} />
                </FormField>
              </div>

              <FormField label={t.adminCouponBrand} required>
                <input className="input" value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} placeholder="highland, kfc, hasaki..." />
              </FormField>

              <FormField label={t.adminCouponImageUrl}>
                <input className="input" type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://..." />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label={t.adminCouponStarCost} required>
                  <input className="input" type="number" min={1} value={form.star_cost} onChange={e => setForm(f => ({ ...f, star_cost: e.target.value }))} />
                </FormField>
                <FormField label={t.adminCouponQuantity}>
                  <input className="input" type="number" min={1} value={form.total_quantity} onChange={e => setForm(f => ({ ...f, total_quantity: e.target.value }))} placeholder="∞" />
                </FormField>
              </div>

              {formError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                {t.btnCancel}
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? t.btnSaving : t.adminCouponSave}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full space-y-4">
            <p className="text-sm text-text">{t.adminCouponDeleteConfirm}</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirmId(null)} className="btn-secondary">{t.btnCancel}</button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                {t.adminCouponDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-text-muted">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function RedemptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending:   'badge-yellow',
    fulfilled: 'badge-green',
    expired:   'badge-gray',
  }
  return <span className={`text-xs ${map[status] ?? 'badge-gray'}`}>{status}</span>
}
