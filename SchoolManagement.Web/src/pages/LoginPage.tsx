import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Please fill in all fields')
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(15,76,117,0.3) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,180,216,0.15) 0%, transparent 50%), var(--clr-bg)',
      padding: 'var(--space-xl)',
    }}>
      {/* Decorative elements */}
      <div style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none'
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '5%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(0,180,216,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '10%', width: 300, height: 300,
          background: 'radial-gradient(circle, rgba(15,76,117,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, var(--clr-navy), var(--clr-teal))',
            borderRadius: 'var(--radius-lg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px',
            boxShadow: 'var(--shadow-glow)',
          }}>🏫</div>
          <h1 style={{
            fontFamily: 'Outfit, sans-serif', fontSize: 28, fontWeight: 800, color: 'white',
          }}>EduManage</h1>
          <p style={{ color: 'var(--clr-text-muted)', marginTop: 4 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--clr-surface)',
          border: '1px solid var(--clr-border)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-faint)' }} />
                <input
                  id="login-email"
                  className="form-control"
                  type="email"
                  placeholder="admin@school.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 40 }}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-faint)' }} />
                <input
                  id="login-password"
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 40, paddingRight: 40 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--clr-text-muted)', padding: 0, display: 'flex',
                  }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button id="login-submit" type="submit" className="btn btn-primary w-full" disabled={loading} style={{ justifyContent: 'center', padding: '11px' }}>
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 0.7s linear infinite' }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials */}
          <div style={{
            marginTop: 'var(--space-lg)',
            padding: 'var(--space-md)',
            background: 'var(--clr-surface-2)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--clr-border)',
          }}>
            <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', fontWeight: 600, marginBottom: 6 }}>
              🔑 Demo Credentials
            </p>
            <p style={{ fontSize: 12, color: 'var(--clr-text-faint)' }}>
              Email: <strong style={{ color: 'var(--clr-teal)' }}>admin@school.com</strong>
            </p>
            <p style={{ fontSize: 12, color: 'var(--clr-text-faint)' }}>
              Password: <strong style={{ color: 'var(--clr-teal)' }}>Admin@1234</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
