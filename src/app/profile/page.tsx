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
  { icon: MapPin,     label: 'Địa chỉ của tôi',             href: '/profile/addresses', accent: '#f87171' },
  { icon: Phone,      label: 'Thay đổi số điện thoại',       href: '/auth/login',        accent: '#60a5fa' },
  { icon: Store,      label: 'Đăng ký nhà hàng / cửa hàng', href: '/restaurant-admin',  accent: '#f0b429' },
  { icon: Bike,       label: 'Đăng ký làm shipper',          href: '/shipper',           accent: '#34d399' },
  { icon: Settings,   label: 'Cài đặt',                      href: '/settings',          accent: '#888888' },
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, signOut } = useAuthStore()
  const [profile, setProfile] = useState<{ name: string; phone: string } | null>(null)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/profile'); return }
    const supabase = createClient()
    supabase.from('users').select('name, phone').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile({ name: data.name ?? '', phone: data.phone ?? '' }) })
  }, [user, router])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <DesktopNav />
      <div className="md:pl-56">
        <div className="max-w-lg mx-auto px-4 pt-10 space-y-4">

          {/* ── User card ───────────────────────────────────────────────── */}
          <div
            className="rounded-2xl p-6 flex items-center gap-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1408 0%, #2d2408 50%, #0e1520 100%)',
              border: '1px solid rgba(240,180,41,0.3)',
            }}
          >
            {/* Background decoration */}
            <div
              className="absolute right-4 top-2 text-5xl select-none pointer-events-none"
              style={{ opacity: 0.15 }}
            >
              👤
            </div>

            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{ background: 'rgba(240,180,41,0.15)', border: '1px solid rgba(240,180,41,0.3)' }}
            >
              👤
            </div>
            <div>
              <h2 className="font-black text-xl" style={{ color: 'var(--color-text)' }}>
                {profile?.name || user.email?.split('@')[0] || 'Người dùng'}
              </h2>
              <p className="text-sm mt-0.5" style={{ color: 'var(--color-gold)' }}>
                {profile?.phone || user.phone || user.email || ''}
              </p>
            </div>
          </div>

          {/* ── Menu ──────────────────────────────────────────────────── */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            {MENU_ITEMS.map(({ icon: Icon, label, href, accent }, i) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 transition-all hover:brightness-110"
                style={i < MENU_ITEMS.length - 1 ? { borderBottom: '1px solid var(--color-border)' } : {}}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${accent}20` }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <span className="flex-1 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {label}
                </span>
                <ChevronRight size={16} style={{ color: 'var(--color-subtle)' }} />
              </Link>
            ))}
          </div>

          {/* ── Sign out ──────────────────────────────────────────────── */}
          <button
            onClick={handleSignOut}
            className="w-full p-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:brightness-110"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171',
            }}
          >
            <LogOut size={16} />
            Đăng xuất
          </button>

          <p className="text-center text-xs pb-2" style={{ color: 'var(--color-subtle)' }}>
            GoodFood v1.0 · Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng
          </p>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
