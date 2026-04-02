'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Package, ArrowRight, Bike, Clock, Banknote } from 'lucide-react'
import { BottomNav } from '@/components/layout/BottomNav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatCurrency, generateOrderCode } from '@/lib/utils'

const PACKAGE_SIZES = [
  { id: 'small', label: 'Nhỏ', desc: 'Dưới 2kg, tài liệu, phong bì', price: 15000, icon: '📄' },
  { id: 'medium', label: 'Vừa', desc: '2–5kg, hộp nhỏ', price: 25000, icon: '📦' },
  { id: 'large', label: 'Lớn', desc: '5–10kg, thùng to', price: 40000, icon: '🗃️' },
]

export default function DeliveryPage() {
  const router = useRouter()
  const [pickup, setPickup] = useState('')
  const [dropoff, setDropoff] = useState('')
  const [size, setSize] = useState('small')
  const [receiverName, setReceiverName] = useState('')
  const [receiverPhone, setReceiverPhone] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedSize = PACKAGE_SIZES.find((s) => s.id === size)!

  const handleSubmit = async () => {
    if (!pickup.trim() || !dropoff.trim()) {
      alert('Vui lòng điền địa chỉ lấy hàng và giao hàng')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1200))
    const code = generateOrderCode()
    router.push(`/orders/${code}?new=1`)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 text-white px-4 pt-12 pb-6">
          <h1 className="text-2xl font-bold">Giao hàng</h1>
          <p className="text-sm opacity-80 mt-1">Gửi bưu kiện trong khu vực Hoài Đức & Xuân Lộc</p>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm">
              <Clock size={14} />
              <span>30–60 phút</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Bike size={14} />
              <span>Từ 15.000đ</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin size={14} />
              <span>Nội khu</span>
            </div>
          </div>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Route */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <p className="font-semibold text-sm">Địa điểm</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <input
                className="w-full pl-8 pr-3 py-3 bg-green-50 border border-green-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Địa chỉ lấy hàng..."
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pl-4">
              <div className="w-px h-6 bg-gray-200" />
              <span className="text-xs text-gray-400">~2km</span>
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <MapPin size={14} className="text-red-500" />
              </div>
              <input
                className="w-full pl-8 pr-3 py-3 bg-red-50 border border-red-200 rounded-xl text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Địa chỉ giao hàng..."
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
              />
            </div>
          </div>

          {/* Package size */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-blue-500" />
              <p className="font-semibold text-sm">Kích thước hàng</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {PACKAGE_SIZES.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSize(s.id)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    size === s.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{s.icon}</span>
                  <p className="font-semibold text-xs mt-1">{s.label}</p>
                  <p className="text-xs text-gray-500">{formatCurrency(s.price)}</p>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg p-2">{selectedSize.desc}</p>
          </div>

          {/* Receiver info */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
            <p className="font-semibold text-sm">Thông tin người nhận</p>
            <Input
              placeholder="Tên người nhận"
              value={receiverName}
              onChange={(e) => setReceiverName(e.target.value)}
            />
            <Input
              placeholder="Số điện thoại người nhận"
              type="tel"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
            />
            <Input
              placeholder="Ghi chú (tuỳ chọn)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Price summary */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-900">Phí giao hàng</p>
                <p className="text-xs text-gray-500">Gói {selectedSize.label} · Thanh toán khi nhận hàng</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedSize.price)}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 justify-end">
                  <Banknote size={12} />
                  <span>COD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            variant="primary"
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            loading={loading}
            onClick={handleSubmit}
          >
            Gửi hàng ngay <ArrowRight size={16} />
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
