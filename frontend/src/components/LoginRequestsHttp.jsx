import React, { useState, useEffect } from 'react'
import { MainApp } from './MainApp'
import requestsHttpService from '../services/requestsHttp'

const inputStyle = {
  width: '100%',
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: '4px',
  color: '#e0e0e0',
  padding: '8px 12px',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

function LoginRequestsHttp({ setErrorMessage }) {
  const [username, setUsername] = useState('guest')
  const [password, setPassword] = useState('guest')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    try {
      const loggedUser = await requestsHttpService.loginPost({ username, password })
      window.localStorage.setItem('loggedRequestsHttpUser', JSON.stringify(loggedUser))
      requestsHttpService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage({ message: 'Wrong username or password', status: 'nok' })
      setTimeout(() => setErrorMessage(null), 5000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem('loggedRequestsHttpUser')
    requestsHttpService.clearToken()
    setUser(null)
    setUsername('guest')
    setPassword('guest')
  }

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedRequestsHttpUser')
    if (loggedUserJSON) {
      const savedUser = JSON.parse(loggedUserJSON)
      setUser(savedUser)
      requestsHttpService.setToken(savedUser.token)
    }
  }, [])

  if (user === null) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0d0d0d',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
      }}>
        <div style={{ width: '100%', maxWidth: '360px', padding: '0 16px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ color: '#ff6b35', fontWeight: 700, fontSize: '18px', letterSpacing: '0.05em' }}>
              HTTP CLIENT
            </div>
            <div style={{ color: '#444', fontSize: '11px', marginTop: '4px' }}>
              POST /api/login
            </div>
          </div>

          {/* Card */}
          <div style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              background: '#1a1a1a',
              borderBottom: '1px solid #2a2a2a',
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{
                background: '#61afef18', border: '1px solid #61afef33',
                color: '#61afef', borderRadius: '4px',
                padding: '2px 8px', fontSize: '10px', fontWeight: 700,
              }}>POST</span>
              <span style={{ color: '#444', fontSize: '12px' }}>/api/login</span>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#555', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                  username
                </label>
                <input
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={({ target }) => setUsername(target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ color: '#555', fontSize: '11px', display: 'block', marginBottom: '6px' }}>
                  password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={({ target }) => setPassword(target.value)}
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: loading ? '#1a1a1a' : '#ff6b3518',
                  border: '1px solid #ff6b3533',
                  borderRadius: '4px',
                  color: loading ? '#555' : '#ff6b35',
                  padding: '10px',
                  cursor: loading ? 'default' : 'pointer',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                  marginTop: '4px',
                }}
              >
                {loading ? 'Authenticating...' : 'Login →'}
              </button>
            </form>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px', color: '#2a2a2a', fontSize: '11px' }}>
            armaca.com.ar · HTTP Client
          </div>
        </div>
      </div>
    )
  }

  return <MainApp user={user} onLogout={handleLogout} />
}

export default LoginRequestsHttp
