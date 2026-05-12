import { useRef } from 'react'
import type { FormField } from '../../types'

interface Props {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
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

const selectStyle: React.CSSProperties = {
  backgroundColor: '#1e1e1e',
  color: '#e0e0e0',
  border: '1px solid #444',
  borderRadius: '4px',
  padding: '4px 6px',
  fontSize: '12px',
  cursor: 'pointer',
}

export function FormDataEditor({ fields, onChange }: Props) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const update = (id: string, patch: Partial<FormField>) =>
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const remove = (id: string) => onChange(fields.filter((f) => f.id !== id))

  const add = () =>
    onChange([...fields, { id: crypto.randomUUID(), key: '', type: 'text', value: '', enabled: true }])

  const handleTypeChange = (field: FormField, type: 'text' | 'file') => {
    update(field.id, { type, value: '', file: undefined })
    if (fileRefs.current[field.id]) fileRefs.current[field.id]!.value = ''
  }

  const handleFileChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    update(id, { file, value: file?.name ?? '' })
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <thead>
          <tr style={{ color: '#888' }}>
            <th style={{ ...cellStyle, width: '30px' }} />
            <th style={cellStyle}>Key</th>
            <th style={{ ...cellStyle, width: '76px' }}>Type</th>
            <th style={cellStyle}>Value</th>
            <th style={{ ...cellStyle, width: '30px' }} />
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field.id}>
              <td style={cellStyle}>
                <input
                  type="checkbox"
                  checked={field.enabled}
                  onChange={(e) => update(field.id, { enabled: e.target.checked })}
                />
              </td>
              <td style={cellStyle}>
                <input
                  style={inputStyle}
                  placeholder="Key"
                  value={field.key}
                  onChange={(e) => update(field.id, { key: e.target.value })}
                />
              </td>
              <td style={cellStyle}>
                <select
                  value={field.type}
                  onChange={(e) => handleTypeChange(field, e.target.value as 'text' | 'file')}
                  style={selectStyle}
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </select>
              </td>
              <td style={cellStyle}>
                {field.type === 'file' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input
                      ref={(el) => { fileRefs.current[field.id] = el }}
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => handleFileChange(field.id, e)}
                    />
                    <span
                      style={{
                        backgroundColor: '#2a2a2a',
                        border: '1px solid #555',
                        borderRadius: '4px',
                        padding: '3px 10px',
                        fontSize: '11px',
                        color: '#aaa',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      Choose File
                    </span>
                    <span
                      style={{
                        color: field.value ? '#ccc' : '#555',
                        fontSize: '11px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {field.value || 'No file selected'}
                    </span>
                  </label>
                ) : (
                  <input
                    style={inputStyle}
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) => update(field.id, { value: e.target.value })}
                  />
                )}
              </td>
              <td style={cellStyle}>
                <button
                  onClick={() => remove(field.id)}
                  style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: '14px' }}
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
        + Add Field
      </button>
    </div>
  )
}
