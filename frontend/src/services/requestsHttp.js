import axios from 'axios'
import { HTTPREQUESTLOGIN, HTTPREQUEST } from '../utils/config'

let token = null

const setToken = (newToken) => {
  token = `Bearer ${newToken}`
}

const post = (dataToSend) => {
  const config = {
    headers: { Authorization: token },
  }

  const request = axios.post(
    HTTPREQUEST,
    dataToSend,
    config,
  )
  return request.then((response) => response)
}

const loginPost = (credentials) => {
  const request = axios.post(
    HTTPREQUESTLOGIN,
    credentials,
  )
  return request.then((response) => response.data)
}

export default { post, loginPost, setToken }
