import Link from 'next/link'
import { Star, Clock, Bike } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'
import type { Restaurant } from '@/types/database'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block flex-shrink-0" style={{ width: '176px' }}>
      <div
        className="rounded-2xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}
      >
        {/* Image */}
        <div className="relative h-28 overflow-hidden" style={{ background: 'var(--color-surface-2)' }}>
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🍽️</div>
          )}

          {/* Closed overlay */}
          {!restaurant.is_open && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
              <span
                className="text-xs font-semibold px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
              >
                Đã đóng cửa
              </span>
            </div>
          )}

          {/* Rating badge */}
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{ background: 'var(--color-gold)', color: '#0f0f13' }}
          >
            <Star size={10} fill="#0f0f13" strokeWidth={0} />
            <span>{restaurant.rating}</span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-bold text-sm truncate" style={{ color: 'var(--color-text)' }}>
            {restaurant.name}
          </h3>
          <p className="text-xs truncate mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {restaurant.category}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-subtle)' }}>
              <Clock size={11} />
              <span>{formatTime(restaurant.delivery_time)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-subtle)' }}>
              <Bike size={11} />
              <span>{formatCurrency(restaurant.delivery_fee)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
