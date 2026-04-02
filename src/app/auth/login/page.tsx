'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function LoginContent() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    try {
      document.cookie = `oauth_next=${encodeURIComponent(redirect)}; path=/; max-age=300; SameSite=Lax`
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) {
        setError(`Lỗi Supabase: ${err.message} (${err.status ?? ''})`)
        setLoading(false)
        return
      }
      if (!data?.url) {
        setError('Không nhận được URL từ Supabase. Kiểm tra Google OAuth trong Supabase Dashboard.')
        setLoading(false)
        return
      }
      window.location.assign(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : JSON.stringify(e))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="text-6xl mb-4">🚀</div>
          <h1 className="text-2xl font-bold text-gray-900">Hoài Đức Express</h1>
          <p className="text-sm text-gray-500 mt-1">Giao hàng nhanh · Khu vực Hoài Đức & Xuân Lộc</p>
        </div>

        {/* Google button */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl py-4 font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors shadow-sm disabled:opacity-60 text-base"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.6-11.3-6.5l-6.5 5C9.6 40 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C40.9 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
            )}
            {loading ? 'Đang chuyển hướng...' : 'Tiếp tục với Google'}
          </button>

          {error && (
            <p className="text-sm text-red-600 text-center bg-red-50 rounded-xl px-4 py-2">{error}</p>
          )}
        </div>

        <p className="text-xs text-center text-gray-400">
          Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
