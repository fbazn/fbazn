'use client'

import { useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode]         = useState<'login'|'signup'>('login')
  const [error, setError]       = useState<string|null>(null)
  const [info, setInfo]         = useState<string|null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)

    let res: any

    if (mode === 'signup') {
      // sign up with email+password, still requires confirmation
      res = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (res.error) {
        setError(res.error.message)
      } else {
        setInfo('✔️ Check your inbox to confirm your email.')
      }
      return
    }

    // ── LOGIN MODE ──
    // password login for returning users:
    res = await supabase.auth.signInWithPassword({ email, password })
    if (res.error) {
      setError(res.error.message)
    } else {
      // got a session → go to dashboard
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded shadow max-w-sm w-full">
        <h1 className="text-xl font-bold mb-2">
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

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>

        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
        {info  && <p className="mt-2 text-green-600 text-sm">{info}</p>}

        <p className="mt-4 text-sm text-gray-600">
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login')
              setError(null)
              setInfo(null)
            }}
            className="text-blue-600 underline"
          >
            {mode === 'login' ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </form>
    </div>
  )
}
