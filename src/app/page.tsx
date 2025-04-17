// updated version with edit/delete functionality
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { LogOut, PlusCircle, Eye, Trash2, Pencil } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
  const [activeView, setActiveView] = useState<'add_wholesaler' | 'add_product' | 'view_products'>('add_wholesaler')
  const [newProduct, setNewProduct] = useState<ProductInput>({})
  const [selectedWholesaler, setSelectedWholesaler] = useState('')

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchWholesalers(session.user.id)
    })

    return () => { subscription.unsubscribe() }
  }, [fetchWholesalers])

  const handleLogout = async () => await supabase.auth.signOut()

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

  const deleteWholesaler = async (id: string) => {
    await supabase.from('wholesalers').delete().eq('id', id)
    fetchWholesalers(user!.id)
  }

  const deleteProduct = async (id: string, wholesalerId: string) => {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts(wholesalerId)
  }

  const addProduct = async () => {
    if (!newProduct.name || !user || !selectedWholesaler) return
    const { error } = await supabase.from('products').insert([
      {
        user_id: user.id,
        wholesaler_id: selectedWholesaler,
        name: newProduct.name,
        product_link: newProduct.product_link || '',
        qty_in_box: Number(newProduct.qty_in_box) || 0,
        purchase_price: Number(newProduct.purchase_price) || 0,
        vat_included: newProduct.vat_included || false,
        asin: newProduct.asin || ''
      }
    ])
    if (!error) {
      setNewProduct({})
      fetchProducts(selectedWholesaler)
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'add_wholesaler':
        return (
          <div>
            <h1 className="text-xl font-bold mb-6">Add Wholesaler</h1>
            <form onSubmit={addWholesaler} className="space-x-4 mb-4">
              <input type="text" placeholder="Wholesaler Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded" />
              <input type="text" placeholder="Wholesaler Link" value={link} onChange={(e) => setLink(e.target.value)} className="p-2 border rounded" />
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Add</button>
            </form>
            <ul className="space-y-4">
              {wholesalers.map(w => (
                <li key={w.id} className="border p-4 rounded flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{w.name}</div>
                    <a href={w.link} className="text-sm text-blue-600 underline">{w.link}</a>
                  </div>
                  <button onClick={() => deleteWholesaler(w.id)} className="text-red-600 hover:text-red-800"><Trash2 className="w-4 h-4" /></button>
                </li>
              ))}
            </ul>
          </div>
        )
      case 'add_product':
        return (
          <div>
            <h1 className="text-xl font-bold mb-6">Add Product</h1>
            <div className="grid gap-4 max-w-xl">
              <select value={selectedWholesaler} onChange={(e) => setSelectedWholesaler(e.target.value)} className="p-2 border rounded">
                <option value="">Select Wholesaler</option>
                {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <input type="text" placeholder="Product Name" value={newProduct.name || ''} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="p-2 border rounded" />
              <input type="text" placeholder="Product Link" value={newProduct.product_link || ''} onChange={(e) => setNewProduct({ ...newProduct, product_link: e.target.value })} className="p-2 border rounded" />
              <input type="number" placeholder="Qty in Box" value={newProduct.qty_in_box || ''} onChange={(e) => setNewProduct({ ...newProduct, qty_in_box: e.target.value })} className="p-2 border rounded" />
              <input type="number" placeholder="Purchase Price" value={newProduct.purchase_price || ''} onChange={(e) => setNewProduct({ ...newProduct, purchase_price: e.target.value })} className="p-2 border rounded" />
              <input type="text" placeholder="ASIN" value={newProduct.asin || ''} onChange={(e) => setNewProduct({ ...newProduct, asin: e.target.value })} className="p-2 border rounded" />
              <label className="flex items-center space-x-2">
                <input type="checkbox" checked={newProduct.vat_included || false} onChange={(e) => setNewProduct({ ...newProduct, vat_included: e.target.checked })} />
                <span className="text-sm">VAT Included</span>
              </label>
              <button onClick={addProduct} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">Add Product</button>
            </div>
          </div>
        )
      case 'view_products':
        return (
          <div>
            <h1 className="text-xl font-bold mb-6">View Products</h1>
            {wholesalers.map(w => (
              <div key={w.id} className="mb-6">
                <h2 className="font-semibold text-lg mb-2">{w.name}</h2>
                <ul className="space-y-2">
                  {products[w.id]?.map(p => (
                    <li key={p.id} className="border p-2 rounded flex justify-between items-center">
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">ASIN: {p.asin}</div>
                        <div className="text-sm">£{p.purchase_price.toFixed(2)}</div>
                        {p.vat_included && <span className="text-xs text-green-600">VAT incl.</span>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => deleteProduct(p.id, w.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
    }
  }

  if (!user) return <main className="min-h-screen flex">...</main>

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
      <main className="flex-1 p-6 overflow-auto bg-gray-50">
        {renderView()}
      </main>
    </div>
  )
}
