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
  const [editingWholesalerId, setEditingWholesalerId] = useState<string | null>(null)
  const [editingWholesalerName, setEditingWholesalerName] = useState('')
  const [editingWholesalerLink, setEditingWholesalerLink] = useState('')

  const [activeView, setActiveView] = useState<'add_wholesaler' | 'add_product' | 'view_products'>('add_wholesaler')
  const [newProduct, setNewProduct] = useState<ProductInput>({})
  const [selectedWholesaler, setSelectedWholesaler] = useState('')
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<ProductInput>({})

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

  const updateWholesaler = async (id: string) => {
    const { error } = await supabase.from('wholesalers').update({ name: editingWholesalerName, link: editingWholesalerLink }).eq('id', id)
    if (!error) {
      setEditingWholesalerId(null)
      fetchWholesalers(user!.id)
    }
  }

  const updateProduct = async (id: string, wholesalerId: string) => {
    const { error } = await supabase.from('products').update({
      name: editingProduct.name,
      purchase_price: editingProduct.purchase_price,
      asin: editingProduct.asin,
      vat_included: editingProduct.vat_included
    }).eq('id', id)
    if (!error) {
      setEditingProductId(null)
      fetchProducts(wholesalerId)
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
                <li key={w.id} className="border p-4 rounded">
                  {editingWholesalerId === w.id ? (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        value={editingWholesalerName}
                        onChange={(e) => setEditingWholesalerName(e.target.value)}
                        className="p-2 border rounded"
                      />
                      <input
                        type="text"
                        value={editingWholesalerLink}
                        onChange={(e) => setEditingWholesalerLink(e.target.value)}
                        className="p-2 border rounded"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateWholesaler(w.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                        >Save</button>
                        <button
                          onClick={() => setEditingWholesalerId(null)}
                          className="bg-gray-300 hover:bg-gray-400 px-3 py-1 rounded"
                        >Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold">{w.name}</div>
                        <a href={w.link} className="text-sm text-blue-600 underline">{w.link}</a>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                          setEditingWholesalerId(w.id);
                          setEditingWholesalerName(w.name);
                          setEditingWholesalerLink(w.link);
                        }} className="text-yellow-600 hover:text-yellow-800">
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
    }
  }
}
