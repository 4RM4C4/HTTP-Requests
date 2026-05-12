import { useEffect, useState } from 'react'
import * as adminService from '../../services/adminService'
import type { User } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
  onSelfDelete: () => void
}

type AdminUser = Omit<User, 'token'>

const btnStyle = (color: string): React.CSSProperties => ({
  background: 'none',
  border: `1px solid ${color}`,
  color,
  borderRadius: '4px',
  padding: '4px 8px',
  cursor: 'pointer',
  fontSize: '11px',
})

const inputStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #444',
  color: '#ccc',
  borderRadius: '4px',
  padding: '6px 8px',
  fontSize: '13px',
  width: '100%',
}

export function AdminPanel({ isOpen, onClose, currentUserId, onSelfDelete }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create user form state
  const [newUsername, setNewUsername] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newIsAdmin, setNewIsAdmin] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getUsers()
      setUsers(data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen])

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteUser(id)
      if (id === currentUserId) {
        onSelfDelete()
        return
      }
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError('Failed to delete user')
    }
  }

  const handleMakeAdmin = async (id: string) => {
    try {
      const updated = await adminService.toggleAdmin(id, true)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isAdmin: updated.isAdmin } : u)))
    } catch {
      setError('Failed to promote user')
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUsername.trim() || !newPassword.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      const created = await adminService.createUser(newUsername.trim(), newPassword, newIsAdmin)
      setUsers((prev) => [...prev, created])
      setNewUsername('')
      setNewPassword('')
      setNewIsAdmin(false)
    } catch (err) {
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
      setCreateError(axiosErr.response?.data?.error ?? axiosErr.message ?? 'Failed to create user')
    } finally {
      setCreating(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: '420px',
        backgroundColor: '#111',
        borderLeft: '1px solid #333',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '16px', borderBottom: '1px solid #333' }}>
        <span style={{ color: '#fff', fontWeight: 700, flex: 1 }}>Admin Panel — Users</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}>
          ×
        </button>
      </div>

      {/* Create User Form */}
      <form
        onSubmit={handleCreate}
        style={{ padding: '16px', borderBottom: '1px solid #333', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <span style={{ color: '#aaa', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Create User
        </span>
        <input
          style={inputStyle}
          placeholder="Username"
          value={newUsername}
          onChange={(e) => setNewUsername(e.target.value)}
          autoComplete="off"
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#aaa', fontSize: '13px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={newIsAdmin}
            onChange={(e) => setNewIsAdmin(e.target.checked)}
          />
          Grant admin role
        </label>
        {createError && <p style={{ color: '#f44', fontSize: '12px', margin: 0 }}>{createError}</p>}
        <button
          type="submit"
          disabled={creating || !newUsername.trim() || !newPassword.trim()}
          style={{
            background: creating ? '#333' : '#1a3a1a',
            border: '1px solid #49cc90',
            color: '#49cc90',
            borderRadius: '4px',
            padding: '6px',
            cursor: creating ? 'default' : 'pointer',
            fontSize: '13px',
          }}
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </form>

      {/* User List */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        <span style={{ color: '#aaa', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          All Users
        </span>

        {loading && <p style={{ color: '#888' }}>Loading...</p>}
        {error && <p style={{ color: '#f44' }}>{error}</p>}
        {!loading && users.length === 0 && !error && <p style={{ color: '#666' }}>No users found.</p>}

        <div style={{ marginTop: '8px' }}>
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            const canDelete = isSelf || !user.isAdmin
            const canPromote = !user.isAdmin

            return (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px',
                  borderBottom: '1px solid #222',
                  backgroundColor: isSelf ? '#1a1a00' : 'transparent',
                }}
              >
                <span style={{ flex: 1, color: '#ccc', fontSize: '13px' }}>
                  {user.username}
                  {isSelf && <span style={{ color: '#888', fontSize: '11px', marginLeft: '6px' }}>(you)</span>}
                </span>

                {user.isAdmin && (
                  <span style={{ color: '#ff6b35', fontSize: '10px', fontWeight: 700 }}>ADMIN</span>
                )}

                {canPromote && !isSelf && (
                  <button onClick={() => handleMakeAdmin(user.id)} style={btnStyle('#49cc90')}>
                    Make Admin
                  </button>
                )}

                {canDelete && (
                  <button onClick={() => handleDelete(user.id)} style={btnStyle('#f44')}>
                    Delete
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
