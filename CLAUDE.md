# GoodFood — Hướng dẫn dự án cho Claude

## Tổng quan
Ứng dụng giao đồ ăn phục vụ khu vực **Đức Tài · Trà Tân · Xuân Lộc · Ông Đồn · Lâm Đồng**.
Stack: **Next.js 16 (App Router + Turbopack)** + **Supabase** + **Tailwind CSS** + **SePay**.

---

## Cấu trúc thư mục

```
src/
├── app/                        # Next.js App Router (pages + API routes)
│   ├── api/                    # API endpoints (chỉ validate + gọi service)
│   │   ├── orders/             # POST tạo đơn, GET danh sách
│   │   │   └── [code]/cancel/  # POST hủy đơn
│   │   └── sepay/test/         # Debug endpoint (XÓA trước production thật)
│   ├── auth/                   # Đăng nhập / OAuth callback
│   ├── checkout/               # Trang xác nhận đơn hàng
│   ├── orders/                 # Danh sách + chi tiết đơn
│   ├── payment/                # Callbacks SePay (success/cancel/error)
│   ├── restaurant/[id]/        # Trang nhà hàng
│   ├── restaurant-admin/       # Dashboard chủ nhà hàng
│   ├── shipper/                # Dashboard shipper
│   ├── profile/                # Trang cá nhân
│   └── settings/               # Cài đặt
│
├── components/                 # React components (UI thuần túy)
│   ├── layout/                 # Header, BottomNav, DesktopNav
│   ├── customer/               # RestaurantCard, CategoryFilter
│   ├── map/                    # MapPicker, ServiceAreaMap (Leaflet)
│   └── ui/                     # Button, Input (generic)
│
├── lib/                        # Thư viện tiện ích
│   ├── supabase/
│   │   ├── client.ts           # Client-side Supabase (anon key)
│   │   ├── server.ts           # Server-side Supabase (anon key + cookies)
│   │   └── service.ts          # Service role client (bypass RLS)
│   ├── sepay.ts                # SePay: chữ ký HMAC, build form, cancel API
│   ├── errors.ts               # ApiError class — xử lý lỗi tập trung
│   ├── validation.ts           # Zod schemas cho mọi API input
│   └── utils.ts                # formatCurrency, generateOrderCode, ...
│
├── services/                   # Business logic (tách khỏi API routes)
│   ├── orderService.ts         # Tạo đơn, hủy đơn, lấy danh sách
│   └── restaurantService.ts    # Lấy nhà hàng, validate
│
├── store/                      # Zustand state management
│   ├── auth.ts                 # useAuthStore (user, loading)
│   └── cart.ts                 # useCartStore (items, restaurant, total)
│
└── types/
    └── database.ts             # TypeScript types cho mọi bảng Supabase
```

---

## Quy tắc quan trọng

### API Routes — chỉ làm 3 việc
1. **Validate** input (Zod)
2. **Gọi** service
3. **Trả** response theo format chuẩn

### Response format nhất quán
```typescript
// Thành công
{ success: true, data: ... }

// Lỗi
{ success: false, error: 'Mô tả lỗi tiếng Việt' }
```

### Supabase clients — dùng đúng loại
| Client | Key | Dùng khi |
|--------|-----|----------|
| `createClient()` (server) | anon | Xác thực user session |
| `createServiceClient()` | service_role | Ghi DB trong API routes |
| `createClient()` (browser) | anon | Client components |

### Coding standards (từ skill coding-standards)
- Tên biến/hàm rõ ràng, dạng verb-noun: `fetchOrders`, `createOrder`, `isUserLoggedIn`
- Dùng TypeScript types, không dùng `any`
- Early return thay vì nested if
- Tránh magic numbers — dùng constants có tên
- Parallel async khi các tác vụ độc lập: `Promise.all([...])`

---

## Môi trường
```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...      # Server only, không lộ ra client
SEPAY_MERCHANT_ID=SP-TEST-DH832993
SEPAY_SECRET_KEY=spsk_test_...
SEPAY_SANDBOX=true
NEXT_PUBLIC_APP_URL=https://hoai-duc-delivery.vercel.app
```

---

## Skills đang áp dụng
- `nextjs-turbopack` — Next.js 16 App Router + Turbopack
- `backend-patterns` — Service layer, error handling, structured logging
- `coding-standards` — TypeScript, naming, DRY, KISS, early returns
- `api-design` — REST conventions, consistent response format, Zod validation
