import React, { useState } from 'react'
import { Container, Row, Col, Button, Form, Table, Collapse } from 'react-bootstrap'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import requestsHttpService from '../services/requestsHttp'

function RequestsHttp({ setErrorMessage, setUser }) {
  const [requestData, setRequestData] = useState({
    method: 'GET',
    url: 'https://www.google.com',
    headers: [],
    params: [],
    bodyType: 'none',
    bodyContent: '',
    formData: [],
    xWwwFormUrlencoded: [],
  })
  const [urlValue, setUrlValue] = useState('https://www.google.com')
  const [response, setResponse] = useState(null)
  const [status, setStatus] = useState(null)
  const [statusText, setStatusText] = useState(null)
  const [time, setTime] = useState(null)
  const [size, setSize] = useState(null)
  const [bodySize, setBodySize] = useState(null)
  const [headerSize, setHeaderSize] = useState(null)
  const [responseHeaders, setResponseHeaders] = useState({})
  const [cookies, setCookies] = useState(null)
  const [format, setFormat] = useState('json')
  const [error, setError] = useState(null)
  const [openSections, setOpenSections] = useState({
    section1: false,
    section2: false,
    section3: false,
  })

  const toggleSection = (section) => {
    setOpenSections((prevState) => {
      const newState = {}
      Object.keys(prevState).forEach((key) => {
        if (key === section) {
          newState[key] = !prevState[key]
        } else {
          newState[key] = prevState[key]
        }
      })
      return newState
    })
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === 'bodyType') {
      setRequestData({
        ...requestData,
        [name]: value,
        headers: value === 'form-data' ? [{ key: 'Content-Type', value: 'multipart/form-data; boundary=<calculated when request is sent>' }] : value === 'raw' ? [{ key: 'Content-Type', value: 'application/json' }] : value === 'x-www-form-urlencoded' ? [{ key: 'Content-Type', value: 'application/x-www-form-urlencoded' }] : value === 'graphql' ? [{ key: 'Content-Type', value: 'application/json' }] : [],
      });
    } else if (name === 'url') {
      setUrlValue(value);
    } else if (name === 'rawContentType') {
      const headers = requestData.headers.filter(header => header.key.toLowerCase() !== 'content-type');
      headers.push({ key: 'Content-Type', value });
      setRequestData({
        ...requestData,
        headers,
      });
    } else {
      setRequestData({
        ...requestData,
        [name]: value,
      });
    }
  };

  const handleHeaderChange = (event, index) => {
    const headers = [...requestData.headers]
    headers[index][event.target.name] = event.target.value
    setRequestData({
      ...requestData,
      headers,
    })
  }

  const handleParamChange = (event, index) => {
    const params = [...requestData.params]
    params[index][event.target.name] = event.target.value
    setRequestData({
      ...requestData,
      params,
    })
  }

  const addHeader = () => {
    setRequestData({
      ...requestData,
      headers: [...requestData.headers, { key: '', value: '' }],
    })
  }

  const removeHeader = (index) => {
    const headers = [...requestData.headers]
    headers.splice(index, 1)
    setRequestData({
      ...requestData,
      headers,
    })
  }

  const addParam = () => {
    setRequestData({
      ...requestData,
      params: [...requestData.params, { key: '', value: '' }],
    })
  }

  const removeParam = (index) => {
    const params = [...requestData.params]
    params.splice(index, 1)
    setRequestData({
      ...requestData,
      params,
    })
  }

  const handleFormDataChange = (event, index) => {
    const { name, value, files } = event.target;
    const formData = [...requestData.formData];
    formData[index][name] = files ? files[0] : value;
    setRequestData({
      ...requestData,
      formData,
    });
  };


  const addFormData = () => {
    setRequestData({
      ...requestData,
      formData: [...requestData.formData, { key: '', value: '' }],
    });
  };

  const removeFormData = (index) => {
    const formData = [...requestData.formData];
    formData.splice(index, 1);
    setRequestData({
      ...requestData,
      formData,
    });
  };

  const handlexWwwFormUrlencodedChange = (event, index) => {
    const { name, value, files } = event.target;
    const xWwwFormUrlencoded = [...requestData.xWwwFormUrlencoded];
    xWwwFormUrlencoded[index][name] = files ? files[0] : value;
    setRequestData({
      ...requestData,
      xWwwFormUrlencoded,
    });
  };


  const addxWwwFormUrlencoded = () => {
    setRequestData({
      ...requestData,
      xWwwFormUrlencoded: [...requestData.xWwwFormUrlencoded, { key: '', value: '' }],
    });
  };

  const removexWwwFormUrlencoded = (index) => {
    const xWwwFormUrlencoded = [...requestData.xWwwFormUrlencoded];
    xWwwFormUrlencoded.splice(index, 1);
    setRequestData({
      ...requestData,
      xWwwFormUrlencoded,
    });
  };

  const handleSendRequest = async () => {
    setRequestData({
      ...requestData,
      url: urlValue,
    })
    try {
      const dataToSend = {
        ...requestData,
        url: urlValue,
      }
      const response = await requestsHttpService.post(dataToSend)
      setStatus(response.data.status)
      setStatusText(response.data.statusText)
      setTime(response.data.time)
      setBodySize(response.data.bodysize)
      setHeaderSize(response.data.headersize)
      setSize(response.data.bodysize + response.data.headersize)
      setResponseHeaders(response.data.headers)
      setCookies(response.data.headers['set-cookie'])
      setResponse(response.data)
      setError(null)
    } catch (error) {
      const ErrorMessageObject = {
        message: 'Connection failed to backend server.',
        status: 'nok',
      }
      setErrorMessage(ErrorMessageObject)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
      setError(null)
      setResponse(null)
      setStatus(null)
      setTime(null)
      setSize(null)
      setResponseHeaders({})
      setCookies(null)
    }
  }

  const formatResponse = (response, format) => {
    try {
      switch (format) {
        case 'json':
          return (
            <SyntaxHighlighter language="json" style={atomDark} className="mt-3">
              {JSON.stringify(response.data, null, 2)}
            </SyntaxHighlighter>
          )
        default:
          return (
            <SyntaxHighlighter style={atomDark} className="mt-3" lineProps={{style: {wordBreak: 'break-all', whiteSpace: 'pre-wrap'}}}
            wrapLines={true}>
              {JSON.stringify(response.data)}
            </SyntaxHighlighter>
          )
      }
    } catch (e) {
      return response.data
    }
  }

  return (
    <Container className="text-white border border-white p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '20px', marginBottom: '20px' }}>
      <Row>
        <Col>
          <Form.Group controlId="loginOut" className="mb-3 d-flex justify-content-between align-items-center">
            <Form.Label className="mb-0" style={{ fontSize: '2em' }}> HTTP Requests</Form.Label>
            <Button
              className="d-auto"
              style={{ backgroundColor: 'black', border: 'white', width: 'auto' }}
              onClick={() => {
                setUser(null)
                window.localStorage.removeItem('loggedRequestsHttpUser')
              }}
            >
              Log out
            </Button>
          </Form.Group>
          <Form>
            <Form.Group controlId="requestMethod">
              <Form.Label>Method</Form.Label>
              <Form.Control as="select" name="method" value={requestData.method} onChange={handleInputChange} style={{ backgroundColor: 'black', color: 'white' }}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="OPTIONS">OPTIONS</option>
              </Form.Control>
            </Form.Group>
            <Form.Group controlId="requestUrl" className="mt-3">
              <Form.Label>URL</Form.Label>
              <Form.Control type="text" name="url" value={urlValue} onChange={handleInputChange} style={{ backgroundColor: 'black', color: 'white' }} />
            </Form.Group>
            <Form.Group controlId="requestHeaders" className="mt-3">
              <Form.Label>Headers</Form.Label>
              {requestData.headers.map((header, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    name="key"
                    placeholder="Key"
                    value={header.key}
                    onChange={(e) => handleHeaderChange(e, index)}
                    style={{ backgroundColor: 'black', color: 'white' }}
                    className="me-2"
                  />
                  <Form.Control
                    type="text"
                    name="value"
                    placeholder="Value"
                    value={header.value}
                    onChange={(e) => handleHeaderChange(e, index)}
                    style={{ backgroundColor: 'black', color: 'white' }}
                    className="me-2"
                  />

                  <Button variant="danger" onClick={() => removeHeader(index)}>-</Button>
                </div>
              ))}
              <Button variant="dark" onClick={addHeader}>Add Header</Button>
            </Form.Group>

            <Form.Group controlId="requestParams" className="mt-3">
              <Form.Label>Params</Form.Label>
              {requestData.params.map((param, index) => (
                <div key={index} className="d-flex mb-2">
                  <Form.Control
                    type="text"
                    name="key"
                    placeholder="Key"
                    value={param.key}
                    onChange={(e) => handleParamChange(e, index)}
                    style={{ backgroundColor: 'black', color: 'white' }}
                    className="me-2"
                  />
                  <Form.Control
                    type="text"
                    name="value"
                    placeholder="Value"
                    value={param.value}
                    onChange={(e) => handleParamChange(e, index)}
                    style={{ backgroundColor: 'black', color: 'white' }}
                    className="me-2"
                  />
                  <Button variant="danger" onClick={() => removeParam(index)}>-</Button>
                </div>
              ))}
              <Button variant="dark" onClick={addParam}>Add Param</Button>
            </Form.Group>
            <Form.Group controlId="requestBody" className="mt-3">
              <Form.Label>Body</Form.Label>
              <Form.Control as="select" name="bodyType" value={requestData.bodyType} onChange={handleInputChange} style={{ backgroundColor: 'black', color: 'white' }}>
                <option value="none">None</option>
                <option value="raw">Raw</option>
                {/*<option value="form-data">Form Data</option>
                <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
                <option value="graphql">GraphQL</option>*/}
              </Form.Control>
              {requestData.bodyType === 'raw' && (
                <Form.Group controlId="bodyContent" className="mt-3">
                  <Form.Label>Body Content</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={5}
                    name="bodyContent"
                    value={requestData.bodyContent}
                    onChange={handleInputChange}
                    style={{ backgroundColor: 'black', color: 'white' }}
                  />
                </Form.Group>
              )}
              {requestData.bodyType === 'form-data' && (
                <Form.Group controlId="formData" className="mt-3">
                  <Form.Label>Form Data</Form.Label>
                  <Table striped bordered hover variant="dark">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestData.formData.map((formData, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="text"
                              name="key"
                              value={formData.key}
                              onChange={(e) => handleFormDataChange(e, index)}
                              style={{ backgroundColor: 'black', color: 'white' }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="value"
                              value={formData.value}
                              onChange={(e) => handleFormDataChange(e, index)}
                              style={{ backgroundColor: 'black', color: 'white' }}
                            />
                          </td>
                          <td>
                            <Button variant="danger" onClick={() => removeFormData(index)}>Remove</Button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3">
                          <Button onClick={addFormData}>Add Key/Value</Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Form.Group>
              )}
              {requestData.bodyType === 'x-www-form-urlencoded' && (
                <Form.Group controlId="xWwwFormUrlencoded" className="mt-3">
                  <Form.Label>x-www-form-urlencoded</Form.Label>
                  <Table striped bordered hover variant="dark">
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestData.xWwwFormUrlencoded.map((xWwwFormUrlencoded, index) => (
                        <tr key={index}>
                          <td>
                            <Form.Control
                              type="text"
                              name="key"
                              value={xWwwFormUrlencoded.key}
                              onChange={(e) => handlexWwwFormUrlencodedChange(e, index)}
                              style={{ backgroundColor: 'black', color: 'white' }}
                            />
                          </td>
                          <td>
                            <Form.Control
                              type="text"
                              name="value"
                              value={xWwwFormUrlencoded.value}
                              onChange={(e) => handlexWwwFormUrlencodedChange(e, index)}
                              style={{ backgroundColor: 'black', color: 'white' }}
                            />
                          </td>
                          <td>
                            <Button variant="danger" onClick={() => removexWwwFormUrlencoded(index)}>Remove</Button>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="3">
                          <Button onClick={addxWwwFormUrlencoded}>Add Key/Value</Button>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Form.Group>
              )}
            </Form.Group>
            <Button variant="dark" onClick={handleSendRequest} className="mt-3">Send Request</Button>
          </Form>
        </Col>
      </Row>
      <Row className="mt-4 mb-4 justify-content-center align-items-center">
        <h2 className="mb-0">Response</h2>
      </Row>
      <Row className="mb-0 justify-content-center align-items-center">
        <Col className="justify-content-center align-items-center">
          {status && (
            <h4 className="mb-0">
              Status: <span style={{ color: status === 200 ? 'green' : 'red' }}>{status} ({statusText})</span></h4>
          )}
        </Col>
        <Col>
          {time !== null && (
            <h4 className="mb-0">Time: {time} ms</h4>
          )}
        </Col>
        <Col>
          <Row className="justify-content-center align-items-center">
            {size !== null && (
              <>
                <Col>
                  <h6 className="mb-0">Total Size: {size} Bytes</h6>
                  <Collapse in={openSections.section1}>
                    <div id="section1-collapse-text">
                      <p className="mt-1 mb-1">
                        Body: {bodySize} Bytes
                      </p>
                      <p className="mt-1 mb-1">
                        Header: {headerSize} Bytes
                      </p>
                    </div>
                  </Collapse>
                </Col>
                <Col>
                  <Button
                    className="justify-content-center align-items-center"
                    style={{ backgroundColor: 'transparent', border: 'none', width: 'auto' }}
                    onClick={() => toggleSection('section1')}
                    aria-controls="section1-collapse-text"
                    aria-expanded={openSections.section1}
                  >
                    {openSections.section1 ? '-' : '+'}
                  </Button>
                </Col>
              </>
            )}
          </Row>
        </Col>
      </Row>
      <Col>
        {response && (
          <div>
            <Row className="d-auto align-items-center">
              <Col xs="auto justify-content-center align-items-center">
                <h4 className="mb-0 justify-content-center align-items-center">Headers:</h4>
              </Col>
              <Button
                style={{ backgroundColor: 'transparent', border: 'none', width: 'auto' }}
                onClick={() => toggleSection('section2')}
                aria-controls="section2-collapse-text"
                aria-expanded={openSections.section2}
              >
                {openSections.section2 ? '-' : '+'}
              </Button>
            </Row>
            <Collapse in={openSections.section2}>
              <div id="section2-collapse-text">
                <Table responsive striped bordered hover variant="dark" size="sm">
                  <thead>
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(responseHeaders).map(([key, value], index) => (
                      <tr key={index}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Collapse>
          </div>
        )}
        {cookies && (
          <div>
            <Row className="d-auto align-items-center">
              <Col xs="auto justify-content-center align-items-center">
                <h4 className="mb-0 justify-content-center align-items-center">Cookies:</h4>
              </Col>
              <Button
                style={{ backgroundColor: 'transparent', border: 'none', width: 'auto' }}
                onClick={() => toggleSection('section3')}
                aria-controls="section3-collapse-text"
                aria-expanded={openSections.section3}
              >
                {openSections.section3 ? '-' : '+'}
              </Button>
            </Row>
            <Collapse in={openSections.section3}>
              <div id="section3-collapse-text">
                <p>{cookies}</p>
              </div>
            </Collapse>
          </div>
        )}
        {response && (
          <Form.Group controlId="responseFormat" className="mt-3">
            <Form.Label>Response Format</Form.Label>
            <Form.Control as="select" value={format} onChange={(e) => setFormat(e.target.value)} style={{ backgroundColor: 'black', color: 'white' }}>
              <option value="raw">Raw</option>
              <option value="json">JSON</option>
            </Form.Control>
          </Form.Group>
        )}
        {response && (
          <div>{formatResponse(response, format)}</div>
        )}
        {error && (
          <p>Error: {error}</p>
        )}
      </Col>
    </Container>
  )
}

export default RequestsHttp
