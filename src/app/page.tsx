'use client'

import { useEffect, useState } from 'react'
import { createClient, User } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [wholesalers, setWholesalers] = useState<{ id: string; name: string; link: string }[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchWholesalers(session.user.id)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchWholesalers(session.user.id)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleRegister = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) setAuthError(error.message)
  }

  const handleLogin = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) setAuthError(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const fetchWholesalers = async (uid: string) => {
    const { data } = await supabase
      .from('wholesalers')
      .select('*')
      .eq('user_id', uid)
    if (data) setWholesalers(data)
  }

  const addWholesaler = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !link || !user) return
    const { error } = await supabase.from('wholesalers').insert([
      {
        user_id: user.id,
        name,
        link
      }
    ])
    if (!error) {
      setName('')
      setLink('')
      fetchWholesalers(user.id)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">fbazn 🔍</h1>
        {user ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-700">Logged in as <strong>{user.email}</strong></p>
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </div>

            <form onSubmit={addWholesaler} className="mb-8 space-y-4">
              <h2 className="text-2xl font-semibold text-gray-700">Add Wholesaler</h2>
              <input
                type="text"
                placeholder="Wholesaler Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                type="text"
                placeholder="Wholesaler Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold">
                Add Wholesaler
              </button>
            </form>

            <div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Wholesalers</h2>
              <ul className="space-y-4">
                {wholesalers.map((w) => (
                  <li key={w.id} className="bg-gray-50 border border-gray-200 p-4 rounded-xl shadow-sm">
                    <strong className="block text-lg text-gray-800 mb-1">{w.name}</strong>
                    <a href={w.link} target="_blank" className="text-blue-600 underline break-words">
                      {w.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-center text-gray-800">
              {mode === 'login' ? 'Login' : 'Register'} to fbazn
            </h2>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button
              className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-semibold"
              onClick={mode === 'login' ? handleLogin : handleRegister}
            >
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
            <p className="text-sm text-center text-gray-600">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => setMode('register')} className="underline text-blue-600">
                    Register
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => setMode('login')} className="underline text-blue-600">
                    Login
                  </button>
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}