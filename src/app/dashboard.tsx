// pages/dashboard.tsx
import { GetServerSideProps } from 'next'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard({ email }: { email: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, {email}</h1>
      <p>This is your protected dashboard.</p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  // pull the Supabase cookie from the incoming request
  const { data: { session } } = await supabase.auth.getSessionFromUrl({ req })

  if (!session) {
    // not logged in → redirect to /
    return {
      redirect: { destination: '/', permanent: false }
    }
  }

  return {
    props: {
      email: session.user.email
    }
  }
}
