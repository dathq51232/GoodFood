import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Lỗi API có thể dự đoán được (validation, auth, not found, ...).
 * Throw class này thay vì NextResponse trực tiếp trong service/API route.
 *
 * @example
 * throw new ApiError(404, 'Không tìm thấy đơn hàng')
 * throw new ApiError(403, 'Không có quyền thực hiện thao tác này')
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
    // Cần thiết khi extend built-in class trong TypeScript
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

// ─── Các lỗi thường gặp (dùng factory functions cho DRY) ──────────────────

/** 400 — Dữ liệu đầu vào không hợp lệ */
export const badRequest = (msg: string) => new ApiError(400, msg)

/** 401 — Chưa đăng nhập */
export const unauthorized = (msg = 'Vui lòng đăng nhập') => new ApiError(401, msg)

/** 403 — Không có quyền */
export const forbidden = (msg = 'Không có quyền thực hiện thao tác này') => new ApiError(403, msg)

/** 404 — Không tìm thấy */
export const notFound = (resource: string) => new ApiError(404, `Không tìm thấy ${resource}`)

/** 409 — Xung đột dữ liệu (ví dụ: đã tồn tại) */
export const conflict = (msg: string) => new ApiError(409, msg)

// ─── Handler tập trung ────────────────────────────────────────────────────

/**
 * Chuyển đổi bất kỳ Error nào thành NextResponse đúng format.
 * Dùng trong try/catch của mọi API route.
 *
 * Response format:
 * - Thành công: { success: true, data: ... }
 * - Lỗi:       { success: false, error: 'Mô tả lỗi' }
 *
 * @example
 * export async function POST(req: NextRequest) {
 *   try {
 *     const data = await orderService.create(...)
 *     return NextResponse.json({ success: true, data })
 *   } catch (err) {
 *     return handleError(err)
 *   }
 * }
 */
export function handleError(err: unknown): NextResponse {
  // Lỗi validation Zod — trả 400 kèm chi tiết từng field
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Dữ liệu không hợp lệ',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    )
  }

  // Lỗi nghiệp vụ có thể dự đoán
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: err.statusCode }
    )
  }

  // Lỗi không mong đợi — log server-side, ẩn chi tiết với client
  console.error('[GoodFood API Error]', err)
  return NextResponse.json(
    { success: false, error: 'Lỗi hệ thống, vui lòng thử lại sau' },
    { status: 500 }
  )
}
