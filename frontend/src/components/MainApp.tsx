import { useState, useEffect } from 'react'
import { useRequestStore } from '../store/requestStore'
import { Header } from './Layout/Header'
import { Sidebar } from './Sidebar'
import { RequestEditor } from './RequestEditor'
import { ResponseViewer } from './ResponseViewer'
import { AdminPanel } from './AdminPanel'
import { setAdminToken } from '../services/adminService'
import { setStorageUser } from '../utils/storage'
import type { User } from '../types'

interface Props {
  user: User
  onLogout: () => void
}

export function MainApp({ user, onLogout }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminOpen, setAdminOpen] = useState(false)
  const refreshHistory = useRequestStore((s) => s.refreshHistory)
  const refreshCollections = useRequestStore((s) => s.refreshCollections)
  const refreshEnvironments = useRequestStore((s) => s.refreshEnvironments)
  const resetStore = useRequestStore((s) => s.resetStore)

  useEffect(() => {
    setStorageUser(user.username)
    resetStore()
    refreshHistory()
    refreshCollections()
    refreshEnvironments()
    if (user.isAdmin) {
      setAdminToken(user.token)
    }
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0d0d0d', overflow: 'hidden' }}>
      <Header
        user={user}
        onLogout={onLogout}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        sidebarOpen={sidebarOpen}
        onOpenAdmin={user.isAdmin ? () => setAdminOpen(true) : undefined}
      />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <Sidebar isOpen={sidebarOpen} isAdmin={user.isAdmin} />

        <main
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <RequestEditor isAdmin={user.isAdmin} />
          <ResponseViewer />
        </main>
      </div>

      {user.isAdmin && (
        <AdminPanel
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          currentUserId={user.id}
          onSelfDelete={onLogout}
        />
      )}
    </div>
  )
}
