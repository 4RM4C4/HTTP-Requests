import React, { useState, useEffect } from 'react'
import { Container, Col, Button, Form } from 'react-bootstrap'
import RequestsHttp from './RequestsHttp'
import requestsHttpService from '../services/requestsHttp'


function LoginRequestsHttp({ setErrorMessage }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState(null)

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      const user = await requestsHttpService.loginPost({
        username, password,
      })
      window.localStorage.setItem('loggedRequestsHttpUser', JSON.stringify(user))
      requestsHttpService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch (exception) {
      const ErrorMessageObject = {
        message: 'Wrong Username or Password.',
        status: 'nok',
      }
      setErrorMessage(ErrorMessageObject)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    }
  }

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem('loggedRequestsHttpUser')
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      requestsHttpService.setToken(user.token)
    }
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin(event)
    }
  }

  if (user === null) {
    return (
      <Container className="text-white border border-white p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '20px', marginBottom: '20px', textAlign: 'center' }}>
        <Col className="d-inline-block">
        <Form.Group controlId="loginOut" className="mb-3">
          <Form.Label className="mb-0" style={{ fontSize: '2em' }}>Log in to application</Form.Label>
        </Form.Group>
        <Form.Group controlId="username" className="mt-3">
          <Form.Label>Username</Form.Label>
          <Form.Control type="text" name="Username" autoComplete="username" value={username} onChange={({ target }) => setUsername(target.value)} style={{ backgroundColor: 'black', color: 'white' }} />
        </Form.Group>
        <Form.Group controlId="username" className="mt-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" name="Password" autoComplete="current-password" value={password}
            onChange={({ target }) => setPassword(target.value)}
            onKeyDown={handleKeyDown}
            style={{ backgroundColor: 'black', color: 'white' }} />
        </Form.Group>
        <Button variant="dark" onClick={handleLogin} className="mt-3">Login</Button>
        </Col>
      </Container>
    )
  }

  return <RequestsHttp setErrorMessage={setErrorMessage} setUser={setUser} />
}

export default LoginRequestsHttp
