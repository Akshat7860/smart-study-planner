import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [prefs, setPrefs] = useState({ ...user?.preferences })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data } = await api.put('/auth/preferences', prefs)
      updateUser({ ...user, preferences: data.preferences })
      toast.success('Preferences saved! ✅')
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const field = (label, key, type = 'text', extra = {}) => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        value={prefs[key] ?? ''}
        onChange={(e) => setPrefs({ ...prefs, [key]: type === 'number' ? +e.target.value : e.target.value })}
        className="input"
        {...extra}
      />
    </div>
  )

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <p className="text-slate-400 mt-1 text-sm">Customize your study schedule preferences</p>
      </div>

      {/* Profile card */}
      <div className="card p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-xl font-bold text-brand-400 shrink-0">
          {user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div>
          <p className="font-semibold text-slate-200 text-lg">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-amber-400">🔥 {user?.streak?.current ?? 0} day streak</span>
            <span className="text-xs text-slate-600">·</span>
            <span className="text-xs text-slate-500">🏆 Best: {user?.streak?.longest ?? 0} days</span>
          </div>
        </div>
      </div>

      {/* Study preferences */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-200 mb-1">Study preferences</h2>
        <p className="text-slate-500 text-xs mb-5">These settings control how your timetable is auto-generated</p>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Study start time</label>
              <input
                type="time"
                value={prefs.studyStartTime ?? '08:00'}
                onChange={(e) => setPrefs({ ...prefs, studyStartTime: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Study end time</label>
              <input
                type="time"
                value={prefs.studyEndTime ?? '22:00'}
                onChange={(e) => setPrefs({ ...prefs, studyEndTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Session length (min)</label>
              <input
                type="number" min="15" max="180" step="5"
                value={prefs.sessionLength ?? 50}
                onChange={(e) => setPrefs({ ...prefs, sessionLength: +e.target.value })}
                className="input"
              />
              <p className="text-xs text-slate-600 mt-1">Recommended: 25–90 min</p>
            </div>
            <div>
              <label className="label">Break length (min)</label>
              <input
                type="number" min="5" max="60" step="5"
                value={prefs.breakLength ?? 10}
                onChange={(e) => setPrefs({ ...prefs, breakLength: +e.target.value })}
                className="input"
              />
              <p className="text-xs text-slate-600 mt-1">Recommended: 5–15 min</p>
            </div>
          </div>

          <div>
            <label className="label">Weekly study goal (hours)</label>
            <input
              type="number" min="1" max="100" step="0.5"
              value={prefs.weeklyGoalHours ?? 20}
              onChange={(e) => setPrefs({ ...prefs, weeklyGoalHours: +e.target.value })}
              className="input max-w-xs"
            />
            <div className="mt-2 h-2 bg-slate-800 rounded-full w-full max-w-xs overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((prefs.weeklyGoalHours ?? 20) / 80) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-1">{prefs.weeklyGoalHours ?? 20}h / week = ~{((prefs.weeklyGoalHours ?? 20) / 5).toFixed(1)}h per day</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto px-8">
            {saving ? 'Saving…' : 'Save preferences'}
          </button>
        </form>
      </div>

      {/* Tips */}
      <div className="card p-6 border-brand-500/20 bg-brand-500/5">
        <h2 className="font-semibold text-brand-400 mb-3">💡 Study tips</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          <li>• The <span className="text-slate-300 font-medium">Pomodoro technique</span> (25 min work + 5 min break) boosts focus and reduces burnout.</li>
          <li>• Studies show <span className="text-slate-300 font-medium">spaced repetition</span> is far more effective than cramming — spread your sessions out.</li>
          <li>• Aim for <span className="text-slate-300 font-medium">consistency</span> over intensity — 2 hours daily beats 14 hours on Sunday.</li>
          <li>• Your <span className="text-slate-300 font-medium">streak</span> resets if you miss a day — keep it alive by logging even short sessions.</li>
        </ul>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-red-500/20">
        <h2 className="font-semibold text-red-400 mb-1">Danger zone</h2>
        <p className="text-slate-500 text-xs mb-4">These actions are irreversible. Please be certain.</p>
        <button
          onClick={() => toast.error('Account deletion coming in a future update.')}
          className="text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors"
        >
          Delete account
        </button>
      </div>
    </div>
  )
}
