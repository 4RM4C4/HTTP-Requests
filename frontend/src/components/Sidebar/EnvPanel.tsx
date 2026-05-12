import { useState } from 'react'
import { useRequestStore } from '../../store/requestStore'
import * as envService from '../../services/envService'

export function EnvPanel() {
  const environments = useRequestStore((s) => s.environments)
  const activeEnvironment = useRequestStore((s) => s.activeEnvironment)
  const setActiveEnvironment = useRequestStore((s) => s.setActiveEnvironment)
  const refreshEnvironments = useRequestStore((s) => s.refreshEnvironments)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [newEnvName, setNewEnvName] = useState('')

  const activeEnv = environments.find((e) => e.name === activeEnvironment)
  const vars = activeEnv?.variables ?? []

  const addVariable = () => {
    if (!newKey.trim()) return
    envService.setVariable(activeEnvironment, newKey.trim(), newValue)
    setNewKey('')
    setNewValue('')
    refreshEnvironments()
  }

  const removeVariable = (key: string) => {
    envService.deleteVariable(activeEnvironment, key)
    refreshEnvironments()
  }

  const toggleVariable = (key: string) => {
    envService.toggleVariable(activeEnvironment, key)
    refreshEnvironments()
  }

  const createEnv = () => {
    if (!newEnvName.trim()) return
    envService.createEnvironment(newEnvName.trim())
    setNewEnvName('')
    refreshEnvironments()
  }

  const inputStyle: React.CSSProperties = {
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '4px 6px',
    fontSize: '11px',
  }

  return (
    <div>
      {/* Environment selector */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', alignItems: 'center' }}>
        <select
          value={activeEnvironment}
          onChange={(e) => setActiveEnvironment(e.target.value)}
          style={{ ...inputStyle, flex: 1 }}
        >
          {environments.map((e) => (
            <option key={e.name} value={e.name}>{e.name}</option>
          ))}
        </select>
        <input
          value={newEnvName}
          onChange={(e) => setNewEnvName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createEnv()}
          placeholder="New env"
          style={{ ...inputStyle, width: '80px' }}
        />
        <button onClick={createEnv} style={{ ...inputStyle, cursor: 'pointer', background: '#333' }}>+</button>
      </div>

      {/* Variables table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '8px' }}>
        <thead>
          <tr style={{ color: '#666' }}>
            <th style={{ width: '20px' }}></th>
            <th style={{ textAlign: 'left', padding: '2px 4px' }}>Key</th>
            <th style={{ textAlign: 'left', padding: '2px 4px' }}>Value</th>
            <th style={{ width: '20px' }}></th>
          </tr>
        </thead>
        <tbody>
          {vars.map((v) => (
            <tr key={v.key} style={{ borderBottom: '1px solid #222' }}>
              <td>
                <input type="checkbox" checked={v.enabled} onChange={() => toggleVariable(v.key)} />
              </td>
              <td style={{ padding: '4px', color: v.enabled ? '#61affe' : '#555' }}>{v.key}</td>
              <td style={{ padding: '4px', color: v.enabled ? '#ccc' : '#555', wordBreak: 'break-all' }}>{v.value}</td>
              <td>
                <button onClick={() => removeVariable(v.key)} style={{ background: 'none', border: 'none', color: '#f44', cursor: 'pointer', fontSize: '12px' }}>×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add variable */}
      <div style={{ display: 'flex', gap: '4px' }}>
        <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="Key" style={{ ...inputStyle, flex: 1 }} />
        <input value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addVariable()} placeholder="Value" style={{ ...inputStyle, flex: 1 }} />
        <button onClick={addVariable} style={{ ...inputStyle, cursor: 'pointer', background: '#333' }}>Add</button>
      </div>
    </div>
  )
}
