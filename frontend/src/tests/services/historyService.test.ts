import { describe, it, expect, beforeEach } from 'vitest'
import { saveEntry, getHistory, deleteEntry, clearHistory } from '../../services/historyService'
import type { HttpRequest, HttpResponse } from '../../types'

const makeRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  id: crypto.randomUUID(),
  method: 'GET',
  url: 'https://jsonplaceholder.typicode.com/posts/1',
  headers: [],
  params: [],
  bodyType: 'none',
  bodyContent: '',
  formData: [],
  xWwwFormUrlencoded: [],
  ...overrides,
})

const makeResponse = (overrides: Partial<HttpResponse> = {}): HttpResponse => ({
  status: 200,
  statusText: 'OK',
  data: { id: 1, title: 'Test' },
  headers: { 'content-type': 'application/json' },
  time: 120,
  bodysize: 42,
  headersize: 80,
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
})

describe('saveEntry', () => {
  it('saves an entry and returns it with an id', () => {
    const entry = saveEntry(makeRequest(), makeResponse())
    expect(entry.id).toBeTruthy()
    expect(entry.executedAt).toBeTruthy()
    expect(entry.request.method).toBe('GET')
  })

  it('prepends new entries (newest first)', () => {
    saveEntry(makeRequest({ url: 'first' }), makeResponse())
    saveEntry(makeRequest({ url: 'second' }), makeResponse())
    const history = getHistory()
    expect(history[0].request.url).toBe('second')
    expect(history[1].request.url).toBe('first')
  })

  it('caps entries at 100', () => {
    for (let i = 0; i < 105; i++) {
      saveEntry(makeRequest({ url: `url-${i}` }), makeResponse())
    }
    expect(getHistory()).toHaveLength(100)
  })

  it('truncates large response bodies', () => {
    const bigBody = 'x'.repeat(60 * 1024)
    const entry = saveEntry(makeRequest(), makeResponse({ data: bigBody }))
    expect(typeof entry.response.data).toBe('string')
    expect((entry.response.data as string).startsWith('[Response truncated')).toBe(true)
  })
})

describe('deleteEntry', () => {
  it('removes the entry with the given id', () => {
    const entry = saveEntry(makeRequest(), makeResponse())
    deleteEntry(entry.id)
    expect(getHistory()).toHaveLength(0)
  })

  it('does not remove other entries', () => {
    saveEntry(makeRequest({ url: 'a' }), makeResponse())
    const target = saveEntry(makeRequest({ url: 'b' }), makeResponse())
    deleteEntry(target.id)
    const history = getHistory()
    expect(history).toHaveLength(1)
    expect(history[0].request.url).toBe('a')
  })
})

describe('clearHistory', () => {
  it('removes all entries', () => {
    saveEntry(makeRequest(), makeResponse())
    saveEntry(makeRequest(), makeResponse())
    clearHistory()
    expect(getHistory()).toHaveLength(0)
  })
})

describe('getHistory', () => {
  it('returns empty array when nothing is stored', () => {
    expect(getHistory()).toEqual([])
  })
})
