import { createClient } from '@/lib/supabase/client'
import type { Restaurant, MenuItem } from '@/types/database'

export async function getRestaurants(category?: string): Promise<Restaurant[]> {
  const supabase = createClient()
  let query = supabase
    .from('restaurants')
    .select('*')
    .order('rating', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Restaurant[]
}

export async function getRestaurant(id: string): Promise<Restaurant | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Restaurant
}

export async function getMenuItems(restaurantId: string): Promise<MenuItem[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_available', true)
    .order('sort_order')

  if (error) throw error
  return data as MenuItem[]
}
