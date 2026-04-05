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
        const { error: insertErr } = await supabase.from('users').insert({
          id: data.user.id,
          name: meta?.full_name || meta?.name || meta?.email?.split('@')[0] || 'Người dùng',
          phone: data.user.phone || '',
          role: 'customer',
        })
        // If insert fails (e.g. phone NOT NULL), try upsert without phone
        if (insertErr) {
          await supabase.from('users').upsert({
            id: data.user.id,
            name: meta?.full_name || meta?.name || 'Người dùng',
            phone: '',
            role: 'customer',
          }, { onConflict: 'id' })
        }
      }
    }
  }

  // Don't redirect to role-registration pages after login — goes to homepage instead
  // so users don't see registration forms as "forced updates"
  const SKIP = ['/restaurant-admin', '/shipper', '/settings']
  const finalNext = SKIP.some((p) => next.startsWith(p)) ? '/' : next

  const response = NextResponse.redirect(`${origin}${finalNext}`)
  response.cookies.delete('oauth_next')
  return response
}
