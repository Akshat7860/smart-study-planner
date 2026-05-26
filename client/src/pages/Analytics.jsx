import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import api from '../services/api'
import dayjs from 'dayjs'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler)

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
    y: { grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
  },
}

export default function Analytics() {
  const [sessions,  setSessions]  = useState([])
  const [subjects,  setSubjects]  = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/sessions', { params: { startDate: dayjs().subtract(30,'day').toISOString(), endDate: dayjs().endOf('day').toISOString() }}),
      api.get('/subjects'),
    ]).then(([sRes, subRes]) => {
      setSessions(sRes.data.data)
      setSubjects(subRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const completed = sessions.filter((s) => s.status === 'completed')
  const totalHours = completed.reduce((a, s) => a + (s.actualDuration || 0), 0) / 60
  const avgSession = completed.length ? Math.round(completed.reduce((a, s) => a + (s.actualDuration || 0), 0) / completed.length) : 0

  // ── Daily hours for last 14 days ──────────────────────────────────────────
  const last14 = Array.from({ length: 14 }, (_, i) => dayjs().subtract(13 - i, 'day'))
  const dailyHours = last14.map((d) =>
    completed
      .filter((s) => dayjs(s.date).isSame(d, 'day'))
      .reduce((a, s) => a + (s.actualDuration || 0), 0) / 60
  )
  const lineData = {
    labels: last14.map((d) => d.format('MMM D')),
    datasets: [{
      data: dailyHours,
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#6366f1',
      pointRadius: 3,
    }],
  }

  // ── Hours per subject ─────────────────────────────────────────────────────
  const subjectHours = subjects.map((sub) => ({
    name: sub.name,
    hours: completed.filter((s) => s.subject?._id === sub._id || s.subject === sub._id)
                    .reduce((a, s) => a + (s.actualDuration || 0), 0) / 60,
    color: sub.color,
  })).filter((s) => s.hours > 0)

  const barData = {
    labels: subjectHours.map((s) => s.name),
    datasets: [{
      data: subjectHours.map((s) => +s.hours.toFixed(2)),
      backgroundColor: subjectHours.map((s) => s.color + 'cc'),
      borderColor: subjectHours.map((s) => s.color),
      borderWidth: 1,
      borderRadius: 8,
    }],
  }

  const donutData = {
    labels: subjectHours.map((s) => s.name),
    datasets: [{ data: subjectHours.map((s) => +s.hours.toFixed(2)), backgroundColor: subjectHours.map((s) => s.color + 'cc'), borderWidth: 0 }],
  }

  // ── Mood distribution ─────────────────────────────────────────────────────
  const moodEmoji = { great: '🤩', good: '😊', okay: '😐', bad: '😔' }
  const moodCount = Object.fromEntries(['great','good','okay','bad'].map((m) => [m, completed.filter((s) => s.mood === m).length]))

  if (loading) return <div className="p-8 animate-pulse space-y-4">{[...Array(3)].map((_,i) => <div key={i} className="h-48 bg-slate-800 rounded-2xl" />)}</div>

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Analytics</h1>
        <p className="text-slate-400 mt-1 text-sm">Last 30 days performance overview</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total hours',      value: totalHours.toFixed(1) + 'h', icon: '⏱️',  color: 'text-brand-400' },
          { label: 'Sessions done',    value: completed.length,             icon: '✅', color: 'text-green-400' },
          { label: 'Avg session',      value: avgSession + ' min',          icon: '📊', color: 'text-sky-400'   },
          { label: 'Completion rate',  value: sessions.length ? Math.round(completed.length / sessions.length * 100) + '%' : '–', icon: '🎯', color: 'text-amber-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <span className="text-xl">{s.icon}</span>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Daily line chart */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Daily study hours — last 14 days</h2>
        {completed.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-slate-500 text-sm">Complete some sessions to see data</div>
        ) : (
          <Line data={lineData} options={{ ...CHART_OPTS, scales: { ...CHART_OPTS.scales, y: { ...CHART_OPTS.scales.y, min: 0 } } }} height={80} />
        )}
      </div>

      {/* Subject breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-4">Hours by subject</h2>
          {subjectHours.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <Bar data={barData} options={CHART_OPTS} height={160} />
          )}
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-200 mb-4">Distribution</h2>
          {subjectHours.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No data yet</div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 shrink-0">
                <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div className="space-y-2 flex-1">
                {subjectHours.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ background: s.color }} />
                    <span className="text-slate-300 truncate flex-1">{s.name}</span>
                    <span className="text-slate-500 shrink-0">{s.hours.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mood tracker */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-200 mb-4">Study mood breakdown</h2>
        <div className="grid grid-cols-4 gap-4">
          {Object.entries(moodCount).map(([mood, count]) => (
            <div key={mood} className="flex flex-col items-center gap-1 p-4 rounded-xl bg-slate-800">
              <span className="text-2xl">{moodEmoji[mood]}</span>
              <p className="text-xl font-bold text-slate-200">{count}</p>
              <p className="text-xs text-slate-500 capitalize">{mood}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
