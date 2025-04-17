// updated version with sidebar and inline editing
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { Trash2, Pencil, LogOut, Eye, PlusCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [wholesalers, setWholesalers] = useState<{ id: string; name: string; link: string }[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [editingWholesalerId, setEditingWholesalerId] = useState<string | null>(null)
  const [editingWholesalerName, setEditingWholesalerName] = useState('')
  const [editingWholesalerLink, setEditingWholesalerLink] = useState('')
  const [activeView, setActiveView] = useState<'add_wholesaler' | 'add_product' | 'view_products'>('add_wholesaler')

  const fetchWholesalers = useCallback(async (uid: string) => {
    const { data } = await supabase.from('wholesalers').select('*').eq('user_id', uid)
    if (data) setWholesalers(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchWholesalers(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchWholesalers(session.user.id)
    })

    return () => { subscription.unsubscribe() }
  }, [fetchWholesalers])

  const addWholesaler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!name || !link || !user) return
    const { error } = await supabase.from('wholesalers').insert([{ user_id: user.id, name, link }])
    if (!error) {
      setName('')
      setLink('')
      fetchWholesalers(user.id)
    }
  }

  const updateWholesaler = async (id: string) => {
    const { error } = await supabase.from('wholesalers').update({ name: editingWholesalerName, link: editingWholesalerLink }).eq('id', id)
    if (!error) {
      setEditingWholesalerId(null)
      fetchWholesalers(user!.id)
    }
  }

  const deleteWholesaler = async (id: string) => {
    await supabase.from('wholesalers').delete().eq('id', id)
    fetchWholesalers(user!.id)
  }

  const handleLogout = async () => await supabase.auth.signOut()

  const renderView = () => {
    switch (activeView) {
      case 'add_wholesaler':
        return (
          <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Wholesalers</h1>
            <form onSubmit={addWholesaler} className="flex gap-2 mb-6">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="border px-2 py-1 rounded w-1/3" />
              <input type="text" value={link} onChange={(e) => setLink(e.target.value)} placeholder="Link" className="border px-2 py-1 rounded w-1/2" />
              <button className="bg-blue-600 text-white px-4 py-1 rounded">Add</button>
            </form>
            <ul className="space-y-4">
              {wholesalers.map(w => (
                <li key={w.id} className="border rounded p-4 flex justify-between items-center">
                  {editingWholesalerId === w.id ? (
                    <div className="flex flex-col w-full gap-2">
                      <input type="text" value={editingWholesalerName} onChange={(e) => setEditingWholesalerName(e.target.value)} className="border px-2 py-1 rounded" />
                      <input type="text" value={editingWholesalerLink} onChange={(e) => setEditingWholesalerLink(e.target.value)} className="border px-2 py-1 rounded" />
                      <div className="flex gap-2">
                        <button onClick={() => updateWholesaler(w.id)} className="bg-green-600 text-white px-4 py-1 rounded">Save</button>
                        <button onClick={() => setEditingWholesalerId(null)} className="bg-gray-300 px-4 py-1 rounded">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center w-full">
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <a href={w.link} className="text-sm text-blue-600 underline" target="_blank">{w.link}</a>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingWholesalerId(w.id)
                            setEditingWholesalerName(w.name)
                            setEditingWholesalerLink(w.link)
                          }}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteWholesaler(w.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      case 'add_product':
        return <div className="p-6">Add Product view coming soon...</div>
      case 'view_products':
        return <div className="p-6">View Products view coming soon...</div>
    }
  }

  if (!user) return <main className="min-h-screen flex items-center justify-center text-gray-500">Loading...</main>

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold p-6 border-b border-gray-800">fbazn</div>
          <nav className="p-4 space-y-2 text-sm">
            <button onClick={() => setActiveView('add_wholesaler')} className="flex items-center gap-2 text-gray-300 hover:text-white">
              <PlusCircle className="h-4 w-4" /> Add Wholesaler
            </button>
            <button onClick={() => setActiveView('add_product')} className="flex items-center gap-2 text-gray-300 hover:text-white">
              <PlusCircle className="h-4 w-4" /> Add Product
            </button>
            <button onClick={() => setActiveView('view_products')} className="flex items-center gap-2 text-gray-300 hover:text-white">
              <Eye className="h-4 w-4" /> View Products
            </button>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-sm">
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </aside>
      <main className="flex-1 overflow-auto bg-gray-50">
        {renderView()}
      </main>
    </div>
  )
}
