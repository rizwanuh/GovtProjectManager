import { useState } from 'react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'sonner@2.0.3'

interface SignUpFormProps {
  onToggleMode: () => void
}

export function SignUpForm({ onToggleMode }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const { signUp, signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await signUp(formData)
      // Auto-login after successful signup
      toast.success('Account created successfully! Signing you in...')
      await signIn(formData.email, formData.password)
      toast.success('Welcome to ProjectManager!')
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create account')
      if (error instanceof Error && error.message.includes('User already registered')) {
        toast.info('This email is already registered. Please sign in instead.')
        onToggleMode() // Switch to login form
      }
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
        <CardTitle className="text-2xl font-bold text-slate-800">Create Account</CardTitle>
        <p className="text-slate-600">Sign up for a new account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          
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
              minLength={6}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <button
              onClick={onToggleMode}
              className="text-blue-600 hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}