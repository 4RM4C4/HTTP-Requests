import { useState } from 'react'
import { useRequestStore } from '../../store/requestStore'
import type { User } from '../../types'

interface Props {
  user: User | null
  onLogout: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
  onOpenAdmin?: () => void
}

export function Header({ user, onLogout, onToggleSidebar, sidebarOpen, onOpenAdmin }: Props) {
  const [copied, setCopied] = useState(false)
  const activeTabId = useRequestStore((s) => s.activeTabId)
  const exportCurl = useRequestStore((s) => s.exportCurl)

  const handleCopyCurl = async () => {
    const curl = exportCurl(activeTabId)
    if (!curl) return
    try {
      await navigator.clipboard.writeText(curl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API may not be available in non-secure contexts
    }
  }

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        backgroundColor: '#0d0d0d',
        borderBottom: '1px solid #333',
        flexShrink: 0,
      }}
    >
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        style={{
          background: sidebarOpen ? '#333' : 'none',
          border: '1px solid #444',
          color: '#aaa',
          borderRadius: '4px',
          padding: '6px 10px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        ☰
      </button>

      {/* Logo */}
      <span style={{ color: '#ff6b35', fontWeight: 700, fontSize: '16px', letterSpacing: '1px' }}>
        HTTP Client
      </span>

      <div style={{ flex: 1 }} />

      {/* cURL export */}
      <button
        onClick={handleCopyCurl}
        title="Copy request as cURL command"
        style={{
          background: copied ? '#49cc90' : 'none',
          border: '1px solid #444',
          color: copied ? '#000' : '#aaa',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: 'pointer',
          fontSize: '12px',
          transition: 'all 0.2s',
        }}
      >
        {copied ? '✓ Copied!' : 'Copy as cURL'}
      </button>

      {/* Admin panel */}
      {user?.isAdmin && onOpenAdmin && (
        <button
          onClick={onOpenAdmin}
          style={{
            background: 'none',
            border: '1px solid #444',
            color: '#aaa',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Admin
        </button>
      )}

      {/* User info & logout */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#888', fontSize: '12px' }}>{user.username}</span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid #444',
              color: '#f44',
              borderRadius: '4px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
