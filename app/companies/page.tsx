"use client"

import { useState, useEffect } from "react"
import { Plus, Edit2, Trash2, Building2 } from "lucide-react"
import type { Company } from "@prisma/client"

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [formData, setFormData] = useState({ name: "", location: "" })
  const [saving, setSaving] = useState(false)

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      }
    } catch (error) {
      console.error("Fetch error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCompany ? `/api/companies/${editingCompany.id}` : "/api/companies"
      const method = editingCompany ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingCompany(null)
        setFormData({ name: "", location: "" })
        fetchCompanies()
      }
    } catch (error) {
      console.error("Save error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (company: Company) => {
    setEditingCompany(company)
    setFormData({ name: company.name, location: company.location || "" })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated equipment and data.")) return

    try {
      const response = await fetch(`/api/companies/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchCompanies()
      }
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Companies</h1>
          <p className="text-slate-400">Manage your companies and locations</p>
        </div>

        <button
          onClick={() => {
            setEditingCompany(null)
            setFormData({ name: "", location: "" })
            setShowForm(true)
          }}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Plus size={18} />
          Add Company
        </button>

        {showForm && (
          <div className="mb-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">
              {editingCompany ? "Edit Company" : "New Company"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="My Company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
                  placeholder="San Francisco"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingCompany(null)
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <p className="text-slate-400">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="bg-slate-800 rounded-lg border border-slate-700 p-12 text-center">
            <Building2 className="mx-auto mb-4 text-slate-500" size={40} />
            <p className="text-slate-400">No companies yet. Add your first company to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {companies.map((company) => (
              <div
                key={company.id}
                className="bg-slate-800 rounded-lg border border-slate-700 p-4 flex items-center justify-between hover:bg-slate-750 transition"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                  {company.location && <p className="text-sm text-slate-400">{company.location}</p>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(company)}
                    className="p-2 hover:bg-slate-600 text-slate-300 hover:text-white rounded transition"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-2 hover:bg-red-900 text-slate-300 hover:text-red-200 rounded transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
