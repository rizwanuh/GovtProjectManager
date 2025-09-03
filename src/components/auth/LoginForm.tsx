import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner@2.0.3'

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signIn(formData.email, formData.password)
      toast.success('Signed in successfully!')
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-slate-800">Welcome Back</CardTitle>
        <p className="text-slate-600">Sign in to your account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={async () => {
              setFormData({ email: 'demo@example.com', password: 'demo123' })
              setIsLoading(true)
              try {
                await signIn('demo@example.com', 'demo123')
                toast.success('Signed in with demo account!')
              } catch (error) {
                // If demo user doesn't exist, create it
                try {
                  const { signUp } = useAuth()
                  await signUp({ email: 'demo@example.com', password: 'demo123', name: 'Demo User' })
                  await signIn('demo@example.com', 'demo123')
                  toast.success('Demo account created and signed in!')
                } catch (createError) {
                  toast.error('Failed to create demo account')
                }
              } finally {
                setIsLoading(false)
              }
            }}
            disabled={isLoading}
          >
            Try Demo Account
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}