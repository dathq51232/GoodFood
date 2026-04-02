import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, MenuItem, Restaurant } from '@/types/database'

interface CartStore {
  items: CartItem[]
  restaurant: Restaurant | null
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  addItem: (item: MenuItem, restaurant: Restaurant) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  total: () => number
  itemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      restaurant: null,
      _hasHydrated: false,

      setHasHydrated: (v) => set({ _hasHydrated: v }),

      addItem: (item, restaurant) => {
        const { items, restaurant: currentRestaurant } = get()

        if (currentRestaurant && currentRestaurant.id !== restaurant.id) {
          set({ items: [{ menu_item: item, quantity: 1 }], restaurant })
          return
        }

        const existing = items.find((i) => i.menu_item.id === item.id)
        if (existing) {
          set({
            items: items.map((i) =>
              i.menu_item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          })
        } else {
          set({ items: [...items, { menu_item: item, quantity: 1 }], restaurant })
        }
      },

      removeItem: (itemId) => {
        const items = get().items.filter((i) => i.menu_item.id !== itemId)
        set({ items, restaurant: items.length === 0 ? null : get().restaurant })
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.menu_item.id === itemId ? { ...i, quantity } : i
          ),
        })
      },

      clearCart: () => set({ items: [], restaurant: null }),

      total: () =>
        get().items.reduce((sum, i) => sum + i.menu_item.price * i.quantity, 0),

      itemCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'hd-cart',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
