import { useEffect, useState, useRef } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import dayjs from 'dayjs'

const MOODS = [
  { v: 'great', emoji: '🤩', label: 'Great' },
  { v: 'good',  emoji: '😊', label: 'Good'  },
  { v: 'okay',  emoji: '😐', label: 'Okay'  },
  { v: 'bad',   emoji: '😔', label: 'Bad'   },
]

export default function Sessions() {
  const [sessions,  setSessions]  = useState([])
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null) // 'add' | 'complete' | null
  const [activeSession, setActiveSession] = useState(null)
  const [form,   setForm]   = useState({ subject: '', date: dayjs().format('YYYY-MM-DD'), plannedDuration: 50, notes: '' })
  const [complete, setComplete] = useState({ actualDuration: 50, notes: '', mood: 'good', pomodoroCount: 0 })

  // Pomodoro timer state
  const [timer,   setTimer]   = useState({ running: false, seconds: 50 * 60, mode: 'work' }) // 50min work
  const intervalRef = useRef(null)

  useEffect(() => { fetchAll() }, [])

  // Countdown tick
  useEffect(() => {
    if (timer.running) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => {
          if (t.seconds <= 1) {
            clearInterval(intervalRef.current)
            toast.success(t.mode === 'work' ? '🎉 Session done! Take a break.' : '⏱️ Break over — back to work!')
            return { ...t, running: false, seconds: 0 }
          }
          return { ...t, seconds: t.seconds - 1 }
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [timer.running])

  const fetchAll = async () => {
    try {
      const [sessRes, subRes] = await Promise.all([
        api.get('/sessions', { params: { startDate: dayjs().subtract(7,'day').toISOString(), endDate: dayjs().endOf('day').toISOString() }}),
        api.get('/subjects'),
      ])
      setSessions(sessRes.data.data)
      setSubjects(subRes.data.data)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const createSession = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/sessions', form)
      setSessions((p) => [data.data, ...p])
      setModal(null)
      toast.success('Session planned!')
      // Start timer automatically
      setTimer({ running: false, seconds: form.plannedDuration * 60, mode: 'work' })
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  const openComplete = (sess) => {
    setActiveSession(sess)
    setComplete({ actualDuration: sess.plannedDuration, notes: '', mood: 'good', pomodoroCount: 0 })
    setModal('complete')
  }

  const markComplete = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.put(`/sessions/${activeSession._id}/complete`, complete)
      setSessions((p) => p.map((s) => s._id === activeSession._id ? data.data : s))
      toast.success(`🔥 Session done! Streak: ${data.streak.current} days`)
      setModal(null)
    } catch { toast.error('Failed to complete') }
  }

  const skipSession = async (id) => {
    try {
      const { data } = await api.put(`/sessions/${id}/skip`)
      setSessions((p) => p.map((s) => s._id === id ? data.data : s))
      toast('Session skipped', { icon: '⏭️' })
    } catch { toast.error('Failed') }
  }

  const fmt = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2,'0')
    const s = (secs % 60).toString().padStart(2,'0')
    return `${m}:${s}`
  }
  const pct = (secs, total) => Math.round((1 - secs / total) * 100)

  const statusColor = { planned: 'text-brand-400 bg-brand-500/10', completed: 'text-green-400 bg-green-500/10', skipped: 'text-slate-500 bg-slate-800' }

  if (loading) return <div className="p-8 animate-pulse"><div className="h-96 bg-slate-800 rounded-2xl" /></div>

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Study Sessions</h1>
          <p className="text-slate-400 mt-1 text-sm">Log and track your study blocks</p>
        </div>
        <button onClick={() => setModal('add')} className="btn-primary">+ Plan session</button>
      </div>

      {/* Pomodoro Timer */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-200 mb-4">⏱️ Pomodoro Timer</h2>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Clock display */}
          <div className="relative w-36 h-36 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#1e293b" strokeWidth="8" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="#6366f1" strokeWidth="8"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - pct(timer.seconds, (timer.mode === 'work' ? 50 : 10) * 60) / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s linear' }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-slate-100">{fmt(timer.seconds)}</span>
              <span className="text-xs text-slate-500 capitalize">{timer.mode}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1 w-full">
            <div className="flex gap-2 flex-wrap">
              {[25,50].map((m) => (
                <button key={m} onClick={() => setTimer({ running: false, seconds: m*60, mode: 'work' })}
                        className="btn-ghost text-xs py-1.5 px-3">{m} min</button>
              ))}
              <button onClick={() => setTimer({ running: false, seconds: 10*60, mode: 'break' })}
                      className="btn-ghost text-xs py-1.5 px-3">10 min break</button>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setTimer((t) => ({ ...t, running: !t.running }))}
                className={`btn-primary flex-1 ${timer.running ? 'bg-amber-500 hover:bg-amber-600' : ''}`}>
                {timer.running ? '⏸ Pause' : '▶ Start'}
              </button>
              <button onClick={() => setTimer((t) => ({ ...t, running: false, seconds: (t.mode === 'work' ? 50 : 10)*60 }))}
                      className="btn-ghost px-4">↺</button>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions list */}
      <div>
        <h2 className="font-semibold text-slate-200 mb-4">Recent sessions (last 7 days)</h2>
        {sessions.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-3xl mb-3">⏱️</p>
            <p className="text-slate-400">No sessions yet. Plan your first study session!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s._id} className="card p-4 flex items-center gap-4 hover:border-slate-700 transition-colors">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.subject?.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-200 text-sm">{s.subject?.name}</span>
                    <span className={`badge text-xs ${statusColor[s.status]}`}>{s.status}</span>
                    {s.mood && <span className="text-sm">{MOODS.find(m=>m.v===s.mood)?.emoji}</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {dayjs(s.date).format('MMM D')} · {s.plannedDuration} min planned
                    {s.actualDuration ? ` · ${s.actualDuration} min actual` : ''}
                    {s.pomodoroCount > 0 ? ` · 🍅 ×${s.pomodoroCount}` : ''}
                  </p>
                </div>
                {s.status === 'planned' && (
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => openComplete(s)} className="btn-primary text-xs py-1.5 px-3">Done</button>
                    <button onClick={() => skipSession(s._id)} className="btn-ghost text-xs py-1.5 px-3">Skip</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Plan session modal */}
      {modal === 'add' && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100">Plan session</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={createSession} className="space-y-4">
              <div>
                <label className="label">Subject</label>
                <select value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} className="input" required>
                  <option value="">Select…</option>
                  {subjects.map((s) => <option key={s._id} value={s._id}>{s.icon} {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Date</label>
                <input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Planned duration (min)</label>
                <input type="number" min="5" max="480" value={form.plannedDuration}
                       onChange={(e) => setForm({...form, plannedDuration: +e.target.value})} className="input" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Plan it</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete session modal */}
      {modal === 'complete' && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-100">Complete session</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 text-xl">×</button>
            </div>
            <form onSubmit={markComplete} className="space-y-4">
              <div>
                <label className="label">Actual duration (min)</label>
                <input type="number" min="1" value={complete.actualDuration}
                       onChange={(e) => setComplete({...complete, actualDuration: +e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">Pomodoros completed</label>
                <input type="number" min="0" max="20" value={complete.pomodoroCount}
                       onChange={(e) => setComplete({...complete, pomodoroCount: +e.target.value})} className="input" />
              </div>
              <div>
                <label className="label">How was it?</label>
                <div className="flex gap-2">
                  {MOODS.map((m) => (
                    <button type="button" key={m.v} onClick={() => setComplete({...complete, mood: m.v})}
                            className={`flex-1 py-2 rounded-xl text-lg border transition-all
                              ${complete.mood === m.v ? 'border-brand-500 bg-brand-500/15' : 'border-slate-700 bg-slate-800'}`}>
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Notes (optional)</label>
                <textarea value={complete.notes} onChange={(e) => setComplete({...complete, notes: e.target.value})}
                          className="input h-20 resize-none" placeholder="What did you study?" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(null)} className="btn-ghost flex-1">Cancel</button>
                <button type="submit" className="btn-primary flex-1">Mark done ✅</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
