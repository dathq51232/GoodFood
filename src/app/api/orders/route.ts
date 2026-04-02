import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOrderCode } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

    const body = await req.json()
    const { restaurant_id, items, delivery_address, note, pay_method } = body

    if (!items?.length) return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 })
    if (!delivery_address?.trim()) return NextResponse.json({ error: 'Thiếu địa chỉ giao hàng' }, { status: 400 })

    // Validate menu items & compute subtotal
    const itemIds = items.map((i: { menu_item_id: string }) => i.menu_item_id)
    const { data: menuItems, error: menuErr } = await supabase
      .from('menu_items')
      .select('id, price, name, is_available')
      .in('id', itemIds)

    if (menuErr || !menuItems?.length) return NextResponse.json({ error: 'Không thể lấy thông tin món' }, { status: 500 })

    let subtotal = 0
    for (const item of items as { menu_item_id: string; quantity: number }[]) {
      const m = menuItems.find((mi) => mi.id === item.menu_item_id)
      if (!m?.is_available) return NextResponse.json({ error: `Món "${m?.name}" hiện không có` }, { status: 400 })
      subtotal += m.price * item.quantity
    }

    // Validate restaurant
    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .select('delivery_fee, min_order, is_open, name')
      .eq('id', restaurant_id)
      .single()

    if (rErr || !restaurant) return NextResponse.json({ error: 'Nhà hàng không tồn tại' }, { status: 400 })
    if (!restaurant.is_open) return NextResponse.json({ error: `${restaurant.name} đang đóng cửa` }, { status: 400 })
    if (subtotal < restaurant.min_order) {
      return NextResponse.json({ error: `Đơn tối thiểu ${restaurant.min_order.toLocaleString('vi')}đ` }, { status: 400 })
    }

    const deliveryFee = restaurant.delivery_fee
    const total = subtotal + deliveryFee
    const code = generateOrderCode()

    // Create order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        code,
        customer_id: user.id,
        restaurant_id,
        delivery_type: 'food',
        status: 'pending',
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_address,
        note: note || null,
        pay_method: pay_method || 'cash',
        estimated_delivery: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
      })
      .select('id, code')
      .single()

    if (orderErr) throw orderErr

    // Create order items
    const orderItems = items.map((item: { menu_item_id: string; quantity: number }) => {
      const m = menuItems.find((mi) => mi.id === item.menu_item_id)!
      return { order_id: order.id, menu_item_id: item.menu_item_id, name: m.name, price: m.price, quantity: item.quantity }
    })

    const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
    if (itemsErr) throw itemsErr

    return NextResponse.json({ code: order.code }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Lỗi hệ thống, thử lại sau' }, { status: 500 })
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 })

  const { data, error } = await supabase
    .from('orders')
    .select('*, restaurant:restaurants(name, image_url), order_items(*)')
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ orders: data })
}
