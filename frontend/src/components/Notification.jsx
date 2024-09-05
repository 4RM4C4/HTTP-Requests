import React, { useEffect } from 'react'
import { Toast, ToastContainer } from 'react-bootstrap'

function Notification({ errorMessage, onClose }) {
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [errorMessage, onClose])

  if (!errorMessage) {
    return null
  }

  return (
    <ToastContainer className="position-fixed" position="top-center">
      <Toast className="d-flex flex-column align-items-center text-white border border-white" style={{ backgroundColor: 'rgba(0, 0, 0, 0.9)', width: 'auto' }} show={true} onClose={onClose} delay={5000} autohide>
        <Toast.Header className="justify-content-center" text-white border style={{ background: 'transparent' }} closeButton={false}>
          <strong className={`me-auto text-${errorMessage.status === 'ok' ? 'success' : 'danger'}`}>Alert</strong>
        </Toast.Header>
        <Toast.Body style={{ background: 'transparent', textAlign: 'center', paddingTop: '0' }}>{errorMessage.message}</Toast.Body>
      </Toast>
    </ToastContainer>
  )
}

export default Notification
