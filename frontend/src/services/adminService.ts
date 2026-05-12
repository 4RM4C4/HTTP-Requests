import axios from 'axios'
import { HTTPREQUEST } from '../utils/config'
import type { User } from '../types'

// Derives admin API base from requests endpoint
const ADMIN_BASE = HTTPREQUEST.replace('/requests', '/users')

let token: string | null = null

export function setAdminToken(newToken: string): void {
  token = `Bearer ${newToken}`
}

const authHeaders = () => ({ Authorization: token })

export async function getUsers(): Promise<Omit<User, 'token'>[]> {
  const response = await axios.get(ADMIN_BASE, { headers: authHeaders() })
  return response.data as Omit<User, 'token'>[]
}

export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`${ADMIN_BASE}/${id}`, { headers: authHeaders() })
}

export async function toggleAdmin(id: string, isAdmin: boolean): Promise<Omit<User, 'token'>> {
  const response = await axios.patch(`${ADMIN_BASE}/${id}`, { isAdmin }, { headers: authHeaders() })
  return response.data as Omit<User, 'token'>
}

export async function createUser(username: string, password: string, isAdmin: boolean): Promise<Omit<User, 'token'>> {
  const response = await axios.post(ADMIN_BASE, { username, password, isAdmin }, { headers: authHeaders() })
  return response.data as Omit<User, 'token'>
}
