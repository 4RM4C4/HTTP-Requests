import { useState } from 'react'
import { HistoryPanel } from './HistoryPanel'
import { CollectionsPanel } from './CollectionsPanel'
import { EnvPanel } from './EnvPanel'

type Section = 'history' | 'collections' | 'env'

const SECTIONS: { id: Section; label: string }[] = [
  { id: 'history', label: 'History' },
  { id: 'collections', label: 'Collections' },
  { id: 'env', label: 'Environments' },
]

interface Props {
  isOpen: boolean
  isAdmin: boolean
}

export function Sidebar({ isOpen }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('history')

  if (!isOpen) return null

  return (
    <div
      style={{
        width: '280px',
        minWidth: '280px',
        backgroundColor: '#111',
        borderRight: '1px solid #333',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Section tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #333', flexShrink: 0 }}>
        {SECTIONS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderBottom: activeSection === id ? '2px solid #ff6b35' : '2px solid transparent',
              color: activeSection === id ? '#fff' : '#888',
              padding: '8px 4px',
              fontSize: '11px',
              cursor: 'pointer',
              fontWeight: activeSection === id ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Section content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 12px' }}>
        {activeSection === 'history' && <HistoryPanel />}
        {activeSection === 'collections' && <CollectionsPanel />}
        {activeSection === 'env' && <EnvPanel />}
      </div>
    </div>
  )
}
