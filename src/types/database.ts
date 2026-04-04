// ─── Enums / Union types ──────────────────────────────────────────────────────
export type UserRole     = 'customer' | 'driver' | 'restaurant' | 'admin'
export type OrderStatus  = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picking_up' | 'delivering' | 'delivered' | 'cancelled'
export type DeliveryType = 'food' | 'package'
export type PayMethod    = 'cash' | 'transfer'

// ─── Domain interfaces (used in app code) ────────────────────────────────────
export interface User {
  id: string
  phone: string
  name: string
  email?: string
  role: UserRole
  avatar_url?: string
  address?: string
  lat?: number
  lng?: number
  is_active?: boolean
  created_at: string
}

export interface Restaurant {
  id: string
  owner_id: string
  name: string
  description?: string
  address: string
  lat: number
  lng: number
  phone: string
  image_url?: string
  category: string
  rating: number
  total_reviews: number
  delivery_time: number
  delivery_fee: number
  min_order: number
  is_open: boolean
  open_time: string
  close_time: string
  created_at: string
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description?: string
  price: number
  image_url?: string
  category: string
  is_available: boolean
  sort_order?: number
  created_at: string
}

export interface Order {
  id: string
  code: string
  customer_id: string
  driver_id?: string
  restaurant_id?: string
  delivery_type: DeliveryType
  status: OrderStatus
  pay_method?: PayMethod
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address: string
  delivery_lat?: number
  delivery_lng?: number
  pickup_address?: string
  pickup_lat?: number
  pickup_lng?: number
  note?: string
  estimated_delivery?: string
  created_at: string
  updated_at?: string
  // joins (không có trong DB, chỉ dùng trong app)
  items?: OrderItem[]
  customer?: User
  driver?: User
  restaurant?: Restaurant
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  name: string
  price: number
  quantity: number
  // join
  menu_item?: MenuItem
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
}

// ─── Supabase Database type ───────────────────────────────────────────────────
// Generated from actual DB schema (cxbptnwnlfdaokbyahyy.supabase.co)
// Format phải khớp với GenericSchema của @supabase/supabase-js v2:
//   Tables[name] = { Row, Insert, Update, Relationships }
//   Views / Functions = { [_ in never]: never }   (empty object, NOT Record<string,never>)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          phone: string | null
          name: string | null
          email: string | null
          role: string | null
          avatar_url: string | null
          address: string | null
          lat: number | null
          lng: number | null
          is_active: boolean | null
          created_at: string | null
        }
        Insert: {
          id: string
          phone?: string | null
          name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          is_active?: boolean | null
          created_at?: string | null
        }
        Update: {
          phone?: string | null
          name?: string | null
          email?: string | null
          role?: string | null
          avatar_url?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string | null
          name: string | null
          description: string | null
          address: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          image_url: string | null
          category: string | null
          rating: number | null
          total_reviews: number | null
          delivery_time: number | null
          delivery_fee: number | null
          min_order: number | null
          is_open: boolean | null
          open_time: string | null
          close_time: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          owner_id?: string | null
          name?: string | null
          description?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          image_url?: string | null
          category?: string | null
          rating?: number | null
          total_reviews?: number | null
          delivery_time?: number | null
          delivery_fee?: number | null
          min_order?: number | null
          is_open?: boolean | null
          open_time?: string | null
          close_time?: string | null
          created_at?: string | null
        }
        Update: {
          owner_id?: string | null
          name?: string | null
          description?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          image_url?: string | null
          category?: string | null
          rating?: number | null
          total_reviews?: number | null
          delivery_time?: number | null
          delivery_fee?: number | null
          min_order?: number | null
          is_open?: boolean | null
          open_time?: string | null
          close_time?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string | null
          name: string | null
          description: string | null
          price: number | null
          image_url: string | null
          category: string | null
          is_available: boolean | null
          sort_order: number | null
          created_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id?: string | null
          name?: string | null
          description?: string | null
          price?: number | null
          image_url?: string | null
          category?: string | null
          is_available?: boolean | null
          sort_order?: number | null
          created_at?: string | null
        }
        Update: {
          restaurant_id?: string | null
          name?: string | null
          description?: string | null
          price?: number | null
          image_url?: string | null
          category?: string | null
          is_available?: boolean | null
          sort_order?: number | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          code: string | null
          customer_id: string | null
          driver_id: string | null
          restaurant_id: string | null
          delivery_type: string | null
          status: string | null
          pay_method: string | null
          subtotal: number | null
          delivery_fee: number | null
          total: number | null
          delivery_address: string | null
          delivery_lat: number | null
          delivery_lng: number | null
          pickup_address: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          note: string | null
          estimated_delivery: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          code?: string | null
          customer_id?: string | null
          driver_id?: string | null
          restaurant_id?: string | null
          delivery_type?: string | null
          status?: string | null
          pay_method?: string | null
          subtotal?: number | null
          delivery_fee?: number | null
          total?: number | null
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          note?: string | null
          estimated_delivery?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          customer_id?: string | null
          driver_id?: string | null
          restaurant_id?: string | null
          delivery_type?: string | null
          status?: string | null
          pay_method?: string | null
          subtotal?: number | null
          delivery_fee?: number | null
          total?: number | null
          delivery_address?: string | null
          delivery_lat?: number | null
          delivery_lng?: number | null
          pickup_address?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          note?: string | null
          estimated_delivery?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string | null
          menu_item_id: string | null
          name: string | null
          price: number | null
          quantity: number | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          menu_item_id?: string | null
          name?: string | null
          price?: number | null
          quantity?: number | null
        }
        Update: {
          order_id?: string | null
          menu_item_id?: string | null
          name?: string | null
          price?: number | null
          quantity?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          order_id: string | null
          customer_id: string | null
          restaurant_id: string | null
          driver_id: string | null
          restaurant_rating: number | null
          driver_rating: number | null
          comment: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          order_id?: string | null
          customer_id?: string | null
          restaurant_id?: string | null
          driver_id?: string | null
          restaurant_rating?: number | null
          driver_rating?: number | null
          comment?: string | null
          created_at?: string | null
        }
        Update: {
          restaurant_rating?: number | null
          driver_rating?: number | null
          comment?: string | null
        }
        Relationships: []
      }
    }
    Views:     { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums:     { [_ in never]: never }
  }
}
