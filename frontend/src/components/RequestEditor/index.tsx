import { useState } from 'react'
import { useRequestStore } from '../../store/requestStore'
import { TabBar } from './TabBar'
import { MethodSelector } from './MethodSelector'
import { UrlBar } from './UrlBar'
import { HeadersEditor } from './HeadersEditor'
import { BodyEditor } from './BodyEditor'
import type { HttpMethod } from '../../types'

const sectionStyle: React.CSSProperties = {
  borderBottom: '1px solid #333',
  marginBottom: '0',
}

const sectionHeaderStyle: React.CSSProperties = {
  padding: '8px 16px',
  cursor: 'pointer',
  fontSize: '12px',
  color: '#aaa',
  userSelect: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
}

const sectionBodyStyle: React.CSSProperties = {
  padding: '12px 16px',
}

interface CollapsibleProps {
  label: string
  children: React.ReactNode
}

function Collapsible({ label, children }: CollapsibleProps) {
  const [open, setOpen] = useState(false)
  return (
    <div style={sectionStyle}>
      <div style={sectionHeaderStyle} onClick={() => setOpen(!open)}>
        <span style={{ fontSize: '10px' }}>{open ? '▼' : '▶'}</span>
        {label}
      </div>
      {open && <div style={sectionBodyStyle}>{children}</div>}
    </div>
  )
}

interface Props {
  isAdmin: boolean
}

export function RequestEditor({ isAdmin }: Props) {
  const tabs = useRequestStore((s) => s.tabs)
  const activeTabId = useRequestStore((s) => s.activeTabId)
  const updateRequest = useRequestStore((s) => s.updateRequest)
  const executeRequest = useRequestStore((s) => s.executeRequest)

  const activeTab = tabs.find((t) => t.id === activeTabId)

  if (!activeTab) return null

  const { request, isLoading } = activeTab

  const update = (partial: Parameters<typeof updateRequest>[1]) => {
    updateRequest(activeTabId, partial)
  }

  return (
    <div style={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #333', flexShrink: 0 }}>
      <TabBar />

      {/* URL Bar */}
      <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', borderBottom: '1px solid #333', alignItems: 'center' }}>
        <MethodSelector
          value={request.method}
          onChange={(method: HttpMethod) => update({ method })}
        />
        <UrlBar
          key={activeTabId}
          url={request.url}
          isAdmin={isAdmin}
          onChange={(url) => update({ url })}
          onSend={() => executeRequest(activeTabId)}
        />
        <button
          onClick={() => executeRequest(activeTabId)}
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#444' : '#ff6b35',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 20px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            minWidth: '80px',
          }}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>

      {/* Sections */}
      <Collapsible label={`Headers (${request.headers.filter((h) => h.enabled && h.key).length})`}>
        <HeadersEditor
          headers={request.headers}
          onChange={(headers) => update({ headers })}
        />
      </Collapsible>

      <Collapsible label={`Params (${request.params.filter((p) => p.enabled && p.key).length})`}>
        <HeadersEditor
          headers={request.params}
          onChange={(params) => update({ params })}
          label="Key"
        />
      </Collapsible>

      <Collapsible label="Body">
        <BodyEditor
          bodyType={request.bodyType}
          bodyContent={request.bodyContent}
          formData={request.formData}
          xWwwFormUrlencoded={request.xWwwFormUrlencoded}
          onChange={update}
        />
      </Collapsible>

      {activeTab.error && (
        <div style={{ padding: '12px 16px', color: '#f44', fontSize: '13px', backgroundColor: '#1a0000', borderTop: '1px solid #333' }}>
          {activeTab.error}
        </div>
      )}
    </div>
  )
}
