import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import dayjs from 'dayjs'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Dashboard() {
  const { user } = useAuth()
  const [todaySessions, setTodaySessions] = useState([])
  const [subjects,      setSubjects]      = useState([])
  const [timetable,     setTimetable]     = useState([])
  const [loading,       setLoading]       = useState(true)

  const todayIdx = new Date().getDay() // 0=Sun … 6=Sat

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [subjRes, ttRes, sessRes] = await Promise.all([
          api.get('/subjects'),
          api.get('/timetable'),
          api.get('/sessions', {
            params: {
              startDate: dayjs().startOf('day').toISOString(),
              endDate:   dayjs().endOf('day').toISOString(),
            },
          }),
        ])
        setSubjects(subjRes.data.data)
        setTimetable(ttRes.data.data)
        setTodaySessions(sessRes.data.data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  // Today's timetable slots
  const todaySlots = timetable.filter((s) => s.dayOfWeek === todayIdx)

  // Total planned minutes today
  const totalMins = todaySlots.reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number)
    const [eh, em] = s.endTime.split(':').map(Number)
    return acc + ((eh * 60 + em) - (sh * 60 + sm))
  }, 0)

  const completedToday = todaySessions.filter((s) => s.status === 'completed').length

  if (loading) return <PageLoader />

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">

      {/* Greeting */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-400 mt-1">{dayjs().format('dddd, MMMM D')}</p>
        </div>
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2">
          <span className="text-xl">🔥</span>
          <div>
            <p className="text-amber-400 font-bold text-lg leading-none">{user?.streak?.current ?? 0}</p>
            <p className="text-xs text-amber-400/70">day streak</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Subjects',        value: subjects.length,                  icon: '📚', color: 'text-brand-400' },
          { label: "Today's sessions",value: `${completedToday}/${todaySlots.length}`, icon: '✅', color: 'text-green-400' },
          { label: 'Study time today',value: `${Math.round(totalMins / 60 * 10) / 10}h`, icon: '⏱️', color: 'text-sky-400' },
          { label: 'Longest streak',  value: `${user?.streak?.longest ?? 0}d`, icon: '🏆', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{s.icon}</span>
            </div>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Today's schedule */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-200">Today's schedule</h2>
            <Link to="/timetable" className="text-xs text-brand-400 hover:text-brand-300">
              Edit →
            </Link>
          </div>

          {todaySlots.length === 0 ? (
            <EmptyState
              icon="🗓️"
              text="No sessions planned for today"
              action={{ label: 'Generate timetable', to: '/timetable' }}
            />
          ) : (
            <div className="space-y-3">
              {todaySlots.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: slot.subject?.color || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {slot.subject?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {slot.startTime} – {slot.endTime}
                    </p>
                  </div>
                  <span className="text-base">{slot.subject?.icon}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subjects overview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-200">My subjects</h2>
            <Link to="/subjects" className="text-xs text-brand-400 hover:text-brand-300">
              Manage →
            </Link>
          </div>

          {subjects.length === 0 ? (
            <EmptyState
              icon="📚"
              text="No subjects yet"
              action={{ label: 'Add subjects', to: '/subjects' }}
            />
          ) : (
            <div className="space-y-3">
              {subjects.slice(0, 5).map((sub) => {
                const pct = Math.min(
                  100,
                  Math.round((sub.totalHoursStudied / sub.weeklyGoalHours) * 100)
                )
                return (
                  <div key={sub._id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{sub.icon}</span>
                        <span className="text-sm font-medium text-slate-200">{sub.name}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {sub.totalHoursStudied.toFixed(1)}h / {sub.weeklyGoalHours}h
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: sub.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: '📚', label: 'Add subject',    to: '/subjects'  },
            { icon: '🗓️',  label: 'View timetable', to: '/timetable' },
            { icon: '⏱️',  label: 'Log session',    to: '/sessions'  },
            { icon: '📊', label: 'View analytics', to: '/analytics' },
          ].map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-brand-500/40 transition-all duration-150"
            >
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs text-slate-300 font-medium text-center">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function PageLoader() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 bg-slate-800 rounded-xl w-64" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-800 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function EmptyState({ icon, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-sm text-slate-500 mb-3">{text}</p>
      {action && (
        <Link to={action.to} className="text-xs text-brand-400 hover:text-brand-300 underline">
          {action.label}
        </Link>
      )}
    </div>
  )
}
