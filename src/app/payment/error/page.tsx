'use client'
import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function ErrorContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const message = searchParams.get('message') || 'Thanh toán thất bại'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#fff1f2',
      fontFamily: 'Be Vietnam Pro, Inter, sans-serif', padding: 24, textAlign: 'center',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
      <p style={{ fontSize: 22, fontWeight: 800, color: '#9f1239', marginBottom: 8 }}>
        Thanh toán thất bại
      </p>
      <p style={{ fontSize: 14, color: '#e11d48', marginBottom: 32, maxWidth: 300 }}>
        {decodeURIComponent(message)}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => router.back()}
          style={{
            background: '#ef4444', color: 'white', border: 'none', borderRadius: 12,
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

export default function PaymentErrorPage() {
  return <Suspense><ErrorContent /></Suspense>
}
