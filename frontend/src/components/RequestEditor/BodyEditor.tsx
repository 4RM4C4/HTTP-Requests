import type { HttpRequest, FormField, RequestHeader } from '../../types'
import { HeadersEditor } from './HeadersEditor'
import { FormDataEditor } from './FormDataEditor'

type BodyMode = HttpRequest['bodyType']

interface Props {
  bodyType: BodyMode
  bodyContent: string
  formData: FormField[]
  xWwwFormUrlencoded: RequestHeader[]
  onChange: (partial: Partial<HttpRequest>) => void
}

const MODES: { value: BodyMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'json', label: 'JSON' },
  { value: 'form-data', label: 'form-data' },
  { value: 'x-www-form-urlencoded', label: 'x-www-form-urlencoded' },
  { value: 'raw', label: 'Raw' },
  { value: 'graphql', label: 'GraphQL' },
]

const PLACEHOLDERS: Partial<Record<BodyMode, string>> = {
  json: '{\n  "key": "value"\n}',
  raw: 'Raw body content',
  graphql: 'query {\n  field\n}',
}

const DESCRIPTIONS: Partial<Record<BodyMode, string>> = {
  'form-data': 'Multipart form data — ideal para archivos y campos de formulario',
  'x-www-form-urlencoded': 'Campos codificados en la URL — equivalente a un formulario HTML estándar',
}

export function BodyEditor({ bodyType, bodyContent, formData, xWwwFormUrlencoded, onChange }: Props) {
  return (
    <div style={{ overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onChange({ bodyType: value })}
            style={{
              background: bodyType === value ? '#333' : 'transparent',
              border: `1px solid ${bodyType === value ? '#666' : '#444'}`,
              color: bodyType === value ? '#fff' : '#888',
              borderRadius: '4px',
              padding: '4px 10px',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {DESCRIPTIONS[bodyType] && (
        <p style={{ color: '#666', fontSize: '11px', margin: '0 0 8px 0', fontStyle: 'italic' }}>
          {DESCRIPTIONS[bodyType]}
        </p>
      )}

      {(bodyType === 'json' || bodyType === 'raw' || bodyType === 'graphql') && (
        <textarea
          value={bodyContent}
          onChange={(e) => onChange({ bodyContent: e.target.value })}
          placeholder={PLACEHOLDERS[bodyType]}
          style={{
            display: 'block',
            width: '100%',
            minHeight: '140px',
            backgroundColor: '#1e1e1e',
            color: '#fff',
            border: '1px solid #444',
            borderRadius: '4px',
            padding: '8px',
            fontFamily: 'monospace',
            fontSize: '13px',
            resize: 'vertical',
            boxSizing: 'border-box',
          }}
        />
      )}

      {bodyType === 'form-data' && (
        <FormDataEditor
          fields={formData}
          onChange={(updated) => onChange({ formData: updated })}
        />
      )}

      {bodyType === 'x-www-form-urlencoded' && (
        <HeadersEditor
          headers={xWwwFormUrlencoded}
          onChange={(updated) => onChange({ xWwwFormUrlencoded: updated })}
          label="Field name"
        />
      )}

      {bodyType === 'none' && (
        <p style={{ color: '#666', fontSize: '12px', margin: '8px 0' }}>
          This request has no body.
        </p>
      )}
    </div>
  )
}
