import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { auth, supabase } from '../utils/api'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (userData: { email: string; password: string; name: string }) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const getInitialUser = async () => {
      try {
        const currentUser = await auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Error getting initial user:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      const data = await auth.signIn(email, password)
      setUser(data.user)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (userData: { email: string; password: string; name: string }) => {
    setLoading(true)
    try {
      await auth.signUp(userData)
      // User will be signed in automatically after successful signup
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}