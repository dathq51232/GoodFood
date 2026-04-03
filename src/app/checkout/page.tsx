'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Minus, Plus, Trash2, CreditCard, Banknote, AlertCircle, Map } from 'lucide-react'
import { useCartStore } from '@/store/cart'
import { useAuthStore } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const MapPicker = dynamic(
  () => import('@/components/map/MapPicker').then((m) => m.MapPicker),
  { ssr: false, loading: () => <div className="h-52 rounded-xl bg-gray-100 animate-pulse" /> }
)

// Leaflet CSS
const LeafletCSS = () => {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])
  return null
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, restaurant, updateQuantity, total, clearCart } = useCartStore()
  const { user } = useAuthStore()
  const [address, setAddress] = useState('')
  const [showMap, setShowMap] = useState(false)
  const [note, setNote] = useState('')
  const [payMethod, setPayMethod] = useState<'cash' | 'transfer'>('cash')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!restaurant || items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-6xl">🛒</p>
        <p className="text-gray-500">Giỏ hàng trống</p>
        <Link href="/" className="text-orange-500 font-medium">Quay lại đặt đồ</Link>
      </div>
    )
  }

  const subtotal = total()
  const deliveryFee = restaurant.delivery_fee
  const grandTotal = subtotal + deliveryFee

  const handleOrder = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout')
      return
    }
    if (!address.trim()) {
      setError('Vui lòng nhập địa chỉ giao hàng')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          items: items.map(({ menu_item, quantity }) => ({
            menu_item_id: menu_item.id,
            quantity,
          })),
          delivery_address: address,
          note,
          pay_method: payMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Đặt hàng thất bại, thử lại')
        setLoading(false)
        return
      }

      clearCart()
      router.push(`/orders/${data.code}?new=1`)
    } catch {
      setError('Lỗi kết nối, thử lại sau')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-lg mx-auto">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <Link href={`/restaurant/${restaurant.id}`} className="p-1"><ArrowLeft size={20} /></Link>
          <h1 className="font-bold text-lg">Xác nhận đơn hàng</h1>
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Restaurant */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1">Nhà hàng</p>
            <p className="font-semibold text-gray-900">{restaurant.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{restaurant.address}</p>
          </div>

          {/* Login prompt */}
          {!user && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
              <p className="text-sm text-orange-700">
                <Link href="/auth/login?redirect=/checkout" className="font-semibold underline">Đăng nhập</Link> để đặt hàng
              </p>
            </div>
          )}

          {/* Delivery address */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-orange-500" />
                <p className="font-semibold text-sm">Địa chỉ giao hàng</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="flex items-center gap-1 text-xs text-orange-500 font-medium"
              >
                <Map size={13} />
                {showMap ? 'Ẩn bản đồ' : 'Chọn trên bản đồ'}
              </button>
            </div>
            <Input
              placeholder="Số nhà, tên đường, khu vực..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            {showMap && (
              <div className="mt-3">
                <LeafletCSS />
                <MapPicker
                  initialAddress={address}
                  onSelect={(addr) => setAddress(addr)}
                />
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="font-semibold text-sm mb-3">Món đã chọn</p>
            <div className="space-y-3">
              {items.map(({ menu_item, quantity }) => (
                <div key={menu_item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{menu_item.name}</p>
                    <p className="text-sm text-orange-500">{formatCurrency(menu_item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(menu_item.id, quantity - 1)}
                      className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-600">
                      {quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">{quantity}</span>
                    <button onClick={() => updateQuantity(menu_item.id, quantity + 1)}
                      className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white">
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-semibold w-20 text-right">{formatCurrency(menu_item.price * quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <Input label="Ghi chú (tuỳ chọn)" placeholder="Ví dụ: ít đường, không hành..."
              value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <p className="font-semibold text-sm mb-3">Phương thức thanh toán</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'cash', label: 'Tiền mặt', Icon: Banknote },
                { key: 'transfer', label: 'Chuyển khoản', Icon: CreditCard },
              ] as const).map(({ key, label, Icon }) => (
                <button key={key} onClick={() => setPayMethod(key)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-colors ${payMethod === key ? 'border-orange-500 bg-orange-50' : 'border-gray-200'}`}>
                  <Icon size={18} className={payMethod === key ? 'text-orange-500' : 'text-gray-400'} />
                  <span className="text-sm font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tiền đồ ăn</span><span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí giao hàng</span><span>{formatCurrency(deliveryFee)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900">
              <span>Tổng cộng</span>
              <span className="text-orange-500">{formatCurrency(grandTotal)}</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <Button size="lg" className="w-full" loading={loading} onClick={handleOrder}>
            {user ? `Đặt hàng · ${formatCurrency(grandTotal)}` : 'Đăng nhập để đặt hàng'}
          </Button>
        </div>
      </div>
    </div>
  )
}
