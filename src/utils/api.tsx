import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from './supabase/info'

const supabaseUrl = `https://${projectId}.supabase.co`
const supabaseKey = publicAnonKey

export const supabase = createClient(supabaseUrl, supabaseKey)

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d22d6276`

async function makeRequest(url: string, options: RequestInit = {}) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token || publicAnonKey
    
    console.log(`Making request to: ${BASE_URL}${url}`)
    console.log(`Using token: ${token.substring(0, 20)}...`)
    
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    })
    
    console.log(`Response status: ${response.status}`)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${errorText}`)
      throw new Error(`API Error (${response.status}): ${errorText}`)
    }
    
    const data = await response.json()
    console.log(`Response data:`, data)
    return data
  } catch (error) {
    console.error('Request failed:', error)
    throw error
  }
}

// Auth API
export const auth = {
  signUp: async (userData: { email: string; password: string; name: string }) => {
    return makeRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },
  
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },
  
  getCurrentUser: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.user || null
  }
}

// Projects API
export const projects = {
  list: async () => {
    return makeRequest('/projects')
  },
  
  create: async (projectData: {
    name: string
    description: string
    status: string
    priority: string
    start_date: string
    end_date: string
    budget: number
    tags: string[]
  }) => {
    return makeRequest('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    })
  },
  
  update: async (id: string, projectData: Partial<{
    name: string
    description: string
    status: string
    priority: string
    start_date: string
    end_date: string
    budget: number
    tags: string[]
  }>) => {
    return makeRequest(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    })
  },
  
  delete: async (id: string) => {
    return makeRequest(`/projects/${id}`, {
      method: 'DELETE',
    })
  }
}

// Tasks API
export const tasks = {
  list: async (projectId?: string) => {
    const query = projectId ? `?project_id=${projectId}` : ''
    return makeRequest(`/tasks${query}`)
  },
  
  create: async (taskData: {
    title: string
    description: string
    status: string
    priority: string
    project_id: string
    due_date?: string
    assigned_to?: string
  }) => {
    return makeRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    })
  },
  
  update: async (id: string, taskData: Partial<{
    title: string
    description: string
    status: string
    priority: string
    due_date: string
    assigned_to: string
  }>) => {
    return makeRequest(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    })
  },
  
  delete: async (id: string) => {
    return makeRequest(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }
}