import React, { useState, useMemo } from 'react'
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

interface HubMetric {
  title: string
  subtitle: string
  colorClass: string
  metrics: {
    sales: string
    ordersUnits: string
    refunds: string
    advCost: string
    estPayout: string
    grossProfit: string
    netProfit: string
  }
}

const initialWholesalers: Wholesaler[] = [
  { id: 'w1', name: 'Wholesaler A', link: 'https://wholesaler-a.com', created_at: '2025-04-20' },
  { id: 'w2', name: 'Wholesaler B', link: 'https://wholesaler-b.com', created_at: '2025-04-21' },
]

const initialProducts: Product[] = [
  { id: 'p1', name: 'Product One', product_link: 'https://example.com/p1', qty_in_box: 10, purchase_price: 5.5, vat_included: true, asin: 'ASIN001', wholesaler_id: 'w1', created_at: '2025-04-22' },
  { id: 'p2', name: 'Product Two', product_link: 'https://example.com/p2', qty_in_box: 20, purchase_price: 8.75, vat_included: false, asin: 'ASIN002', wholesaler_id: 'w2', created_at: '2025-04-23' },
]

export default function DemoDashboard() {
  const [view, setView] = useState<'hub' | 'recent' | 'wholesalers' | 'products'>('hub')

  // Data state
  const [wholesalers, setWholesalers] = useState<Wholesaler[]>(initialWholesalers)
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Form state
  const [newWhName, setNewWhName] = useState('')
  const [newWhLink, setNewWhLink] = useState('')
  const [newProd, setNewProd] = useState<Omit<Product, 'id' | 'created_at'>>({ name: '', product_link: '', qty_in_box: 0, purchase_price: 0, vat_included: false, asin: '', wholesaler_id: '' })

  // Edit state
  const [editWhId, setEditWhId] = useState<string | null>(null)
  const [editWhName, setEditWhName] = useState('')
  const [editWhLink, setEditWhLink] = useState('')
  const [editProdId, setEditProdId] = useState<string | null>(null)
  const [editProdData, setEditProdData] = useState<Partial<Product>>({})

  // Memoized recent products
  const recentProducts = useMemo(
    () => [...products].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 5),
    [products]
  )

  // Fake Hub cards data
  const hubCards: HubMetric[] = [
    {
      title: 'Today', subtitle: '15. December 2029', colorClass: 'bg-blue-500',
      metrics: {
        sales: '£730.15', ordersUnits: '52 / 55', refunds: '3', advCost: '-£6.27', estPayout: '£522.61', grossProfit: '£277.49', netProfit: '£276.99'
      }
    },
    {
      title: 'Yesterday', subtitle: '14. December 2029', colorClass: 'bg-teal-500',
      metrics: {
        sales: '£744.82', ordersUnits: '65 / 68', refunds: '5', advCost: '-£9.21', estPayout: '£487.34', grossProfit: '£244.02', netProfit: '£218.52'
      }
    },
    {
      title: 'Month to date', subtitle: '1. - 15. December 2029', colorClass: 'bg-green-500',
      metrics: {
        sales: '£12,920.78', ordersUnits: '914 / 1,044', refunds: '44', advCost: '-£119.08', estPayout: '£9,018.80', grossProfit: '£5,008.72', netProfit: '£4,678.22'
      }
    },
    {
      title: 'This month (forecast)', subtitle: '1. - 31. December 2029', colorClass: 'bg-cyan-500',
      metrics: {
        sales: '£26,692.65', ordersUnits: '1,922 / 2,188', refunds: '95', advCost: '-£727.72', estPayout: '£17,745.56', grossProfit: '£9,441.66', netProfit: '£9,103.44'
      }
    }
  ]

  // CRUD Handlers
  const addWholesaler = (e: React.FormEvent) => {
    e.preventDefault()
    const w: Wholesaler = { id: `w${Date.now()}`, name: newWhName, link: newWhLink, created_at: new Date().toISOString().slice(0, 10) }
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
  const deleteWh = (id: string) => setWholesalers(prev => prev.filter(w => w.id !== id))

  const addProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const p: Product = { id: `p${Date.now()}`, created_at: new Date().toISOString().slice(0, 10), ...newProd } as Product
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
  const deleteProd = (id: string) => setProducts(prev => prev.filter(p => p.id !== id))

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold mb-4">Navigation</h2>
        <nav className="space-y-2">
          <button onClick={() => setView('hub')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">Hub</button>
          <button onClick={() => setView('recent')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">Recent Products</button>
          <button onClick={() => setView('wholesalers')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">Wholesalers</button>
          <button onClick={() => setView('products')} className="w-full text-left px-2 py-1 rounded hover:bg-gray-700">Products</button>
        </nav>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        {view === 'hub' && (
          <section>
            <h1 className="text-3xl font-bold mb-6">Hub</h1>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {hubCards.map(c => (
                <div key={c.title} className="bg-white shadow rounded overflow-hidden">
                  <div className={`${c.colorClass} p-4 text-white`}>
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="text-sm">{c.subtitle}</p>
                  </div>
                  <div className="p-4 space-y-2 text-sm bg-gray-50">
                    <div><strong>Sales:</strong> {c.metrics.sales}</div>
                    <div><strong>Orders/Units:</strong> {c.metrics.ordersUnits}</div>
                    <div><strong>Refunds:</strong> {c.metrics.refunds}</div>
                    <div><strong>Adv. cost:</strong> {c.metrics.advCost}</div>
                    <div><strong>Est. payout:</strong> {c.metrics.estPayout}</div>
                    <div><strong>Gross profit:</strong> {c.metrics.grossProfit}</div>
                    <div><strong>Net profit:</strong> {c.metrics.netProfit}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        {view === 'recent' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Products</h2>
            <div className="bg-white shadow rounded p-4">
              {recentProducts.length === 0 ? (
                <p className="text-gray-600">No products yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
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
          </section>
        )}
        {view === 'wholesalers' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Wholesalers</h2>
            <div className="bg-white shadow rounded p-4 mb-6">
              <form onSubmit={addWholesaler} className="flex gap-2">
                <input type="text" placeholder="Name" className="flex-1 border px-2 py-1 rounded" value={newWhName} onChange={e => setNewWhName(e.target.value)} />
                <input type="text" placeholder="Link" className="flex-1 border px-2 py-1 rounded" value={newWhLink} onChange={e => setNewWhLink(e.target.value)} />
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
                          <td className="p-2"><input className="border px-1 w-full" value={editWhName} onChange={e => setEditWhName(e.target.value)} /></td>
                          <td className="p-2"><input className="border px-1 w-full" value={editWhLink} onChange={e => setEditWhLink(e.target.value)} /></td>
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
          </section>
        )}
        {view === 'products' && (
          <section>
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            <div className="bg-white shadow rounded p-4 mb-6">
              <form onSubmit={addProduct} className="space-y-2">
                <input type="text" placeholder="Name" className="w-full border px-2 py-1 rounded" value={newProd.name} onChange={e => setNewProd({ ...newProd, name: e.target.value })} />
                <input type="text" placeholder="Link" className="w-full border px-2 py-1 rounded" value={newProd.product_link} onChange={e => setNewProd({ ...newProd, product_link: e.target.value })} />
                <div className="flex gap-2">
                  <input type="number" placeholder="Qty" className="w-1/3 border px-2 py-1 rounded" value={newProd.qty_in_box} onChange={e => setNewProd({ ...newProd, qty_in_box: Number(e.target.value) })} />
                  <input type="number" placeholder="Price" className="w-1/3 border px-2 py-1 rounded" value={newProd.purchase_price} onChange={e => setNewProd({ ...newProd, purchase_price: Number(e.target.value) })} />
                  <input type="text" placeholder="ASIN" className="w-1/3 border px-2 py-1 rounded" value={newProd.asin} onChange={e => setNewProd({ ...newProd, asin: e.target.value })} />
                </div>
                <div className="flex gap-2 items-center">
                  <select className="flex-1 border px-2 py-1 rounded" value={newProd.wholesaler_id} onChange={e => setNewProd({ ...newProd, wholesaler_id: e.target.value })}>
                    <option value="" disabled>Select Wholesaler</option>
                    {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={newProd.vat_included} onChange={e => setNewProd({ ...newProd, vat_included: e.target.checked })} /> VAT?
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
                          <td className="p-2"><input className="border px-1 w-full" value={editProdData.name || ''} onChange={e => setEditProdData({ ...editProdData, name: e.target.value })} /></td>
                          <td className="p-2"><select className="border px-1 w-full" value={editProdData.wholesaler_id || ''} onChange={e => setEditProdData({ ...editProdData, wholesaler_id: e.target.value })}>
                            {wholesalers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select></td>
                          <td className="p-2"><input type="number" className="border px-1 w-16" value={editProdData.qty_in_box ?? ''} onChange={e => setEditProdData({ ...editProdData, qty_in_box: Number(e.target.value) })} /></td>
                          <td className="p-2"><input type="number" className="border px-1 w-20" value={editProdData.purchase_price ?? ''} onChange={e => setEditProdData({ ...editProdData, purchase_price: Number(e.target.value) })} /></td>
                          <td className="p-2 text-center"><input type="checkbox" checked={editProdData.vat_included || false} onChange={e => setEditProdData({ ...editProdData, vat_included: e.target.checked })} /></td>
                          <td className="p-2 flex gap-2"><button onClick={() => saveEditProd(p.id)}><Save className="w-4 h-4 text-green-600" /></button><button onClick={() => setEditProdId(null)}><X className="w-4 h-4 text-gray-500" /></button></td>
                        </>
                      ) : (
                        <>
                          <td className="p-2">{p.name}</td>
                          <td className="p-2">{wholesalers.find(w => w.id === p.wholesaler_id)?.name || '—'}</td>
                          <td className="p-2">{p.qty_in_box}</td>
                          <td className="p-2">£{p.purchase_price.toFixed(2)}</td>
                          <td className="p-2 text-center">{p.vat_included ? '✓' : '✗'}</td>
                          <td className="p-2 flex gap-2"><button onClick={() => startEditProd(p)}><Pencil className="w-4 h-4 text-yellow-600" /></button><button onClick={() => deleteProd(p.id)}><Trash2 className="w-4 h-4 text-red-600" /></button></td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}