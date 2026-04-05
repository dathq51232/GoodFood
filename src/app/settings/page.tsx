'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, Shield, Bell, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BottomNav } from '@/components/layout/BottomNav'
import { DesktopNav } from '@/components/layout/DesktopNav'

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [name, setName] = useState('')
  const [originalName, setOriginalName] = useState('')
  const [role, setRole] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifOrders, setNotifOrders] = useState(true)
  const [notifPromo, setNotifPromo] = useState(false)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/settings'); return }
    const supabase = createClient()
    supabase.from('users').select('name, phone, role').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setName(data.name || '')
          setOriginalName(data.name || '')
          setPhone(data.phone || '')
          setRole(data.role || 'customer')
        }
      })
  }, [user, router])

  const handleSaveName = async () => {
    if (name.trim().length < 2) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ name: name.trim() }).eq('id', user!.id)
    setOriginalName(name.trim())
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const roleLabel = {
    customer: 'Khách hàng',
    driver: 'Shipper',
    restaurant: 'Chủ nhà hàng',
    admin: 'Quản trị viên',
  }[role] || 'Khách hàng'

  if (!user) return null

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <DesktopNav />
      <div className="md:pl-56">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="px-4 pt-12 pb-4 flex items-center gap-3"
            style={{ borderBottom: '1px solid var(--color-border)' }}>
            <button
              onClick={() => router.back()}
              className="p-1.5 rounded-full transition-colors"
              style={{ background: 'var(--color-surface-2)' }}
            >
              <ArrowLeft size={20} style={{ color: 'var(--color-text)' }} />
            </button>
            <h1 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>Cài đặt</h1>
          </div>

          <div className="px-4 pt-4 space-y-4">

            {/* Profile section */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <User size={15} style={{ color: 'var(--color-gold)' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Thông tin cá nhân</h2>
              </div>
              <div className="p-4 space-y-3">
                <Input
                  label="Họ và tên"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setSaved(false) }}
                  placeholder="Nguyễn Văn A"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveName}
                    loading={saving}
                    disabled={name.trim() === originalName || name.trim().length < 2}
                    className="flex items-center gap-1.5"
                  >
                    {saved ? <><Check size={14} /> Đã lưu</> : 'Lưu tên'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Account info */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <Shield size={15} style={{ color: '#60a5fa' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Tài khoản</h2>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)' }}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone size={16} style={{ color: 'var(--color-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Số điện thoại</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {phone || user.phone || '—'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between"
                  style={{ borderTop: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-3">
                    <Shield size={16} style={{ color: 'var(--color-muted)' }} />
                    <div>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Loại tài khoản</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-gold)' }}>{roleLabel}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="px-4 py-3 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--color-border)' }}>
                <Bell size={15} style={{ color: '#c084fc' }} />
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Thông báo</h2>
              </div>
              <div>
                {[
                  { label: 'Cập nhật đơn hàng', desc: 'Thông báo khi trạng thái đơn thay đổi', value: notifOrders, onChange: setNotifOrders },
                  { label: 'Khuyến mãi & ưu đãi', desc: 'Nhận thông báo về ưu đãi mới', value: notifPromo, onChange: setNotifPromo },
                ].map(({ label, desc, value, onChange }, i) => (
                  <div key={label} className="px-4 py-3 flex items-center justify-between"
                    style={i > 0 ? { borderTop: '1px solid var(--color-border)' } : {}}>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{desc}</p>
                    </div>
                    <button
                      onClick={() => onChange(!value)}
                      className="relative w-11 h-6 rounded-full transition-colors"
                      style={{ background: value ? 'var(--color-gold)' : 'var(--color-surface-2)' }}
                    >
                      <div
                        className="absolute top-0.5 w-5 h-5 rounded-full shadow transition-transform"
                        style={{
                          background: 'white',
                          transform: value ? 'translateX(20px)' : 'translateX(2px)',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs pb-2" style={{ color: 'var(--color-subtle)' }}>
              GoodFood v1.0 · Phục vụ khu vực Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
