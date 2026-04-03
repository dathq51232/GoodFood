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
      if (err) { setError(`Lỗi: ${err.message}`); setLoading(false); return }
      if (!data?.url) { setError('Không nhận được URL. Kiểm tra Google OAuth trong Supabase.'); setLoading(false); return }
      window.location.assign(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : JSON.stringify(e))
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080c14 !important; }
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #080c14;
          font-family: 'Be Vietnam Pro', Inter, sans-serif;
          -webkit-font-smoothing: antialiased;
          padding: 20px;
        }
        .login-wrap { width: 100%; max-width: 420px; }
        .login-header { text-align: center; margin-bottom: 28px; }
        .login-icon { font-size: 52px; margin-bottom: 8px; display: block; }
        .login-title { font-size: 26px; font-weight: 900; letter-spacing: -1px; color: #e6eaf4; }
        .login-sub { font-size: 13px; color: #445570; margin-top: 4px; }
        .login-card {
          background: #121b2a;
          border: 1.5px solid #243348;
          border-radius: 26px;
          padding: 28px 24px 32px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }
        .login-card-title { font-size: 17px; font-weight: 800; color: #e6eaf4; margin-bottom: 6px; text-align: center; }
        .login-card-sub { font-size: 13px; color: #8496b5; text-align: center; margin-bottom: 24px; }
        .google-btn {
          width: 100%;
          background: #0e1520;
          border: 1.5px solid #1a2a40;
          border-radius: 14px;
          padding: 15px 0;
          color: #e6eaf4;
          font-weight: 700;
          font-size: 15px;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .google-btn:hover:not(:disabled) { background: #162030; border-color: #243348; }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .divider { display: flex; align-items: center; gap: 12; margin: 20px 0; }
        .divider-line { height: 1px; flex: 1; background: #1a2a40; }
        .divider-text { font-size: 12px; color: #445570; padding: 0 4px; }
        .error-box {
          background: rgba(240,82,82,0.09);
          border: 1px solid rgba(240,82,82,0.27);
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13px;
          color: #f05252;
          margin-top: 16px;
        }
        .footer-text { text-align: center; font-size: 12px; color: #445570; margin-top: 20px; line-height: 1.6; }
      `}</style>

      <div className="login-root">
        <div className="login-wrap">
          {/* Header */}
          <div className="login-header">
            <span className="login-icon">🚀</span>
            <div className="login-title">GoodFood</div>
            <div className="login-sub">Giao hàng nhanh · Đức Tài đến ngã ba Ông Đồn</div>
          </div>

          {/* Card */}
          <div className="login-card">
            <div className="login-card-title">Chào mừng trở lại</div>
            <div className="login-card-sub">Đăng nhập để đặt hàng và theo dõi đơn của bạn</div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ height: '1px', flex: 1, background: '#1a2a40' }} />
              <span style={{ fontSize: '12px', color: '#445570' }}>Tiếp tục với</span>
              <div style={{ height: '1px', flex: 1, background: '#1a2a40' }} />
            </div>

            {/* Google Button */}
            <button className="google-btn" onClick={handleGoogleLogin} disabled={loading}>
              {loading ? (
                <>
                  <div style={{ width: 18, height: 18, border: '2px solid #445570', borderTopColor: '#f0b429', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Đang chuyển hướng...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.8 2.4 30.2 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.2 17.8 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 6.9-10.1 7.1-17z"/>
                    <path fill="#FBBC05" d="M10.6 28.6A14.9 14.9 0 0 1 9.5 24c0-1.6.3-3.1.7-4.6L2.3 13.3A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.9-6.1z"/>
                    <path fill="#34A853" d="M24 48c6.5 0 12-2.1 16-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-3.7-13.4-9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/>
                  </svg>
                  Tiếp tục với Google
                </>
              )}
            </button>

            {error && <div className="error-box">⚠️ {error}</div>}
          </div>

          <div className="footer-text">
            Bằng cách tiếp tục, bạn đồng ý với<br />
            <span style={{ color: '#f0b429', fontWeight: 700 }}>Điều khoản dịch vụ</span> của GoodFood
          </div>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
