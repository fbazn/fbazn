'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/navigation'

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
      if (!res.error) {
        // auto-login after signup
        res = await supabase.auth.signInWithPassword({ email, password })
      }
    } else {
      res = await supabase.auth.signInWithPassword({ email, password })
    }

    if (res.error) {
      setError(res.error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 border">
        <h1 className="text-xl font-bold">
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </h1>
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <button className="w-full bg-blue-600 text-white py-2 rounded">
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <p className="text-sm">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-blue-600 underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  )
}
