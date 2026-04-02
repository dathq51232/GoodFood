'use client'
import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Star, Clock, Bike, Plus, Minus, Info } from 'lucide-react'
import { getRestaurant, getMenuItems } from '@/lib/api/restaurants'
import { useCartStore } from '@/store/cart'
import { formatCurrency, formatTime } from '@/lib/utils'
import type { MenuItem, Restaurant } from '@/types/database'

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')

  const { items, addItem, updateQuantity, itemCount, total, restaurant: cartRestaurant, _hasHydrated } = useCartStore()

  useEffect(() => {
    Promise.all([getRestaurant(id), getMenuItems(id)])
      .then(([r, m]) => { setRestaurant(r); setMenuItems(m) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="h-56 bg-gray-200 animate-pulse" />
        <div className="px-4 pt-4 space-y-3">
          <div className="bg-white rounded-2xl h-28 animate-pulse" />
          <div className="bg-white rounded-2xl h-16 animate-pulse" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Không tìm thấy quán ăn</p>
      </div>
    )
  }

  const categories = ['all', ...Array.from(new Set(menuItems.map((m) => m.category)))]
  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((m) => m.category === activeCategory)

  const getItemQty = (itemId: string) => items.find((i) => i.menu_item.id === itemId)?.quantity || 0
  const cartTotal = _hasHydrated ? total() : 0
  const cartCount = _hasHydrated ? itemCount() : 0
  const isDifferentRestaurant = _hasHydrated && cartRestaurant && cartRestaurant.id !== restaurant.id && cartCount > 0

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Hero */}
      <div className="relative h-56 bg-gray-200">
        {restaurant.image_url && (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <Link href="/" className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow">
          <ArrowLeft size={18} />
        </Link>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Info card */}
        <div className="bg-white rounded-2xl -mt-6 relative z-10 p-4 shadow-sm border border-gray-100 mb-4">
          <h1 className="font-bold text-xl text-gray-900">{restaurant.name}</h1>
          {restaurant.description && <p className="text-sm text-gray-500 mt-1">{restaurant.description}</p>}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">{restaurant.rating}</span>
              <span className="text-xs text-gray-400">({restaurant.total_reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock size={14} />
              <span>{formatTime(restaurant.delivery_time)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Bike size={14} />
              <span>{formatCurrency(restaurant.delivery_fee)}</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            📍 {restaurant.address} · {restaurant.is_open ? `${restaurant.open_time} – ${restaurant.close_time}` : 'Đã đóng cửa'}
          </p>
        </div>

        {isDifferentRestaurant && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4 flex items-start gap-2">
            <Info size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700">Giỏ hàng đang có món từ <b>{cartRestaurant.name}</b>. Thêm món sẽ xoá giỏ hàng cũ.</p>
          </div>
        )}

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {categories.map((cat) => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 border border-gray-200'
                }`}>
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Menu */}
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">🍽️</p>
            <p>Chưa có món ăn nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={getItemQty(item.id)}
                onAdd={() => addItem(item, restaurant)}
                onDecrease={() => updateQuantity(item.id, getItemQty(item.id) - 1)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating cart */}
      {_hasHydrated && cartCount > 0 && cartRestaurant?.id === restaurant.id && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-slide-up">
          <Link href="/checkout"
            className="bg-orange-500 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg hover:bg-orange-600 transition-colors">
            <div className="flex items-center gap-3">
              <div className="bg-orange-400 rounded-xl w-8 h-8 flex items-center justify-center text-sm font-bold">{cartCount}</div>
              <span className="font-semibold">Xem giỏ hàng</span>
            </div>
            <span className="font-bold">{formatCurrency(cartTotal)}</span>
          </Link>
        </div>
      )}
    </div>
  )
}

function MenuItemCard({ item, quantity, onAdd, onDecrease }: {
  item: MenuItem; quantity: number; onAdd: () => void; onDecrease: () => void
}) {
  return (
    <div className="bg-white rounded-2xl p-3 flex gap-3 items-center border border-gray-100 shadow-sm">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div className="w-20 h-20 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0 text-3xl">🍽️</div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-gray-900">{item.name}</p>
        {item.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</p>}
        <p className="text-orange-500 font-bold text-sm mt-1">{formatCurrency(item.price)}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {quantity > 0 && (
          <>
            <button onClick={onDecrease}
              className="w-7 h-7 rounded-full border border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50">
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-bold">{quantity}</span>
          </>
        )}
        <button onClick={onAdd}
          className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}
