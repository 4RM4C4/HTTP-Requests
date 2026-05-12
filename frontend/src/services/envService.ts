import type { Environment, EnvVariable } from '../types'
import { storageKey } from '../utils/storage'

const ENVS_KEY = () => storageKey('environments')
const ACTIVE_KEY = () => storageKey('active_env')
const DEFAULT_ENV = 'Default'

export function getEnvironments(): Environment[] {
  try {
    const raw = localStorage.getItem(ENVS_KEY())
    const envs: Environment[] = raw ? JSON.parse(raw) : []
    if (envs.length === 0) {
      const defaultEnv: Environment = { name: DEFAULT_ENV, variables: [] }
      persist([defaultEnv])
      return [defaultEnv]
    }
    return envs
  } catch {
    return [{ name: DEFAULT_ENV, variables: [] }]
  }
}

function persist(envs: Environment[]): void {
  localStorage.setItem(ENVS_KEY(), JSON.stringify(envs))
}

export function createEnvironment(name: string): Environment {
  const env: Environment = { name, variables: [] }
  persist([...getEnvironments(), env])
  return env
}

export function deleteEnvironment(name: string): void {
  persist(getEnvironments().filter((e) => e.name !== name))
  if (getActiveEnvironment() === name) {
    setActiveEnvironment(DEFAULT_ENV)
  }
}

export function getActiveEnvironment(): string {
  return localStorage.getItem(ACTIVE_KEY()) ?? DEFAULT_ENV
}

export function setActiveEnvironment(name: string): void {
  localStorage.setItem(ACTIVE_KEY(), name)
}

export function getActiveVariables(): EnvVariable[] {
  const active = getActiveEnvironment()
  return getEnvironments().find((e) => e.name === active)?.variables ?? []
}

export function setVariable(envName: string, key: string, value: string): void {
  persist(
    getEnvironments().map((e) => {
      if (e.name !== envName) return e
      const existing = e.variables.find((v) => v.key === key)
      if (existing) {
        return { ...e, variables: e.variables.map((v) => (v.key === key ? { ...v, value } : v)) }
      }
      return { ...e, variables: [...e.variables, { key, value, enabled: true }] }
    }),
  )
}

export function deleteVariable(envName: string, key: string): void {
  persist(
    getEnvironments().map((e) =>
      e.name === envName ? { ...e, variables: e.variables.filter((v) => v.key !== key) } : e,
    ),
  )
}

export function toggleVariable(envName: string, key: string): void {
  persist(
    getEnvironments().map((e) =>
      e.name === envName
        ? {
            ...e,
            variables: e.variables.map((v) => (v.key === key ? { ...v, enabled: !v.enabled } : v)),
          }
        : e,
    ),
  )
}

// Replaces {{key}} with value from enabled variables. Unknown keys are left as-is.
export function resolveVariables(text: string, vars: EnvVariable[]): string {
  return text.replace(/\{\{([^{}]+)\}\}/g, (match, key: string) => {
    const variable = vars.find((v) => v.enabled && v.key === key.trim())
    return variable !== undefined ? variable.value : match
  })
}
