/**
 * /api/orders
 *
 * API route chỉ làm 3 việc (backend-patterns):
 * 1. Xác thực user session
 * 2. Validate input bằng Zod
 * 3. Gọi service và trả response
 *
 * Toàn bộ business logic nằm trong src/services/orderService.ts
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { CreateOrderSchema } from '@/lib/validation'
import { handleError, unauthorized } from '@/lib/errors'
import { createOrder, getUserOrders } from '@/services/orderService'

// ─── POST /api/orders — Tạo đơn hàng ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    // 2. Validate input
    const body = await req.json()
    const input = CreateOrderSchema.parse(body)  // Throw ZodError nếu sai

    // 3. Gọi service
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
    const result = await createOrder(user.id, input, appUrl)

    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (err) {
    return handleError(err)
  }
}

// ─── GET /api/orders — Lấy danh sách đơn hàng ─────────────────────────────
export async function GET() {
  try {
    // 1. Xác thực session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw unauthorized()

    // 2. Gọi service (không cần validate — không có input)
    const orders = await getUserOrders(user.id)

    return NextResponse.json({ success: true, data: orders })
  } catch (err) {
    return handleError(err)
  }
}
