'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, ClipboardList, User } from 'lucide-react'
import { useCartStore } from '@/store/cart'

const navItems = [
  { href: '/',        icon: Home,          label: 'Trang chủ' },
  { href: '/search',  icon: Search,        label: 'Tìm kiếm'  },
  { href: '/checkout',icon: ShoppingBag,   label: 'Giỏ hàng'  },
  { href: '/orders',  icon: ClipboardList, label: 'Đơn hàng'  },
  { href: '/profile', icon: User,          label: 'Hồ sơ'     },
]

export function BottomNav() {
  const pathname = usePathname()
  const { itemCount, _hasHydrated } = useCartStore()
  const cartCount = _hasHydrated ? itemCount() : 0

  // Ẩn trên desktop
  return (
    <nav className="md:hidden fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="pointer-events-auto flex items-center gap-1 rounded-full px-3 py-2"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)',
        }}
      >
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          const isCart = href === '/checkout'

          return (
            <Link key={href} href={href} className="relative">
              {active ? (
                /* Active pill — mở rộng có label */
                <div
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-semibold transition-all"
                  style={{ background: 'var(--color-gold)', color: '#0f0f13' }}
                >
                  <Icon size={16} strokeWidth={2.5} />
                  <span className="text-xs font-bold">{label}</span>
                </div>
              ) : (
                /* Inactive — icon only */
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-all relative"
                  style={{ color: 'var(--color-muted)' }}
                >
                  <Icon size={20} strokeWidth={1.8} />
                  {/* Cart badge */}
                  {isCart && cartCount > 0 && (
                    <span
                      className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center text-[9px] font-bold px-1"
                      style={{ background: 'var(--color-gold)', color: '#0f0f13' }}
                    >
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
