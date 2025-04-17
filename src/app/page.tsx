'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <main className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to fbazn 🚀</h1>
        {user ? (
          <>
            <p className="mb-4">Logged in as {user.email}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={handleLogout}
            >
              Log Out
            </button>
          </>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLogin}
          >
            Login with GitHub
          </button>
        )}
      </div>
    </main>
  )
}
