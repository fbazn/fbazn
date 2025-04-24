// pages/index.tsx
import { useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useRouter } from 'next/router'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]     = useState<'login'|'signup'>('login')
  const [error, setError]   = useState<string|null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    let res
    if (mode === 'signup') {
      res = await supabase.auth.signUp({ email, password })
      // optional: auto-login by calling signInWithPassword after a successful signUp:
      if (!res.error) {
        res = await supabase.auth.signInWithPassword({ email, password })
      }
    } else {
      res = await supabase.auth.signInWithPassword({ email, password })
    }

    if (res.error) {
      setError(res.error.message)
    } else {
      // on success, redirect to /dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h1 className="text-xl font-bold mb-4">
          {mode === 'signup' ? 'Create an account' : 'Log in'}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={e=>setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={e=>setPassword(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            {mode === 'signup' ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
        <p className="mt-4 text-sm text-gray-600">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-600 underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>
    </div>
  )
}
