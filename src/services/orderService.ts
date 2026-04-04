/**
 * orderService.ts — Toàn bộ business logic liên quan đến đơn hàng
 *
 * Nguyên tắc (backend-patterns - Service Layer):
 * - Không import NextRequest/NextResponse (không phụ thuộc HTTP layer)
 * - Nhận dữ liệu đã validated, trả kết quả hoặc throw ApiError
 * - API route gọi service, không chứa logic trực tiếp
 */

import { createServiceClient } from '@/lib/supabase/service'
import { buildSePayForm, cancelSePayOrder, SEPAY_CHECKOUT_URL } from '@/lib/sepay'
import { badRequest, notFound, forbidden } from '@/lib/errors'
import { generateOrderCode } from '@/lib/utils'
import type { CreateOrderInput } from '@/lib/validation'

// ─── Types ────────────────────────────────────────────────────────────────

/** Kết quả tạo đơn hàng */
export interface CreateOrderResult {
  code: string
  /** Có khi pay_method=transfer: thông tin form SePay để auto-submit */
  sepay?: {
    action: string
    fields: Record<string, string>
  }
}

// ─── Service functions ────────────────────────────────────────────────────

/**
 * Tạo đơn hàng mới.
 *
 * Flow:
 * 1. Validate menu items tồn tại và available
 * 2. Validate nhà hàng mở cửa + đủ đơn tối thiểu
 * 3. Tính tổng tiền
 * 4. Insert order + order_items (1 transaction qua service client)
 * 5. Nếu transfer → build SePay form với chữ ký HMAC-SHA256
 *
 * @param userId - ID user đã xác thực (từ Supabase auth)
 * @param input  - Dữ liệu đã validated bởi CreateOrderSchema
 * @param appUrl - Base URL app (cho SePay callback URLs)
 */
export async function createOrder(
  userId: string,
  input: CreateOrderInput,
  appUrl: string
): Promise<CreateOrderResult> {
  const db = createServiceClient()
  const { restaurant_id, items, delivery_address, note, pay_method } = input

  // ── 1. Validate menu items ─────────────────────────────────────────────
  // Dùng Promise.all để fetch song song (coding-standards: parallel async)
  const itemIds = items.map((i) => i.menu_item_id)
  const { data: menuItems, error: menuErr } = await db
    .from('menu_items')
    .select('id, name, price, is_available')   // Chỉ lấy cột cần thiết (backend-patterns: query optimization)
    .in('id', itemIds)

  if (menuErr || !menuItems?.length) {
    throw badRequest('Không thể lấy thông tin món ăn')
  }

  // Tính subtotal + kiểm tra từng món
  let subtotal = 0
  for (const item of items) {
    const menuItem = menuItems.find((m) => m.id === item.menu_item_id)
    if (!menuItem) throw badRequest(`Món ăn không tồn tại`)
    if (!menuItem.is_available) throw badRequest(`Món "${menuItem.name}" tạm thời không có`)
    subtotal += menuItem.price * item.quantity
  }

  // ── 2. Validate nhà hàng ──────────────────────────────────────────────
  const { data: restaurant, error: rErr } = await db
    .from('restaurants')
    .select('name, delivery_fee, min_order, is_open')
    .eq('id', restaurant_id)
    .single()

  if (rErr || !restaurant) throw badRequest('Nhà hàng không tồn tại')
  if (!restaurant.is_open) throw badRequest(`${restaurant.name} đang đóng cửa`)
  if (subtotal < restaurant.min_order) {
    throw badRequest(`Đơn tối thiểu ${restaurant.min_order.toLocaleString('vi')}đ`)
  }

  // ── 3. Tính tổng ─────────────────────────────────────────────────────
  const deliveryFee = restaurant.delivery_fee
  const total = subtotal + deliveryFee
  const code = generateOrderCode()

  // Giao hàng dự kiến 35 phút
  const ESTIMATED_DELIVERY_MINUTES = 35
  const estimatedDelivery = new Date(
    Date.now() + ESTIMATED_DELIVERY_MINUTES * 60 * 1000
  ).toISOString()

  // ── 4. Insert đơn hàng ────────────────────────────────────────────────
  const { data: order, error: orderErr } = await db
    .from('orders')
    .insert({
      code,
      customer_id: userId,
      restaurant_id,
      delivery_type: 'food',
      status: 'pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      delivery_address,
      note: note ?? null,
      pay_method,
      estimated_delivery: estimatedDelivery,
    })
    .select('id, code')
    .single()

  if (orderErr) throw orderErr  // Lỗi DB — sẽ bị handleError bắt → 500

  // Insert order items
  const orderItems = items.map((item) => {
    const menuItem = menuItems.find((m) => m.id === item.menu_item_id)!
    return {
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      name: menuItem.name,
      price: menuItem.price,
      quantity: item.quantity,
    }
  })
  const { error: itemsErr } = await db.from('order_items').insert(orderItems)
  if (itemsErr) throw itemsErr

  // ── 5. SePay form nếu chuyển khoản ───────────────────────────────────
  if (pay_method === 'transfer') {
    const sePayFields = buildSePayForm({
      order_amount: String(total),
      operation: 'PURCHASE',
      order_description: `GoodFood order ${order.code}`,
      order_invoice_number: order.code,
      success_url: `${appUrl}/payment/success`,
      error_url: `${appUrl}/payment/error`,
      cancel_url: `${appUrl}/payment/cancel`,
    })
    return {
      code: order.code,
      sepay: { action: SEPAY_CHECKOUT_URL, fields: sePayFields as Record<string, string> },
    }
  }

  return { code: order.code }
}

/**
 * Hủy đơn hàng.
 *
 * Quy tắc:
 * - Chỉ chủ đơn mới được hủy (kiểm tra customer_id)
 * - Không hủy đơn đã giao hoặc đã hủy trước đó
 * - Nếu đã thanh toán qua SePay → gọi SePay cancel API
 */
export async function cancelOrder(
  orderCode: string,
  userId: string
): Promise<void> {
  const db = createServiceClient()

  // Lấy thông tin đơn
  const { data: order, error } = await db
    .from('orders')
    .select('id, status, pay_method, customer_id')
    .eq('code', orderCode)
    .single()

  if (error || !order) throw notFound('đơn hàng')

  // Kiểm tra quyền — early return pattern (coding-standards)
  if (order.customer_id !== userId) throw forbidden()
  if (order.status === 'cancelled') return  // Idempotent: đã hủy → không làm gì
  if (order.status === 'delivered') throw badRequest('Không thể hủy đơn đã giao thành công')

  // Hủy trên SePay nếu là thanh toán chuyển khoản
  if (order.pay_method === 'transfer') {
    await cancelSePayOrder(orderCode)
  }

  // Cập nhật trạng thái trong DB
  const { error: updateErr } = await db
    .from('orders')
    .update({ status: 'cancelled' })
    .eq('id', order.id)

  if (updateErr) throw updateErr
}

/**
 * Lấy danh sách đơn hàng của user.
 * Sắp xếp mới nhất trước.
 */
export async function getUserOrders(userId: string) {
  const db = createServiceClient()

  const { data, error } = await db
    .from('orders')
    .select('*, restaurant:restaurants(name, image_url), order_items(*)')
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
