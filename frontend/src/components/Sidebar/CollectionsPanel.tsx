import { useState } from 'react'
import { useRequestStore } from '../../store/requestStore'
import * as collectionService from '../../services/collectionService'
import type { Collection } from '../../types'

export function CollectionsPanel() {
  const collections = useRequestStore((s) => s.collections)
  const activeTabId = useRequestStore((s) => s.activeTabId)
  const refreshCollections = useRequestStore((s) => s.refreshCollections)
  const saveToCollection = useRequestStore((s) => s.saveToCollection)
  const loadFromCollection = useRequestStore((s) => s.loadFromCollection)
  const [newName, setNewName] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const createCollection = () => {
    const name = newName.trim()
    if (!name) return
    collectionService.createCollection(name)
    setNewName('')
    refreshCollections()
  }

  const deleteCollection = (id: string) => {
    collectionService.deleteCollection(id)
    refreshCollections()
  }

  return (
    <div>
      {/* Create new */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createCollection()}
          placeholder="New collection name"
          style={{ flex: 1, backgroundColor: '#1e1e1e', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '4px 8px', fontSize: '11px' }}
        />
        <button
          onClick={createCollection}
          style={{ background: '#333', border: '1px solid #555', color: '#fff', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer' }}
        >
          +
        </button>
      </div>

      {collections.length === 0 && (
        <p style={{ color: '#666', fontSize: '12px' }}>No collections yet.</p>
      )}

      {collections.map((col: Collection) => (
        <div key={col.id} style={{ marginBottom: '6px', border: '1px solid #333', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 8px', backgroundColor: '#1a1a1a', cursor: 'pointer' }}
            onClick={() => setExpanded(expanded === col.id ? null : col.id)}
          >
            <span style={{ color: '#888', fontSize: '10px' }}>{expanded === col.id ? '▼' : '▶'}</span>
            <span style={{ flex: 1, color: '#ccc', fontSize: '12px', fontWeight: 600 }}>{col.name}</span>
            <span style={{ color: '#666', fontSize: '10px' }}>{col.requests.length}</span>
            <button
              onClick={(e) => { e.stopPropagation(); saveToCollection(col.id, activeTabId) }}
              title="Save current request"
              style={{ background: 'none', border: '1px solid #555', color: '#aaa', cursor: 'pointer', fontSize: '10px', borderRadius: '3px', padding: '2px 6px' }}
            >
              Save
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); deleteCollection(col.id) }}
              style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: '12px' }}
              title="Delete collection"
            >
              ×
            </button>
          </div>
          {expanded === col.id && (
            <div style={{ padding: '4px 0' }}>
              {col.requests.length === 0 && (
                <p style={{ color: '#666', fontSize: '11px', padding: '4px 12px' }}>Empty collection.</p>
              )}
              {col.requests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => loadFromCollection(req)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 12px', cursor: 'pointer', borderBottom: '1px solid #222' }}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#61affe', minWidth: '40px' }}>{req.method}</span>
                  <span style={{ fontSize: '11px', color: '#ccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.url}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
