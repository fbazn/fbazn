'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [wholesalers, setWholesalers] = useState<any[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState('')

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

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const fetchWholesalers = async (uid: string) => {
    const { data } = await supabase
      .from('wholesalers')
      .select('*')
      .eq('user_id', uid)
    setWholesalers(data || [])
  }

  const addWholesaler = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !link || !user) return
    const { data, error } = await supabase.from('wholesalers').insert([
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
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold mb-6">Welcome to fbazn 🚀</h1>
        {user ? (
          <>
            <p className="mb-4">Logged in as {user.email}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-6"
              onClick={handleLogout}
            >
              Log Out
            </button>

            <form onSubmit={addWholesaler} className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Add Wholesaler</h2>
              <input
                type="text"
                placeholder="Wholesaler Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <input
                type="text"
                placeholder="Wholesaler Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2 mb-2 border rounded"
              />
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Add Wholesaler
              </button>
            </form>

            <div>
              <h2 className="text-xl font-semibold mb-2">Your Wholesalers</h2>
              <ul className="space-y-2">
                {wholesalers.map((w) => (
                  <li key={w.id} className="border p-3 rounded">
                    <strong>{w.name}</strong>
                    <br />
                    <a href={w.link} target="_blank" className="text-blue-600 underline">
                      {w.link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
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
