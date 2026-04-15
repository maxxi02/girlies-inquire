import { useState, useEffect, useRef, type FormEvent } from 'react'
import './index.css'
import './App.css'

const API = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://girlies-birthing-server.onrender.com' : 'http://localhost:3000')

// ── Types ─────────────────────────────────────────────────────────────────────
type ToastState = { type: 'success' | 'error'; msg: string } | null

// ── Utility ──────────────────────────────────────────────────────────────────
function Toast({ toast }: { toast: ToastState }) {
  if (!toast) return null
  return (
    <div className={`toast ${toast.type}`} role="alert">
      {toast.type === 'success' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      )}
      {toast.msg}
    </div>
  )
}

// ── Inquiry Form ──────────────────────────────────────────────────────────────
function InquiryForm() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [submitted, setSubmitted] = useState(false)

  const showToast = (t: ToastState) => { setToast(t); setTimeout(() => setToast(null), 5000) }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.fullName || !form.email || !form.message) {
      showToast({ type: 'error', msg: 'Please fill in all required fields.' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/public/inquire`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setSubmitted(true)
    } catch (err: unknown) {
      showToast({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to send inquiry.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-card">
        <div className="form-card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'oklch(0.97 0.02 150)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.18 150)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Inquiry Sent!
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '0.25rem' }}>
            Thank you, <strong style={{ color: 'var(--text)' }}>{form.fullName}</strong>. We've received your message.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            We'll get back to you at <strong style={{ color: 'var(--text)' }}>{form.email}</strong> within 24 hours.
          </p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 28px', margin: '0 auto' }}
            onClick={() => { setSubmitted(false); setForm({ fullName: '', email: '', phone: '', message: '' }) }}
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div className="form-card-icon">💬</div>
        <h2>Send an Inquiry</h2>
        <p>Have a question? Send us a message and we'll respond within 24 hours.</p>
      </div>
      <form className="form-card-body" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="inq-name">Full Name <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <input id="inq-name" type="text" placeholder="Maria Santos" value={form.fullName} onChange={set('fullName')} required />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="inq-email">Gmail / Email <span style={{ color: 'var(--rose-500)' }}>*</span></label>
            <input id="inq-email" type="email" placeholder="maria@gmail.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label htmlFor="inq-phone">Phone (optional)</label>
            <input id="inq-phone" type="tel" placeholder="09XX XXX XXXX" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="inq-message">Your Message <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <textarea id="inq-message" rows={5} placeholder="What would you like to know about our services…" value={form.message} onChange={set('message')} required />
        </div>

        <Toast toast={toast} />

        <button id="inq-submit" className="btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Sending…</> : <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            Send Inquiry
          </>}
        </button>
      </form>
    </div>
  )
}
// ── Appointment Form ──────────────────────────────────────────────────────────
const TIME_SLOTS = [
  '8:00 AM – 9:00 AM',
  '9:00 AM – 10:00 AM',
  '10:00 AM – 11:00 AM',
  '11:00 AM – 12:00 PM',
  '1:00 PM – 2:00 PM',
  '2:00 PM – 3:00 PM',
  '3:00 PM – 4:00 PM',
  '4:00 PM – 5:00 PM',
]

const REASONS = [
  'Prenatal Check-up',
  'Post-natal Visit',
  'Family Planning',
  'Newborn Screening',
  'Vaccination',
  'General Consultation',
  'Ultrasound',
  'Laboratory',
  'Other',
]

// ── Reason Select ─────────────────────────────────────────────────────────────
function ReasonSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        id="appt-reason"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'var(--surface)',
          border: '1.5px solid var(--border)', borderRadius: 10, padding: '10px 2.5rem 10px 14px',
          fontSize: '0.92rem', color: value ? 'var(--text)' : 'var(--muted)', cursor: 'pointer',
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23ec4899'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: 18,
        }}
      >
        {value || 'Select reason…'}
      </button>
      {open && (
        <ul style={{
          position: 'absolute', zIndex: 50, top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 10,
          maxHeight: 220, overflowY: 'auto', margin: 0, padding: '4px 0', listStyle: 'none',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        }}>
          {REASONS.map(r => (
            <li
              key={r}
              onClick={() => { onChange(r); setOpen(false) }}
              style={{
                padding: '9px 14px', fontSize: '0.92rem', cursor: 'pointer',
                color: r === value ? 'var(--rose-600)' : 'var(--text)',
                background: r === value ? 'oklch(0.97 0.02 0)' : 'transparent',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'oklch(0.97 0.02 0)')}
              onMouseLeave={e => (e.currentTarget.style.background = r === value ? 'oklch(0.97 0.02 0)' : 'transparent')}
            >
              {r}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function AppointmentForm() {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '',
    preferredDate: '', preferredTime: '', reason: '',
  })
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastState>(null)
  const [submitted, setSubmitted] = useState(false)

  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  const showToast = (t: ToastState) => { setToast(t); setTimeout(() => setToast(null), 6000) }

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!form.preferredDate) {
      setBookedSlots([])
      return
    }
    fetch(`${API}/api/public/appointments/slots?date=${form.preferredDate}`)
      .then(res => res.json())
      .then(data => {
        if (data.bookedSlots) setBookedSlots(data.bookedSlots)
      })
      .catch(console.error)
  }, [form.preferredDate])

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    const { fullName, email, preferredDate, preferredTime, reason } = form
    if (!fullName || !email || !preferredDate || !preferredTime || !reason) {
      showToast({ type: 'error', msg: 'Please fill in all required fields.' })
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/public/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setSubmitted(true)
    } catch (err: unknown) {
      showToast({ type: 'error', msg: err instanceof Error ? err.message : 'Failed to submit appointment.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="form-card">
        <div className="form-card-body" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'oklch(0.97 0.02 150)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="oklch(0.55 0.18 150)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Appointment Requested!
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '0.25rem' }}>
            Thank you, <strong style={{ color: 'var(--text)' }}>{form.fullName}</strong>. We've received your request.
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            A confirmation will be sent to <strong style={{ color: 'var(--text)' }}>{form.email}</strong> once we review your schedule.
          </p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '10px 28px', margin: '0 auto' }}
            onClick={() => { setSubmitted(false); setForm({ fullName: '', email: '', phone: '', preferredDate: '', preferredTime: '', reason: '' }) }}
          >
            Book Another Appointment
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="form-card">
      <div className="form-card-header">
        <div className="form-card-icon">📅</div>
        <h2>Book an Appointment</h2>
        <p>Fill in your details below and we'll confirm your schedule via email.</p>
      </div>
      <form className="form-card-body" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="appt-name">Full Name <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <input id="appt-name" type="text" placeholder="Maria Santos" value={form.fullName} onChange={set('fullName')} required />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="appt-email">Gmail / Email <span style={{ color: 'var(--rose-500)' }}>*</span></label>
            <input id="appt-email" type="email" placeholder="maria@gmail.com" value={form.email} onChange={set('email')} required />
          </div>
          <div className="field">
            <label htmlFor="appt-phone">Phone (optional)</label>
            <input id="appt-phone" type="tel" placeholder="09XX XXX XXXX" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        <div className="divider">Schedule</div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="appt-date">Preferred Date <span style={{ color: 'var(--rose-500)' }}>*</span></label>
            <input id="appt-date" type="date" min={today} value={form.preferredDate} onChange={set('preferredDate')} required />
          </div>
          <div className="field">
            <label htmlFor="appt-time">Preferred Time <span style={{ color: 'var(--rose-500)' }}>*</span></label>
            <select id="appt-time" value={form.preferredTime} onChange={set('preferredTime')} required disabled={!form.preferredDate} style={{ opacity: form.preferredDate ? 1 : 0.4, cursor: form.preferredDate ? 'auto' : 'not-allowed' }}>
              <option value="">{form.preferredDate ? 'Select time slot' : 'Select a date first'}</option>
              {TIME_SLOTS.map(t => (
                <option key={t} value={t} disabled={bookedSlots.includes(t)}>
                  {t} {bookedSlots.includes(t) ? '(Booked)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="appt-reason">Reason for Visit <span style={{ color: 'var(--rose-500)' }}>*</span></label>
          <ReasonSelect value={form.reason} onChange={v => setForm(f => ({ ...f, reason: v }))} />
        </div>

        <Toast toast={toast} />

        <button id="appt-submit" className="btn-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner" /> Submitting…</> : <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Request Appointment
          </>}
        </button>

        <p style={{ fontSize: '0.78rem', color: 'var(--muted)', textAlign: 'center', lineHeight: 1.5 }}>
          A confirmation email will be sent to your Gmail once we review your request.
        </p>
      </form>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<'inquiry' | 'appointment' | null>(null)

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar */}
      <nav className="navbar">
        <a href="#" className="navbar-brand">
          <img src="/logo.png" alt="Logo" className="navbar-logo" />
          <div>
            <div className="navbar-name">Girlie's Birthing Home</div>
            <div className="navbar-tagline">Compassionate maternity care</div>
          </div>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--muted)' }}>
          <div className="live-dot" />
          Accepting patients
        </div>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ paddingBottom: activeTab ? '2rem' : '6rem', flex: activeTab ? 'none' : '1' }}>
        <div className="hero-badge">
          <div className="live-dot" /> Patient Portal
        </div>
        <h1>We're here to <span>care for you</span><br />every step of the way</h1>
        <p>
          Send us an inquiry or book an appointment online. Your confirmation will be sent directly to your Gmail.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary"
            style={{ 
              background: activeTab === 'inquiry' ? 'var(--rose-600)' : 'white', 
              color: activeTab === 'inquiry' ? 'white' : 'var(--rose-600)',
              border: '2px solid var(--rose-600)',
              transition: 'all 0.2s ease',
              width: 'auto',
              minWidth: '200px',
              padding: '12px 24px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(activeTab === 'inquiry' ? null : 'inquiry')}
          >
            💬 Send an Inquiry
          </button>
          <button 
            className="btn-primary"
            style={{ 
              background: activeTab === 'appointment' ? 'var(--rose-600)' : 'white', 
              color: activeTab === 'appointment' ? 'white' : 'var(--rose-600)',
              border: '2px solid var(--rose-600)',
              transition: 'all 0.2s ease',
              width: 'auto',
              minWidth: '200px',
              padding: '12px 24px',
              cursor: 'pointer'
            }}
            onClick={() => setActiveTab(activeTab === 'appointment' ? null : 'appointment')}
          >
            📅 Book an Appointment
          </button>
        </div>
      </section>

      {/* Forms */}
      {activeTab && (
        <main className="forms-section" style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ maxWidth: '640px', width: '100%', animation: 'fadeIn 0.4s ease-out' }}>
            {activeTab === 'inquiry' && <InquiryForm />}
            {activeTab === 'appointment' && <AppointmentForm />}
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="footer" style={{ marginTop: 'auto' }}>
        © {new Date().getFullYear()} Girlie's Birthing Home. All rights reserved.
        &nbsp;·&nbsp; For emergencies please call your nearest hospital.
      </footer>
    </div>
  )
}
