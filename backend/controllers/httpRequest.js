const httpRequestRouter = require('express').Router()
const axios = require('axios')
const multer = require('multer')
const FormData = require('form-data')
const middleware = require('../utils/middleware')

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

const DEMO_BASE = 'https://jsonplaceholder.typicode.com'

// Public APIs allowed for non-admin users
const ALLOWED_DOMAINS = [
  { hostname: 'jsonplaceholder.typicode.com', label: 'JSONPlaceholder', description: 'Fake REST API for testing' },
  { hostname: 'pokeapi.co',                   label: 'PokéAPI',         description: 'Pokémon data' },
  { hostname: 'httpbin.org',                  label: 'HTTPBin',         description: 'HTTP request & response testing' },
  { hostname: 'api.github.com',               label: 'GitHub API',      description: 'GitHub public data' },
  { hostname: 'reqres.in',                    label: 'ReqRes',          description: 'Hosted REST API for testing' },
  { hostname: 'dummyjson.com',                label: 'DummyJSON',       description: 'Fake JSON data with auth, cart, products' },
  { hostname: 'randomuser.me',                label: 'Random User',     description: 'Random user data generator' },
  { hostname: 'swapi.dev',                    label: 'SWAPI',           description: 'Star Wars API' },
  { hostname: 'api.open-meteo.com',           label: 'Open-Meteo',      description: 'Free weather API (no key needed)' },
  { hostname: 'restcountries.com',            label: 'REST Countries',   description: 'Countries data' },
  { hostname: 'dog.ceo',                      label: 'Dog API',          description: 'Random dog images' },
  { hostname: 'icanhazdadjoke.com',           label: 'Dad Jokes',        description: 'Random dad jokes' },
]

const ALLOWED_HOSTNAMES = ALLOWED_DOMAINS.map((d) => d.hostname)

function convertArrayToObject(array) {
  return array.reduce((obj, item) => {
    if (item.key && item.key.trim() !== '') {
      obj[item.key] = item.value
    }
    return obj
  }, {})
}

// Pure function — independently testable
function isUrlAllowed(url, allowAny) {
  if (allowAny) return true
  if (!url.startsWith('http://') && !url.startsWith('https://')) return true
  try {
    const { hostname } = new URL(url)
    return ALLOWED_HOSTNAMES.includes(hostname)
  } catch {
    return false
  }
}

function buildUrl(url) {
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return DEMO_BASE + (url.startsWith('/') ? '' : '/') + url
}

// GET /api/requests/allowed-domains — public, no auth needed
httpRequestRouter.get('/allowed-domains', (_req, res) => {
  res.json({ allowedDomains: ALLOWED_DOMAINS })
})

httpRequestRouter.post(
  '/',
  upload.any(),
  middleware.tokenExtractor,
  middleware.userExtractor,
  async (req, res) => {
    const isMultipart = !!req.is('multipart/form-data')

    // Parse incoming request metadata
    let method, url, headers, params, bodyType, bodyContent
    if (isMultipart) {
      method = req.body.__method
      url = req.body.__url
      headers = JSON.parse(req.body.__headers || '[]')
      params = JSON.parse(req.body.__params || '[]')
      bodyType = 'form-data'
    } else {
      ;({ method, url, headers, params, bodyType, bodyContent } = req.body)
    }

    const allowAny = req.user && req.user.isAdmin === true
    if (!isUrlAllowed(url, allowAny)) {
      return res.status(403).json({
        error: 'URL not allowed. Use one of the allowed domains or log in as admin.',
        allowedDomains: ALLOWED_DOMAINS,
      })
    }

    const resolvedUrl = buildUrl(url)

    // Build outgoing request body
    let outgoingData
    let outgoingHeaders = convertArrayToObject(headers)

    if (isMultipart) {
      // Files present — forward as multipart/form-data
      const fd = new FormData()
      Object.entries(req.body).forEach(([key, value]) => {
        if (!key.startsWith('__')) fd.append(key, String(value))
      })
      ;(req.files ?? []).forEach((file) => {
        fd.append(file.fieldname, file.buffer, {
          filename: file.originalname,
          contentType: file.mimetype,
          knownLength: file.buffer.length,
        })
      })
      outgoingData = fd
      outgoingHeaders = { ...outgoingHeaders, ...fd.getHeaders() }

    } else if (bodyType === 'form-data') {
      // Text-only form-data sent as JSON — build FormData to forward
      const fd = new FormData()
      const fields = Array.isArray(req.body.formData) ? req.body.formData : []
      fields.filter((f) => f.enabled && f.key).forEach((f) => fd.append(f.key, f.value || ''))
      outgoingData = fd
      outgoingHeaders = { ...outgoingHeaders, ...fd.getHeaders() }

    } else if (bodyType === 'x-www-form-urlencoded') {
      const fields = Array.isArray(req.body.xWwwFormUrlencoded) ? req.body.xWwwFormUrlencoded : []
      const searchParams = new URLSearchParams()
      fields.filter((f) => f.enabled && f.key).forEach((f) => searchParams.append(f.key, f.value || ''))
      outgoingData = searchParams.toString()
      outgoingHeaders = { ...outgoingHeaders, 'Content-Type': 'application/x-www-form-urlencoded' }

    } else if (bodyType === 'json' && bodyContent) {
      try {
        outgoingData = JSON.parse(bodyContent)
      } catch {
        outgoingData = bodyContent
      }
    } else {
      outgoingData = bodyContent || undefined
    }

    const axiosConfig = {
      method,
      url: resolvedUrl,
      headers: outgoingHeaders,
      params: convertArrayToObject(params),
      data: outgoingData,
    }

    const startTime = performance.now()
    try {
      const response = await axios(axiosConfig)
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      const bodySize = new TextEncoder().encode(JSON.stringify(response.data)).length
      const headerSize = new TextEncoder().encode(JSON.stringify(response.headers)).length

      res.json({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
        time: responseTime,
        bodysize: bodySize,
        headersize: headerSize,
      })
    } catch (error) {
      const endTime = performance.now()
      const responseTime = Math.round(endTime - startTime)
      const responseData = {
        status: '',
        statusText: '',
        data: '',
        headers: '',
        time: responseTime,
        bodysize: '',
        headersize: '',
      }
      if (error.response) {
        if (error.response.data) {
          responseData.bodysize = new TextEncoder().encode(JSON.stringify(error.response.data)).length
          responseData.data = error.response.data
        }
        if (error.response.headers) {
          responseData.headers = error.response.headers
          responseData.headersize = new TextEncoder().encode(JSON.stringify(error.response.headers)).length
        }
        if (error.response.status) responseData.status = error.response.status
        if (error.response.statusText) responseData.statusText = error.response.statusText
      }
      res.json(responseData)
    }
  },
)

module.exports = { httpRequestRouter, isUrlAllowed, buildUrl, ALLOWED_DOMAINS, ALLOWED_HOSTNAMES }
