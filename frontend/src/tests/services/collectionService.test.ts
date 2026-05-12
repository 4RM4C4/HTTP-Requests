import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCollections,
  createCollection,
  deleteCollection,
  renameCollection,
  addRequestToCollection,
  removeRequestFromCollection,
} from '../../services/collectionService'
import type { HttpRequest } from '../../types'

const makeRequest = (url = '/posts'): HttpRequest => ({
  id: crypto.randomUUID(),
  method: 'GET',
  url,
  headers: [],
  params: [],
  bodyType: 'none',
  bodyContent: '',
  formData: [],
  xWwwFormUrlencoded: [],
})

beforeEach(() => {
  localStorage.clear()
})

describe('createCollection', () => {
  it('creates a collection with a unique id', () => {
    const c1 = createCollection('Alpha')
    const c2 = createCollection('Beta')
    expect(c1.id).not.toBe(c2.id)
    expect(getCollections()).toHaveLength(2)
  })

  it('persists across calls', () => {
    createCollection('Test')
    expect(getCollections()[0].name).toBe('Test')
  })
})

describe('deleteCollection', () => {
  it('removes the collection by id', () => {
    const col = createCollection('To delete')
    deleteCollection(col.id)
    expect(getCollections()).toHaveLength(0)
  })
})

describe('renameCollection', () => {
  it('updates the name', () => {
    const col = createCollection('Old name')
    renameCollection(col.id, 'New name')
    expect(getCollections()[0].name).toBe('New name')
  })
})

describe('addRequestToCollection', () => {
  it('appends request to collection', () => {
    const col = createCollection('My collection')
    addRequestToCollection(col.id, makeRequest('/users'))
    expect(getCollections()[0].requests).toHaveLength(1)
    expect(getCollections()[0].requests[0].url).toBe('/users')
  })
})

describe('removeRequestFromCollection', () => {
  it('removes request by id', () => {
    const col = createCollection('My collection')
    const req = makeRequest('/posts')
    addRequestToCollection(col.id, req)
    removeRequestFromCollection(col.id, req.id)
    expect(getCollections()[0].requests).toHaveLength(0)
  })

  it('does not remove other requests', () => {
    const col = createCollection('My collection')
    const r1 = makeRequest('/posts')
    const r2 = makeRequest('/users')
    addRequestToCollection(col.id, r1)
    addRequestToCollection(col.id, r2)
    removeRequestFromCollection(col.id, r1.id)
    expect(getCollections()[0].requests).toHaveLength(1)
    expect(getCollections()[0].requests[0].url).toBe('/users')
  })
})
