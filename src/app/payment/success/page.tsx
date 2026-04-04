'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/store/cart'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCartStore()
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading')

  useEffect(() => {
    const orderCode = searchParams.get('order_invoice_number')
    if (!orderCode) { router.replace('/'); return }

    const run = async () => {
      try {
        const supabase = createClient()
        // Mark order as confirmed after successful payment
        await supabase
          .from('orders')
          .update({ pay_method: 'transfer', status: 'confirmed' })
          .eq('code', orderCode)

        clearCart()
        setStatus('done')
        setTimeout(() => router.replace(`/orders/${orderCode}`), 2000)
      } catch {
        setStatus('error')
      }
    }
    run()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#f0fdf4',
      fontFamily: 'Be Vietnam Pro, Inter, sans-serif', padding: 24, textAlign: 'center',
    }}>
      {status === 'loading' && (
        <>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>Đang xác nhận thanh toán...</p>
        </>
      )}
      {status === 'done' && (
        <>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#166534', marginBottom: 8 }}>Thanh toán thành công!</p>
          <p style={{ fontSize: 14, color: '#4ade80' }}>Đang chuyển đến trang theo dõi đơn hàng...</p>
        </>
      )}
      {status === 'error' && (
        <>
          <div style={{ fontSize: 52, marginBottom: 16 }}>⚠️</div>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 16 }}>
            Không thể xác nhận đơn hàng. Vui lòng liên hệ hỗ trợ.
          </p>
          <a href="/" style={{ color: '#f97316', fontWeight: 700 }}>Về trang chủ</a>
        </>
      )}
    </div>
  )
}

export default function PaymentSuccessPage() {
  return <Suspense><SuccessContent /></Suspense>
}
