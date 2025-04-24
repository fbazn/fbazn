// src/app/dashboard/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  // 1) Create a Supabase server-side client, passing in Next’s cookies
  const supabase = createServerComponentClient({ cookies })

  // 2) Fetch the current session
  const {
    data: { session }
  } = await supabase.auth.getSession()

  // 3) If no session, redirect back to the login page
  if (!session) {
    redirect('/')
  }

  // 4) Otherwise, render your protected UI
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {session.user.email}</h1>
      <p>This is your protected dashboard.</p>
    </div>
  )
}
