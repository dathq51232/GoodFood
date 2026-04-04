import { z } from 'zod'

// ─── Orders ───────────────────────────────────────────────────────────────

/**
 * Schema tạo đơn hàng — dùng trong POST /api/orders
 *
 * Giải thích từng field:
 * - restaurant_id: UUID nhà hàng (bắt buộc)
 * - items: mảng món ăn, mỗi phần tử gồm menu_item_id + quantity ≥ 1
 * - delivery_address: địa chỉ giao hàng, không được rỗng
 * - note: ghi chú tùy chọn (ví dụ: "ít đường, không hành")
 * - pay_method: chỉ chấp nhận 'cash' hoặc 'transfer'
 */
export const CreateOrderSchema = z.object({
  restaurant_id: z.string().uuid('ID nhà hàng không hợp lệ'),
  items: z
    .array(
      z.object({
        menu_item_id: z.string().uuid('ID món ăn không hợp lệ'),
        quantity: z.number().int().min(1, 'Số lượng tối thiểu là 1'),
      })
    )
    .min(1, 'Giỏ hàng không được rỗng'),
  delivery_address: z.string().min(5, 'Địa chỉ giao hàng quá ngắn'),
  note: z.string().max(500).optional(),
  pay_method: z.enum(['cash', 'transfer']).default('cash'),
})

/** Type tự động từ schema — dùng trong service */
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>

// ─── Restaurants ──────────────────────────────────────────────────────────

/**
 * Schema đăng ký nhà hàng — dùng trong POST /api/restaurants
 */
export const CreateRestaurantSchema = z.object({
  name: z.string().min(2, 'Tên nhà hàng tối thiểu 2 ký tự').max(100),
  address: z.string().min(5, 'Địa chỉ quá ngắn'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Số điện thoại không hợp lệ'),
  category: z.string().min(1, 'Chọn danh mục'),
  description: z.string().max(500).optional(),
  delivery_fee: z.number().min(0).max(100_000),
  min_order: z.number().min(0).max(1_000_000),
})

export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>

// ─── Users ────────────────────────────────────────────────────────────────

/**
 * Schema cập nhật thông tin cá nhân — dùng trong PATCH /api/profile
 */
export const UpdateProfileSchema = z.object({
  name: z.string().min(2, 'Tên tối thiểu 2 ký tự').max(100),
})

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
