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
      <div className="min-h-screen" style={{ background: 'var(--color-bg)' }}>
        <div className="h-52 animate-shimmer" />
        <div className="px-4 pt-4 space-y-3">
          <div className="h-28 rounded-2xl animate-shimmer" />
          <div className="h-16 rounded-2xl animate-shimmer" />
          <div className="h-16 rounded-2xl animate-shimmer" />
        </div>
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
        <p style={{ color: 'var(--color-muted)' }}>Không tìm thấy quán ăn</p>
      </div>
    )
  }

  const categories = ['all', ...Array.from(new Set(menuItems.map((m) => m.category)))]
  const filtered = activeCategory === 'all' ? menuItems : menuItems.filter((m) => m.category === activeCategory)

  const getItemQty = (itemId: string) => items.find((i) => i.menu_item.id === itemId)?.quantity || 0
  const cartTotal = _hasHydrated ? total() : 0
  const cartCount = _hasHydrated ? itemCount() : 0
  const isDifferentRestaurant = _hasHydrated && cartRestaurant && cartRestaurant.id !== restaurant.id && cartCount > 0

  // Món đầu tiên (bán chạy / featured)
  const featuredItem = filtered[0]
  const restItems = filtered.slice(1)

  return (
    <div className="min-h-screen pb-36" style={{ background: 'var(--color-bg)' }}>

      {/* ── Hero image ──────────────────────────────────────────────────── */}
      <div className="relative h-52 overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
        {restaurant.image_url && (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        )}
        {/* Gradient fade bottom */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(15,15,19,0.3) 0%, rgba(15,15,19,0.85) 100%)' }}
        />

        {/* Back button */}
        <Link
          href="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(15,15,19,0.7)', border: '1px solid var(--color-border)' }}
        >
          <ArrowLeft size={18} color="white" />
        </Link>

        {/* Restaurant name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: restaurant.is_open ? 'rgba(212,168,67,0.2)' : 'rgba(255,255,255,0.1)',
                color: restaurant.is_open ? 'var(--color-gold)' : 'var(--color-muted)',
                border: `1px solid ${restaurant.is_open ? 'rgba(212,168,67,0.4)' : 'var(--color-border)'}`,
              }}
            >
              {restaurant.is_open ? `● Đang mở · ${restaurant.open_time}–${restaurant.close_time}` : '● Đã đóng cửa'}
            </span>
          </div>
          <h1 className="text-xl font-black text-white">{restaurant.name}</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">

        {/* ── Info strip ────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-4 p-3 rounded-2xl mt-3 mb-3"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center gap-1.5">
            <Star size={14} style={{ color: 'var(--color-gold)' }} fill="var(--color-gold)" />
            <span className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>{restaurant.rating}</span>
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>({restaurant.total_reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Clock size={13} />
            <span>{formatTime(restaurant.delivery_time)}</span>
          </div>
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
            <Bike size={13} />
            <span>{formatCurrency(restaurant.delivery_fee)}</span>
          </div>
          <div className="ml-auto text-xs" style={{ color: 'var(--color-subtle)' }}>
            Tối thiểu {formatCurrency(restaurant.min_order)}
          </div>
        </div>

        {/* ── Different restaurant warning ───────────────────────────────── */}
        {isDifferentRestaurant && (
          <div
            className="flex items-start gap-2 p-3 rounded-xl mb-3 text-xs"
            style={{ background: 'rgba(212,168,67,0.1)', border: '1px solid rgba(212,168,67,0.3)', color: 'var(--color-gold)' }}
          >
            <Info size={14} className="flex-shrink-0 mt-0.5" />
            <p>Giỏ hàng đang có món từ <b>{cartRestaurant.name}</b>. Thêm món sẽ xoá giỏ hàng cũ.</p>
          </div>
        )}

        {/* ── Category pills ─────────────────────────────────────────────── */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: activeCategory === cat ? 'var(--color-gold)' : 'var(--color-surface)',
                  color: activeCategory === cat ? '#0f0f13' : 'var(--color-muted)',
                  border: `1px solid ${activeCategory === cat ? 'var(--color-gold)' : 'var(--color-border)'}`,
                }}
              >
                {cat === 'all' ? 'Tất cả' : cat}
              </button>
            ))}
          </div>
        )}

        {/* ── Menu items ─────────────────────────────────────────────────── */}
        {filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>
            <p className="text-4xl mb-2">🍽️</p>
            <p className="text-sm">Chưa có món ăn nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Featured card — món đầu tiên / bán chạy */}
            {featuredItem && (
              <FeaturedMenuItemCard
                item={featuredItem}
                quantity={getItemQty(featuredItem.id)}
                onAdd={() => addItem(featuredItem, restaurant)}
                onDecrease={() => updateQuantity(featuredItem.id, getItemQty(featuredItem.id) - 1)}
              />
            )}

            {/* Remaining items — compact list */}
            {restItems.map((item) => (
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

      {/* ── Sticky cart bar ────────────────────────────────────────────── */}
      {_hasHydrated && cartCount > 0 && cartRestaurant?.id === restaurant.id && (
        <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto z-50 animate-slide-up">
          <Link
            href="/checkout"
            className="flex items-center justify-between p-4 rounded-2xl transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, var(--color-gold-dark), var(--color-gold))',
              boxShadow: '0 8px 24px rgba(212,168,67,0.4)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                style={{ background: 'rgba(0,0,0,0.2)', color: '#fff' }}
              >
                {cartCount}
              </div>
              <span className="font-bold text-sm" style={{ color: '#0f0f13' }}>Xem giỏ hàng</span>
            </div>
            <span className="font-black text-sm" style={{ color: '#0f0f13' }}>
              {formatCurrency(cartTotal)} →
            </span>
          </Link>
        </div>
      )}
    </div>
  )
}

// ─── Featured (large) menu item card ────────────────────────────────────────
function FeaturedMenuItemCard({ item, quantity, onAdd, onDecrease }: {
  item: MenuItem; quantity: number; onAdd: () => void; onDecrease: () => void
}) {
  return (
    <div
      className="rounded-2xl p-4 flex gap-3 items-center"
      style={{
        background: 'linear-gradient(135deg, var(--color-surface) 0%, var(--color-surface-2) 100%)',
        border: '1px solid rgba(212,168,67,0.25)',
      }}
    >
      {/* Image */}
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 text-4xl"
          style={{ background: 'var(--color-surface-2)' }}
        >
          🍽️
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Badge */}
        <span
          className="inline-block text-[9px] font-black px-2 py-0.5 rounded-full mb-2"
          style={{ background: 'var(--color-gold)', color: '#0f0f13', letterSpacing: '0.05em' }}
        >
          BÁN CHẠY
        </span>
        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{item.name}</p>
        {item.description && (
          <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--color-muted)' }}>
            {item.description}
          </p>
        )}
        <p className="font-black text-base mt-2" style={{ color: 'var(--color-gold)' }}>
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {quantity > 0 && (
          <>
            <button
              onClick={onDecrease}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            >
              <Minus size={14} />
            </button>
            <span className="w-5 text-center text-sm font-bold" style={{ color: 'var(--color-text)' }}>
              {quantity}
            </span>
          </>
        )}
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-gold)', color: '#0f0f13' }}
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  )
}

// ─── Regular (compact) menu item card ───────────────────────────────────────
function MenuItemCard({ item, quantity, onAdd, onDecrease }: {
  item: MenuItem; quantity: number; onAdd: () => void; onDecrease: () => void
}) {
  return (
    <div
      className="rounded-xl p-3 flex gap-3 items-center"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Small image */}
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
      ) : (
        <div
          className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: 'var(--color-surface-2)' }}
        >
          🍽️
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{item.name}</p>
        {item.description && (
          <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--color-muted)' }}>
            {item.description}
          </p>
        )}
        <p className="font-bold text-sm mt-1" style={{ color: 'var(--color-gold)' }}>
          {formatCurrency(item.price)}
        </p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {quantity > 0 && (
          <>
            <button
              onClick={onDecrease}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
            >
              <Minus size={12} />
            </button>
            <span className="w-4 text-center text-xs font-bold" style={{ color: 'var(--color-text)' }}>
              {quantity}
            </span>
          </>
        )}
        <button
          onClick={onAdd}
          className="w-7 h-7 rounded-lg flex items-center justify-center transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-gold)', color: '#0f0f13' }}
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}
