import type { RequestHeader } from '../../types'

interface Props {
  headers: RequestHeader[]
  onChange: (headers: RequestHeader[]) => void
  label?: string
}

const inputStyle: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  color: '#fff',
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '4px 8px',
  fontSize: '12px',
  width: '100%',
}

const cellStyle: React.CSSProperties = { padding: '4px' }

export function HeadersEditor({ headers, onChange, label = 'Key' }: Props) {
  const update = (index: number, field: keyof RequestHeader, value: string | boolean) => {
    onChange(headers.map((h, i) => (i === index ? { ...h, [field]: value } : h)))
  }

  const add = () => {
    onChange([...headers, { key: '', value: '', enabled: true }])
  }

  const remove = (index: number) => {
    onChange(headers.filter((_, i) => i !== index))
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ color: '#888' }}>
            <th style={{ ...cellStyle, width: '30px' }}></th>
            <th style={cellStyle}>{label}</th>
            <th style={cellStyle}>Value</th>
            <th style={{ ...cellStyle, width: '30px' }}></th>
          </tr>
        </thead>
        <tbody>
          {headers.map((header, i) => (
            <tr key={i}>
              <td style={cellStyle}>
                <input
                  type="checkbox"
                  checked={header.enabled}
                  onChange={(e) => update(i, 'enabled', e.target.checked)}
                />
              </td>
              <td style={cellStyle}>
                <input
                  style={inputStyle}
                  placeholder={label}
                  value={header.key}
                  onChange={(e) => update(i, 'key', e.target.value)}
                />
              </td>
              <td style={cellStyle}>
                <input
                  style={inputStyle}
                  placeholder="Value"
                  value={header.value}
                  onChange={(e) => update(i, 'value', e.target.value)}
                />
              </td>
              <td style={cellStyle}>
                <button
                  onClick={() => remove(i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#f44',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={add}
        style={{
          marginTop: '8px',
          backgroundColor: 'transparent',
          border: '1px dashed #555',
          color: '#aaa',
          borderRadius: '4px',
          padding: '4px 12px',
          fontSize: '12px',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        + Add {label}
      </button>
    </div>
  )
}
