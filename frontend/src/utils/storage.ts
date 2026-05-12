let userPrefix = 'anonymous'

export function setStorageUser(username: string): void {
  userPrefix = username.toLowerCase().replace(/[^a-z0-9_-]/g, '_')
}

export function storageKey(key: string): string {
  return `httptool_${userPrefix}_${key}`
}
