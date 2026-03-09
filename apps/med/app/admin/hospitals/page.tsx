'use client'

import { useEffect, useState, FormEvent } from 'react'
import { Plus, X, Building2 } from 'lucide-react'
import { useToast } from '@/components/ui/Toast'
import type { NursedHospital } from '@/lib/supabase'
import { useLang } from '@/contexts/LanguageContext'

interface CreateHospitalForm {
  name: string
  name_vi: string
  city: string
  contact_email: string
  plan: 'free' | 'pro'
}

const EMPTY_FORM: CreateHospitalForm = {
  name: '',
  name_vi: '',
  city: '',
  contact_email: '',
  plan: 'free',
}

export default function HospitalsPage() {
  const { toast } = useToast()
  const { t } = useLang()
  const [hospitals, setHospitals] = useState<NursedHospital[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<CreateHospitalForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    loadHospitals()
  }, [])

  async function loadHospitals() {
    setLoading(true)
    try {
      const res = await fetch('/api/hospitals')
      const data = await res.json()
      setHospitals(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast(t.toastHospitalCreated, 'success')
        setShowModal(false)
        setForm(EMPTY_FORM)
        await loadHospitals()
      } else {
        toast(t.toastHospitalCreateError, 'error')
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleActive(hospital: NursedHospital) {
    const res = await fetch(`/api/hospitals/${hospital.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !hospital.active }),
    })
    if (res.ok) {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, active: !h.active } : h)),
      )
      toast(hospital.active ? t.toastDeactivated : t.toastActivated, 'success')
    } else {
      toast(t.toastUpdateError, 'error')
    }
  }

  async function handleSaveName(hospital: NursedHospital) {
    const res = await fetch(`/api/hospitals/${hospital.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    if (res.ok) {
      setHospitals((prev) =>
        prev.map((h) => (h.id === hospital.id ? { ...h, name: editName } : h)),
      )
      setEditingId(null)
      toast(t.toastNameUpdated, 'success')
    } else {
      toast(t.toastUpdateError, 'error')
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{t.adminHospitalsTitle}</h1>
          <p className="text-sm text-text-muted mt-1">{hospitals.length}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          {t.btnAddHospital}
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-surface animate-pulse" />
            ))}
          </div>
        ) : hospitals.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 size={40} className="text-text-muted mx-auto mb-3" />
            <p className="text-text-muted">{t.emptyHospitals}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-text-muted">{t.tableColHospitalName}</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">{t.tableColCity}</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted">{t.tableColEmail}</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted w-24">{t.tableColPlan}</th>
                <th className="text-left px-4 py-3 font-medium text-text-muted w-28">{t.tableColStatusH}</th>
                <th className="text-right px-4 py-3 font-medium text-text-muted w-24">{t.tableColActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {hospitals.map((hospital) => (
                <tr key={hospital.id} className="hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3">
                    {editingId === hospital.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          className="input text-sm"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveName(hospital)}
                          className="btn-primary !py-1 !px-2.5 text-xs"
                        >
                          {t.btnSave}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="btn-secondary !py-1 !px-2 text-xs"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => {
                            setEditingId(hospital.id)
                            setEditName(hospital.name)
                          }}
                          className="font-medium text-text hover:text-primary transition-colors text-left"
                        >
                          {hospital.name}
                        </button>
                        {hospital.name_vi && (
                          <p className="text-xs text-text-muted">{hospital.name_vi}</p>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-text-muted">{hospital.city ?? '—'}</td>
                  <td className="px-4 py-3 text-text-muted">{hospital.contact_email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={hospital.plan === 'pro' ? 'badge-blue' : 'badge-gray'}>
                      {hospital.plan === 'pro' ? t.planPro : t.planFree}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(hospital)}
                      className={`badge cursor-pointer transition-colors ${
                        hospital.active
                          ? 'badge-green hover:bg-red-100 hover:text-red-700'
                          : 'badge-red hover:bg-green-100 hover:text-green-700'
                      }`}
                    >
                      {hospital.active ? t.statusActive : t.statusInactive}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs text-text-muted">
                      {new Date(hospital.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in">
          <div className="card p-6 w-full max-w-md mx-4 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2>{t.modalAddHospitalTitle}</h2>
              <button onClick={() => setShowModal(false)} className="btn-ghost !p-1.5">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="label">{t.labelNameEn}</label>
                <input
                  className="input"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={t.placeholderNameEn}
                />
              </div>
              <div>
                <label className="label">{t.labelNameVi}</label>
                <input
                  className="input"
                  value={form.name_vi}
                  onChange={(e) => setForm({ ...form, name_vi: e.target.value })}
                  placeholder={t.placeholderNameVi}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.labelCity}</label>
                  <input
                    className="input"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder={t.placeholderCity}
                  />
                </div>
                <div>
                  <label className="label">{t.labelPlan}</label>
                  <select
                    className="input"
                    value={form.plan}
                    onChange={(e) =>
                      setForm({ ...form, plan: e.target.value as 'free' | 'pro' })
                    }
                  >
                    <option value="free">{t.planFree}</option>
                    <option value="pro">{t.planPro}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t.labelEmail}</label>
                <input
                  className="input"
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                  placeholder={t.placeholderEmail}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary flex-1"
                >
                  {t.btnCancel}
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? t.btnCreating : t.btnCreateHospital}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
