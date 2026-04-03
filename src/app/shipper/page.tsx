'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Phone, Navigation, CheckCircle2, DollarSign, Package, RefreshCw, Bike, ArrowLeft, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface AvailableOrder {
  id: string
  code: string
  delivery_type: string
  total: number
  delivery_fee: number
  delivery_address: string
  note: string | null
  restaurant: { name: string; address: string } | null
  order_items: { name: string; quantity: number }[]
  customer: { name: string; phone: string } | null
}

interface ActiveOrder extends AvailableOrder {
  status: string
}

type ShipperStatus = 'offline' | 'online'

const VEHICLE_TYPES = ['Xe máy', 'Xe đạp điện', 'Xe tải nhỏ']

function ShipperRegisterForm({
  userId,
  userName,
  onDone,
  onBack,
}: {
  userId: string
  userName: string
  onDone: () => void
  onBack: () => void
}) {
  const [vehicle, setVehicle] = useState(VEHICLE_TYPES[0])
  const [plate, setPlate] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!plate.trim()) { setError('Vui lòng nhập biển số xe'); return }
    if (!agreed) { setError('Vui lòng đồng ý với điều khoản'); return }
    setError('')
    setSaving(true)
    const supabase = createClient()
    await supabase.from('users').update({ role: 'driver' }).eq('id', userId)
    setSaving(false)
    onDone()
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-10">
      <div className="px-4 pt-12 pb-8">
        <button onClick={onBack} className="mb-4 p-1 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="text-4xl mb-2">🛵</div>
        <h1 className="text-2xl font-bold">Đăng ký shipper</h1>
        <p className="text-sm text-gray-400 mt-1">Giao hàng và kiếm thêm thu nhập</p>
      </div>

      <div className="max-w-lg mx-auto px-4 space-y-4">
        {/* Benefits */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-2">
          {[
            { icon: '💰', text: 'Nhận phí giao hàng cho mỗi đơn' },
            { icon: '🕐', text: 'Tự quyết định giờ làm việc' },
            { icon: '📱', text: 'Nhận đơn realtime qua app' },
            { icon: '🗺️', text: 'Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-sm">
              <span>{icon}</span>
              <span className="text-gray-300">{text}</span>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-2xl p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Họ tên</label>
            <p className="text-sm font-medium text-white">{userName || '—'}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-2">Loại phương tiện</label>
            <div className="flex gap-2 flex-wrap">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v}
                  onClick={() => setVehicle(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    vehicle === v ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-600 text-gray-300 hover:border-orange-400'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Biển số xe *</label>
            <input
              type="text"
              className="w-full bg-gray-700 rounded-xl border border-gray-600 px-3 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 uppercase"
              placeholder="29A-12345"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <div
              onClick={() => setAgreed(!agreed)}
              className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border transition-colors ${agreed ? 'bg-orange-500 border-orange-500' : 'border-gray-500'}`}
            >
              {agreed && <CheckCircle2 size={12} className="text-white" />}
            </div>
            <span className="text-xs text-gray-400 leading-relaxed">
              Tôi đồng ý với <span className="text-orange-400">Điều khoản shipper</span> và xác nhận thông tin xe của tôi là chính xác
            </span>
          </label>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <Button size="lg" className="w-full bg-orange-500 hover:bg-orange-600 text-white" loading={saving} onClick={handleSubmit}>
          Đăng ký ngay
        </Button>

        <div className="flex items-center gap-2 bg-gray-800 rounded-xl p-3">
          <Shield size={14} className="text-green-400 flex-shrink-0" />
          <p className="text-xs text-gray-400">Thông tin của bạn được bảo mật và chỉ dùng để xác minh danh tính</p>
        </div>
      </div>
    </div>
  )
}

export default function ShipperPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [shipperStatus, setShipperStatus] = useState<ShipperStatus>('offline')
  const [available, setAvailable] = useState<AvailableOrder[]>([])
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState<string | null>(null)
  const [delivering, setDelivering] = useState(false)
  const [todayEarnings, setTodayEarnings] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login?redirect=/shipper'); return }

    // Check user role
    const supabase = createClient()
    supabase.from('users').select('role, name').eq('id', user.id).single().then(({ data }) => {
      setUserRole(data?.role || 'customer')
      setUserName(data?.name || '')
      if (data?.role === 'driver') setLoading(false)
      else setLoading(false)
    })
  }, [authLoading, user, router])

  // Original loading effect replaced above — keep data loading here
  useEffect(() => {
    if (!user || userRole !== 'driver') return

    const loadActive = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('orders')
        .select('id, code, delivery_type, total, delivery_fee, delivery_address, note, status, restaurant:restaurants(name, address), order_items(name, quantity), customer:users!orders_customer_id_fkey(name, phone)')
        .eq('driver_id', user.id)
        .in('status', ['picking_up', 'delivering'])
        .maybeSingle()

      if (data) {
        setActiveOrder(data as ActiveOrder)
        setShipperStatus('online')
      }

      // Today earnings
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const { data: done } = await supabase
        .from('orders')
        .select('delivery_fee')
        .eq('driver_id', user.id)
        .eq('status', 'delivered')
        .gte('created_at', today.toISOString())

      if (done) {
        setTodayEarnings(done.reduce((s, o) => s + o.delivery_fee, 0))
        setTodayCount(done.length)
      }
    }
    loadActive()
  }, [user, userRole])

  // Load available orders when online
  useEffect(() => {
    if (!user || shipperStatus === 'offline') {
      setAvailable([])
      return
    }

    const supabase = createClient()

    const load = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, code, delivery_type, total, delivery_fee, delivery_address, note, restaurant:restaurants(name, address), order_items(name, quantity), customer:users!orders_customer_id_fkey(name, phone)')
        .eq('status', 'ready')
        .is('driver_id', null)
        .order('created_at', { ascending: false })

      setAvailable((data as AvailableOrder[]) || [])
    }

    load()

    const channel = supabase
      .channel('available-orders')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders',
      }, () => { load() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, shipperStatus])

  const acceptOrder = async (order: AvailableOrder) => {
    setAccepting(order.id)
    const supabase = createClient()
    const { error } = await supabase
      .from('orders')
      .update({ driver_id: user!.id, status: 'picking_up' })
      .eq('id', order.id)
      .is('driver_id', null) // prevent race condition

    if (!error) {
      setActiveOrder({ ...order, status: 'picking_up' })
      setAvailable((prev) => prev.filter((o) => o.id !== order.id))
    }
    setAccepting(null)
  }

  const updateDelivery = async (newStatus: 'delivering' | 'delivered') => {
    if (!activeOrder) return
    setDelivering(true)
    const supabase = createClient()
    await supabase.from('orders').update({ status: newStatus }).eq('id', activeOrder.id)

    if (newStatus === 'delivered') {
      setTodayEarnings((prev) => prev + activeOrder.delivery_fee)
      setTodayCount((prev) => prev + 1)
      setActiveOrder(null)
    } else {
      setActiveOrder((prev) => prev ? { ...prev, status: newStatus } : prev)
    }
    setDelivering(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (userRole && userRole !== 'driver') {
    return (
      <ShipperRegisterForm
        userId={user!.id}
        userName={userName}
        onDone={() => setUserRole('driver')}
        onBack={() => router.push('/')}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-6">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="font-bold text-xl">Shipper</h1>
            <p className="text-sm text-gray-400">GoodFood</p>
          </div>
          <div className="flex gap-1.5">
            {(['offline', 'online'] as ShipperStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => !activeOrder && setShipperStatus(s)}
                disabled={!!activeOrder}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors disabled:opacity-50 ${
                  shipperStatus === s
                    ? s === 'online' ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'
                    : 'bg-gray-800 text-gray-400'
                }`}
              >
                {s === 'online' ? '🟢 Online' : '⚫ Offline'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-800 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <DollarSign size={16} />
              <span className="text-xs font-medium">Thu nhập hôm nay</span>
            </div>
            <p className="font-bold text-xl">{formatCurrency(todayEarnings)}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-3">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Package size={16} />
              <span className="text-xs font-medium">Đơn hoàn thành</span>
            </div>
            <p className="font-bold text-xl">{todayCount} đơn</p>
          </div>
        </div>
      </div>

      {/* Active order */}
      {activeOrder && (
        <div className="mx-4 mt-2 bg-orange-500 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bike size={18} />
              <p className="font-bold">Đơn đang giao</p>
            </div>
            <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full font-medium">
              #{activeOrder.code}
            </span>
          </div>

          <div className="space-y-2 mb-4">
            {activeOrder.restaurant && (
              <div className="flex items-start gap-2">
                <div className="w-2.5 h-2.5 bg-white rounded-full mt-1 flex-shrink-0" />
                <div>
                  <p className="text-xs opacity-75">Lấy tại</p>
                  <p className="font-medium text-sm">{(activeOrder.restaurant as { name: string; address: string }).name}</p>
                  <p className="text-xs opacity-75">{(activeOrder.restaurant as { address: string }).address}</p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs opacity-75">Giao đến · {(activeOrder.customer as { name: string } | null)?.name}</p>
                <p className="font-medium text-sm">{activeOrder.delivery_address}</p>
              </div>
            </div>
            {activeOrder.note && (
              <p className="text-xs bg-white/20 rounded-lg px-2 py-1">📝 {activeOrder.note}</p>
            )}
          </div>

          <div className="flex gap-2 mb-2">
            {(activeOrder.customer as { phone?: string } | null)?.phone && (
              <a
                href={`tel:${(activeOrder.customer as { phone: string }).phone}`}
                className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium"
              >
                <Phone size={14} /> Gọi khách
              </a>
            )}
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(activeOrder.delivery_address)}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 bg-white/20 hover:bg-white/30 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-medium"
            >
              <Navigation size={14} /> Dẫn đường
            </a>
          </div>

          {activeOrder.status === 'picking_up' ? (
            <button
              onClick={() => updateDelivery('delivering')}
              disabled={delivering}
              className="w-full bg-white text-orange-600 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-bold disabled:opacity-60"
            >
              {delivering ? <RefreshCw size={14} className="animate-spin" /> : <Bike size={14} />}
              Đã lấy hàng · Bắt đầu giao
            </button>
          ) : (
            <button
              onClick={() => updateDelivery('delivered')}
              disabled={delivering}
              className="w-full bg-white text-green-600 rounded-xl py-2.5 flex items-center justify-center gap-1.5 text-sm font-bold disabled:opacity-60"
            >
              {delivering ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Đã giao thành công
            </button>
          )}
        </div>
      )}

      {/* Available orders */}
      {!activeOrder && (
        <div className="mx-4 mt-4">
          {shipperStatus === 'offline' ? (
            <div className="bg-gray-800 rounded-2xl p-10 text-center">
              <p className="text-4xl mb-2">😴</p>
              <p className="text-gray-400 font-medium">Bạn đang offline</p>
              <p className="text-xs text-gray-500 mt-1">Bật Online để nhận đơn hàng</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-sm text-gray-300">
                  Đơn chờ nhận ({available.length})
                </h2>
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Realtime
                </span>
              </div>
              {available.length === 0 ? (
                <div className="bg-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-2">🎯</p>
                  <p className="text-gray-400 font-medium">Chưa có đơn mới</p>
                  <p className="text-xs text-gray-500 mt-1">Đơn sẽ hiện ngay khi nhà hàng xong món</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {available.map((order) => {
                    const itemsSummary = order.order_items.slice(0, 2).map(i => `${i.name} x${i.quantity}`).join(', ') +
                      (order.order_items.length > 2 ? '...' : '')
                    const rest = order.restaurant as { name: string; address: string } | null

                    return (
                      <div key={order.id} className="bg-gray-800 rounded-2xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{order.delivery_type === 'food' ? '🍜' : '📦'}</span>
                            <div>
                              <p className="font-semibold text-sm">
                                {order.delivery_type === 'food' ? rest?.name : 'Giao hàng'}
                              </p>
                              <p className="text-xs text-gray-400 line-clamp-1">{itemsSummary}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-green-400">{formatCurrency(order.delivery_fee)}</p>
                            <p className="text-xs text-gray-400">phí ship</p>
                          </div>
                        </div>

                        <div className="bg-gray-700/50 rounded-xl p-2 mb-3 space-y-1">
                          {rest && (
                            <div className="flex items-center gap-2 text-xs text-gray-300">
                              <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0" />
                              <span className="truncate">{rest.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-300">
                            <MapPin size={10} className="text-red-400 flex-shrink-0" />
                            <span className="truncate">{order.delivery_address}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={!!accepting}
                            onClick={() => setAvailable((prev) => prev.filter((o) => o.id !== order.id))}
                            className="flex-1 bg-gray-700 text-gray-300 rounded-xl py-2.5 text-sm disabled:opacity-50"
                          >
                            Bỏ qua
                          </button>
                          <button
                            disabled={!!accepting}
                            onClick={() => acceptOrder(order)}
                            className="flex-[2] bg-orange-500 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {accepting === order.id
                              ? <><RefreshCw size={14} className="animate-spin" /> Đang nhận...</>
                              : 'Nhận đơn'
                            }
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
