// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1) Check current session:
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // no session → back to login
        router.replace('/')
      } else {
        setUser(session.user)
      }
      setLoading(false)
    })

    // 2) Listen for future changes (e.g. they sign out in another tab)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/')
      } else {
        setUser(session.user)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {user?.email}</h1>
      <p>This is your protected dashboard.</p>
    </div>
  )
}
