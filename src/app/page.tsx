// updated version with sidebar and product add/view
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { Trash2, Pencil, LogOut, Eye, PlusCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Product {
  id: string;
  name: string;
  product_link: string;
  qty_in_box: number;
  purchase_price: number;
  vat_included: boolean;
  asin: string;
  wholesaler_id: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [wholesalers, setWholesalers] = useState<{ id: string; name: string; link: string }[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState('')
  const [link, setLink] = useState('')
  const [editingWholesalerId, setEditingWholesalerId] = useState<string | null>(null)
  const [editingWholesalerName, setEditingWholesalerName] = useState('')
  const [editingWholesalerLink, setEditingWholesalerLink] = useState('')
  const [activeView, setActiveView] = useState<'add_wholesaler' | 'add_product' | 'view_products'>('add_wholesaler')

  const [productInputs, setProductInputs] = useState({
    name: '',
    product_link: '',
    qty_in_box: '',
    purchase_price: '',
    vat_included: false,
    asin: '',
    wholesaler_id: ''
  })

  const fetchWholesalers = useCallback(async (uid: string) => {
    const { data } = await supabase.from('wholesalers').select('*').eq('user_id', uid)
    if (data) setWholesalers(data)
  }, [])

  const fetchProducts = useCallback(async (uid: string) => {
    const { data } = await supabase.from('products').select('*').eq('user_id', uid)
    if (data) setProducts(data)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWholesalers(session.user.id)
        fetchProducts(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchWholesalers(session.user.id)
        fetchProducts(session.user.id)
      }
    })

    return () => { subscription.unsubscribe() }
  }, [fetchWholesalers, fetchProducts])

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

  const addProduct = async () => {
    if (!user) return
    const { name, product_link, qty_in_box, purchase_price, vat_included, asin, wholesaler_id } = productInputs
    if (!name || !wholesaler_id) return
    const { error } = await supabase.from('products').insert([
      {
        user_id: user.id,
        name,
        product_link,
        qty_in_box: Number(qty_in_box),
        purchase_price: Number(purchase_price),
        vat_included,
        asin,
        wholesaler_id
      }
    ])
    if (!error) {
      setProductInputs({
        name: '', product_link: '', qty_in_box: '', purchase_price: '', vat_included: false, asin: '', wholesaler_id: ''
      })
      fetchProducts(user.id)
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
        return (
          <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add Product</h1>
            <div className="grid gap-4">
              <select value={productInputs.wholesaler_id} onChange={(e) => setProductInputs(prev => ({ ...prev, wholesaler_id: e.target.value }))} className="border px-2 py-2 rounded">
                <option value="">Select Wholesaler</option>
                {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
              <input type="text" placeholder="Product Name" value={productInputs.name} onChange={(e) => setProductInputs(prev => ({ ...prev, name: e.target.value }))} className="border px-2 py-1 rounded" />
              <input type="text" placeholder="Product Link" value={productInputs.product_link} onChange={(e) => setProductInputs(prev => ({ ...prev, product_link: e.target.value }))} className="border px-2 py-1 rounded" />
              <input type="number" placeholder="Qty in Box" value={productInputs.qty_in_box} onChange={(e) => setProductInputs(prev => ({ ...prev, qty_in_box: e.target.value }))} className="border px-2 py-1 rounded" />
              <input type="number" placeholder="Purchase Price" value={productInputs.purchase_price} onChange={(e) => setProductInputs(prev => ({ ...prev, purchase_price: e.target.value }))} className="border px-2 py-1 rounded" />
              <input type="text" placeholder="ASIN" value={productInputs.asin} onChange={(e) => setProductInputs(prev => ({ ...prev, asin: e.target.value }))} className="border px-2 py-1 rounded" />
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={productInputs.vat_included} onChange={(e) => setProductInputs(prev => ({ ...prev, vat_included: e.target.checked }))} />
                VAT Included
              </label>
              <button onClick={addProduct} className="bg-blue-600 text-white px-4 py-2 rounded">Add Product</button>
            </div>
          </div>
        )
      case 'view_products':
        return (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">All Products</h1>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Product</th>
                  <th className="p-2 border">Wholesaler</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">ASIN</th>
                  <th className="p-2 border">VAT</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const wholesaler = wholesalers.find(w => w.id === p.wholesaler_id)
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{wholesaler?.name || '—'}</td>
                      <td className="p-2">{p.qty_in_box}</td>
                      <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                      <td className="p-2">{p.asin}</td>
                      <td className="p-2">{p.vat_included ? 'Yes' : 'No'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
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