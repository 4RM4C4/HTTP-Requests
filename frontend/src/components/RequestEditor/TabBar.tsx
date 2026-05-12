import { useRequestStore } from '../../store/requestStore'

export function TabBar() {
  const tabs = useRequestStore((s) => s.tabs)
  const activeTabId = useRequestStore((s) => s.activeTabId)
  const addTab = useRequestStore((s) => s.addTab)
  const closeTab = useRequestStore((s) => s.closeTab)
  const setActiveTab = useRequestStore((s) => s.setActiveTab)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #333',
        backgroundColor: '#1a1a1a',
        overflowX: 'auto',
        minHeight: '36px',
      }}
    >
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            fontSize: '12px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            borderRight: '1px solid #333',
            borderBottom: tab.id === activeTabId ? '2px solid #ff6b35' : '2px solid transparent',
            backgroundColor: tab.id === activeTabId ? '#252525' : 'transparent',
            color: tab.id === activeTabId ? '#fff' : '#aaa',
            maxWidth: '180px',
          }}
        >
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '130px',
            }}
            title={tab.label}
          >
            {tab.label}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '0 2px',
              fontSize: '14px',
              lineHeight: 1,
              flexShrink: 0,
            }}
            title="Close tab"
          >
            ×
          </button>
        </div>
      ))}
      <button
        onClick={addTab}
        style={{
          background: 'none',
          border: 'none',
          color: '#888',
          cursor: 'pointer',
          padding: '6px 12px',
          fontSize: '18px',
          lineHeight: 1,
          flexShrink: 0,
        }}
        title="New tab"
      >
        +
      </button>
    </div>
  )
}
