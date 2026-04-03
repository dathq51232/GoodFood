'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, Shield, Bell, ChevronRight, Check } from 'lucide-react'
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <DesktopNav />
      <div className="md:pl-56">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
            <button onClick={() => router.back()} className="p-1.5 rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h1 className="font-bold text-lg text-gray-900">Cài đặt</h1>
          </div>

          <div className="px-4 pt-4 space-y-4">
            {/* Profile section */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <User size={15} className="text-orange-500" />
                <h2 className="text-sm font-semibold text-gray-900">Thông tin cá nhân</h2>
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
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <Shield size={15} className="text-blue-500" />
                <h2 className="text-sm font-semibold text-gray-900">Tài khoản</h2>
              </div>
              <div className="divide-y divide-gray-50">
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Số điện thoại</p>
                      <p className="text-sm font-medium text-gray-900">{phone || user.phone || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield size={16} className="text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Loại tài khoản</p>
                      <p className="text-sm font-medium text-gray-900">{roleLabel}</p>
                    </div>
                  </div>
                </div>
                {role !== 'driver' && (
                  <button
                    onClick={() => router.push('/shipper')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center">
                        <span className="text-sm">🛵</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Đăng ký làm shipper</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                )}
                {role !== 'restaurant' && (
                  <button
                    onClick={() => router.push('/restaurant-admin')}
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center">
                        <span className="text-sm">🏪</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">Đăng ký nhà hàng</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                <Bell size={15} className="text-purple-500" />
                <h2 className="text-sm font-semibold text-gray-900">Thông báo</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {[
                  { label: 'Cập nhật đơn hàng', desc: 'Thông báo khi trạng thái đơn thay đổi', value: notifOrders, onChange: setNotifOrders },
                  { label: 'Khuyến mãi & ưu đãi', desc: 'Nhận thông báo về ưu đãi mới', value: notifPromo, onChange: setNotifPromo },
                ].map(({ label, desc, value, onChange }) => (
                  <div key={label} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                    </div>
                    <button
                      onClick={() => onChange(!value)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-orange-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 pb-2">
              GoodFood v1.0 · Phục vụ khu vực Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng
            </p>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
