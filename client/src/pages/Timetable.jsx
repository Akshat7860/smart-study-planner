import { useEffect, useState } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

export default function Timetable() {
  const [slots,     setSlots]     = useState([])
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [generating,setGenerating]= useState(false)
  const [modal,     setModal]     = useState(false)
  const [form,      setForm]      = useState({ subject: '', dayOfWeek: 1, startTime: '09:00', endTime: '10:00' })

  useEffect(() => {
    Promise.all([api.get('/timetable'), api.get('/subjects')]).then(([tt, sub]) => {
      setSlots(tt.data.data)
      setSubjects(sub.data.data)
    }).catch(() => toast.error('Failed to load')).finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    if (!confirm('This will replace your current timetable. Continue?')) return
    setGenerating(true)
    try {
      const { data } = await api.post('/timetable/generate')
      setSlots(data.data)
      toast.success('Timetable generated! 🗓️')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Generation failed')
    } finally { setGenerating(false) }
  }

  const addSlot = async (e) => {
    e.preventDefault()
    if (!form.subject) return toast.error('Select a subject')
    try {
      const { data } = await api.post('/timetable/slot', form)
      setSlots((prev) => [...prev, data.data])
      setModal(false)
      toast.success('Slot added!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add slot')
    }
  }

  const deleteSlot = async (id) => {
    try {
      await api.delete(`/timetable/slot/${id}`)
      setSlots((prev) => prev.filter((s) => s._id !== id))
      toast.success('Slot removed')
    } catch { toast.error('Failed to remove') }
  }

  // Group slots by day
  const byDay = Array.from({ length: 7 }, (_, i) =>
    slots.filter((s) => s.dayOfWeek === i).sort((a, b) => a.startTime.localeCompare(b.startTime))
  )

  if (loading) return <div className="p-8 animate-pulse"><div className="h-96 bg-slate-800 rounded-2xl" /></div>

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Weekly Timetable</h1>
          <p className="text-slate-400 mt-1 text-sm">Your recurring study schedule</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setModal(true)} className="btn-ghost text-sm flex items-center gap-2">
            + Add slot
          </button>
          <button onClick={generate} disabled={generating} className="btn-primary text-sm flex items-center gap-2">
            {generating ? '⏳ Generating…' : '✨ Auto-generate'}
          </button>
        </div>
      </div>

      {subjects.length === 0 && (
        <div className="card p-6 mb-6 border-amber-500/30 bg-amber-500/5">
          <p className="text-amber-400 text-sm">⚠️ Add subjects first before generating a timetable.</p>
        </div>
      )}

      {/* Week grid — Mon to Fri (+ Sat/Sun condensed) */}
      <div className="space-y-4">
        {[1,2,3,4,5,6,0].map((dayIdx) => {
          const daySlots = byDay[dayIdx]
          const isToday  = new Date().getDay() === dayIdx
          return (
            <div key={dayIdx} className={`card p-5 ${isToday ? 'border-brand-500/40 bg-brand-500/5' : ''}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0
                  ${isToday ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-300'}`}>
                  {SHORT[dayIdx]}
                </div>
                <h3 className={`font-semibold ${isToday ? 'text-brand-400' : 'text-slate-300'}`}>
                  {DAYS[dayIdx]} {isToday && <span className="text-xs font-normal text-brand-400/70 ml-1">(today)</span>}
                </h3>
                <span className="text-xs text-slate-500 ml-auto">{daySlots.length} session{daySlots.length !== 1 ? 's' : ''}</span>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-sm text-slate-600 py-2 pl-1">No sessions — rest day 😴</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <div key={slot._id}
                         className="group flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl text-sm
                                    bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: slot.subject?.color }} />
                      <span className="text-slate-200 font-medium">{slot.subject?.name}</span>
                      <span className="text-slate-500 text-xs">{slot.startTime}–{slot.endTime}</span>
                      <button onClick={() => deleteSlot(slot._id)}
                              className="ml-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-xs">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add slot modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100">Add time slot</h2>
              <button onClick={() => setModal(false)} className="text-slate-400 text-xl leading-none">×</button>
            </div>

            <form onSubmit={addSlot} className="space-y-4">
              <div>
                <label className="label">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="input">
                  <option value="">Select subject…</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Day</label>
                <select value={form.dayOfWeek} onChange={(e) => setForm({...form, dayOfWeek: +e.target.value})} className="input">
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} className="input" />
                </div>
                <div>
                  <label className="label">End</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} className="input" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Add slot</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
