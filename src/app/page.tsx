'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Bell, Search, MapPin } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { RestaurantCard } from '@/components/customer/RestaurantCard'
import { getRestaurants } from '@/lib/api/restaurants'
import { CATEGORIES } from '@/lib/mock-data'
import type { Restaurant } from '@/types/database'

// ─── Icon grid categories (trang chủ chỉ hiện 5 mục đại diện + search) ───────
const ICON_CATEGORIES = [
  { id: 'Phở & Bún',     label: 'Phở/Bún', icon: '🍜' },
  { id: 'Cơm',           label: 'Cơm',      icon: '🍚' },
  { id: 'Gà & FastFood', label: 'Gà',       icon: '🍗' },
  { id: 'Trà & Đồ uống', label: 'Đồ uống',  icon: '🧋' },
]

export default function HomePage() {
  const [category, setCategory] = useState('all')
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getRestaurants(category)
      .then(setRestaurants)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <DesktopNav />

      <div className="md:pl-56">
        <main className="max-w-lg mx-auto px-4 pt-5 space-y-6">

          {/* ── Top bar ─────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-muted)' }}>
                <MapPin size={11} style={{ color: 'var(--color-gold)' }} />
                <span>Giao đến</span>
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                Đức Tài · Trà Tân · Xuân Lộc ▾
              </p>
            </div>
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <Bell size={18} style={{ color: 'var(--color-muted)' }} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: 'var(--color-gold)' }}
              />
            </button>
          </div>

          {/* ── Hero Banner ─────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1408 0%, #2d2408 50%, #1a1810 100%)',
              border: '1px solid rgba(240,180,41,0.2)',
            }}
          >
            {/* Background scooter icon */}
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 text-5xl select-none pointer-events-none"
              style={{ opacity: 0.45 }}
            >
              🛵
            </div>

            <p
              className="text-xs font-bold tracking-widest mb-2"
              style={{ color: 'var(--color-gold)', letterSpacing: '0.12em' }}
            >
              GOODFOOD · HOÀI ĐỨC EXPRESS
            </p>
            <h1 className="text-2xl font-black leading-tight mb-3" style={{ color: 'var(--color-text)' }}>
              Giao đồ ăn<br />
              <span style={{ color: 'var(--color-gold)' }}>tận nơi 🔥</span>
            </h1>

            <Link
              href="#restaurants"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-gold)', color: '#080c14' }}
            >
              Đặt ngay →
            </Link>
          </div>

          {/* ── Search bar ──────────────────────────────────────────────── */}
          <Link
            href="/search"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-opacity hover:opacity-80"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-subtle)',
            }}
          >
            <Search size={16} />
            <span>Tìm món ăn, nhà hàng...</span>
          </Link>

          {/* ── Category icon grid ──────────────────────────────────────── */}
          <div>
            <div className="grid grid-cols-5 gap-2">
              {ICON_CATEGORIES.map((cat) => {
                const active = category === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(active ? 'all' : cat.id)}
                    className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
                      style={{
                        background: active ? 'var(--color-gold)' : 'var(--color-surface)',
                        border: `1px solid ${active ? 'var(--color-gold)' : 'var(--color-border)'}`,
                        boxShadow: active ? '0 4px 16px rgba(240,180,41,0.3)' : 'none',
                      }}
                    >
                      {cat.icon}
                    </div>
                    <span
                      className="text-[10px] font-medium text-center leading-tight"
                      style={{ color: active ? 'var(--color-gold)' : 'var(--color-muted)' }}
                    >
                      {cat.label}
                    </span>
                  </button>
                )
              })}

              {/* Search / Tất cả button */}
              <button
                onClick={() => setCategory('all')}
                className="flex flex-col items-center gap-1.5 transition-transform active:scale-95"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all"
                  style={{
                    background: category === 'all' ? 'var(--color-gold)' : 'var(--color-surface)',
                    border: `1px solid ${category === 'all' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                    boxShadow: category === 'all' ? '0 4px 16px rgba(240,180,41,0.3)' : 'none',
                  }}
                >
                  🍽️
                </div>
                <span
                  className="text-[10px] font-medium"
                  style={{ color: category === 'all' ? 'var(--color-gold)' : 'var(--color-muted)' }}
                >
                  Tất cả
                </span>
              </button>
            </div>
          </div>

          {/* ── Restaurant horizontal scroll ────────────────────────────── */}
          <section id="restaurants">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                {category === 'all' ? 'Gần bạn nhất' : category}
              </h2>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                {restaurants.length} quán
              </span>
            </div>

            {loading ? (
              /* Skeleton shimmer */
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 w-44 h-52 rounded-2xl animate-shimmer"
                    style={{ minWidth: '176px' }}
                  />
                ))}
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-12" style={{ color: 'var(--color-muted)' }}>
                <p className="text-4xl mb-2">🍽️</p>
                <p className="text-sm">Không có quán nào trong danh mục này</p>
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-2">
                {restaurants.map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} />
                ))}
              </div>
            )}
          </section>

          {/* ── Quick delivery link ─────────────────────────────────────── */}
          <Link
            href="/delivery"
            className="flex items-center gap-4 p-4 rounded-2xl transition-opacity hover:opacity-80"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ background: 'rgba(240,180,41,0.15)' }}
            >
              📦
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                Giao hàng hỏa tốc
              </p>
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Gửi bưu kiện · Đức Tài · Trà Tân · Xuân Lộc · Lâm Đồng
              </p>
            </div>
            <span className="ml-auto text-lg" style={{ color: 'var(--color-gold)' }}>›</span>
          </Link>

        </main>
      </div>

      <BottomNav />
    </div>
  )
}
