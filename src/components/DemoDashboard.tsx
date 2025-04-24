import React, { useState, useEffect } from 'react'
import { Pencil, Trash2, Save, X, PlusCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  product_link: string
  qty_in_box: number
  purchase_price: number
  vat_included: boolean
  asin: string
  wholesaler_id: string
  created_at: string
}

interface Wholesaler {
  id: string
  name: string
  link: string
  created_at: string
}

const initialWholesalers: Wholesaler[] = [
  { id: 'w1', name: 'Wholesaler A', link: 'https://wholesaler-a.com', created_at: '2025-04-20' },
  { id: 'w2', name: 'Wholesaler B', link: 'https://wholesaler-b.com', created_at: '2025-04-21' },
]

const initialProducts: Product[] = [
  {
    id: 'p1', name: 'Product One', product_link: 'https://example.com/p1', qty_in_box: 10,
    purchase_price: 5.5, vat_included: true, asin: 'ASIN001', wholesaler_id: 'w1', created_at: '2025-04-22'
  },
  {
    id: 'p2', name: 'Product Two', product_link: 'https://example.com/p2', qty_in_box: 20,
    purchase_price: 8.75, vat_included: false, asin: 'ASIN002', wholesaler_id: 'w2', created_at: '2025-04-23'
  },
]

