// src/lib/database.ts

export interface Product {
  id: string
  name: string
  product_link: string
  qty_in_box: number
  purchase_price: number
  vat_included: boolean
  asin: string
  wholesaler_id: string
  user_id: string
  created_at: string
}

export interface Wholesaler {
  id: string
  name: string
  link: string
  user_id: string
  created_at: string
}

// This is the shape Supabase needs to know about every table in your DB
export type Database = {
  products: {
    Row:    Product
    Insert: Omit<Product, 'id' | 'created_at'>
    Update: Partial<Product>
  }
  wholesalers: {
    Row:    Wholesaler
    Insert: Omit<Wholesaler, 'id' | 'created_at'>
    Update: Partial<Wholesaler>
  }
}
