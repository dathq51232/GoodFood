'use client'
import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChefHat, Bike, PackageCheck, Phone, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getStatusLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Order } from '@/types/database'

const ORDER_STEPS = [
  { key: 'pending',     label: 'Chờ xác nhận',       icon: Clock },
  { key: 'confirmed',   label: 'Đã xác nhận',         icon: CheckCircle2 },
  { key: 'preparing',   label: 'Đang chuẩn bị',       icon: ChefHat },
  { key: 'picking_up',  label: 'Shipper đang lấy hàng', icon: Bike },
  { key: 'delivering',  label: 'Đang giao hàng',       icon: Bike },
  { key: 'delivered',   label: 'Đã giao thành công',   icon: PackageCheck },
]

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'picking_up', 'delivering', 'delivered']

export default function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>
  searchParams: Promise<{ new?: string }>
}) {
  const { code } = use(params)
  const { new: isNew } = use(searchParams)

  const [order, setOrder] = useState<Order | null>(null)
  const [status, setStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)

  // Load order from DB
  useEffect(() => {
    const supabase = createClient()

    supabase
      .from('orders')
      .select('*, restaurant:restaurants(name, address, phone), driver:users!orders_driver_id_fkey(name, phone)')
      .eq('code', code)
      .single()
      .then(({ data }) => {
        if (data) {
          setOrder(data as Order)
          setStatus(data.status)
        }
        setLoading(false)
      })
  }, [code])

  // Realtime subscription
  useEffect(() => {
    if (!order?.id) return

    const supabase = createClient()

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          const updated = payload.new as Order
          setStatus(updated.status)
          setOrder((prev) => prev ? { ...prev, ...updated } : prev)
        }
      )
      .subscribe((state) => {
        setConnected(state === 'SUBSCRIBED')
      })

    return () => { supabase.removeChannel(channel) }
  }, [order?.id])

  // Simulate progression for demo orders (when ?new=1 and no driver yet)
  useEffect(() => {
    if (!isNew || !order) return
    // Only auto-progress if order is brand new (pending)
    if (order.status !== 'pending') return

    const progressMap: Record<string, string> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'picking_up',
      picking_up: 'delivering',
      delivering: 'delivered',
    }

    const delays: Record<string, number> = {
      pending: 3000,
      confirmed: 6000,
      preparing: 12000,
      picking_up: 8000,
      delivering: 15000,
    }

    let currentStatus = 'pending'
    const timers: ReturnType<typeof setTimeout>[] = []
    let accumulated = 0

    for (const [from, to] of Object.entries(progressMap)) {
      accumulated += delays[from]
      const delay = accumulated
      const t = setTimeout(() => {
        if (currentStatus === from) {
          currentStatus = to
          setStatus(to)
          // Also update in DB if order exists
          const supabase = createClient()
          supabase.from('orders').update({ status: to }).eq('code', code).then(() => {})
        }
      }, delay)
      timers.push(t)
    }

    return () => timers.forEach(clearTimeout)
  }, [isNew, order?.id, code])

  const currentIdx = STATUS_ORDER.indexOf(status)
  const isDone = status === 'delivered'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Đang tải đơn hàng...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className={`px-4 pt-12 pb-6 transition-colors ${isDone ? 'bg-green-500' : 'bg-orange-500'} text-white`}>
          <div className="flex items-center gap-2 mb-2">
            {!isDone && connected && (
              <span className="flex items-center gap-1.5 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                Realtime
              </span>
            )}
          </div>
          {isDone ? (
            <div className="text-center">
              <div className="text-6xl mb-2">🎉</div>
              <h1 className="text-2xl font-bold">Giao hàng thành công!</h1>
              <p className="text-sm opacity-80 mt-1">Cảm ơn bạn đã tin tưởng Hoài Đức Express</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{getStatusLabel(status)}</h1>
              <p className="text-sm opacity-80 mt-1">Mã đơn: #{code}</p>
            </>
          )}
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Progress tracker */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <h2 className="font-semibold text-sm mb-4">Trạng thái đơn hàng</h2>
            <div className="space-y-0">
              {ORDER_STEPS.map((step, i) => {
                const stepIdx = STATUS_ORDER.indexOf(step.key)
                const done = stepIdx <= currentIdx
                const active = stepIdx === currentIdx
                const Icon = step.icon
                const isLast = i === ORDER_STEPS.length - 1
                return (
                  <div key={step.key} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                        done ? active ? 'bg-orange-500 text-white ring-4 ring-orange-100' : 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        <Icon size={15} />
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 h-6 my-0.5 transition-colors ${stepIdx < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <div className="flex-1 pt-1.5 pb-3">
                      <p className={`text-sm font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                        {active && !isDone && (
                          <span className="ml-2 inline-flex items-center gap-1 text-xs text-orange-500 font-normal">
                            <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                            Đang xử lý
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ETA */}
          {!isDone && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
              <Clock size={20} className="text-orange-500" />
              <div>
                <p className="font-semibold text-sm text-gray-900">Dự kiến giao hàng</p>
                <p className="text-xs text-gray-600">Trong vòng 20–35 phút</p>
              </div>
            </div>
          )}

          {/* Driver info */}
          {(status === 'picking_up' || status === 'delivering') && (
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <p className="font-semibold text-sm mb-3">Thông tin shipper</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">👨‍💼</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {(order?.driver as { name?: string } | null)?.name || 'Đang tìm shipper...'}
                  </p>
                  <p className="text-xs text-gray-500">Xe máy · Khu vực Hoài Đức</p>
                </div>
                {(order?.driver as { phone?: string } | null)?.phone && (
                  <a href={`tel:${(order?.driver as { phone?: string }).phone}`}
                    className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone size={16} className="text-green-600" />
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Order info */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-1">
            <p className="font-semibold text-sm mb-2">Chi tiết đơn hàng</p>
            <p className="text-xs text-gray-500">Mã đơn: <span className="font-medium text-gray-700">#{code}</span></p>
            {order?.restaurant && (
              <p className="text-xs text-gray-500">Nhà hàng: <span className="font-medium text-gray-700">{(order.restaurant as { name: string }).name}</span></p>
            )}
            {order?.delivery_address && (
              <p className="text-xs text-gray-500">Giao đến: <span className="font-medium text-gray-700">{order.delivery_address}</span></p>
            )}
            {order?.total && (
              <p className="text-xs text-gray-500">Tổng tiền: <span className="font-medium text-orange-500">{order.total.toLocaleString('vi')}đ</span></p>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-2">
            {isDone ? (
              <>
                <Button variant="primary" size="lg" className="w-full">⭐ Đánh giá đơn hàng</Button>
                <Link href="/"><Button variant="outline" size="lg" className="w-full">Đặt thêm</Button></Link>
              </>
            ) : (
              <Link href="/"><Button variant="outline" size="lg" className="w-full">Về trang chủ</Button></Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
