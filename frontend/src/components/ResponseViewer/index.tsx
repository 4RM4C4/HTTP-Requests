import { useState } from 'react'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { useRequestStore } from '../../store/requestStore'

SyntaxHighlighter.registerLanguage('json', json)

type ViewTab = 'body' | 'headers'

function statusColor(status: number | string): string {
  const code = Number(status)
  if (code >= 200 && code < 300) return '#49cc90'
  if (code >= 300 && code < 400) return '#fca130'
  if (code >= 400) return '#f93e3e'
  return '#aaa'
}

function formatSize(bytes: number | string): string {
  const n = Number(bytes)
  if (!n || isNaN(n)) return '—'
  if (n < 1024) return `${n} B`
  return `${(n / 1024).toFixed(1)} KB`
}

function tryPrettyJson(data: unknown): { formatted: string; isJson: boolean } {
  try {
    const formatted = typeof data === 'string' ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2)
    return { formatted, isJson: true }
  } catch {
    return { formatted: String(data), isJson: false }
  }
}

export function ResponseViewer() {
  const [activeView, setActiveView] = useState<ViewTab>('body')
  const tabs = useRequestStore((s) => s.tabs)
  const activeTabId = useRequestStore((s) => s.activeTabId)

  const activeTab = tabs.find((t) => t.id === activeTabId)
  const response = activeTab?.response
  const isLoading = activeTab?.isLoading

  if (isLoading) {
    return (
      <div style={{ padding: '24px', color: '#aaa', textAlign: 'center', backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333' }}>
        Sending request...
      </div>
    )
  }

  if (!response || response.status === '') {
    return (
      <div style={{ padding: '24px', color: '#555', textAlign: 'center', backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333' }}>
        Send a request to see the response.
      </div>
    )
  }

  const { formatted, isJson } = tryPrettyJson(response.data)
  const headers = response.headers as Record<string, string>

  return (
    <div style={{ backgroundColor: '#111', borderRadius: '8px', border: '1px solid #333', overflow: 'hidden', flexShrink: 0 }}>
      {/* Status bar */}
      <div style={{ display: 'flex', gap: '20px', padding: '10px 16px', borderBottom: '1px solid #333', alignItems: 'center', backgroundColor: '#1a1a1a' }}>
        <span style={{ fontWeight: 700, color: statusColor(response.status) }}>
          {response.status} {response.statusText}
        </span>
        <span style={{ color: '#888', fontSize: '12px' }}>
          Time: <span style={{ color: '#fff' }}>{response.time}ms</span>
        </span>
        <span style={{ color: '#888', fontSize: '12px' }}>
          Body: <span style={{ color: '#fff' }}>{formatSize(response.bodysize)}</span>
        </span>
        <span style={{ color: '#888', fontSize: '12px' }}>
          Headers: <span style={{ color: '#fff' }}>{formatSize(response.headersize)}</span>
        </span>
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #333' }}>
        {(['body', 'headers'] as ViewTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveView(tab)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeView === tab ? '2px solid #ff6b35' : '2px solid transparent',
              color: activeView === tab ? '#fff' : '#888',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxHeight: '400px', overflow: 'auto' }}>
        {activeView === 'body' && (
          <SyntaxHighlighter
            language={isJson ? 'json' : 'plaintext'}
            style={atomOneDark}
            customStyle={{ margin: 0, background: 'transparent', fontSize: '13px', padding: '16px' }}
          >
            {formatted}
          </SyntaxHighlighter>
        )}

        {activeView === 'headers' && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', padding: '8px' }}>
            <tbody>
              {Object.entries(headers).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '6px 16px', color: '#61affe', width: '40%', wordBreak: 'break-word' }}>{key}</td>
                  <td style={{ padding: '6px 16px', color: '#ccc', wordBreak: 'break-word' }}>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
