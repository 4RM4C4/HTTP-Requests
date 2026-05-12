import type { HttpMethod } from '../../types'

const METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

const METHOD_COLORS: Record<HttpMethod, string> = {
  GET: '#61affe',
  POST: '#49cc90',
  PUT: '#fca130',
  PATCH: '#50e3c2',
  DELETE: '#f93e3e',
  HEAD: '#9012fe',
  OPTIONS: '#0d5aa7',
}

interface Props {
  value: HttpMethod
  onChange: (method: HttpMethod) => void
}

export function MethodSelector({ value, onChange }: Props) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      style={{
        backgroundColor: '#1e1e1e',
        color: METHOD_COLORS[value],
        border: '1px solid #444',
        borderRadius: '4px',
        padding: '6px 10px',
        fontWeight: 700,
        fontSize: '13px',
        minWidth: '100px',
        cursor: 'pointer',
      }}
    >
      {METHODS.map((m) => (
        <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>
          {m}
        </option>
      ))}
    </select>
  )
}
