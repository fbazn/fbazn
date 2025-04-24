// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../lib/database'
import { Pencil, Trash2, Save, X, PlusCircle } from 'lucide-react'

type ProductRow     = Database['products']['Row']
type WholesalerRow  = Database['wholesalers']['Row']

export default function DashboardPage() {
  const router = useRouter()

  // Auth
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [userId,     setUserId]       = useState<string | null>(null)

  // Data
  const [counts, setCounts] = useState({
    products: 0,
    wholesalers: 0,
    inventoryValue: 0,
  })
  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([])
  const [products,       setProducts]       = useState<ProductRow[]>([])
  const [wholesalers,    setWholesalers]    = useState<WholesalerRow[]>([])

  // New‐item forms
  const [newWholesalerName, setNewWholesalerName] = useState('')
  const [newWholesalerLink, setNewWholesalerLink] = useState('')

  const [newProduct, setNewProduct] = useState({
    name: '',
    product_link: '',
    qty_in_box: '',
    purchase_price: '',
    vat_included: false,
    asin: '',
    wholesaler_id: '',
  })

  // Editing state
  const [editingWholesalerId,   setEditingWholesalerId]   = useState<string | null>(null)
  const [editingWholesalerName, setEditingWholesalerName] = useState('')
  const [editingWholesalerLink, setEditingWholesalerLink] = useState('')

  const [editingProductId,    setEditingProductId]    = useState<string | null>(null)
  const [editingProductData,  setEditingProductData]  = useState<Partial<ProductRow>>({})

  //
  // ── AUTH CHECK & INITIAL FETCH ───────────────────────────────────────────────
  //
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session) {
          router.replace('/')
        } else {
          setUserId(session.user.id)
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAuth(false))
  }, [router])

  // once we have a userId, load everything
  useEffect(() => {
    if (!userId) return

    const fetchDashboard = async () => {
      // summary counts & recent
      const [
        { count: prodCount },
        { count: whCount },
        { data: invRows },
        { data: recent }
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('wholesalers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId),
        supabase
          .from('products')
          .select('purchase_price, qty_in_box')
          .eq('user_id', userId),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setCounts({
        products: prodCount ?? 0,
        wholesalers: whCount ?? 0,
        inventoryValue: (invRows ?? []).reduce(
          (sum, r) => sum + r.purchase_price * r.qty_in_box,
          0
        )
      })
      setRecentProducts(recent ?? [])

      // full lists for manage sections
      const [{ data: allProds }, { data: allWhs }] = await Promise.all([
        supabase.from('products').select('*').eq('user_id', userId),
        supabase.from('wholesalers').select('*').eq('user_id', userId),
      ])
      setProducts(allProds ?? [])
      setWholesalers(allWhs ?? [])
    }
    fetchDashboard()
  }, [userId])

  if (loadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Checking auth…</p>
      </div>
    )
  }

  //
  // ── WH OLESALER HANDLERS ────────────────────────────────────────────────────
  //
  const handleAddWholesaler = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newWholesalerName) return
    await supabase
      .from('wholesalers')
      .insert([{ name: newWholesalerName, link: newWholesalerLink, user_id: userId }])
    setNewWholesalerName('')
    setNewWholesalerLink('')
    // refresh
    setWholesalers((await supabase.from('wholesalers').select('*').eq('user_id', userId)).data || [])
    setCounts(cnt => ({ ...cnt, wholesalers: cnt.wholesalers + 1 }))
  }

  const startEditWholesaler = (w: WholesalerRow) => {
    setEditingWholesalerId(w.id)
    setEditingWholesalerName(w.name)
    setEditingWholesalerLink(w.link)
  }

  const saveEditWholesaler = async (id: string) => {
    await supabase
      .from('wholesalers')
      .update({ name: editingWholesalerName, link: editingWholesalerLink })
      .eq('id', id)
    setEditingWholesalerId(null)
    // refresh
    setWholesalers((await supabase.from('wholesalers').select('*').eq('user_id', userId!)).data || [])
  }

  const deleteWholesaler = async (id: string) => {
    await supabase.from('wholesalers').delete().eq('id', id)
    setWholesalers(wholesalers.filter(w => w.id !== id))
    setCounts(cnt => ({ ...cnt, wholesalers: cnt.wholesalers - 1 }))
  }

  //
  // ── PRODUCT HANDLERS ────────────────────────────────────────────────────────
  //
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !newProduct.name) return
    const payload = {
      name: newProduct.name,
      product_link: newProduct.product_link,
      qty_in_box:   Number(newProduct.qty_in_box),
      purchase_price: Number(newProduct.purchase_price),
      vat_included:  newProduct.vat_included,
      asin:          newProduct.asin,
      wholesaler_id: newProduct.wholesaler_id,
      user_id:       userId,
    }
    await supabase.from('products').insert([payload])
    // refresh
    const allProds = (await supabase.from('products').select('*').eq('user_id', userId)).data || []
    setProducts(allProds)
    setCounts(cnt => ({ ...cnt, products: cnt.products + 1, inventoryValue: cnt.inventoryValue + payload.qty_in_box * payload.purchase_price }))
    setNewProduct({
      name: '', product_link: '', qty_in_box: '',
      purchase_price: '', vat_included: false, asin: '', wholesaler_id: ''
    })
  }

  const startEditProduct = (p: ProductRow) => {
    setEditingProductId(p.id)
    setEditingProductData(p)
  }

  const saveEditProduct = async (id: string) => {
    const upd = {
      name:            editingProductData.name,
      product_link:    editingProductData.product_link,
      qty_in_box:      editingProductData.qty_in_box,
      purchase_price:  editingProductData.purchase_price,
      vat_included:    editingProductData.vat_included,
      asin:            editingProductData.asin,
      wholesaler_id:   editingProductData.wholesaler_id,
    }
    await supabase.from('products').update(upd).eq('id', id)
    setEditingProductId(null)
    // refresh
    setProducts((await supabase.from('products').select('*').eq('user_id', userId!)).data || [])
  }

  const deleteProduct = async (id: string) => {
    await supabase.from('products').delete().eq('id', id)
    setProducts(products.filter(p => p.id !== id))
    setCounts(cnt => ({ ...cnt, products: cnt.products - 1 }))
  }

  //
  // ── RENDER ──────────────────────────────────────────────────────────────────
  //
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* ── Summary cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Products</p>
          <p className="text-2xl font-semibold">{counts.products}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Wholesalers</p>
          <p className="text-2xl font-semibold">{counts.wholesalers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Inventory Value</p>
          <p className="text-2xl font-semibold">£{counts.inventoryValue.toFixed(2)}</p>
        </div>
      </div>

      {/* ── Recent Products ──────────────────────────────────────── */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-3">Recent Products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-gray-600">No products added yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">ASIN</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.qty_in_box}</td>
                  <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                  <td className="p-2">{p.asin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Manage Wholesalers & Products ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wholesalers */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3">Wholesalers</h2>

          {/* add */}
          <form onSubmit={handleAddWholesaler} className="flex gap-2 mb-4">
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Name"
              value={newWholesalerName}
              onChange={e => setNewWholesalerName(e.target.value)}
            />
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Link"
              value={newWholesalerLink}
              onChange={e => setNewWholesalerLink(e.target.value)}
            />
            <button type="submit" className="text-green-600">
              <PlusCircle />
            </button>
          </form>

          {/* list/edit */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Link</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {wholesalers.map(w => (
                <tr key={w.id} className="border-t">
                  {editingWholesalerId === w.id ? (
                    <>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editingWholesalerName}
                          onChange={e => setEditingWholesalerName(e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editingWholesalerLink}
                          onChange={e => setEditingWholesalerLink(e.target.value)}
                        />
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => saveEditWholesaler(w.id)}>
                          <Save className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => setEditingWholesalerId(null)}>
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{w.name}</td>
                      <td className="p-2">{w.link}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => startEditWholesaler(w)}>
                          <Pencil className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button onClick={() => deleteWholesaler(w.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Products */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3">Products</h2>

          {/* add */}
          <form onSubmit={handleAddProduct} className="space-y-2 mb-4">
            <input
              className="w-full border px-2 py-1 rounded"
              placeholder="Name"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              className="w-full border px-2 py-1 rounded"
              placeholder="Link"
              value={newProduct.product_link}
              onChange={e => setNewProduct({ ...newProduct, product_link: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qty"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProduct.qty_in_box}
                onChange={e => setNewProduct({ ...newProduct, qty_in_box: e.target.value })}
              />
              <input
                type="number"
                placeholder="Price"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProduct.purchase_price}
                onChange={e => setNewProduct({ ...newProduct, purchase_price: e.target.value })}
              />
              <input
                placeholder="ASIN"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProduct.asin}
                onChange={e => setNewProduct({ ...newProduct, asin: e.target.value })}
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 border px-2 py-1 rounded"
                value={newProduct.wholesaler_id}
                onChange={e => setNewProduct({ ...newProduct, wholesaler_id: e.target.value })}
              >
                <option value="" disabled>
                  Select Wholesaler
                </option>
                {wholesalers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newProduct.vat_included}
                  onChange={e => setNewProduct({ ...newProduct, vat_included: e.target.checked })}
                />{' '}
                VAT?
              </label>
              <button type="submit">
                <PlusCircle className="w-6 h-6 text-green-600" />
              </button>
            </div>
          </form>

          {/* list/edit */}
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Wholesaler</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">VAT</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t">
                  {editingProductId === p.id ? (
                    <>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editingProductData.name || ''}
                          onChange={e =>
                            setEditingProductData({ ...editingProductData, name: e.target.value })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className="border px-1 w-full"
                          value={editingProductData.wholesaler_id || ''}
                          onChange={e =>
                            setEditingProductData({ ...editingProductData, wholesaler_id: e.target.value })
                          }
                        >
                          {wholesalers.map(w => (
                            <option key={w.id} value={w.id}>
                              {w.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-1 w-16"
                          value={editingProductData.qty_in_box ?? ''}
                          onChange={e =>
                            setEditingProductData({
                              ...editingProductData,
                              qty_in_box: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-1 w-20"
                          value={editingProductData.purchase_price ?? ''}
                          onChange={e =>
                            setEditingProductData({
                              ...editingProductData,
                              purchase_price: Number(e.target.value),
                            })
                          }
                        />
                      </td>
                      <td className="p-2 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editingProductData.vat_included || false}
                          onChange={e =>
                            setEditingProductData({
                              ...editingProductData,
                              vat_included: e.target.checked,
                            })
                          }
                        />
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => saveEditProduct(p.id)}>
                          <Save className="w-4 h-4 text-green-600" />
                        </button>
                        <button onClick={() => setEditingProductId(null)}>
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">
                        {wholesalers.find((w) => w.id === p.wholesaler_id)?.name || '—'}
                      </td>
                      <td className="p-2">{p.qty_in_box}</td>
                      <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                      <td className="p-2 text-center">{p.vat_included ? '✓' : '✗'}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => startEditProduct(p)}>
                          <Pencil className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button onClick={() => deleteProduct(p.id)}>
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
