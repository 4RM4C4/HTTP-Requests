// Requires DATABASE_TEST_URL env var pointing to a test MariaDB instance
// Run with: npm run test:integration
const supertest = require('supertest')
const jwt = require('jsonwebtoken')
const app = require('../../app')
const { connectAndSync, closeConnection, createTestUser } = require('../setup')
const config = require('../../utils/config')

const api = supertest(app)
let authToken

beforeAll(async () => {
  await connectAndSync()
  const user = await createTestUser({ username: 'reqtestuser', password: 'testpass' })
  authToken = jwt.sign({ username: user.username, id: user.id }, config.SECRET)
})

afterAll(async () => {
  await closeConnection()
})

describe('POST /api/requests', () => {
  const validPayload = {
    method: 'GET',
    url: '/posts/1',
    headers: [],
    params: [],
    bodyType: 'none',
    bodyContent: '',
  }

  it('rejects requests without auth token', async () => {
    await api
      .post('/api/requests')
      .send(validPayload)
      .expect(401)
  })

  it('proxies allowed URL and returns response data', async () => {
    const response = await api
      .post('/api/requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload)
      .expect(200)

    expect(response.body).toHaveProperty('status', 200)
    expect(response.body).toHaveProperty('data')
    expect(response.body).toHaveProperty('time')
    expect(response.body).toHaveProperty('bodysize')
    expect(typeof response.body.data).toBe('object')
  })

  it('accepts full jsonplaceholder URL', async () => {
    const response = await api
      .post('/api/requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...validPayload, url: 'https://jsonplaceholder.typicode.com/posts/1' })
      .expect(200)

    expect(response.body.status).toBe(200)
  })

  it('blocks non-jsonplaceholder URL in demo mode (ALLOW_ANY_URL=false)', async () => {
    // This test only validates demo mode behavior.
    // Skip if ALLOW_ANY_URL is set to true.
    if (config.ALLOW_ANY_URL) {
      return
    }

    await api
      .post('/api/requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ ...validPayload, url: 'https://api.github.com/users' })
      .expect(403)
  })

  it('returns response time as a number', async () => {
    const response = await api
      .post('/api/requests')
      .set('Authorization', `Bearer ${authToken}`)
      .send(validPayload)
      .expect(200)

    expect(typeof response.body.time).toBe('number')
    expect(response.body.time).toBeGreaterThanOrEqual(0)
  })
})
