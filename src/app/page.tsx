'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Package } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { RestaurantCard } from '@/components/customer/RestaurantCard'
import { CategoryFilter } from '@/components/customer/CategoryFilter'
import { getRestaurants } from '@/lib/api/restaurants'
import type { Restaurant } from '@/types/database'

const ServiceAreaMap = dynamic(
  () => import('@/components/map/ServiceAreaMap').then((m) => m.ServiceAreaMap),
  { ssr: false, loading: () => <div className="h-44 rounded-2xl bg-gray-100 animate-pulse" /> }
)

const BANNERS = [
  { id: 1, title: 'Miễn phí giao hàng', subtitle: 'Đơn đầu tiên của bạn', bg: 'from-orange-500 to-red-500', icon: '🎉' },
  { id: 2, title: 'Giao hàng nhanh', subtitle: 'Trong vòng 30 phút', bg: 'from-green-500 to-teal-500', icon: '⚡' },
  { id: 3, title: 'Đức Tài đến ngã ba Ông Đồn', subtitle: 'Phục vụ tận nơi', bg: 'from-blue-500 to-purple-500', icon: '📍' },
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <DesktopNav />
      <div className="md:pl-56">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pt-4 space-y-5">
        {/* Banner carousel */}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4">
          {BANNERS.map((b) => (
            <div
              key={b.id}
              className={`flex-shrink-0 w-72 bg-gradient-to-r ${b.bg} rounded-2xl p-4 text-white flex items-center justify-between`}
            >
              <div>
                <p className="font-bold text-base">{b.title}</p>
                <p className="text-sm opacity-90 mt-0.5">{b.subtitle}</p>
              </div>
              <span className="text-4xl">{b.icon}</span>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">🍜</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Đặt đồ ăn</p>
              <p className="text-xs text-gray-500">Giao trong 30 phút</p>
            </div>
          </div>
          <Link
            href="/delivery"
            className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3 hover:bg-blue-100 transition-colors"
          >
            <Package size={32} className="text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Giao hàng</p>
              <p className="text-xs text-gray-500">Gửi bưu kiện</p>
            </div>
          </Link>
        </div>

        {/* Service area map */}
        <ServiceAreaMap />

        {/* Categories */}
        <CategoryFilter selected={category} onChange={setCategory} />

        {/* Restaurant list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900">
              {category === 'all' ? 'Quán gần bạn' : category}
            </h2>
            <span className="text-gray-400 text-sm">{restaurants.length} quán</span>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl h-52 animate-pulse border border-gray-100" />
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🍽️</p>
              <p>Không có quán nào trong danh mục này</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          )}
        </section>
      </main>

      </div>
      <BottomNav />
    </div>
  )
}
