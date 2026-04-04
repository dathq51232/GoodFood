import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cancelSePayOrder } from '@/lib/sepay'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  if (!code) return NextResponse.json({ error: 'Thiếu mã đơn hàng' }, { status: 400 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  // Verify order belongs to user and is cancellable
  const { data: order, error: fetchErr } = await supabase
    .from('orders')
    .select('id, status, pay_method, customer_id')
    .eq('code', code)
    .single()

  if (fetchErr || !order) return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 })
  if (order.customer_id !== user.id) return NextResponse.json({ error: 'Không có quyền hủy đơn này' }, { status: 403 })
  if (order.status === 'cancelled') return NextResponse.json({ message: 'Đơn đã được hủy trước đó' })
  if (order.status === 'delivered') return NextResponse.json({ error: 'Không thể hủy đơn đã giao' }, { status: 400 })

  // Cancel on SePay side if it was a transfer payment
  if (order.pay_method === 'transfer') {
    await cancelSePayOrder(code)
  }

  // Update order status in DB
  const { error: updateErr } = await supabase
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  if (updateErr) return NextResponse.json({ error: 'Không thể hủy đơn hàng' }, { status: 500 })

  return NextResponse.json({ message: 'Đã hủy đơn hàng thành công' })
}
