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
  { ssr: false, loading: () => <div className="h-52 rounded-xl animate-shimmer" /> }
)

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
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: 'var(--color-bg)' }}
      >
        <p className="text-6xl">🛒</p>
        <p style={{ color: 'var(--color-muted)' }}>Giỏ hàng trống</p>
        <Link
          href="/"
          className="font-bold text-sm px-5 py-2 rounded-full"
          style={{ background: 'var(--color-gold)', color: '#080c14' }}
        >
          Quay lại đặt đồ
        </Link>
      </div>
    )
  }

  const subtotal = total()
  const deliveryFee = restaurant.delivery_fee
  const grandTotal = subtotal + deliveryFee

  const handleOrder = async () => {
    if (!user) { router.push('/auth/login?redirect=/checkout'); return }
    if (!address.trim()) { setError('Vui lòng nhập địa chỉ giao hàng'); return }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant_id: restaurant.id,
          items: items.map(({ menu_item, quantity }) => ({ menu_item_id: menu_item.id, quantity })),
          delivery_address: address,
          note,
          pay_method: payMethod,
        }),
      })

      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Đặt hàng thất bại, thử lại'); setLoading(false); return }

      if (data.sepay) {
        const { action, fields } = data.sepay as { action: string; fields: Record<string, string> }
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = action
        const fieldOrder = [
          'order_amount', 'merchant', 'currency', 'operation',
          'order_description', 'order_invoice_number',
          'customer_id', 'payment_method',
          'success_url', 'error_url', 'cancel_url', 'signature',
        ]
        for (const key of fieldOrder) {
          if (fields[key] !== undefined) {
            const input = document.createElement('input')
            input.type = 'hidden'; input.name = key; input.value = fields[key]
            form.appendChild(input)
          }
        }
        document.body.appendChild(form)
        form.submit()
        return
      }

      clearCart()
      router.push(`/orders/${data.code}?new=1`)
    } catch {
      setError('Lỗi kết nối, thử lại sau')
      setLoading(false)
    }
  }

  // Shared card style
  const cardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: '16px',
    padding: '16px',
  }

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-lg mx-auto">

        {/* ── Top bar ──────────────────────────────────────────────────── */}
        <div
          className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
          style={{
            background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Link
            href={`/restaurant/${restaurant.id}`}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <ArrowLeft size={18} style={{ color: 'var(--color-text)' }} />
          </Link>
          <h1 className="font-black text-lg" style={{ color: 'var(--color-text)' }}>Xác nhận đơn hàng</h1>
        </div>

        <div className="px-4 pt-4 space-y-4">

          {/* Restaurant */}
          <div style={cardStyle}>
            <p className="text-xs mb-1" style={{ color: 'var(--color-muted)' }}>Nhà hàng</p>
            <p className="font-bold" style={{ color: 'var(--color-text)' }}>{restaurant.name}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-subtle)' }}>{restaurant.address}</p>
          </div>

          {/* Login prompt */}
          {!user && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)', color: 'var(--color-gold)' }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <p>
                <Link href="/auth/login?redirect=/checkout" className="font-bold underline">Đăng nhập</Link> để đặt hàng
              </p>
            </div>
          )}

          {/* Delivery address */}
          <div style={cardStyle}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} style={{ color: 'var(--color-gold)' }} />
                <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Địa chỉ giao hàng</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMap((v) => !v)}
                className="flex items-center gap-1 text-xs font-medium"
                style={{ color: 'var(--color-gold)' }}
              >
                <Map size={13} />
                {showMap ? 'Ẩn bản đồ' : 'Chọn bản đồ'}
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
                <MapPicker initialAddress={address} onSelect={(addr) => setAddress(addr)} />
              </div>
            )}
          </div>

          {/* Items */}
          <div style={cardStyle}>
            <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Món đã chọn</p>
            <div className="space-y-3">
              {items.map(({ menu_item, quantity }) => (
                <div key={menu_item.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{menu_item.name}</p>
                    <p className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>{formatCurrency(menu_item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(menu_item.id, quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: quantity === 1 ? '#f87171' : 'var(--color-muted)' }}
                    >
                      {quantity === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
                    </button>
                    <span className="w-5 text-center text-sm font-bold" style={{ color: 'var(--color-text)' }}>{quantity}</span>
                    <button
                      onClick={() => updateQuantity(menu_item.id, quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: 'var(--color-gold)', color: '#080c14' }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <p className="text-sm font-bold w-20 text-right" style={{ color: 'var(--color-text)' }}>
                    {formatCurrency(menu_item.price * quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div style={cardStyle}>
            <Input
              label="Ghi chú (tuỳ chọn)"
              placeholder="Ví dụ: ít đường, không hành..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Payment method */}
          <div style={cardStyle}>
            <p className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>Phương thức thanh toán</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPayMethod('cash')}
                className="flex items-center gap-2 p-3 rounded-xl transition-all"
                style={{
                  background: payMethod === 'cash' ? 'rgba(240,180,41,0.15)' : 'var(--color-surface-2)',
                  border: `1px solid ${payMethod === 'cash' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                }}
              >
                <Banknote size={18} style={{ color: payMethod === 'cash' ? 'var(--color-gold)' : 'var(--color-muted)' }} />
                <span className="text-sm font-medium" style={{ color: payMethod === 'cash' ? 'var(--color-gold)' : 'var(--color-text)' }}>
                  Tiền mặt
                </span>
              </button>
              <button
                onClick={() => setPayMethod('transfer')}
                className="flex flex-col items-start gap-1 p-3 rounded-xl transition-all"
                style={{
                  background: payMethod === 'transfer' ? 'rgba(240,180,41,0.15)' : 'var(--color-surface-2)',
                  border: `1px solid ${payMethod === 'transfer' ? 'var(--color-gold)' : 'var(--color-border)'}`,
                }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={18} style={{ color: payMethod === 'transfer' ? 'var(--color-gold)' : 'var(--color-muted)' }} />
                  <span className="text-sm font-medium" style={{ color: payMethod === 'transfer' ? 'var(--color-gold)' : 'var(--color-text)' }}>
                    Chuyển khoản
                  </span>
                </div>
                <span
                  className="text-[9px] font-black px-1.5 py-0.5 rounded-full ml-6"
                  style={{ background: 'rgba(240,180,41,0.2)', color: 'var(--color-gold)' }}
                >
                  QR · SePay
                </span>
              </button>
            </div>
            {payMethod === 'transfer' && (
              <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                🔒 Thanh toán an toàn qua cổng SePay — hỗ trợ QR ngân hàng & thẻ quốc tế
              </p>
            )}
          </div>

          {/* Price summary */}
          <div style={cardStyle}>
            <div className="space-y-2">
              <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted)' }}>
                <span>Tiền đồ ăn</span><span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm" style={{ color: 'var(--color-muted)' }}>
                <span>Phí giao hàng</span><span>{formatCurrency(deliveryFee)}</span>
              </div>
              <div
                className="flex justify-between font-black text-base pt-2"
                style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <span>Tổng cộng</span>
                <span style={{ color: 'var(--color-gold)' }}>{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <AlertCircle size={16} className="flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky order button ─────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4"
        style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
      >
        <div className="max-w-lg mx-auto">
          <Button size="lg" className="w-full" loading={loading} onClick={handleOrder}>
            {user ? `Đặt hàng · ${formatCurrency(grandTotal)}` : 'Đăng nhập để đặt hàng'}
          </Button>
        </div>
      </div>
    </div>
  )
}
