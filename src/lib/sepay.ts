import crypto from 'crypto'

// ─── Config ────────────────────────────────────────────────────────────────
export const SEPAY_MERCHANT_ID = process.env.SEPAY_MERCHANT_ID!
export const SEPAY_SECRET_KEY  = process.env.SEPAY_SECRET_KEY!
export const SEPAY_SANDBOX     = process.env.SEPAY_SANDBOX === 'true'

export const SEPAY_CHECKOUT_URL = SEPAY_SANDBOX
  ? 'https://pay-sandbox.sepay.vn/v1/checkout/init'
  : 'https://pay.sepay.vn/v1/checkout/init'

export const SEPAY_API_URL = SEPAY_SANDBOX
  ? 'https://pgapi-sandbox.sepay.vn'
  : 'https://pgapi.sepay.vn'

// ─── Types ──────────────────────────────────────────────────────────────────
export interface SePayFields {
  order_amount: string
  merchant: string
  currency: 'VND'
  operation: 'PURCHASE' | 'VERIFY'
  order_description: string
  order_invoice_number: string
  customer_id?: string
  payment_method?: 'CARD' | 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER'
  success_url?: string
  error_url?: string
  cancel_url?: string
  signature?: string
}

// ─── Signature ──────────────────────────────────────────────────────────────
// Fields to sign — ORDER MATTERS (must match PHP reference implementation)
const SIGNED_FIELD_ORDER = [
  'order_amount',
  'merchant',
  'currency',
  'operation',
  'order_description',
  'order_invoice_number',
  'customer_id',
  'payment_method',
  'success_url',
  'error_url',
  'cancel_url',
] as const

export function createSePaySignature(
  fields: Omit<SePayFields, 'signature'>,
  secretKey: string = SEPAY_SECRET_KEY
): string {
  const parts: string[] = []
  for (const key of SIGNED_FIELD_ORDER) {
    const value = fields[key as keyof typeof fields]
    if (value !== undefined && value !== '') {
      parts.push(`${key}=${value}`)
    }
  }
  const signingString = parts.join(',')
  const hmac = crypto.createHmac('sha256', secretKey)
  hmac.update(signingString)
  return hmac.digest('base64')
}

// ─── Build full form fields (ready to POST) ─────────────────────────────────
export function buildSePayForm(
  params: Omit<SePayFields, 'merchant' | 'currency' | 'signature'>
): SePayFields & { signature: string } {
  const fields: Omit<SePayFields, 'signature'> = {
    ...params,
    merchant: SEPAY_MERCHANT_ID,
    currency: 'VND',
  }
  return { ...fields, signature: createSePaySignature(fields) }
}

// ─── Cancel order via SePay API ─────────────────────────────────────────────
export async function cancelSePayOrder(orderInvoiceNumber: string): Promise<{ ok: boolean; message?: string }> {
  const credentials = Buffer.from(`${SEPAY_MERCHANT_ID}:${SEPAY_SECRET_KEY}`).toString('base64')
  try {
    const res = await fetch(`${SEPAY_API_URL}/v1/order/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order_invoice_number: orderInvoiceNumber }),
    })
    const data = await res.json()
    return { ok: res.ok, message: data.message }
  } catch {
    return { ok: false, message: 'Lỗi kết nối SePay' }
  }
}
