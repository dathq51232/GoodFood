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

// Dark-friendly status colors
function statusStyle(status: string): { bg: string; color: string } {
  switch (status) {
    case 'pending':    return { bg: 'rgba(240,180,41,0.15)',  color: '#f0b429' }
    case 'confirmed':  return { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' }
    case 'preparing':  return { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa' }
    case 'delivering': return { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc' }
    case 'delivered':  return { bg: 'rgba(34,197,94,0.15)',   color: '#22c55e' }
    case 'cancelled':  return { bg: 'rgba(239,68,68,0.15)',   color: '#f87171' }
    default:           return { bg: 'rgba(136,136,136,0.15)', color: '#888888' }
  }
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
        setOrders((data as unknown as OrderRow[]) || [])
        setLoading(false)
      })
  }, [user, router])

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-lg mx-auto px-4 pt-12">
        <h1 className="font-black text-2xl mb-5" style={{ color: 'var(--color-text)' }}>
          Đơn hàng
        </h1>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-shimmer" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20" style={{ color: 'var(--color-muted)' }}>
            <p className="text-5xl mb-3">📋</p>
            <p className="font-medium text-sm">Chưa có đơn hàng nào</p>
            <Link
              href="/"
              className="mt-4 inline-block text-sm font-bold px-5 py-2 rounded-full"
              style={{ background: 'var(--color-gold)', color: '#080c14' }}
            >
              Đặt ngay
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const itemsSummary = order.order_items
                .slice(0, 2)
                .map((i) => `${i.name} x${i.quantity}`)
                .join(', ') + (order.order_items.length > 2 ? '...' : '')
              const ss = statusStyle(order.status)

              return (
                <Link key={order.code} href={`/orders/${order.code}`}>
                  <div
                    className="p-4 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>
                        {order.restaurant?.name || 'Giao hàng'}
                      </p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: ss.bg, color: ss.color }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                    <p className="text-xs line-clamp-1" style={{ color: 'var(--color-muted)' }}>
                      {itemsSummary}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <p className="text-xs" style={{ color: 'var(--color-subtle)' }}>
                        {new Date(order.created_at).toLocaleDateString('vi-VN', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                      <p className="font-black text-sm" style={{ color: 'var(--color-gold)' }}>
                        {formatCurrency(order.total)}
                      </p>
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
