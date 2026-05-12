import type { HistoryEntry, HttpRequest, HttpResponse } from '../types'
import { storageKey } from '../utils/storage'

const STORAGE_KEY = () => storageKey('history')
const MAX_ENTRIES = 100
const MAX_BODY_BYTES = 50 * 1024 // 50 KB

function truncateBody(body: unknown): unknown {
  const serialized = JSON.stringify(body)
  if (serialized.length > MAX_BODY_BYTES) {
    return `[Response truncated — ${serialized.length} bytes]`
  }
  return body
}

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY())
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : []
  } catch {
    return []
  }
}

function persist(entries: HistoryEntry[]): void {
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(entries))
}

export function saveEntry(request: HttpRequest, response: HttpResponse): HistoryEntry {
  // File objects are not JSON-serializable; strip before persisting
  const sanitizedRequest: HttpRequest = {
    ...request,
    formData: request.formData.map((f) => ({ ...f, file: undefined })),
  }
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    executedAt: new Date().toISOString(),
    request: sanitizedRequest,
    response: { ...response, data: truncateBody(response.data) },
  }
  const entries = [entry, ...getHistory()].slice(0, MAX_ENTRIES)
  persist(entries)
  return entry
}

export function deleteEntry(id: string): void {
  persist(getHistory().filter((e) => e.id !== id))
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY())
}
