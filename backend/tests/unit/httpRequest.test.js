const { isUrlAllowed, buildUrl, ALLOWED_DOMAINS, ALLOWED_HOSTNAMES } = require('../../controllers/httpRequest')

describe('isUrlAllowed', () => {
  describe('when allowAny is true', () => {
    it('allows any full URL', () => {
      expect(isUrlAllowed('https://evil.com/steal', true)).toBe(true)
    })

    it('allows whitelisted URLs', () => {
      expect(isUrlAllowed('https://jsonplaceholder.typicode.com/posts', true)).toBe(true)
      expect(isUrlAllowed('https://api.github.com/users', true)).toBe(true)
    })

    it('allows relative paths', () => {
      expect(isUrlAllowed('/posts', true)).toBe(true)
    })
  })

  describe('when allowAny is false (demo mode)', () => {
    it('allows all whitelisted domains', () => {
      expect(isUrlAllowed('https://jsonplaceholder.typicode.com/posts', false)).toBe(true)
      expect(isUrlAllowed('https://pokeapi.co/api/v2/pokemon', false)).toBe(true)
      expect(isUrlAllowed('https://httpbin.org/get', false)).toBe(true)
      expect(isUrlAllowed('https://api.github.com/users', false)).toBe(true)
      expect(isUrlAllowed('https://reqres.in/api/users', false)).toBe(true)
      expect(isUrlAllowed('https://dummyjson.com/products', false)).toBe(true)
      expect(isUrlAllowed('https://randomuser.me/api/', false)).toBe(true)
      expect(isUrlAllowed('https://swapi.dev/api/people', false)).toBe(true)
      expect(isUrlAllowed('https://api.open-meteo.com/v1/forecast', false)).toBe(true)
      expect(isUrlAllowed('https://restcountries.com/v3.1/all', false)).toBe(true)
      expect(isUrlAllowed('https://dog.ceo/api/breeds/image/random', false)).toBe(true)
      expect(isUrlAllowed('https://icanhazdadjoke.com/', false)).toBe(true)
    })

    it('allows relative paths', () => {
      expect(isUrlAllowed('/posts', false)).toBe(true)
      expect(isUrlAllowed('posts/1', false)).toBe(true)
    })

    it('blocks unlisted domains', () => {
      expect(isUrlAllowed('http://evil.com/data', false)).toBe(false)
      expect(isUrlAllowed('https://internal.corp.net/secret', false)).toBe(false)
      expect(isUrlAllowed('https://myapi.example.com/users', false)).toBe(false)
    })

    it('blocks subdomains of whitelisted hostnames', () => {
      expect(isUrlAllowed('https://sub.jsonplaceholder.typicode.com/posts', false)).toBe(false)
      expect(isUrlAllowed('https://evil.api.github.com/users', false)).toBe(false)
    })

    it('returns false for malformed URLs', () => {
      expect(isUrlAllowed('https://', false)).toBe(false)
      expect(isUrlAllowed('not a url at all', false)).toBe(true) // treated as relative path
    })
  })

  describe('ALLOWED_DOMAINS and ALLOWED_HOSTNAMES exports', () => {
    it('exports 12 allowed domains', () => {
      expect(ALLOWED_DOMAINS).toHaveLength(12)
    })

    it('each domain entry has hostname, label, and description', () => {
      ALLOWED_DOMAINS.forEach((d) => {
        expect(d).toHaveProperty('hostname')
        expect(d).toHaveProperty('label')
        expect(d).toHaveProperty('description')
      })
    })

    it('ALLOWED_HOSTNAMES matches domain hostnames', () => {
      expect(ALLOWED_HOSTNAMES).toEqual(ALLOWED_DOMAINS.map((d) => d.hostname))
    })
  })
})

describe('buildUrl', () => {
  it('returns full URLs unchanged', () => {
    expect(buildUrl('https://jsonplaceholder.typicode.com/posts')).toBe('https://jsonplaceholder.typicode.com/posts')
    expect(buildUrl('http://example.com')).toBe('http://example.com')
  })

  it('prepends demo base to paths starting with /', () => {
    expect(buildUrl('/posts')).toBe('https://jsonplaceholder.typicode.com/posts')
    expect(buildUrl('/users/1')).toBe('https://jsonplaceholder.typicode.com/users/1')
  })

  it('prepends demo base with slash to paths not starting with /', () => {
    expect(buildUrl('posts')).toBe('https://jsonplaceholder.typicode.com/posts')
    expect(buildUrl('users/1')).toBe('https://jsonplaceholder.typicode.com/users/1')
  })
})
