'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { LayoutDashboard, LogOut } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const backgroundImageUrl =
  'https://images.unsplash.com/photo-1605902711622-cfb43c4437b7?auto=format&fit=crop&w=1950&q=80'

interface ProductInput {
  name?: string
  product_link?: string
  qty_in_box?: number | string
  purchase_price?: number | string
  vat_included?: boolean
  asin?: string
}

interface Product {
  id: string
  name: string
  asin: string
  purchase_price: number
  vat_included: boolean
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [wholesalers, setWholesalers] = useState<{ id: string; name: string; link: string }[]>([])
  const [products, setProducts] = useState<Record<string, Product[]>>({})
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')

  const [productInputs, setProductInputs] = useState<Record<string, ProductInput>>({})

  const fetchWholesalers = useCallback(async (uid: string) => {
    const { data } = await supabase.from('wholesalers').select('*').eq('user_id', uid)
    if (data) {
      setWholesalers(data)
      data.forEach(w => fetchProducts(w.id))
    }
  }, [])

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
  }, [fetchWholesalers])

  const handleRegister = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setAuthError(error.message)
  }

  const handleLogin = async () => {
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setAuthError(error.message)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const fetchProducts = async (wholesalerId: string) => {
    const { data } = await supabase.from('products').select('*').eq('wholesaler_id', wholesalerId)
    setProducts(prev => ({ ...prev, [wholesalerId]: (data || []) as Product[] }))
  }

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

  const addProduct = async (wholesalerId: string) => {
    const p = productInputs[wholesalerId] || {}
    if (!p.name || !user) return
    const { error } = await supabase.from('products').insert([
      {
        user_id: user.id,
        wholesaler_id: wholesalerId,
        name: p.name,
        product_link: p.product_link || '',
        qty_in_box: Number(p.qty_in_box) || 0,
        purchase_price: Number(p.purchase_price) || 0,
        vat_included: p.vat_included || false,
        asin: p.asin || ''
      }
    ])
    if (!error) {
      setProductInputs(prev => ({ ...prev, [wholesalerId]: {} }))
      fetchProducts(wholesalerId)
    }
  }

  const handleProductChange = (
    wholesalerId: string,
    field: keyof ProductInput,
    value: string | number | boolean
  ) => {
    setProductInputs(prev => ({
      ...prev,
      [wholesalerId]: {
        ...(prev[wholesalerId] || {}),
        [field]: value
      }
    }))
  }

  if (!user) {
    return (
      <main className="min-h-screen flex">
        <div
          className="w-1/2 hidden md:block bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        >
          <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
            <h1 className="text-white text-4xl font-bold max-w-md text-center">
              fbazn: Your Amazon FBA Sourcing Companion
            </h1>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 text-center">
              {mode === 'login' ? 'Login' : 'Register'} to fbazn
            </h2>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg" />
            {authError && <p className="text-red-500 text-sm text-center">{authError}</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold" onClick={mode === 'login' ? handleLogin : handleRegister}>
              {mode === 'login' ? 'Login' : 'Register'}
            </button>
            <p className="text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>Don&apos;t have an account? <button onClick={() => setMode('register')} className="underline text-blue-600">Register</button></>
              ) : (
                <>Already have an account? <button onClick={() => setMode('login')} className="underline text-blue-600">Login</button></>
              )}
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <div className="text-2xl font-bold p-6 border-b border-gray-800">fbazn</div>
          <nav className="p-4 space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </div>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-4 bg-red-600 hover:bg-red-700 text-sm">
          <LogOut className="h-4 w-4" /> Log Out
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        <h1 className="text-xl font-bold mb-6">Your Wholesalers</h1>
        <form onSubmit={addWholesaler} className="mb-6 space-x-4">
          <input type="text" placeholder="Wholesaler Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded w-60" />
          <input type="text" placeholder="Wholesaler Link" value={link} onChange={(e) => setLink(e.target.value)} className="p-2 border rounded w-60" />
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add</button>
        </form>

        <div className="grid gap-6">
          {wholesalers.map(w => (
            <div key={w.id} className="bg-white border rounded-lg p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-semibold text-lg">{w.name}</div>
                  <a href={w.link} target="_blank" className="text-sm text-blue-600 underline break-words">{w.link}</a>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                <input type="text" placeholder="Product Name" value={productInputs[w.id]?.name || ''} onChange={(e) => handleProductChange(w.id, 'name', e.target.value)} className="p-2 border rounded" />
                <input type="text" placeholder="Product Link" value={productInputs[w.id]?.product_link || ''} onChange={(e) => handleProductChange(w.id, 'product_link', e.target.value)} className="p-2 border rounded" />
                <input type="number" placeholder="Qty in Box" value={productInputs[w.id]?.qty_in_box || ''} onChange={(e) => handleProductChange(w.id, 'qty_in_box', e.target.value)} className="p-2 border rounded" />
                <input type="number" placeholder="Purchase Price" value={productInputs[w.id]?.purchase_price || ''} onChange={(e) => handleProductChange(w.id, 'purchase_price', e.target.value)} className="p-2 border rounded" />
                <input type="text" placeholder="ASIN" value={productInputs[w.id]?.asin || ''} onChange={(e) => handleProductChange(w.id, 'asin', e.target.value)} className="p-2 border rounded" />
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={productInputs[w.id]?.vat_included || false} onChange={(e) => handleProductChange(w.id, 'vat_included', e.target.checked)} />
                  <span className="text-sm">VAT Included</span>
                </label>
              </div>
              <button onClick={() => addProduct(w.id)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mb-4">Add Product</button>

              <ul className="space-y-2">
                {products[w.id]?.map(p => (
                  <li key={p.id} className="border p-2 rounded flex justify-between">
                    <div>
                      <div className="font-medium">{p.name}</div>
                      <div className="text-sm text-gray-600">ASIN: {p.asin}</div>
                    </div>
                    <div className="text-right text-sm">
                      £{p.purchase_price.toFixed(2)}<br />
                      {p.vat_included && <span className="text-xs text-green-600">VAT incl.</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
