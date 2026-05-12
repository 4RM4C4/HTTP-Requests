export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

export interface RequestHeader {
  key: string
  value: string
  enabled: boolean
}

export interface FormField {
  id: string
  key: string
  type: 'text' | 'file'
  value: string
  file?: File
  enabled: boolean
}

export interface HttpRequest {
  id: string
  method: HttpMethod
  url: string
  headers: RequestHeader[]
  params: RequestHeader[]
  bodyType: 'none' | 'json' | 'form-data' | 'x-www-form-urlencoded' | 'graphql' | 'raw'
  bodyContent: string
  formData: FormField[]
  xWwwFormUrlencoded: RequestHeader[]
}

export interface HttpResponse {
  status: number | string
  statusText: string
  data: unknown
  headers: Record<string, string>
  time: number
  bodysize: number | string
  headersize: number | string
}

export interface HistoryEntry {
  id: string
  executedAt: string
  request: HttpRequest
  response: HttpResponse
}

export interface Collection {
  id: string
  name: string
  requests: HttpRequest[]
  createdAt: string
}

export interface EnvVariable {
  key: string
  value: string
  enabled: boolean
}

export interface Environment {
  name: string
  variables: EnvVariable[]
}

export interface User {
  id: string
  username: string
  isAdmin: boolean
  token: string
}

export interface Tab {
  id: string
  label: string
  request: HttpRequest
  response: HttpResponse | null
  isLoading: boolean
  error: string | null
}
