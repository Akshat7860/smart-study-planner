import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const COLORS  = ['#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#8b5cf6','#06b6d4']
const ICONS   = ['📚','🧮','🔬','🌍','💻','🎨','📝','⚗️','🏛️','📐','🎭','🎵']
const DEFAULT = { name: '', icon: '📚', color: '#6366f1', weeklyGoalHours: 5, priority: 'medium', examDate: '' }

export default function Subjects() {
  const [subjects, setSubjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)   // add/edit modal open
  const [editing,  setEditing]  = useState(null)    // subject being edited (or null)
  const [form,     setForm]     = useState(DEFAULT)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { fetchSubjects() }, [])

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get('/subjects')
      setSubjects(data.data)
    } catch { toast.error('Failed to load subjects') }
    finally { setLoading(false) }
  }

  const openAdd  = ()     => { setEditing(null); setForm(DEFAULT); setModal(true) }
  const openEdit = (sub)  => { setEditing(sub); setForm({ ...sub, examDate: sub.examDate?.slice(0,10) || '' }); setModal(true) }
  const closeModal = ()   => { setModal(false); setEditing(null) }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Subject name is required')
    setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/subjects/${editing._id}`, form)
        setSubjects((prev) => prev.map((s) => s._id === editing._id ? data.data : s))
        toast.success('Subject updated!')
      } else {
        const { data } = await api.post('/subjects', form)
        setSubjects((prev) => [data.data, ...prev])
        toast.success('Subject added!')
      }
      closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subject?')) return
    try {
      await api.delete(`/subjects/${id}`)
      setSubjects((prev) => prev.filter((s) => s._id !== id))
      toast.success('Subject deleted')
    } catch { toast.error('Failed to delete') }
  }

  const priorityBadge = { high: 'bg-red-500/15 text-red-400', medium: 'bg-amber-500/15 text-amber-400', low: 'bg-green-500/15 text-green-400' }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">My Subjects</h1>
          <p className="text-slate-400 mt-1 text-sm">Add subjects and set your weekly study goals</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <span>+</span> Add subject
        </button>
      </div>

      {/* Subject grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i) => (
            <div key={i} className="h-44 bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <div className="card p-16 flex flex-col items-center text-center">
          <span className="text-5xl mb-4">📚</span>
          <h3 className="text-lg font-semibold text-slate-200 mb-2">No subjects yet</h3>
          <p className="text-slate-500 text-sm mb-6">Add your subjects and set weekly hour goals to get started</p>
          <button onClick={openAdd} className="btn-primary">Add your first subject</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => {
            const pct = Math.min(100, Math.round((sub.totalHoursStudied / sub.weeklyGoalHours) * 100))
            return (
              <div key={sub._id} className="card p-5 hover:border-slate-700 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                         style={{ background: sub.color + '22', border: `1px solid ${sub.color}44` }}>
                      {sub.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 leading-tight">{sub.name}</h3>
                      <span className={`badge mt-1 ${priorityBadge[sub.priority]}`}>
                        {sub.priority} priority
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(sub)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 text-xs">✏️</button>
                    <button onClick={() => handleDelete(sub._id)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 text-xs">🗑️</button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 mt-auto">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{sub.totalHoursStudied.toFixed(1)}h studied</span>
                    <span>Goal: {sub.weeklyGoalHours}h/week</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                         style={{ width: `${pct}%`, background: sub.color }} />
                  </div>
                  <p className="text-xs text-slate-500 text-right">{pct}%</p>
                </div>

                {sub.examDate && (
                  <p className="mt-3 text-xs text-slate-500">
                    📅 Exam: {new Date(sub.examDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-100">
                {editing ? 'Edit subject' : 'Add subject'}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-200 text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Name */}
              <div>
                <label className="label">Subject name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})}
                       placeholder="e.g. Mathematics" className="input" required />
              </div>

              {/* Icon picker */}
              <div>
                <label className="label">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button type="button" key={ic} onClick={() => setForm({...form, icon: ic})}
                            className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all
                              ${form.icon === ic ? 'bg-brand-500/20 border border-brand-500' : 'bg-slate-800 border border-slate-700 hover:border-slate-500'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <label className="label">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button type="button" key={c} onClick={() => setForm({...form, color: c})}
                            className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''}`}
                            style={{ background: c }} />
                  ))}
                </div>
              </div>

              {/* Weekly goal + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Weekly goal (hours)</label>
                  <input type="number" min="0.5" max="40" step="0.5"
                         value={form.weeklyGoalHours}
                         onChange={(e) => setForm({...form, weeklyGoalHours: +e.target.value})}
                         className="input" />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})}
                          className="input">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {/* Exam date */}
              <div>
                <label className="label">Exam date (optional)</label>
                <input type="date" value={form.examDate}
                       onChange={(e) => setForm({...form, examDate: e.target.value})}
                       className="input" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeModal} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : editing ? 'Save changes' : 'Add subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
