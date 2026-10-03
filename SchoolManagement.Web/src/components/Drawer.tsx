import React, { useEffect } from 'react'
import { X } from 'lucide-react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  icon?: React.ReactNode
  children: React.ReactNode
  footer?: React.ReactNode
  wide?: boolean
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  wide = false,
}: DrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="drawer-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`drawer ${wide ? 'drawer-wide' : ''}`} role="dialog" aria-modal="true">
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            {icon && <div className="drawer-icon-box">{icon}</div>}
            <div>
              <h2 className="drawer-title">{title}</h2>
              {subtitle && <p className="drawer-subtitle">{subtitle}</p>}
            </div>
          </div>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close drawer" title="Close (Esc)">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="drawer-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
