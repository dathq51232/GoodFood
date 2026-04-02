import Link from 'next/link'
import Image from 'next/image'
import { Star, Clock, Bike } from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'
import type { Restaurant } from '@/types/database'

export function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurant/${restaurant.id}`} className="block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative h-44 bg-gray-100">
          {restaurant.image_url ? (
            <img
              src={restaurant.image_url}
              alt={restaurant.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-orange-50">
              <span className="text-5xl">🍽️</span>
            </div>
          )}
          {!restaurant.is_open && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Đã đóng cửa</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-0.5 flex items-center gap-1 shadow-sm">
            <Star size={12} className="text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-semibold">{restaurant.rating}</span>
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-gray-900 text-sm">{restaurant.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{restaurant.category}</p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatTime(restaurant.delivery_time)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Bike size={12} />
              <span>{formatCurrency(restaurant.delivery_fee)}</span>
            </div>
            <div className="text-xs text-gray-400">
              Tối thiểu {formatCurrency(restaurant.min_order)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
