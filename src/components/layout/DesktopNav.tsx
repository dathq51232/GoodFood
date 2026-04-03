'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, Package, User, Store, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'

const mainItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/orders', icon: ClipboardList, label: 'Đơn hàng' },
  { href: '/delivery', icon: Package, label: 'Giao hàng' },
  { href: '/profile', icon: User, label: 'Tài khoản' },
]

export function DesktopNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 bg-white border-r border-gray-100 z-40 py-6 px-3">
      <div className="px-3 mb-8">
        <div className="text-orange-500 font-bold text-lg leading-tight">GoodFood</div>
        <div className="text-xs text-gray-400 mt-0.5">Giao hàng nhanh · Đức Tài</div>
      </div>

      <div className="space-y-0.5 flex-1">
        {mainItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}

        {user && (
          <div className="pt-3 mt-3 border-t border-gray-100 space-y-0.5">
            <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Dành cho bạn</p>
            <Link
              href="/restaurant-admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === '/restaurant-admin' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Store size={18} strokeWidth={pathname === '/restaurant-admin' ? 2.5 : 1.8} />
              Quản lý quán
            </Link>
            <Link
              href="/shipper"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname === '/shipper' ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Bike size={18} strokeWidth={pathname === '/shipper' ? 2.5 : 1.8} />
              Khu vực shipper
            </Link>
          </div>
        )}
      </div>

      <div className="px-3 text-[11px] text-gray-400">v1.0 · Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng</div>
    </nav>
  )
}
