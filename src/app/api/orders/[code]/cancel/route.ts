/**
 * /api/orders/[code]/cancel
 *
 * POST — Hủy đơn hàng theo mã code.
 * Business logic nằm trong orderService.cancelOrder().
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleError, unauthorized, badRequest } from '@/lib/errors'
import { cancelOrder } from '@/services/orderService'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    // 1. Lấy mã đơn từ URL params
    const { code } = await params
    if (!code) throw badRequest('Thiếu mã đơn hàng')

    // 2. Xác thực session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    // 3. Gọi service
    await cancelOrder(code, user.id)

    return NextResponse.json({ success: true, data: { message: 'Đã hủy đơn hàng thành công' } })
  } catch (err) {
    return handleError(err)
  }
}
