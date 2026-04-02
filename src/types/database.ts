export type UserRole = 'customer' | 'driver' | 'restaurant' | 'admin'
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picking_up' | 'delivering' | 'delivered' | 'cancelled'
export type DeliveryType = 'food' | 'package'

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
  delivery_time: number // minutes
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
  items?: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  delivery_address: string
  delivery_lat: number
  delivery_lng: number
  pickup_address?: string
  pickup_lat?: number
  pickup_lng?: number
  note?: string
  estimated_delivery?: string
  created_at: string
  updated_at: string
  // joins
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
  menu_item?: MenuItem
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
}

export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: Omit<User, 'created_at'>; Update: Partial<User> }
      restaurants: { Row: Restaurant; Insert: Omit<Restaurant, 'id' | 'created_at' | 'rating' | 'total_reviews'>; Update: Partial<Restaurant> }
      menu_items: { Row: MenuItem; Insert: Omit<MenuItem, 'id' | 'created_at'>; Update: Partial<MenuItem> }
      orders: { Row: Order; Insert: Omit<Order, 'id' | 'code' | 'created_at' | 'updated_at'>; Update: Partial<Order> }
      order_items: { Row: OrderItem; Insert: Omit<OrderItem, 'id'>; Update: Partial<OrderItem> }
    }
  }
}
