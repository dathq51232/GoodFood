import { NextResponse } from 'next/server'
import { buildSePayForm, SEPAY_CHECKOUT_URL, createSePaySignature, SEPAY_MERCHANT_ID } from '@/lib/sepay'

/** Debug endpoint — returns signing string + form fields as JSON. Remove before production. */
export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const params = {
    order_amount: '80000',
    operation: 'PURCHASE' as const,
    order_description: 'GoodFood order TESTCODE',
    order_invoice_number: `TEST-${Date.now()}`,
    success_url: `${appUrl}/payment/success`,
    error_url: `${appUrl}/payment/error`,
    cancel_url: `${appUrl}/payment/cancel`,
  }

  // Re-build signing string manually to show it
  const SIGNED_FIELD_ORDER = [
    'order_amount', 'merchant', 'currency', 'operation',
    'order_description', 'order_invoice_number', 'customer_id',
    'payment_method', 'success_url', 'error_url', 'cancel_url',
  ] as const

  const withMerchant = { ...params, merchant: SEPAY_MERCHANT_ID, currency: 'VND' as const }
  const parts: string[] = []
  for (const key of SIGNED_FIELD_ORDER) {
    const value = (withMerchant as Record<string, string>)[key]
    if (value) parts.push(`${key}=${value}`)
  }
  const signingString = parts.join(',')

  const fields = buildSePayForm(params)

  return NextResponse.json({
    checkout_url: SEPAY_CHECKOUT_URL,
    merchant_id: SEPAY_MERCHANT_ID,
    signing_string: signingString,
    signature: fields.signature,
    all_fields: fields,
  })
}
