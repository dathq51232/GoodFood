'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, ClipboardList, Package, User, Store, Bike } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'

const mainItems = [
  { href: '/', icon: Home, label: 'Trang chủ' },
  { href: '/orders', icon: ClipboardList, label: 'Đơn hàng' },
  { href: '/delivery', icon: Package, label: 'Giao hàng' },
  { href: '/profile', icon: User, label: 'Tài khoản' },
]

export function DesktopNav() {
  const pathname = usePathname()
  const { user } = useAuthStore()
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { setRole(null); return }
    const supabase = createClient()
    supabase.from('users').select('role').eq('id', user.id).single()
      .then(({ data }) => setRole(data?.role ?? 'customer'))
  }, [user])

  return (
    <nav className="hidden md:flex flex-col fixed left-0 top-0 h-full w-56 z-40 py-6 px-3"
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
      <div className="px-3 mb-8">
        <div className="font-bold text-lg leading-tight" style={{ color: 'var(--color-gold)' }}>GoodFood</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>Giao hàng nhanh · Đức Tài</div>
      </div>

      <div className="space-y-0.5 flex-1">
        {mainItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors')}
              style={active
                ? { background: 'rgba(212,168,67,0.15)', color: 'var(--color-gold)' }
                : { color: 'var(--color-muted)' }}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
            </Link>
          )
        })}

        {/* Role-specific links — only shown for the right role */}
        {user && role === 'restaurant' && (
          <div className="pt-3 mt-3 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-subtle)' }}>Nhà hàng</p>
            <Link
              href="/restaurant-admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={pathname === '/restaurant-admin'
                ? { background: 'rgba(212,168,67,0.15)', color: 'var(--color-gold)' }
                : { color: 'var(--color-muted)' }}
            >
              <Store size={18} strokeWidth={pathname === '/restaurant-admin' ? 2.5 : 1.8} />
              Quản lý quán
            </Link>
          </div>
        )}

        {user && role === 'driver' && (
          <div className="pt-3 mt-3 space-y-0.5" style={{ borderTop: '1px solid var(--color-border)' }}>
            <p className="px-3 text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-subtle)' }}>Shipper</p>
            <Link
              href="/shipper"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={pathname === '/shipper'
                ? { background: 'rgba(212,168,67,0.15)', color: 'var(--color-gold)' }
                : { color: 'var(--color-muted)' }}
            >
              <Bike size={18} strokeWidth={pathname === '/shipper' ? 2.5 : 1.8} />
              Khu vực shipper
            </Link>
          </div>
        )}
      </div>

      <div className="px-3 text-[11px]" style={{ color: 'var(--color-subtle)' }}>v1.0 · Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng</div>
    </nav>
  )
}
