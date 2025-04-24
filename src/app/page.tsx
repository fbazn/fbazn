'use client'
import type { Database } from "../app/types/supabase"

import { useEffect, useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import type { Session, User } from '@supabase/supabase-js'

const supabase = createPagesBrowserClient<Database>()

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })
  }, [])

  function RedirectToLogin() {
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    return null
  }
  if (!user && !loading) {
    return <RedirectToLogin />
  }
  if (loading) return <main className="h-screen flex items-center justify-center">Loading...</main>

  if (!user) return <main className="h-screen flex items-center justify-center">Not logged in</main>

  return (
    <main className="h-screen flex items-center justify-center">
      <div className="text-xl">Welcome, {user.email}</div>
    </main>
  )
}