export default function DemoDashboard() {
  // State
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(initialWholesalers)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Form state: new entries
  const [newWhName, setNewWhName] = useState('')
  const [newWhLink, setNewWhLink] = useState('')
  const [newProd, setNewProd] = useState<Omit<Product, 'id' | 'created_at'>>({
    name: '', product_link: '', qty_in_box: 0,
    purchase_price: 0, vat_included: false, asin: '', wholesaler_id: ''
  })

  // Editing state
  const [editWhId, setEditWhId] = useState<string | null>(null)
  const [editWhName, setEditWhName] = useState('')
  const [editWhLink, setEditWhLink] = useState('')
  const [editProdId, setEditProdId] = useState<string | null>(null)
  const [editProdData, setEditProdData] = useState<Partial<Product>>({})

  // Counts & inventory value
  const [counts, setCounts] = useState({ products: 0, wholesalers: 0, inventoryValue: 0 })
  useEffect(() => {
    setCounts({
      products: products.length,
      wholesalers: wholesalers.length,
      inventoryValue: products.reduce((sum, p) => sum + p.purchase_price * p.qty_in_box, 0)
    })
  }, [products, wholesalers])

  // Recent products (last 5)
  const recentProducts = [...products]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  // Handlers for wholesalers
  const addWholesaler = (e: React.FormEvent) => {
    e.preventDefault()
    const w: Wholesaler = {
      id: `w${Date.now()}`, name: newWhName,
      link: newWhLink, created_at: new Date().toISOString().slice(0, 10)
    }
    setWholesalers(prev => [...prev, w])
    setNewWhName('')
    setNewWhLink('')
  }

  const startEditWh = (w: Wholesaler) => {
    setEditWhId(w.id)
    setEditWhName(w.name)
    setEditWhLink(w.link)
  }

  const saveEditWh = (id: string) => {
    setWholesalers(prev => prev.map(w => w.id === id ? { ...w, name: editWhName, link: editWhLink } : w))
    setEditWhId(null)
  }

  const deleteWh = (id: string) => {
    setWholesalers(prev => prev.filter(w => w.id !== id))
  }

  // Handlers for products
  const addProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Product = {
      id: `p${Date.now()}`, created_at: new Date().toISOString().slice(0, 10),
      ...newProd
    } as Product
    setProducts(prev => [...prev, p])
    setNewProd({ name: '', product_link: '', qty_in_box: 0, purchase_price: 0, vat_included: false, asin: '', wholesaler_id: '' })
  }

  const startEditProd = (p: Product) => {
    setEditProdId(p.id)
    setEditProdData(p)
  }

  const saveEditProd = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...(editProdData as Product) } : p))
    setEditProdId(null)
  }

  const deleteProd = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id))
  }

  // Render
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Demo Dashboard</h1>

      {/* Summary cards */}
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

      {/* Recent Products */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-2">Recent Products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Name</th>
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

      {/* Manage Wholesalers & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wholesalers Section */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3">Wholesalers</h2>
          <form onSubmit={addWholesaler} className="flex gap-2 mb-4">
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Name"
              value={newWhName}
              onChange={e => setNewWhName(e.target.value)}
            />
            <input
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Link"
              value={newWhLink}
              onChange={e => setNewWhLink(e.target.value)}
            />
            <button type="submit" className="text-green-600"><PlusCircle /></button>
          </form>
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
                  {editWhId === w.id ? (
                    <>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editWhName}
                          onChange={e => setEditWhName(e.target.value)}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editWhLink}
                          onChange={e => setEditWhLink(e.target.value)}
                        />
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => saveEditWh(w.id)}><Save className="w-4 h-4 text-green-600" /></button>
                        <button onClick={() => setEditWhId(null)}><X className="w-4 h-4 text-gray-500" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{w.name}</td>
                      <td className="p-2">{w.link}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => startEditWh(w)}><Pencil className="w-4 h-4 text-yellow-600" /></button>
                        <button onClick={() => deleteWh(w.id)}><Trash2 className="w-4 h-4 text-red-600" /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Products Section */}
        <div className="bg-white shadow rounded p-4">
          <h2 className="text-xl font-bold mb-3">Products</h2>
          <form onSubmit={addProduct} className="space-y-2 mb-4">
            <input
              className="w-full border px-2 py-1 rounded"
              placeholder="Name"
              value={newProd.name}
              onChange={e => setNewProd({ ...newProd, name: e.target.value })}
            />
            <input
              className="w-full border px-2 py-1 rounded"
              placeholder="Link"
              value={newProd.product_link}
              onChange={e => setNewProd({ ...newProd, product_link: e.target.value })}
            />
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Qty"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProd.qty_in_box}
                onChange={e => setNewProd({ ...newProd, qty_in_box: Number(e.target.value) })}
              />
              <input
                type="number"
                placeholder="Price"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProd.purchase_price}
                onChange={e => setNewProd({ ...newProd, purchase_price: Number(e.target.value) })}
              />
              <input
                placeholder="ASIN"
                className="w-1/3 border px-2 py-1 rounded"
                value={newProd.asin}
                onChange={e => setNewProd({ ...newProd, asin: e.target.value })}
              />
            </div>
            <div className="flex gap-2 items-center">
              <select
                className="flex-1 border px-2 py-1 rounded"
                value={newProd.wholesaler_id}
                onChange={e => setNewProd({ ...newProd, wholesaler_id: e.target.value })}
              >
                <option value="" disabled>Select Wholesaler</option>
                {wholesalers.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={newProd.vat_included}
                  onChange={e => setNewProd({ ...newProd, vat_included: e.target.checked })}
                /> VAT?
              </label>
              <button type="submit"><PlusCircle className="w-6 h-6 text-green-600" /></button>
            </div>
          </form>
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
                  {editProdId === p.id ? (
                    <>
                      <td className="p-2">
                        <input
                          className="border px-1 w-full"
                          value={editProdData.name || ''}
                          onChange={e => setEditProdData({ ...editProdData, name: e.target.value })}
                        />
                      </td>
                      <td className="p-2">
                        <select
                          className="border px-1 w-full"
                          value={editProdData.wholesaler_id || ''}
                          onChange={e => setEditProdData({ ...editProdData, wholesaler_id: e.target.value })}
                        >
                          {wholesalers.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-1 w-16"
                          value={editProdData.qty_in_box ?? ''}
                          onChange={e => setEditProdData({ ...editProdData, qty_in_box: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          className="border px-1 w-20"
                          value={editProdData.purchase_price ?? ''}
                          onChange={e => setEditProdData({ ...editProdData, purchase_price: Number(e.target.value) })}
                        />
                      </td>
                      <td className="p-2 flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={editProdData.vat_included || false}
                          onChange={e => setEditProdData({ ...editProdData, vat_included: e.target.checked })}
                        />
                      </td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => saveEditProd(p.id)}><Save className="w-4 h-4 text-green-600" /></button>
                        <button onClick={() => setEditProdId(null)}><X className="w-4 h-4 text-gray-500" /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-2">{p.name}</td>
                      <td className="p-2">{wholesalers.find(w => w.id === p.wholesaler_id)?.name || '—'}</td>
                      <td className="p-2">{p.qty_in_box}</td>
                      <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                      <td className="p-2 text-center">{p.vat_included ? '✓' : '✗'}</td>
                      <td className="p-2 flex gap-2">
                        <button onClick={() => startEditProd(p)}><Pencil className="w-4 h-4 text-yellow-600" /></button>
                        <button onClick={() => deleteProd(p.id)}><Trash2 className="w-4 h-4 text-red-600" /></button>
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
