import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Read redirect destination from cookie (set before OAuth redirect to avoid query-param whitelist issues)
  const oauthNext = request.cookies.get('oauth_next')?.value
  const next = oauthNext ? decodeURIComponent(oauthNext) : (searchParams.get('next') ?? '/')

  if (code) {
    const supabase = await createClient()
    const { data } = await supabase.auth.exchangeCodeForSession(code)

    // Ensure user row exists in our users table (for OAuth logins)
    if (data.user) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!existing) {
        const meta = data.user.user_metadata
        await supabase.from('users').insert({
          id: data.user.id,
          name: meta?.full_name || meta?.name || 'Người dùng',
          phone: data.user.phone || null,
          role: 'customer',
        })
      }
    }
  }

  const response = NextResponse.redirect(`${origin}${next}`)
  response.cookies.delete('oauth_next')
  return response
}
