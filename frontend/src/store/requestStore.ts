import { create } from 'zustand'
import type { Tab, HttpRequest, HttpResponse, HistoryEntry, Collection, Environment } from '../types'
import * as historyService from '../services/historyService'
import * as collectionService from '../services/collectionService'
import * as envService from '../services/envService'
import { generateCurlCommand } from '../utils/curlExporter'
import requestsHttpService from '../services/requestsHttp'

function makeBlankRequest(): HttpRequest {
  return {
    id: crypto.randomUUID(),
    method: 'GET',
    url: '',
    headers: [],
    params: [],
    bodyType: 'none',
    bodyContent: '',
    formData: [],
    xWwwFormUrlencoded: [],
  }
}

function makeBlankTab(): Tab {
  return {
    id: crypto.randomUUID(),
    label: 'New Request',
    request: makeBlankRequest(),
    response: null,
    isLoading: false,
    error: null,
  }
}

function labelFor(request: HttpRequest): string {
  const url = request.url.trim()
  if (!url) return 'New Request'
  try {
    const parsed = new URL(url)
    return `${request.method} ${parsed.pathname}`
  } catch {
    return `${request.method} ${url.slice(0, 30)}`
  }
}

interface RequestStore {
  // Tabs
  tabs: Tab[]
  activeTabId: string

  // Sidebar data (mirrors of localStorage)
  history: HistoryEntry[]
  collections: Collection[]
  environments: Environment[]
  activeEnvironment: string

  // Tab actions
  addTab: () => void
  closeTab: (id: string) => void
  setActiveTab: (id: string) => void
  updateRequest: (tabId: string, partial: Partial<HttpRequest>) => void
  executeRequest: (tabId: string) => Promise<void>
  loadFromHistory: (entry: HistoryEntry) => void
  loadFromCollection: (request: HttpRequest) => void

  // Sidebar sync actions
  refreshHistory: () => void
  refreshCollections: () => void
  refreshEnvironments: () => void
  saveToCollection: (collectionId: string, tabId: string) => void
  exportCurl: (tabId: string) => string | null

  // Environment actions
  setActiveEnvironment: (name: string) => void

  // Session
  resetStore: () => void
}

const initialTab = makeBlankTab()

export const useRequestStore = create<RequestStore>((set, get) => ({
  tabs: [initialTab],
  activeTabId: initialTab.id,
  history: historyService.getHistory(),
  collections: collectionService.getCollections(),
  environments: envService.getEnvironments(),
  activeEnvironment: envService.getActiveEnvironment(),

  addTab: () => {
    const tab = makeBlankTab()
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get()
    if (tabs.length === 1) {
      // Reset last tab instead of removing it
      const blank = makeBlankTab()
      set({ tabs: [blank], activeTabId: blank.id })
      return
    }
    const idx = tabs.findIndex((t) => t.id === id)
    const next = tabs[idx === tabs.length - 1 ? idx - 1 : idx + 1]
    set({
      tabs: tabs.filter((t) => t.id !== id),
      activeTabId: activeTabId === id ? next.id : activeTabId,
    })
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateRequest: (tabId, partial) => {
    set((s) => ({
      tabs: s.tabs.map((t) => {
        if (t.id !== tabId) return t
        const request = { ...t.request, ...partial }
        return { ...t, request, label: labelFor(request) }
      }),
    }))
  },

  executeRequest: async (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId)
    if (!tab) return

    set((s) => ({
      tabs: s.tabs.map((t) =>
        t.id === tabId ? { ...t, isLoading: true, error: null, response: null } : t,
      ),
    }))

    const activeVars = envService.getActiveVariables()
    const resolvedUrl = envService.resolveVariables(tab.request.url, activeVars)
    const resolvedHeaders = tab.request.headers.map((h) => ({
      ...h,
      value: envService.resolveVariables(h.value, activeVars),
    }))
    const resolvedBodyContent = envService.resolveVariables(tab.request.bodyContent, activeVars)

    const payload = {
      ...tab.request,
      url: resolvedUrl,
      headers: resolvedHeaders,
      bodyContent: resolvedBodyContent,
    }

    try {
      const axiosResponse = await requestsHttpService.post(payload)
      const response = axiosResponse.data as HttpResponse

      const entry = historyService.saveEntry(tab.request, response)

      set((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === tabId ? { ...t, isLoading: false, response } : t,
        ),
        history: [entry, ...s.history].slice(0, 100),
      }))
    } catch (err: unknown) {
      // Prefer the backend's error message from the response body (e.g. 403 URL not allowed)
      const axiosErr = err as { response?: { data?: { error?: string } }; message?: string }
      const message = axiosErr.response?.data?.error ?? axiosErr.message ?? 'Request failed'
      set((s) => ({
        tabs: s.tabs.map((t) =>
          t.id === tabId ? { ...t, isLoading: false, error: message } : t,
        ),
      }))
    }
  },

  loadFromHistory: (entry) => {
    const tab: Tab = {
      id: crypto.randomUUID(),
      label: labelFor(entry.request),
      request: { ...entry.request, id: crypto.randomUUID() },
      response: entry.response,
      isLoading: false,
      error: null,
    }
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
  },

  loadFromCollection: (request) => {
    const tab: Tab = {
      id: crypto.randomUUID(),
      label: labelFor(request),
      request: { ...request, id: crypto.randomUUID() },
      response: null,
      isLoading: false,
      error: null,
    }
    set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }))
  },

  refreshHistory: () => set({ history: historyService.getHistory() }),
  refreshCollections: () => set({ collections: collectionService.getCollections() }),
  refreshEnvironments: () =>
    set({
      environments: envService.getEnvironments(),
      activeEnvironment: envService.getActiveEnvironment(),
    }),

  saveToCollection: (collectionId, tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId)
    if (!tab) return
    collectionService.addRequestToCollection(collectionId, tab.request)
    get().refreshCollections()
  },

  exportCurl: (tabId) => {
    const tab = get().tabs.find((t) => t.id === tabId)
    if (!tab) return null
    const activeVars = envService.getActiveVariables()
    const resolvedUrl = envService.resolveVariables(tab.request.url, activeVars)
    return generateCurlCommand(tab.request, resolvedUrl)
  },

  setActiveEnvironment: (name) => {
    envService.setActiveEnvironment(name)
    set({ activeEnvironment: name })
  },

  resetStore: () => {
    const blank = makeBlankTab()
    set({
      tabs: [blank],
      activeTabId: blank.id,
      history: [],
      collections: [],
      environments: [],
      activeEnvironment: 'Default',
    })
  },
}))
