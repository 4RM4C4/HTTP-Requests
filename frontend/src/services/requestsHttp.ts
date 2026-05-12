import axios, { AxiosResponse } from 'axios'
import { HTTPREQUESTLOGIN, HTTPREQUEST } from '../utils/config'
import type { HttpRequest, HttpResponse, User } from '../types'

let token: string | null = null

const setToken = (newToken: string): void => {
  token = `Bearer ${newToken}`
}

const clearToken = (): void => {
  token = null
}

const post = (dataToSend: Partial<HttpRequest>): Promise<AxiosResponse<HttpResponse>> => {
  const hasFiles =
    dataToSend.bodyType === 'form-data' &&
    dataToSend.formData?.some((f) => f.type === 'file' && f.file != null)

  if (hasFiles) {
    const fd = new FormData()
    fd.append('__method', dataToSend.method ?? 'GET')
    fd.append('__url', dataToSend.url ?? '')
    fd.append('__headers', JSON.stringify(dataToSend.headers ?? []))
    fd.append('__params', JSON.stringify(dataToSend.params ?? []))
    for (const field of dataToSend.formData!.filter((f) => f.enabled && f.key)) {
      if (field.type === 'file' && field.file) {
        fd.append(field.key, field.file)
      } else {
        fd.append(field.key, field.value)
      }
    }
    return axios.post<HttpResponse>(HTTPREQUEST, fd, { headers: { Authorization: token } })
  }

  return axios.post<HttpResponse>(HTTPREQUEST, dataToSend, { headers: { Authorization: token } })
}

const loginPost = (credentials: { username: string; password: string }): Promise<User> => {
  return axios.post<User>(HTTPREQUESTLOGIN, credentials).then((response) => response.data)
}

export default { post, loginPost, setToken, clearToken }
