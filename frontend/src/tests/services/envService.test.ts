import { describe, it, expect, beforeEach } from 'vitest'
import {
  getEnvironments,
  createEnvironment,
  deleteEnvironment,
  getActiveEnvironment,
  setActiveEnvironment,
  getActiveVariables,
  setVariable,
  deleteVariable,
  toggleVariable,
  resolveVariables,
} from '../../services/envService'
import type { EnvVariable } from '../../types'

beforeEach(() => {
  localStorage.clear()
})

describe('resolveVariables', () => {
  const vars: EnvVariable[] = [
    { key: 'baseUrl', value: 'https://api.example.com', enabled: true },
    { key: 'token', value: 'abc123', enabled: true },
    { key: 'disabled', value: 'secret', enabled: false },
  ]

  it('replaces known variables', () => {
    expect(resolveVariables('{{baseUrl}}/users', vars)).toBe('https://api.example.com/users')
  })

  it('replaces multiple variables', () => {
    expect(resolveVariables('{{baseUrl}}/auth?token={{token}}', vars)).toBe(
      'https://api.example.com/auth?token=abc123',
    )
  })

  it('leaves unknown variables unchanged', () => {
    expect(resolveVariables('{{unknown}}/path', vars)).toBe('{{unknown}}/path')
  })

  it('does not resolve disabled variables', () => {
    expect(resolveVariables('value={{disabled}}', vars)).toBe('value={{disabled}}')
  })

  it('handles text with no variables', () => {
    expect(resolveVariables('https://example.com/api', vars)).toBe('https://example.com/api')
  })

  it('handles empty string', () => {
    expect(resolveVariables('', vars)).toBe('')
  })

  it('does not cause infinite loops with nested braces', () => {
    expect(resolveVariables('{{{baseUrl}}}', vars)).toBe('{https://api.example.com}')
  })

  it('trims whitespace inside braces', () => {
    expect(resolveVariables('{{ baseUrl }}', vars)).toBe('https://api.example.com')
  })
})

describe('environment management', () => {
  it('creates a Default environment when none exist', () => {
    const envs = getEnvironments()
    expect(envs).toHaveLength(1)
    expect(envs[0].name).toBe('Default')
  })

  it('creates a new environment', () => {
    createEnvironment('Production')
    expect(getEnvironments()).toHaveLength(2)
  })

  it('deletes an environment', () => {
    createEnvironment('Staging')
    const col = getEnvironments().find((e) => e.name === 'Staging')!
    deleteEnvironment(col.name)
    expect(getEnvironments().find((e) => e.name === 'Staging')).toBeUndefined()
  })
})

describe('active environment', () => {
  it('defaults to Default', () => {
    expect(getActiveEnvironment()).toBe('Default')
  })

  it('changes the active environment', () => {
    createEnvironment('Dev')
    setActiveEnvironment('Dev')
    expect(getActiveEnvironment()).toBe('Dev')
  })
})

describe('variables', () => {
  it('sets and retrieves a variable', () => {
    getEnvironments() // ensure Default exists
    setVariable('Default', 'apiKey', '12345')
    const vars = getActiveVariables()
    expect(vars.find((v) => v.key === 'apiKey')?.value).toBe('12345')
  })

  it('updates an existing variable', () => {
    getEnvironments()
    setVariable('Default', 'apiKey', 'first')
    setVariable('Default', 'apiKey', 'updated')
    const vars = getActiveVariables()
    expect(vars.filter((v) => v.key === 'apiKey')).toHaveLength(1)
    expect(vars.find((v) => v.key === 'apiKey')?.value).toBe('updated')
  })

  it('deletes a variable', () => {
    getEnvironments()
    setVariable('Default', 'temp', 'value')
    deleteVariable('Default', 'temp')
    expect(getActiveVariables().find((v) => v.key === 'temp')).toBeUndefined()
  })

  it('toggles a variable', () => {
    getEnvironments()
    setVariable('Default', 'toggle', 'val')
    toggleVariable('Default', 'toggle')
    expect(getActiveVariables().find((v) => v.key === 'toggle')?.enabled).toBe(false)
    toggleVariable('Default', 'toggle')
    expect(getActiveVariables().find((v) => v.key === 'toggle')?.enabled).toBe(true)
  })
})
