import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { cmsApi } from '@/lib/services'
import {
  Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, Shield
} from 'lucide-react'
import {
  FacebookIcon, TwitterIcon, InstagramIcon,
  LinkedinIcon, YoutubeIcon, GithubIcon
} from '@/components/SocialIcons'
import toast from 'react-hot-toast'

interface PublicCmsSettings {
  siteName: string
  siteTagline?: string
  logoUrl?: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  footerText?: string
  facebookUrl?: string
  twitterUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  githubUrl?: string
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  // Fetch dynamic CMS branding & social links configured by SuperAdmin
  const { data: cms } = useQuery<PublicCmsSettings>({
    queryKey: ['publicCmsSettings'],
    queryFn: async () => {
      const res = await cmsApi.getPublic()
      return res.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return toast.error('Enter your email and password')
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success('Signed in successfully')
      if (user.isSuperAdmin) {
        navigate('/superadmin/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch {
      toast.error('Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const hasSocials = !!(
    cms?.facebookUrl ||
    cms?.twitterUrl ||
    cms?.instagramUrl ||
    cms?.linkedinUrl ||
    cms?.youtubeUrl ||
    cms?.githubUrl
  )

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: '24px 16px',
    }}>
      {/* Main Card Container */}
      <div style={{ width: '100%', maxWidth: 410 }}>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 46,
            height: 46,
            borderRadius: 'var(--r-lg)',
            background: 'var(--primary)',
            color: '#ffffff',
            marginBottom: 12,
            boxShadow: '0 4px 12px 0 rgba(79, 70, 229, 0.25)',
          }}>
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M5 7.5C5 5.57 6.57 4 8.5 4H22.2C24.41 4 26.2 5.79 26.2 8V20.2C26.2 22.41 24.41 24.2 22.2 24.2H13.7L8.15 28V24.2H8.5C6.57 24.2 5 22.63 5 20.7V7.5Z" fill="currentColor"/>
              <path d="M10 10H21.5M10 15.8H18.5M10 21.5H15" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}>
            {cms?.siteName || 'EduManage'}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            {cms?.siteTagline || 'Sign in to access the academic & administrative portal'}
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="card" style={{ padding: '28px 24px', boxShadow: 'var(--shadow-md)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{
                  position: 'absolute', left: 11, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  id="login-email"
                  className="form-control"
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{ paddingLeft: 34 }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password">Password</label>
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); toast('Please contact school administration to reset your password.') }}
                  style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 500 }}
                >
                  Forgot password?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{
                  position: 'absolute', left: 11, top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  id="login-password"
                  className="form-control"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: 34, paddingRight: 36 }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  style={{
                    position: 'absolute', right: 8, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', padding: 4, display: 'flex',
                  }}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{ width: 15, height: 15, accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="rememberMe" style={{ fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: 4, fontWeight: 600 }}
            >
              {loading ? (
                <><Loader2 size={15} style={{ animation: 'spin 0.65s linear infinite' }} /> Signing in…</>
              ) : (
                <>Sign In to Account <ArrowRight size={14} /></>
              )}
            </button>
          </form>
        </div>

        {/* Dynamic Social Links configured by SuperAdmin */}
        {hasSocials && (
          <div style={{
            marginTop: 18,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Connect with us
            </span>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
              {cms?.facebookUrl && (
                <a href={cms.facebookUrl} target="_blank" rel="noreferrer" title="Facebook"
                   style={{ color: '#1877F2', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <FacebookIcon size={15} />
                </a>
              )}
              {cms?.twitterUrl && (
                <a href={cms.twitterUrl} target="_blank" rel="noreferrer" title="Twitter / X"
                   style={{ color: '#1DA1F2', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <TwitterIcon size={15} />
                </a>
              )}
              {cms?.instagramUrl && (
                <a href={cms.instagramUrl} target="_blank" rel="noreferrer" title="Instagram"
                   style={{ color: '#E4405F', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <InstagramIcon size={15} />
                </a>
              )}
              {cms?.linkedinUrl && (
                <a href={cms.linkedinUrl} target="_blank" rel="noreferrer" title="LinkedIn"
                   style={{ color: '#0A66C2', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <LinkedinIcon size={15} />
                </a>
              )}
              {cms?.youtubeUrl && (
                <a href={cms.youtubeUrl} target="_blank" rel="noreferrer" title="YouTube"
                   style={{ color: '#FF0000', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <YoutubeIcon size={15} />
                </a>
              )}
              {cms?.githubUrl && (
                <a href={cms.githubUrl} target="_blank" rel="noreferrer" title="GitHub"
                   style={{ color: 'var(--text-1)', background: 'var(--bg-subtle)', padding: 7, borderRadius: '50%', border: '1px solid var(--border)', display: 'inline-flex' }}>
                  <GithubIcon size={15} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Security & Footer Notice */}
        <div style={{
          marginTop: 18,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
          fontSize: 12,
          color: 'var(--text-muted)',
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={13} style={{ color: 'var(--success)' }} />
            <span>Enterprise Multi-Tenant School Management</span>
          </div>
          {cms?.footerText && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
              {cms.footerText}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
