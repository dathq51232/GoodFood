'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, ChefHat, X, TrendingUp, ShoppingBag, DollarSign, Star, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/store/auth'
import { formatCurrency, getStatusLabel, getStatusColor } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OrderItem { name: string; price: number; quantity: number }
interface Order {
  id: string
  code: string
  status: string
  total: number
  note: string | null
  delivery_address: string
  pay_method: string
  created_at: string
  customer: { name: string; phone: string } | null
  order_items: OrderItem[]
}
interface Restaurant {
  id: string
  name: string
  is_open: boolean
  rating: number
}

type Tab = 'orders' | 'stats'

export default function RestaurantAdminPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthStore()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('orders')
  const [updating, setUpdating] = useState<string | null>(null)

  // Load restaurant + orders
  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/login?redirect=/restaurant-admin'); return }

    const supabase = createClient()

    const load = async () => {
      // Get restaurant owned by this user
      const { data: rest } = await supabase
        .from('restaurants')
        .select('id, name, is_open, rating')
        .eq('owner_id', user.id)
        .single()

      if (!rest) {
        // No restaurant yet — show setup prompt
        setLoading(false)
        return
      }

      setRestaurant(rest)

      // Load today's orders
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id, code, status, total, note, delivery_address, pay_method, created_at, customer:users!orders_customer_id_fkey(name, phone), order_items(name, price, quantity)')
        .eq('restaurant_id', rest.id)
        .gte('created_at', today.toISOString())
        .order('created_at', { ascending: false })

      setOrders((ordersData as Order[]) || [])
      setLoading(false)

      // Realtime
      const channel = supabase
        .channel(`restaurant-orders-${rest.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${rest.id}`,
        }, async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch full order with joins
            const { data: newOrder } = await supabase
              .from('orders')
              .select('id, code, status, total, note, delivery_address, pay_method, created_at, customer:users!orders_customer_id_fkey(name, phone), order_items(name, price, quantity)')
              .eq('id', payload.new.id)
              .single()
            if (newOrder) setOrders((prev) => [newOrder as Order, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) => prev.map((o) =>
              o.id === payload.new.id ? { ...o, status: payload.new.status } : o
            ))
          }
        })
        .subscribe()

      return () => { supabase.removeChannel(channel) }
    }

    load()
  }, [user, router])

  const updateOrder = async (orderId: string, status: string) => {
    setUpdating(orderId)
    const supabase = createClient()
    await supabase.from('orders').update({ status }).eq('id', orderId)
    setUpdating(null)
  }

  const toggleOpen = async () => {
    if (!restaurant) return
    const supabase = createClient()
    const newOpen = !restaurant.is_open
    await supabase.from('restaurants').update({ is_open: newOpen }).eq('id', restaurant.id)
    setRestaurant((prev) => prev ? { ...prev, is_open: newOpen } : prev)
  }

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status))
  const todayRevenue = orders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0)
  const pendingCount = orders.filter((o) => o.status === 'pending').length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">🏪</p>
        <h2 className="font-bold text-xl text-gray-900">Chưa có nhà hàng</h2>
        <p className="text-sm text-gray-500">Bạn chưa đăng ký nhà hàng nào. Liên hệ admin để được thiết lập.</p>
        <Button onClick={() => router.push('/')} variant="outline">Về trang chủ</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="font-bold text-xl text-gray-900">{restaurant.name}</h1>
            <p className="text-sm text-gray-500">Quản lý đơn hàng</p>
          </div>
          <button
            onClick={toggleOpen}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              restaurant.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            {restaurant.is_open ? 'Đang mở' : 'Đã đóng'}
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: ShoppingBag, label: 'Đơn hôm nay', value: `${orders.length}`, color: 'text-blue-500' },
            { icon: DollarSign, label: 'Doanh thu', value: todayRevenue >= 1000000 ? `${(todayRevenue/1000000).toFixed(1)}M` : `${Math.round(todayRevenue/1000)}K`, color: 'text-green-500' },
            { icon: Clock, label: 'Chờ xử lý', value: `${pendingCount}`, color: pendingCount > 0 ? 'text-red-500' : 'text-orange-500' },
            { icon: Star, label: 'Đánh giá', value: `${restaurant.rating.toFixed(1)}`, color: 'text-yellow-500' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2 text-center">
              <Icon size={16} className={`${color} mx-auto mb-1`} />
              <p className={`font-bold text-sm ${pendingCount > 0 && label === 'Chờ xử lý' ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
              <p className="text-[10px] text-gray-500 leading-tight">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100">
        {([
          { key: 'orders', label: `Đang hoạt động (${activeOrders.length})` },
          { key: 'stats', label: 'Hôm nay' },
        ] as { key: Tab; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4 pt-4 max-w-lg mx-auto">
        {tab === 'orders' && (
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <ShoppingBag size={40} className="mx-auto mb-2 opacity-30" />
                <p className="font-medium">Chưa có đơn hàng mới</p>
                <p className="text-xs mt-1">Đơn hàng sẽ xuất hiện realtime khi khách đặt</p>
              </div>
            ) : (
              activeOrders.map((order) => (
                <div key={order.id} className={`bg-white rounded-2xl p-4 border shadow-sm ${
                  order.status === 'pending' ? 'border-orange-200 ring-1 ring-orange-200' : 'border-gray-100'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">#{order.code}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(order.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="mb-2 space-y-0.5">
                    <p className="text-sm font-medium text-gray-700">
                      👤 {(order.customer as { name: string } | null)?.name || 'Khách hàng'}
                    </p>
                    <p className="text-xs text-gray-500">📍 {order.delivery_address}</p>
                    {order.note && <p className="text-xs text-orange-600">📝 {order.note}</p>}
                    <p className="text-xs text-gray-400">
                      💳 {order.pay_method === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-2 mb-3">
                    {order.order_items.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs text-gray-700">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 mt-1.5 pt-1.5 flex justify-between font-semibold text-sm">
                      <span>Tổng</span>
                      <span className="text-orange-500">{formatCurrency(order.total)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          disabled={updating === order.id}
                          onClick={() => updateOrder(order.id, 'cancelled')}
                          className="flex-1 flex items-center justify-center gap-1 py-2 border border-red-200 text-red-500 rounded-xl text-sm disabled:opacity-50"
                        >
                          <X size={14} /> Từ chối
                        </button>
                        <button
                          disabled={updating === order.id}
                          onClick={() => updateOrder(order.id, 'confirmed')}
                          className="flex-[2] flex items-center justify-center gap-1 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold disabled:opacity-50"
                        >
                          {updating === order.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          Xác nhận
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        disabled={updating === order.id}
                        onClick={() => updateOrder(order.id, 'preparing')}
                        className="w-full flex items-center justify-center gap-1 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {updating === order.id ? <RefreshCw size={14} className="animate-spin" /> : <ChefHat size={14} />}
                        Bắt đầu nấu
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        disabled={updating === order.id}
                        onClick={() => updateOrder(order.id, 'ready')}
                        className="w-full flex items-center justify-center gap-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium disabled:opacity-50"
                      >
                        {updating === order.id ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                        Đã xong · Chờ shipper
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <div className="w-full text-center py-2 rounded-xl text-sm bg-purple-100 text-purple-700 font-medium">
                        Đang chờ shipper đến lấy
                      </div>
                    )}
                    {order.status === 'picking_up' && (
                      <div className="w-full text-center py-2 rounded-xl text-sm bg-indigo-100 text-indigo-700 font-medium">
                        Shipper đang lấy hàng
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'stats' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-orange-500" /> Thống kê hôm nay
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tổng đơn', value: `${orders.length}` },
                  { label: 'Đã giao', value: `${orders.filter(o => o.status === 'delivered').length}` },
                  { label: 'Đang xử lý', value: `${activeOrders.length}` },
                  { label: 'Đã huỷ', value: `${orders.filter(o => o.status === 'cancelled').length}` },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">{label}</p>
                    <p className="font-bold text-gray-900 text-xl mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Doanh thu hôm nay</p>
              <p className="font-bold text-2xl text-orange-500">{formatCurrency(todayRevenue)}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-2">
              <p className="font-semibold text-sm">Đơn gần nhất</p>
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">#{o.code}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(o.status)}`}>{getStatusLabel(o.status)}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(o.total)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
