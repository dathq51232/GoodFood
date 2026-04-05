import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/layout/AuthProvider'

export const metadata: Metadata = {
  title: 'GoodFood — Giao hàng & Đồ ăn',
  description: 'Đặt đồ ăn và giao hàng nhanh tại khu vực Hoài Đức, Xuân Lộc',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#080c14',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-screen antialiased" style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
