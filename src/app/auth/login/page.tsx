'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Phone, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type Step = 'phone' | 'otp' | 'name'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('0')) return '+84' + digits.slice(1)
    if (digits.startsWith('84')) return '+' + digits
    return '+84' + digits
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      const supabase = createClient()
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
        },
      })
      if (err) throw err
      if (data?.url) window.location.assign(data.url)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Đăng nhập Google thất bại')
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (phone.replace(/\D/g, '').length < 9) {
      setError('Vui lòng nhập số điện thoại hợp lệ')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithOtp({
      phone: formatPhone(phone),
    })
    setLoading(false)
    if (err) {
      setError(err.message === 'SMS not enabled' ? 'SMS chưa được bật. Liên hệ admin.' : err.message)
      return
    }
    setStep('otp')
    setCountdown(60)
  }

  const handleVerifyOTP = async () => {
    if (otp.length < 6) {
      setError('Mã OTP gồm 6 chữ số')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data, error: err } = await supabase.auth.verifyOtp({
      phone: formatPhone(phone),
      token: otp,
      type: 'sms',
    })
    if (err) {
      setLoading(false)
      setError('Mã OTP không đúng hoặc đã hết hạn')
      return
    }
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', data.user!.id)
      .single()

    setLoading(false)
    if (!userData?.name) {
      setStep('name')
    } else {
      router.push(redirect)
    }
  }

  const handleSaveName = async () => {
    if (name.trim().length < 2) {
      setError('Vui lòng nhập họ tên')
      return
    }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('users').upsert({
      id: user!.id,
      phone: formatPhone(phone),
      name: name.trim(),
      role: 'customer',
    })
    setLoading(false)
    router.push(redirect)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-500 to-red-400 px-4 pt-12 pb-10 text-white">
        {step !== 'phone' && (
          <button onClick={() => setStep(step === 'otp' ? 'phone' : 'otp')} className="mb-4 p-1">
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="text-4xl mb-3">
          {step === 'phone' ? '🚀' : step === 'otp' ? '💬' : '👋'}
        </div>
        <h1 className="text-2xl font-bold">
          {step === 'phone' && 'Đăng nhập'}
          {step === 'otp' && 'Nhập mã OTP'}
          {step === 'name' && 'Tên của bạn'}
        </h1>
        <p className="text-sm opacity-80 mt-1">
          {step === 'phone' && 'Hoài Đức Express — Giao hàng nhanh'}
          {step === 'otp' && `Mã đã gửi tới ${phone}`}
          {step === 'name' && 'Giúp chúng tôi biết bạn là ai'}
        </p>
      </div>

      <div className="flex-1 px-4 pt-6 max-w-lg mx-auto w-full">
        {step === 'phone' && (
          <div className="space-y-4">
            {/* Google login */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-xl py-3.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.6-11.3-6.5l-6.5 5C9.6 40 16.3 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C40.9 35.3 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
              Đăng nhập với Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-200" />
              <span className="text-xs text-gray-400">hoặc</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <Input
              label="Số điện thoại"
              type="tel"
              placeholder="0912 345 678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone size={16} />}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button size="lg" className="w-full" loading={loading} onClick={handleSendOTP}>
              Gửi mã OTP
            </Button>
            <p className="text-xs text-center text-gray-400">
              Bằng cách tiếp tục, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
            </p>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã OTP (6 chữ số)</label>
              <input
                type="number"
                maxLength={6}
                placeholder="••••••"
                value={otp}
                onChange={(e) => setOtp(e.target.value.slice(0, 6))}
                autoFocus
                className="w-full text-center text-3xl font-bold tracking-[0.5em] rounded-xl border border-gray-200 py-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button size="lg" className="w-full" loading={loading} onClick={handleVerifyOTP}>
              Xác nhận
            </Button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-400">Gửi lại sau {countdown}s</p>
              ) : (
                <button
                  onClick={() => { setOtp(''); handleSendOTP() }}
                  className="text-sm text-orange-500 font-medium"
                >
                  Gửi lại mã OTP
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
              <CheckCircle2 size={18} className="text-green-600" />
              <p className="text-sm text-green-700 font-medium">Xác thực thành công!</p>
            </div>
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button size="lg" className="w-full" loading={loading} onClick={handleSaveName}>
              Bắt đầu đặt hàng
            </Button>
          </div>
        )}
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
