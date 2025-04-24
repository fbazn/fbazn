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

interface SourcingProduct {
  id: string
  wholesaler_id: string
  name: string
  box_price: number
  items_in_box: number
  wholesale_price: number
  asin: string
  sell_price: number
  amazon_fees: number
}

interface HubMetric {
  title: string
  subtitle: string
  colorClass: string
  metrics: Record<string, string>
}

// Initial fake data
const initialWholesalers: Wholesaler[] = [
  { id: 'w1', name: 'Wholesaler A', link: '', created_at: '' },
  { id: 'w2', name: 'Wholesaler B', link: '', created_at: '' }
]
const initialProducts: Product[] = [
  { id: 'p1', name: 'Prod A', product_link: '', qty_in_box: 10, purchase_price:5, vat_included:false, asin:'ASIN1', wholesaler_id:'w1', created_at:'2025-04-20' },
  { id: 'p2', name: 'Prod B', product_link: '', qty_in_box: 20, purchase_price:8, vat_included:true, asin:'ASIN2', wholesaler_id:'w2', created_at:'2025-04-21' }
]
const initialSourcing: SourcingProduct[] = []

export default function DemoDashboard() {
  const [view, setView] = useState<'hub'|'recent'|'wholesalers'|'products'|'sourcing'>('hub')

  // Data state
  const [wholesalers, setWholesalers] = useState(initialWholesalers)
  const [products, setProducts] = useState(initialProducts)
  const [sourcing, setSourcing] = useState<SourcingProduct[]>(initialSourcing)

  // CRUD form state for wholesalers
  const [newWhName, setNewWhName] = useState('')
  const [newWhLink, setNewWhLink] = useState('')
  const [editWhId, setEditWhId] = useState<string|null>(null)
  const [editWhName, setEditWhName] = useState('')
  const [editWhLink, setEditWhLink] = useState('')

  // CRUD form state for products
  const [newProd, setNewProd] = useState<Omit<Product,'id'|'created_at'>>({
    name:'', product_link:'', qty_in_box:0, purchase_price:0, vat_included:false, asin:'', wholesaler_id:''
  })
  const [editProdId, setEditProdId] = useState<string|null>(null)
  const [editProdData, setEditProdData] = useState<Partial<Product>>({})

  // Sourcing form state
  const [activeTab, setActiveTab] = useState<string>('all')
  const [newSource, setNewSource] = useState<Omit<SourcingProduct,'id'>>({
    wholesaler_id:'all', name:'', box_price:0, items_in_box:0,
    wholesale_price:0, asin:'', sell_price:0, amazon_fees:0
  })

  // Derived lists
  const recentProducts = useMemo(
    () => [...products].sort((a,b)=>b.created_at.localeCompare(a.created_at)).slice(0,5),
    [products]
  )
  const filteredSourcing = activeTab==='all'
    ? sourcing
    : sourcing.filter(s=>s.wholesaler_id===activeTab)

  // Hub metrics stub
  const hubCards: HubMetric[] = [
    { title:'Today', subtitle:'Apr 24, 2025', colorClass:'bg-blue-500', metrics:{ sales:'£1,200', ordersUnits:'30/32', refunds:'2', advCost:'-£50', estPayout:'£900', grossProfit:'£300', netProfit:'£250'}},
    { title:'Yesterday', subtitle:'Apr 23, 2025', colorClass:'bg-teal-500', metrics:{ sales:'£950', ordersUnits:'25/28', refunds:'1', advCost:'-£40', estPayout:'£720', grossProfit:'£230', netProfit:'£190'}},
    { title:'MTD', subtitle:'Apr 1–24,2025', colorClass:'bg-green-500', metrics:{ sales:'£18,500', ordersUnits:'520/540', refunds:'10', advCost:'-£600', estPayout:'£13,000', grossProfit:'£5,000', netProfit:'£4,400'}},
    { title:'Forecast', subtitle:'Apr 1–30,2025', colorClass:'bg-cyan-500', metrics:{ sales:'£25,000', ordersUnits:'700/740', refunds:'15', advCost:'-£800', estPayout:'£17,000', grossProfit:'£8,000', netProfit:'£7,200'}}
  ]

  // CRUD handlers
  const addWholesaler = (e:React.FormEvent)=>{e.preventDefault();const w={id:`w${Date.now()}`,name:newWhName,link:newWhLink,created_at:new Date().toISOString()};setWholesalers(prev=>[...prev,w]);setNewWhName('');setNewWhLink('')}
  const startEditWh = (w:Wholesaler)=>{setEditWhId(w.id);setEditWhName(w.name);setEditWhLink(w.link)}
  const saveEditWh = (id:string)=>{setWholesalers(prev=>prev.map(w=>w.id===id?{...w,name:editWhName,link:editWhLink}:w));setEditWhId(null)}
  const deleteWholesaler = (id:string)=>setWholesalers(prev=>prev.filter(w=>w.id!==id))

  const addProduct = (e:React.FormEvent)=>{e.preventDefault();const p={id:`p${Date.now()}`,created_at:new Date().toISOString(),...newProd} as Product;setProducts(prev=>[...prev,p]);setNewProd({name:'',product_link:'',qty_in_box:0,purchase_price:0,vat_included:false,asin:'',wholesaler_id:''})}
  const startEditProd = (p:Product)=>{setEditProdId(p.id);setEditProdData(p)}
  const saveEditProd = (id:string)=>{setProducts(prev=>prev.map(p=>p.id===id?{...p,...(editProdData as Product)}:p));setEditProdId(null)}
  const deleteProduct = (id:string)=>setProducts(prev=>prev.filter(p=>p.id!==id))

  const addSource = (e:React.FormEvent)=>{e.preventDefault();const s={id:`s${Date.now()}`,...newSource} as SourcingProduct;setSourcing(prev=>[...prev,s]);setNewSource({wholesaler_id:'all',name:'',box_price:0,items_in_box:0,wholesale_price:0,asin:'',sell_price:0,amazon_fees:0})}

  return (
    <div className="flex h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-2">
        <button onClick={()=>setView('hub')} className="w-full text-left px-2 py-1 hover:bg-gray-700">Hub</button>
        <button onClick={()=>setView('recent')} className="w-full text-left px-2 py-1 hover:bg-gray-700">Recent</button>
        <button onClick={()=>setView('wholesalers')} className="w-full text-left px-2 py-1 hover:bg-gray-700">Wholesalers</button>
        <button onClick={()=>setView('products')} className="w-full text-left px-2 py-1 hover:bg-gray-700">Products</button>
        <button onClick={()=>setView('sourcing')} className="w-full text-left px-2 py-1 hover:bg-gray-700">Sourcing</button>
      </aside>
      <main className="flex-1 overflow-auto p-6 bg-gray-100">
        {view==='hub'&&(
          <section>
            <h1 className="text-3xl font-bold mb-6">Hub</h1>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {hubCards.map(c=>(<div key={c.title} className="bg-white shadow rounded overflow-hidden">
                <div className={`${c.colorClass} p-4 text-white`}><h3 className="text-lg">{c.title}</h3><p className="text-sm">{c.subtitle}</p></div>
                <div className="p-4 space-y-1 text-sm bg-gray-50">{Object.entries(c.metrics).map(([k,v])=>(<div key={k}><strong>{k.replace(/([A-Z])/g,' $1')}:</strong> {v}</div>))}</div>
              </div>))}
            </div>
          </section>
        )}
        {view==='recent'&&(
          <section>
            <h2 className="text-2xl font-bold mb-4">Recent Products</h2>
            <table className="w-full bg-white shadow rounded text-sm">
              <thead><tr className="bg-gray-100"><th className="p-2">Name</th><th>Qty</th><th>Price</th><th>ASIN</th></tr></thead>
              <tbody>{recentProducts.map(p=>(<tr key={p.id} className="border-t"><td className="p-2">{p.name}</td><td>{p.qty_in_box}</td><td>£{p.purchase_price.toFixed(2)}</td><td>{p.asin}</td></tr>))}</tbody>
            </table>
          </section>
        )}
        {view==='wholesalers'&&(
          <section>
            <h2 className="text-2xl font-bold mb-4">Wholesalers</h2>
            <form onSubmit={addWholesaler} className="flex gap-2 mb-4">
              <input className="flex-1 border px-2 py-1" placeholder="Name" value={newWhName} onChange={e=>setNewWhName(e.target.value)}/>
              <input className="flex-1 border px-2 py-1" placeholder="Link" value={newWhLink} onChange={e=>setNewWhLink(e.target.value)}/>
              <button type="submit" className="text-green-600"><PlusCircle/></button>
            </form>
            <table className="w-full bg-white shadow rounded text-sm">
              <thead><tr className="bg-gray-100"><th>Name</th><th>Link</th><th>Actions</th></tr></thead>
              <tbody>{wholesalers.map(w=>(<tr key={w.id} className="border-t">{editWhId===w.id?(<><td><input className="border px-1 w-full" value={editWhName} onChange={e=>setEditWhName(e.target.value)}/></td><td><input className="border px-1 w-full" value={editWhLink} onChange={e=>setEditWhLink(e.target.value)}/></td><td className="flex gap-2"><button onClick={()=>saveEditWh(w.id)}><Save/></button><button onClick={()=>setEditWhId(null)}><X/></button></td></>):(<><td>{w.name}</td><td>{w.link}</td><td className="flex gap-2"><button onClick={()=>startEditWh(w)}><Pencil/></button><button onClick={()=>deleteWholesaler(w.id)}><Trash2/></button></td></>)}</tr>))}</tbody>
            </table>
          </section>
        )}
        {view==='products'&&(
          <section>
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            <form onSubmit={addProduct} className="space-y-2 mb-4">
              <input className="w-full border px-2 py-1" placeholder="Name" value={newProd.name} onChange={e=>setNewProd({...newProd,name:e.target.value})}/>
              <div className="flex gap-2"><input className="flex-1 border px-2 py-1" placeholder="Link" value={newProd.product_link} onChange={e=>setNewProd({...newProd,product_link:e.target.value})}/><input type="number" className="w-24 border px-2 py-1" placeholder="Qty" value={newProd.qty_in_box} onChange={e=>setNewProd({...newProd,qty_in_box:Number(e.target.value)})}/><input type="number" className="w-24 border px-2 py-1" placeholder="Price" value={newProd.purchase_price} onChange={e=>setNewProd({...newProd,purchase_price:Number(e.target.value)})}/></div>
              <div className="flex gap-2 items-center"><input className="border px-2 py-1" placeholder="ASIN" value={newProd.asin} onChange={e=>setNewProd({...newProd,asin:e.target.value})}/><select className="border px-2 py-1" value={newProd.wholesaler_id} onChange={e=>setNewProd({...newProd,wholesaler_id:e.target.value})}><option value="" disabled>Select Wh</option>{wholesalers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select><label className="flex items-center gap-1"><input type="checkbox" checked={newProd.vat_included} onChange={e=>setNewProd({...newProd,vat_included:e.target.checked})}/> VAT</label><button type="submit" className="text-green-600"><PlusCircle/></button></div>
            </form>
            <table className="w-full bg-white shadow rounded text-sm">
              <thead><tr className="bg-gray-100"><th>Name</th><th>Wholesaler</th><th>Qty</th><th>Price</th><th>VAT</th><th>Actions</th></tr></thead>
              <tbody>{products.map(p=>(<tr key={p.id} className="border-t">{editProdId===p.id?(<><td><input className="border px-1 w-full" value={editProdData.name||''} onChange={e=>setEditProdData({...editProdData,name:e.target.value})}/></td><td><select className="border px-1" value={editProdData.wholesaler_id||''} onChange={e=>setEditProdData({...editProdData,wholesaler_id:e.target.value})}>{wholesalers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></td><td><input type="number" className="border px-1 w-16" value={editProdData.qty_in_box||''} onChange={e=>setEditProdData({...editProdData,qty_in_box:Number(e.target.value)})}/></td><td><input type="number" className="border px-1 w-20" value={editProdData.purchase_price||''} onChange={e=>setEditProdData({...editProdData,purchase_price:Number(e.target.value)})}/></td><td><input type="checkbox" checked={editProdData.vat_included||false} onChange={e=>setEditProdData({...editProdData,vat_included:e.target.checked})}/></td><td className="flex gap-2"><button onClick={()=>saveEditProd(p.id)}><Save/></button><button onClick={()=>setEditProdId(null)}><X/></button></td></>):(<><td>{p.name}</td><td>{wholesalers.find(w=>w.id===p.wholesaler_id)?.name||'—'}</td><td>{p.qty_in_box}</td><td>£{p.purchase_price.toFixed(2)}</td><td className="text-center">{p.vat_included?'✓':'✗'}</td><td className="flex gap-2"><button onClick={()=>startEditProd(p)}><Pencil/></button><button onClick={()=>deleteProduct(p.id)}><Trash2/></button></td></>)}</tr>))}</tbody>
            </table>
          </section>
        )}
        {view==='sourcing'&&(
          <section>
            <h2 className="text-2xl font-bold mb-4">Product Sourcing</h2>
            <div className="flex space-x-2 mb-4">{['all',...wholesalers.map(w=>w.id)].map(tab=><button key={tab} onClick={()=>setActiveTab(tab)} className="px-3 py-1 bg-white shadow rounded">{tab==='all'?'All':wholesalers.find(w=>w.id===tab)?.name}</button>)}</div>
            <form onSubmit={addSource} className="grid grid-cols-2 gap-4 mb-6">
              <select value={newSource.wholesaler_id} onChange={e=>setNewSource({...newSource,wholesaler_id:e.target.value})}><option value="all">All</option>{wholesalers.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select>
              <input placeholder="Product Name" value={newSource.name} onChange={e=>setNewSource({...newSource,name:e.target.value})}/>
              <input type="number" placeholder="Box Price" value={newSource.box_price} onChange={e=>setNewSource({...newSource,box_price:+e.target.value})}/>
              <input type="number" placeholder="Items In Box" value={newSource.items_in_box} onChange={e=>setNewSource({...newSource,items_in_box:+e.target.value})}/>
              <input type="number" placeholder="Wholesale Price" value={newSource.wholesale_price} onChange={e=>setNewSource({...newSource,wholesale_price:+e.target.value})}/>
              <input placeholder="ASIN" value={newSource.asin} onChange={e=>setNewSource({...newSource,asin:e.target.value})}/>
              <input type="number" placeholder="Sell Price" value={newSource.sell_price} onChange={e=>setNewSource({...newSource,sell_price:+e.target.value})}/>
              <input type="number" placeholder="Amazon Fees" value={newSource.amazon_fees} onChange={e=>setNewSource({...newSource,amazon_fees:+e.target.value})}/>
              <button type="submit" className="col-span-2 px-4 py-2 bg-green-600 text-white rounded">Add</button>
            </form>
            <table className="w-full bg-white shadow rounded text-sm">
              <thead><tr className="bg-gray-100"><th>Name</th><th>BoxPrice</th><th>Qty</th><th>Wholesale</th><th>Sell</th><th>Fees</th><th>Profit</th><th>ROI</th></tr></thead>
              <tbody>{filteredSourcing.map(s=>(<tr key={s.id} className="border-t"><td className="p-2">{s.name}</td><td>£{s.box_price.toFixed(2)}</td><td>{s.items_in_box}</td><td>£{s.wholesale_price.toFixed(2)}</td><td>£{s.sell_price.toFixed(2)}</td><td>£{s.amazon_fees.toFixed(2)}</td><td>£{(s.sell_price-s.wholesale_price-s.amazon_fees).toFixed(2)}</td><td>{((s.sell_price-s.wholesale_price-s.amazon_fees)/s.wholesale_price*100).toFixed(1)}%</td></tr>))}</tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  )
}
