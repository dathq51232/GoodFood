'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, ChevronRight, LogOut, Store, Bike, Settings } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { DesktopNav } from '@/components/layout/DesktopNav'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'

const MENU_ITEMS = [
  { icon: MapPin, label: 'Địa chỉ của tôi', href: '/profile/addresses', color: 'text-red-500 bg-red-50' },
  { icon: Phone, label: 'Thay đổi số điện thoại', href: '/auth/login', color: 'text-blue-500 bg-blue-50' },
  { icon: Store, label: 'Đăng ký nhà hàng/cửa hàng', href: '/restaurant-admin', color: 'text-orange-500 bg-orange-50' },
  { icon: Bike, label: 'Đăng ký làm shipper', href: '/shipper', color: 'text-green-500 bg-green-50' },
  { icon: Settings, label: 'Cài đặt', href: '/settings', color: 'text-gray-500 bg-gray-100' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const [profile, setProfile] = useState<{ name: string; phone: string } | null>(null)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/profile'); return }
    const supabase = createClient()
    supabase.from('users').select('name, phone').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <DesktopNav />
      <div className="md:pl-56">
      <div className="max-w-2xl mx-auto px-4 pt-12 space-y-4">
        {/* User card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-400 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
              👤
            </div>
            <div>
              <h2 className="font-bold text-xl">{profile?.name || 'Đang tải...'}</h2>
              <p className="text-sm opacity-80">{profile?.phone || user.phone || ''}</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {MENU_ITEMS.map(({ icon: Icon, label, href, color }, i) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i < MENU_ITEMS.length - 1 ? 'border-b border-gray-50' : ''}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
              <span className="flex-1 text-sm font-medium text-gray-900">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center gap-2 text-red-500 font-medium hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} /> Đăng xuất
        </button>

        <p className="text-center text-xs text-gray-400 pb-2">
          GoodFood v1.0 · Phục vụ khu vực Đức Tài đến ngã ba Ông Đồn
        </p>
      </div>
      </div>
      <BottomNav />
    </div>
  )
}
