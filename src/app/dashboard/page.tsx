// src/app/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import type { Database } from '../lib/database'

type ProductRow = Database['products']['Row']

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string|null>(null)

  const [counts, setCounts] = useState({
    products: 0,
    wholesalers: 0,
    inventoryValue: 0,
  })

  const [recentProducts, setRecentProducts] = useState<ProductRow[]>([])

  // 1) Auth check + redirect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/')
      } else {
        setUserEmail(session.user.email)
      }
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace('/')
      } else {
        setUserEmail(session.user.email)
      }
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [router])

  // 2) Fetch metrics once we have user
  useEffect(() => {
    if (!userEmail) return

    const uid = supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return

      // Total counts
      Promise.all([
        supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('wholesalers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('products')
          .select('purchase_price, qty_in_box')
          .eq('user_id', user.id),
        supabase
          .from('products')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ]).then(([prodCnt, whCnt, invRows, recent]) => {
        setCounts({
          products: prodCnt.count ?? 0,
          wholesalers: whCnt.count ?? 0,
          inventoryValue: (invRows.data ?? []).reduce(
            (sum, r) => sum + r.purchase_price * r.qty_in_box,
            0
          ),
        })
        setRecentProducts(recent.data ?? [])
      })
    })
  }, [userEmail])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading…</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Total Products</p>
          <p className="text-2xl font-semibold">{counts.products}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Total Wholesalers</p>
          <p className="text-2xl font-semibold">{counts.wholesalers}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <p className="text-sm uppercase text-gray-500">Inventory Value</p>
          <p className="text-2xl font-semibold">
            £{counts.inventoryValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Recent products */}
      <div className="bg-white shadow rounded p-4">
        <h2 className="text-xl font-bold mb-2">Recent Products</h2>
        {recentProducts.length === 0 ? (
          <p className="text-gray-600">No products yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Name</th>
                <th className="p-2">Qty/Box</th>
                <th className="p-2">Price</th>
                <th className="p-2">ASIN</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
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
    </div>
  )
}
