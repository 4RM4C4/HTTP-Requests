import React, { useState, useEffect } from 'react'
import { Container, Col, Button, Form } from 'react-bootstrap'
import { MainApp } from './MainApp'
import requestsHttpService from '../services/requestsHttp'

function LoginRequestsHttp({ setErrorMessage }) {
  const [username, setUsername] = useState('guest')
  const [password, setPassword] = useState('guest')
  const [user, setUser] = useState(null)

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const loggedUser = await requestsHttpService.loginPost({ username, password })
      window.localStorage.setItem('loggedRequestsHttpUser', JSON.stringify(loggedUser))
      requestsHttpService.setToken(loggedUser.token)
      setUser(loggedUser)
      setUsername('')
      setPassword('')
    } catch {
      setErrorMessage({ message: 'Wrong Username or Password.', status: 'nok' })
      setTimeout(() => setErrorMessage(null), 5000)
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
      <Container
        className="text-white border border-white p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '20px', marginBottom: '20px', textAlign: 'center' }}
      >
        <Col className="d-inline-block">
          <Form.Group controlId="loginOut" className="mb-3">
            <Form.Label className="mb-0" style={{ fontSize: '2em' }}>Log in to application</Form.Label>
          </Form.Group>
          <Form.Group controlId="username" className="mt-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="Username"
              autoComplete="username"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
              style={{ backgroundColor: 'black', color: 'white' }}
            />
          </Form.Group>
          <Form.Group controlId="password" className="mt-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="Password"
              autoComplete="current-password"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin(e)}
              style={{ backgroundColor: 'black', color: 'white' }}
            />
          </Form.Group>
          <Button variant="dark" onClick={handleLogin} className="mt-3">Login</Button>
        </Col>
      </Container>
    )
  }

  return <MainApp user={user} onLogout={handleLogout} />
}

export default LoginRequestsHttp
