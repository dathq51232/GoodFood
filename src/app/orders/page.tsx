'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { useAuthStore } from '@/store/auth'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel, getStatusColor, formatCurrency } from '@/lib/utils'

interface OrderRow {
  id: string
  code: string
  status: string
  total: number
  created_at: string
  restaurant: { name: string } | null
  order_items: { name: string; quantity: number }[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { router.push('/auth/login?redirect=/orders'); return }
    const supabase = createClient()
    supabase
      .from('orders')
      .select('id, code, status, total, created_at, restaurant:restaurants(name), order_items(name, quantity)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders((data as OrderRow[]) || [])
        setLoading(false)
      })
  }, [user, router])

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-lg mx-auto px-4 pt-12">
        <h1 className="font-bold text-xl text-gray-900 mb-4">Đơn hàng của tôi</h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium">Chưa có đơn hàng nào</p>
            <Link href="/" className="mt-3 inline-block text-orange-500 text-sm font-medium">Đặt ngay</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const itemsSummary = order.order_items
                .slice(0, 2)
                .map((i) => `${i.name} x${i.quantity}`)
                .join(', ') + (order.order_items.length > 2 ? '...' : '')

              return (
                <Link key={order.code} href={`/orders/${order.code}`}>
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-semibold text-gray-900">
                        {order.restaurant?.name || 'Giao hàng'}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1">{itemsSummary}</p>
                    <div className="flex items-center justify-between mt-2.5">
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="font-bold text-orange-500 text-sm">{formatCurrency(order.total)}</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  )
}
