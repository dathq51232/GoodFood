'use client'
import Link from 'next/link'
import { MapPin, Bell, Search } from 'lucide-react'

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <MapPin size={12} className="text-orange-500" />
              <span>Giao đến</span>
            </div>
            <button className="font-semibold text-sm text-gray-900 flex items-center gap-1">
              Hoài Đức, Hà Nội
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </button>
          </div>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-400"
        >
          <Search size={16} />
          Tìm món ăn, nhà hàng...
        </Link>
      </div>
    </header>
  )
}
