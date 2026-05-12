import { useEffect, useState } from 'react'
import * as adminService from '../../services/adminService'
import type { User } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  currentUserId: string
}

type AdminUser = Omit<User, 'token'>

export function AdminPanel({ isOpen, onClose, currentUserId }: Props) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch {
      setError('Failed to delete user')
    }
  }

  const handleToggleAdmin = async (id: string, currentIsAdmin: boolean) => {
    try {
      const updated = await adminService.toggleAdmin(id, !currentIsAdmin)
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, isAdmin: updated.isAdmin } : u)))
    } catch {
      setError('Failed to update user')
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
        width: '400px',
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
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '20px' }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
        {loading && <p style={{ color: '#888' }}>Loading...</p>}
        {error && <p style={{ color: '#f44' }}>{error}</p>}

        {!loading && users.length === 0 && !error && (
          <p style={{ color: '#666' }}>No users found.</p>
        )}

        {users.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px',
              borderBottom: '1px solid #222',
              backgroundColor: user.id === currentUserId ? '#1a1a00' : 'transparent',
            }}
          >
            <span style={{ flex: 1, color: '#ccc', fontSize: '13px' }}>
              {user.username}
              {user.id === currentUserId && (
                <span style={{ color: '#888', fontSize: '11px', marginLeft: '6px' }}>(you)</span>
              )}
            </span>

            {user.isAdmin && (
              <span style={{ color: '#ff6b35', fontSize: '10px', fontWeight: 700 }}>ADMIN</span>
            )}

            {user.id !== currentUserId && (
              <>
                <button
                  onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                  style={{
                    background: 'none',
                    border: '1px solid #555',
                    color: user.isAdmin ? '#f44' : '#49cc90',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  {user.isAdmin ? 'Revoke Admin' : 'Make Admin'}
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  style={{
                    background: 'none',
                    border: '1px solid #f44',
                    color: '#f44',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                  }}
                >
                  Delete
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
