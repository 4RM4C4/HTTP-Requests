import { describe, it, expect } from 'vitest'
import { generateCurlCommand } from '../../utils/curlExporter'
import type { HttpRequest } from '../../types'

const baseRequest = (overrides: Partial<HttpRequest> = {}): HttpRequest => ({
  id: 'test-id',
  method: 'GET',
  url: 'https://example.com/api',
  headers: [],
  params: [],
  bodyType: 'none',
  bodyContent: '',
  formData: [],
  xWwwFormUrlencoded: [],
  ...overrides,
})

describe('generateCurlCommand', () => {
  it('generates a basic GET with no body', () => {
    const result = generateCurlCommand(baseRequest(), 'https://example.com/api')
    expect(result).toContain("curl -X GET 'https://example.com/api'")
    expect(result).toContain('--compressed')
    expect(result).not.toContain('-d')
  })

  it('generates POST with JSON body', () => {
    const request = baseRequest({
      method: 'POST',
      bodyType: 'json',
      bodyContent: '{"name":"Alice"}',
    })
    const result = generateCurlCommand(request, 'https://example.com/api')
    expect(result).toContain('-X POST')
    expect(result).toContain("-H 'Content-Type: application/json'")
    expect(result).toContain("-d '{\"name\":\"Alice\"}'")
  })

  it('does not duplicate Content-Type when already set in headers', () => {
    const request = baseRequest({
      method: 'POST',
      headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
      bodyType: 'json',
      bodyContent: '{}',
    })
    const result = generateCurlCommand(request, 'https://example.com')
    const matches = (result.match(/Content-Type/g) ?? []).length
    expect(matches).toBe(1)
  })

  it('includes enabled headers and skips disabled ones', () => {
    const request = baseRequest({
      headers: [
        { key: 'Authorization', value: 'Bearer token123', enabled: true },
        { key: 'X-Debug', value: 'true', enabled: false },
      ],
    })
    const result = generateCurlCommand(request, 'https://example.com')
    expect(result).toContain("-H 'Authorization: Bearer token123'")
    expect(result).not.toContain('X-Debug')
  })

  it('escapes single quotes in values', () => {
    const request = baseRequest({
      headers: [{ key: "O'Header", value: "it's a value", enabled: true }],
    })
    const result = generateCurlCommand(request, 'https://example.com')
    expect(result).toContain("O'\\''Header")
    expect(result).toContain("it'\\''s a value")
  })

  it('generates form-data with --form flags', () => {
    const request = baseRequest({
      method: 'POST',
      bodyType: 'form-data',
      formData: [
        { key: 'username', value: 'alice', enabled: true },
        { key: 'hidden', value: 'nope', enabled: false },
      ],
    })
    const result = generateCurlCommand(request, 'https://example.com/upload')
    expect(result).toContain("--form 'username=alice'")
    expect(result).not.toContain('hidden')
  })

  it('generates x-www-form-urlencoded with --data-urlencode flags', () => {
    const request = baseRequest({
      method: 'POST',
      bodyType: 'x-www-form-urlencoded',
      xWwwFormUrlencoded: [{ key: 'grant_type', value: 'password', enabled: true }],
    })
    const result = generateCurlCommand(request, 'https://example.com/token')
    expect(result).toContain("--data-urlencode 'grant_type=password'")
  })

  it('uses the resolvedUrl, not request.url', () => {
    const request = baseRequest({ url: '{{baseUrl}}/users' })
    const result = generateCurlCommand(request, 'https://api.example.com/users')
    expect(result).toContain('https://api.example.com/users')
    expect(result).not.toContain('{{baseUrl}}')
  })
})
