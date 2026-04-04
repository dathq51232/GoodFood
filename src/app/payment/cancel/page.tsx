'use client'
import { useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderCode = searchParams.get('order_invoice_number') || ''

  useEffect(() => {
    // Call our cancel API to sync status
    if (orderCode) {
      fetch(`/api/orders/${orderCode}/cancel`, { method: 'POST' }).catch(() => {})
    }
  }, [orderCode])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#fff7ed',
      fontFamily: 'Be Vietnam Pro, Inter, sans-serif', padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🚫</div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#9a3412', marginBottom: 8 }}>
        Đã hủy thanh toán
      </p>
      <p style={{ fontSize: 14, color: '#c2410c', marginBottom: 32 }}>
        Bạn đã hủy quá trình thanh toán. Đơn hàng chưa được xử lý.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => router.push('/checkout')}
          style={{
            background: '#f97316', color: 'white', border: 'none', borderRadius: 12,
            padding: '12px 24px', fontWeight: 700, fontSize: 15, cursor: 'pointer',
          }}
        >
          Thử lại
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            background: 'white', color: '#374151', border: '1.5px solid #e5e7eb',
            borderRadius: 12, padding: '12px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer',
          }}
        >
          Về trang chủ
        </button>
      </div>
    </div>
  )
}

export default function PaymentCancelPage() {
  return <Suspense><CancelContent /></Suspense>
}
