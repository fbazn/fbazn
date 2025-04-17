// updated version with working product and wholesaler CRUD
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient, User } from '@supabase/supabase-js'
import { Trash2, Pencil, LogOut, Eye, PlusCircle, Save } from 'lucide-react'

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

interface Wholesaler {
  id: string;
  name: string;
  link: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({})
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

  const updateProduct = async (id: string) => {
    const { name, product_link, qty_in_box, purchase_price, vat_included, asin } = editingProduct
    if (!name) return
    await supabase.from('products').update({
      name,
      product_link,
      qty_in_box,
      purchase_price,
      vat_included,
      asin
    }).eq('id', id)
    setEditingProductId(null)
    fetchProducts(user!.id)
  }

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    fetchProducts(user!.id)
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
      case 'view_products':
        return (
          <div className="p-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">All Products</h1>
            <table className="w-full text-sm border">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Name</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Price</th>
                  <th className="p-2 border">ASIN</th>
                  <th className="p-2 border">VAT</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-t">
                    {editingProductId === p.id ? (
                      <>
                        <td className="p-2"><input value={editingProduct.name || ''} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="border px-1" /></td>
                        <td className="p-2"><input type="number" value={editingProduct.qty_in_box || ''} onChange={(e) => setEditingProduct({ ...editingProduct, qty_in_box: Number(e.target.value) })} className="border px-1 w-16" /></td>
                        <td className="p-2"><input type="number" value={editingProduct.purchase_price || ''} onChange={(e) => setEditingProduct({ ...editingProduct, purchase_price: Number(e.target.value) })} className="border px-1 w-20" /></td>
                        <td className="p-2"><input value={editingProduct.asin || ''} onChange={(e) => setEditingProduct({ ...editingProduct, asin: e.target.value })} className="border px-1 w-24" /></td>
                        <td className="p-2">
                          <input type="checkbox" checked={editingProduct.vat_included || false} onChange={(e) => setEditingProduct({ ...editingProduct, vat_included: e.target.checked })} />
                        </td>
                        <td className="p-2 flex gap-2">
                          <button onClick={() => updateProduct(p.id)} className="text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingProductId(null)} className="text-gray-500">Cancel</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.qty_in_box}</td>
                        <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                        <td className="p-2">{p.asin}</td>
                        <td className="p-2">{p.vat_included ? 'Yes' : 'No'}</td>
                        <td className="p-2 flex gap-2">
                          <button onClick={() => {
                            setEditingProductId(p.id)
                            setEditingProduct(p)
                          }} className="text-yellow-600 hover:text-yellow-800">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      default:
        return null
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
