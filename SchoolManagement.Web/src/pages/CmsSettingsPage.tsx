import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cmsApi } from '@/lib/services'
import {
  Globe, Mail, Share2, Save, CheckCircle2,
  ShieldCheck, Server, AlertCircle
} from 'lucide-react'
import {
  FacebookIcon, TwitterIcon, InstagramIcon,
  LinkedinIcon, YoutubeIcon, GithubIcon
} from '@/components/SocialIcons'
import toast from 'react-hot-toast'

interface CmsSettings {
  id: number
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
  smtpHost?: string
  smtpPort: number
  smtpUsername?: string
  smtpPassword?: string
  smtpSenderEmail?: string
  smtpSenderName?: string
  smtpEnableSsl: boolean
  updatedAt?: string
  updatedBy?: string
}

export default function CmsSettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'branding' | 'social' | 'smtp'>('branding')
  const [formData, setFormData] = useState<Partial<CmsSettings>>({})

  const { data: settings, isLoading } = useQuery<CmsSettings>({
    queryKey: ['cmsSettings'],
    queryFn: async () => {
      const res = await cmsApi.getSettings()
      return res.data
    },
  })

  useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: (data: Partial<CmsSettings>) => cmsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cmsSettings'] })
      queryClient.invalidateQueries({ queryKey: ['publicCmsSettings'] })
      toast.success('CMS and Platform settings saved successfully')
    },
    onError: () => {
      toast.error('Failed to save settings. Please verify inputs.')
    }
  })

  const handleChange = (field: keyof CmsSettings, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="loader" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.02em' }}>
            CMS & Platform Settings
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-3)', margin: '4px 0 0 0' }}>
            Manage platform branding, public social channels, and transactional SMTP credentials.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="btn btn-primary"
          style={{ gap: 8 }}
        >
          <Save size={15} />
          {mutation.isPending ? 'Saving changes…' : 'Save Settings'}
        </button>
      </div>

      {/* ── Tabs Navigation ── */}
      <div style={{
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid var(--border)',
        paddingBottom: 2,
      }}>
        <button
          type="button"
          onClick={() => setActiveTab('branding')}
          className={`btn btn-sm ${activeTab === 'branding' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: 8, borderRadius: '6px 6px 0 0' }}
        >
          <Globe size={14} />
          Branding & Contact
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('social')}
          className={`btn btn-sm ${activeTab === 'social' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: 8, borderRadius: '6px 6px 0 0' }}
        >
          <Share2 size={14} />
          Social Channels
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('smtp')}
          className={`btn btn-sm ${activeTab === 'smtp' ? 'btn-primary' : 'btn-ghost'}`}
          style={{ gap: 8, borderRadius: '6px 6px 0 0' }}
        >
          <Server size={14} />
          SMTP Server
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Tab 1: Branding & Contact ── */}
        {activeTab === 'branding' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Globe size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Site Identity & Public Details</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Displays on login screens, navigation headers, and system emails</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Platform Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.siteName || ''}
                  onChange={e => handleChange('siteName', e.target.value)}
                  placeholder="e.g. EduManage"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.siteTagline || ''}
                  onChange={e => handleChange('siteTagline', e.target.value)}
                  placeholder="e.g. Intelligent Multi-Tenant School System"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Support Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.contactEmail || ''}
                  onChange={e => handleChange('contactEmail', e.target.value)}
                  placeholder="support@edumanage.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Support Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.contactPhone || ''}
                  onChange={e => handleChange('contactPhone', e.target.value)}
                  placeholder="+1 (800) 555-0199"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Headquarters / Physical Address</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                  placeholder="100 Innovation Way, Suite 400"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Footer Copyright Notice</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.footerText || ''}
                  onChange={e => handleChange('footerText', e.target.value)}
                  placeholder="© 2026 EduManage Technologies. All rights reserved."
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Social Links ── */}
        {activeTab === 'social' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: 'var(--primary-light)', color: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Social Media Handles</h3>
                  <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Only filled links will be shown dynamically on login and public pages</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FacebookIcon size={14} style={{ color: '#1877F2' }} /> Facebook URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.facebookUrl || ''}
                    onChange={e => handleChange('facebookUrl', e.target.value)}
                    placeholder="https://facebook.com/your-school"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <TwitterIcon size={14} style={{ color: '#1DA1F2' }} /> Twitter / X URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.twitterUrl || ''}
                    onChange={e => handleChange('twitterUrl', e.target.value)}
                    placeholder="https://twitter.com/your-school"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <InstagramIcon size={14} style={{ color: '#E4405F' }} /> Instagram URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.instagramUrl || ''}
                    onChange={e => handleChange('instagramUrl', e.target.value)}
                    placeholder="https://instagram.com/your-school"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <LinkedinIcon size={14} style={{ color: '#0A66C2' }} /> LinkedIn URL
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.linkedinUrl || ''}
                    onChange={e => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/your-school"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <YoutubeIcon size={14} style={{ color: '#FF0000' }} /> YouTube Channel
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.youtubeUrl || ''}
                    onChange={e => handleChange('youtubeUrl', e.target.value)}
                    placeholder="https://youtube.com/@your-school"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <GithubIcon size={14} /> GitHub Profile
                  </label>
                  <input
                    type="url"
                    className="form-control"
                    value={formData.githubUrl || ''}
                    onChange={e => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/your-organization"
                  />
                </div>
              </div>
            </div>

            {/* ── Live Preview Card ── */}
            <div className="card" style={{ background: 'var(--surface-2)', border: '1px dashed var(--border-strong)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
                Live Preview: Public Social Links Widget
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {formData.facebookUrl && (
                  <a href={formData.facebookUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <FacebookIcon size={14} style={{ color: '#1877F2' }} /> Facebook
                  </a>
                )}
                {formData.twitterUrl && (
                  <a href={formData.twitterUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <TwitterIcon size={14} style={{ color: '#1DA1F2' }} /> Twitter
                  </a>
                )}
                {formData.instagramUrl && (
                  <a href={formData.instagramUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <InstagramIcon size={14} style={{ color: '#E4405F' }} /> Instagram
                  </a>
                )}
                {formData.linkedinUrl && (
                  <a href={formData.linkedinUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <LinkedinIcon size={14} style={{ color: '#0A66C2' }} /> LinkedIn
                  </a>
                )}
                {formData.youtubeUrl && (
                  <a href={formData.youtubeUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <YoutubeIcon size={14} style={{ color: '#FF0000' }} /> YouTube
                  </a>
                )}
                {formData.githubUrl && (
                  <a href={formData.githubUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ gap: 6 }}>
                    <GithubIcon size={14} /> GitHub
                  </a>
                )}

                {!formData.facebookUrl && !formData.twitterUrl && !formData.instagramUrl && !formData.linkedinUrl && !formData.youtubeUrl && !formData.githubUrl && (
                  <span style={{ fontSize: 12.5, color: 'var(--text-3)', fontStyle: 'italic' }}>
                    No social channels provided yet. Enter URLs above to show badges.
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: SMTP Server Details ── */}
        {activeTab === 'smtp' && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14, borderBottom: '1px solid var(--border)' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--primary-light)', color: 'var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Server size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', margin: 0 }}>Mail Server / SMTP Configuration</h3>
                <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Used by the platform to send tenant invitation emails, invoices, and password resets</span>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8,
              background: 'var(--bg-subtle)', border: '1px solid var(--border)', fontSize: 12.5, color: 'var(--text-2)'
            }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span>SMTP credentials are encrypted at rest and never shared with tenant administrators or normal users.</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">SMTP Host Server</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.smtpHost || ''}
                  onChange={e => handleChange('smtpHost', e.target.value)}
                  placeholder="smtp.mailgun.org or smtp.sendgrid.net"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input
                  type="number"
                  className="form-control"
                  value={formData.smtpPort || 587}
                  onChange={e => handleChange('smtpPort', parseInt(e.target.value, 10))}
                  placeholder="587"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.smtpUsername || ''}
                  onChange={e => handleChange('smtpUsername', e.target.value)}
                  placeholder="postmaster@yourdomain.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={formData.smtpPassword || ''}
                  onChange={e => handleChange('smtpPassword', e.target.value)}
                  placeholder="••••••••••••••••"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.smtpSenderEmail || ''}
                  onChange={e => handleChange('smtpSenderEmail', e.target.value)}
                  placeholder="no-reply@edumanage.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sender Display Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.smtpSenderName || ''}
                  onChange={e => handleChange('smtpSenderName', e.target.value)}
                  placeholder="EduManage Notifications"
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <input
                  type="checkbox"
                  id="smtpEnableSsl"
                  checked={formData.smtpEnableSsl ?? true}
                  onChange={e => handleChange('smtpEnableSsl', e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="smtpEnableSsl" className="form-label" style={{ margin: 0, cursor: 'pointer' }}>
                  Enable SSL / TLS Encryption (Recommended)
                </label>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
