import type { Collection, HttpRequest } from '../types'
import { storageKey } from '../utils/storage'

const STORAGE_KEY = () => storageKey('collections')

export function getCollections(): Collection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY())
    return raw ? (JSON.parse(raw) as Collection[]) : []
  } catch {
    return []
  }
}

function persist(collections: Collection[]): void {
  localStorage.setItem(STORAGE_KEY(), JSON.stringify(collections))
}

export function createCollection(name: string): Collection {
  const collection: Collection = {
    id: crypto.randomUUID(),
    name,
    requests: [],
    createdAt: new Date().toISOString(),
  }
  persist([...getCollections(), collection])
  return collection
}

export function deleteCollection(id: string): void {
  persist(getCollections().filter((c) => c.id !== id))
}

export function renameCollection(id: string, name: string): void {
  persist(getCollections().map((c) => (c.id === id ? { ...c, name } : c)))
}

export function addRequestToCollection(collectionId: string, request: HttpRequest): void {
  const sanitized: HttpRequest = {
    ...request,
    formData: request.formData.map((f) => ({ ...f, file: undefined })),
  }
  persist(
    getCollections().map((c) =>
      c.id === collectionId ? { ...c, requests: [...c.requests, sanitized] } : c,
    ),
  )
}

export function removeRequestFromCollection(collectionId: string, requestId: string): void {
  persist(
    getCollections().map((c) =>
      c.id === collectionId
        ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
        : c,
    ),
  )
}
