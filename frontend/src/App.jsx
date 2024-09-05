import React, { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import LoginRequestsHttp from './components/LoginRequestsHttp'
import Notification from './components/Notification'
import './app.css'

function App() {
  const [errorMessage, setErrorMessage] = useState(null)

  const handleCloseNotification = () => {
    setErrorMessage(null)
  }
   return (
    <Container fluid className="d-flex flex-column min-vh-100">
      <Notification
        errorMessage={errorMessage}
        onClose={handleCloseNotification}
      />
      <Row className="flex-grow-1 justify-content-center align-items-center">
        <Col>
        <LoginRequestsHttp setErrorMessage={setErrorMessage} />
        </Col>
      </Row>
    </Container>
  )
}

export default App
