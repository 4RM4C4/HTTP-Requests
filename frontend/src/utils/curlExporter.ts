import type { HttpRequest } from '../types'

function escapeShellArg(value: string): string {
  return value.replace(/'/g, `'\\''`)
}

// Generates a readable multi-line curl command from a request.
// resolvedUrl must already have {{variables}} replaced by the caller.
export function generateCurlCommand(request: HttpRequest, resolvedUrl: string): string {
  const { method, headers, bodyType, bodyContent, formData, xWwwFormUrlencoded } = request
  const lines: string[] = [`curl -X ${method} '${escapeShellArg(resolvedUrl)}'`]

  const enabledHeaders = headers.filter((h) => h.enabled && h.key.trim() !== '')

  // Avoid duplicating Content-Type if it's already set by the user
  const hasContentType = enabledHeaders.some(
    (h) => h.key.toLowerCase() === 'content-type',
  )

  for (const header of enabledHeaders) {
    lines.push(`  -H '${escapeShellArg(header.key)}: ${escapeShellArg(header.value)}'`)
  }

  if (bodyType === 'json' && bodyContent) {
    if (!hasContentType) {
      lines.push(`  -H 'Content-Type: application/json'`)
    }
    lines.push(`  -d '${escapeShellArg(bodyContent)}'`)
  } else if (bodyType === 'raw' && bodyContent) {
    lines.push(`  -d '${escapeShellArg(bodyContent)}'`)
  } else if (bodyType === 'form-data') {
    for (const field of formData.filter((f) => f.enabled && f.key.trim() !== '')) {
      lines.push(`  --form '${escapeShellArg(field.key)}=${escapeShellArg(field.value)}'`)
    }
  } else if (bodyType === 'x-www-form-urlencoded') {
    for (const field of xWwwFormUrlencoded.filter((f) => f.enabled && f.key.trim() !== '')) {
      lines.push(`  --data-urlencode '${escapeShellArg(field.key)}=${escapeShellArg(field.value)}'`)
    }
  }

  lines.push(`  --compressed`)

  return lines.join(' \\\n')
}
