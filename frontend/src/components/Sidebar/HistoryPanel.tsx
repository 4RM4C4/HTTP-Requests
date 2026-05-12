import { useRequestStore } from '../../store/requestStore'
import * as historyService from '../../services/historyService'
import type { HistoryEntry } from '../../types'

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString()
  } catch {
    return iso
  }
}

const METHOD_COLORS: Record<string, string> = {
  GET: '#61affe', POST: '#49cc90', PUT: '#fca130',
  PATCH: '#50e3c2', DELETE: '#f93e3e', HEAD: '#9012fe', OPTIONS: '#0d5aa7',
}

export function HistoryPanel() {
  const history = useRequestStore((s) => s.history)
  const refreshHistory = useRequestStore((s) => s.refreshHistory)
  const loadFromHistory = useRequestStore((s) => s.loadFromHistory)

  const handleDelete = (id: string) => {
    historyService.deleteEntry(id)
    refreshHistory()
  }

  const handleClear = () => {
    historyService.clearHistory()
    refreshHistory()
  }

  if (history.length === 0) {
    return <p style={{ color: '#666', fontSize: '12px', padding: '8px 0' }}>No requests yet.</p>
  }

  return (
    <div>
      <button
        onClick={handleClear}
        style={{ background: 'none', border: '1px solid #444', color: '#f44', borderRadius: '4px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer', marginBottom: '8px' }}
      >
        Clear All
      </button>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {history.map((entry: HistoryEntry) => (
          <div
            key={entry.id}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 0', borderBottom: '1px solid #222', cursor: 'pointer' }}
            onClick={() => loadFromHistory(entry)}
            title="Open in new tab"
          >
            <span style={{ color: METHOD_COLORS[entry.request.method] ?? '#aaa', fontSize: '10px', fontWeight: 700, minWidth: '40px' }}>
              {entry.request.method}
            </span>
            <span style={{ color: '#ccc', fontSize: '11px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {entry.request.url}
            </span>
            <span style={{ color: '#666', fontSize: '10px' }}>{formatTime(entry.executedAt)}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(entry.id) }}
              style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}
              title="Delete"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
