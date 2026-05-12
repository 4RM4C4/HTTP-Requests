import { useState } from 'react'

interface Domain {
  label: string
  hostname: string
  baseUrl: string
}

const DOMAINS: Domain[] = [
  { label: 'JSONPlaceholder', hostname: 'jsonplaceholder.typicode.com', baseUrl: 'https://jsonplaceholder.typicode.com' },
  { label: 'PokéAPI',        hostname: 'pokeapi.co',                   baseUrl: 'https://pokeapi.co' },
  { label: 'HTTPBin',        hostname: 'httpbin.org',                  baseUrl: 'https://httpbin.org' },
  { label: 'GitHub API',     hostname: 'api.github.com',               baseUrl: 'https://api.github.com' },
  { label: 'ReqRes',         hostname: 'reqres.in',                    baseUrl: 'https://reqres.in' },
  { label: 'DummyJSON',      hostname: 'dummyjson.com',                baseUrl: 'https://dummyjson.com' },
  { label: 'Random User',    hostname: 'randomuser.me',                baseUrl: 'https://randomuser.me' },
  { label: 'SWAPI',          hostname: 'swapi.dev',                    baseUrl: 'https://swapi.dev' },
  { label: 'Open-Meteo',     hostname: 'api.open-meteo.com',           baseUrl: 'https://api.open-meteo.com' },
  { label: 'REST Countries', hostname: 'restcountries.com',            baseUrl: 'https://restcountries.com' },
  { label: 'Dog API',        hostname: 'dog.ceo',                      baseUrl: 'https://dog.ceo' },
  { label: 'Dad Jokes',      hostname: 'icanhazdadjoke.com',           baseUrl: 'https://icanhazdadjoke.com' },
]

const PATH_PLACEHOLDERS: Record<string, string> = {
  'jsonplaceholder.typicode.com': 'posts, users/1, comments?postId=1',
  'pokeapi.co':                   'api/v2/pokemon/pikachu',
  'httpbin.org':                  'get, post, headers, delay/2',
  'api.github.com':               'users/octocat, repos/torvalds/linux',
  'reqres.in':                    'api/users, api/users/2',
  'dummyjson.com':                'products, users/1, posts',
  'randomuser.me':                'api/',
  'swapi.dev':                    'api/people/1/',
  'api.open-meteo.com':           'v1/forecast?latitude=52.52&longitude=13.41&current_weather=true',
  'restcountries.com':            'v3.1/all, v3.1/name/germany',
  'dog.ceo':                      'api/breeds/image/random',
  'icanhazdadjoke.com':           '(dejar vacío para un chiste aleatorio)',
}

const CUSTOM = '__custom__'

interface Props {
  url: string
  isAdmin: boolean
  onChange: (url: string) => void
  onSend: () => void
}

export function UrlBar({ url, isAdmin, onChange, onSend }: Props) {
  // forceCustom: admin explicitly chose "Custom URL" even if url matches a domain
  const [forceCustom, setForceCustom] = useState(false)

  const matchedDomain = DOMAINS.find((d) => url.startsWith(d.baseUrl))
  const isCustomMode = forceCustom || (!matchedDomain && url.startsWith('http'))

  const activeDomain = matchedDomain ?? DOMAINS[0]
  const path = matchedDomain ? url.slice(matchedDomain.baseUrl.length).replace(/^\//, '') : ''

  const handleBaseChange = (value: string) => {
    if (value === CUSTOM) {
      setForceCustom(true)
    } else {
      setForceCustom(false)
      const currentPath = matchedDomain ? url.slice(matchedDomain.baseUrl.length).replace(/^\//, '') : ''
      onChange(value + (currentPath ? '/' + currentPath : ''))
    }
  }

  const handlePathChange = (value: string) => {
    onChange(activeDomain.baseUrl + (value ? '/' + value : ''))
  }

  const selectStyle: React.CSSProperties = {
    backgroundColor: '#1e1e1e',
    color: '#e0e0e0',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '8px 6px',
    fontSize: '12px',
    cursor: 'pointer',
    flexShrink: 0,
    maxWidth: '150px',
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '4px',
    padding: '8px 12px',
    fontSize: '13px',
    minWidth: 0,
  }

  return (
    <div style={{ display: 'flex', flex: 1, gap: '6px', alignItems: 'center', minWidth: 0 }}>
      <select
        value={isCustomMode ? CUSTOM : activeDomain.baseUrl}
        onChange={(e) => handleBaseChange(e.target.value)}
        style={selectStyle}
      >
        {DOMAINS.map((d) => (
          <option key={d.hostname} value={d.baseUrl}>
            {d.label}
          </option>
        ))}
        {isAdmin && <option value={CUSTOM}>— Custom URL</option>}
      </select>

      {isCustomMode ? (
        <input
          value={url}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSend()}
          placeholder="https://api.example.com/endpoint o {{baseUrl}}/users"
          style={inputStyle}
        />
      ) : (
        <>
          <span style={{ color: '#555', fontSize: '14px', flexShrink: 0, userSelect: 'none' }}>/</span>
          <input
            value={path}
            onChange={(e) => handlePathChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder={PATH_PLACEHOLDERS[activeDomain.hostname] ?? 'endpoint'}
            style={inputStyle}
          />
        </>
      )}
    </div>
  )
}
