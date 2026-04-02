#!/usr/bin/env node
/**
 * Migration script — chạy: node scripts/migrate.mjs
 * Cần biến môi trường trong .env.local
 */
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
const getEnv = (key) => {
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match ? match[1].trim() : null
}

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL')
const SERVICE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY')

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Thiếu SUPABASE_URL hoặc SERVICE_ROLE_KEY trong .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

// Seed restaurants data
const restaurants = [
  { name: 'Phở Hoài Đức', description: 'Phở bò truyền thống, nước dùng ninh 12 tiếng', address: '12 Đường Lê Lợi, Hoài Đức, Hà Nội', lat: 21.0456, lng: 105.7234, phone: '0912345678', image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400', category: 'Phở & Bún', rating: 4.8, total_reviews: 234, delivery_time: 25, delivery_fee: 15000, min_order: 50000, is_open: true, open_time: '06:00', close_time: '22:00' },
  { name: 'Cơm Tấm Sài Gòn', description: 'Cơm tấm sườn bì chả đặc biệt', address: '45 Nguyễn Văn Cừ, Hoài Đức', lat: 21.0489, lng: 105.7198, phone: '0987654321', image_url: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400', category: 'Cơm', rating: 4.6, total_reviews: 189, delivery_time: 20, delivery_fee: 12000, min_order: 40000, is_open: true, open_time: '07:00', close_time: '21:00' },
  { name: 'Bún Bò Huế Cô Lan', description: 'Bún bò Huế cay nồng', address: '78 Trần Phú, Xuân Lộc', lat: 21.0512, lng: 105.7267, phone: '0934567890', image_url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400', category: 'Phở & Bún', rating: 4.7, total_reviews: 312, delivery_time: 30, delivery_fee: 18000, min_order: 55000, is_open: true, open_time: '06:30', close_time: '20:30' },
  { name: 'Gà Rán Crispy', description: 'Gà rán giòn rụm, cay vừa', address: '23 Hoàng Văn Thụ, Hoài Đức', lat: 21.0445, lng: 105.7212, phone: '0923456789', image_url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400', category: 'Gà & FastFood', rating: 4.5, total_reviews: 156, delivery_time: 18, delivery_fee: 10000, min_order: 35000, is_open: true, open_time: '10:00', close_time: '22:30' },
  { name: 'Bánh Mì Thanh Hương', description: 'Bánh mì giòn thơm, pate tự làm', address: '5 Đường Hùng Vương, Hoài Đức', lat: 21.0478, lng: 105.7245, phone: '0945678901', image_url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400', category: 'Bánh mì', rating: 4.9, total_reviews: 445, delivery_time: 15, delivery_fee: 8000, min_order: 25000, is_open: true, open_time: '06:00', close_time: '21:00' },
  { name: 'Trà Sữa Mochi', description: 'Trà sữa tươi, topping mochi', address: '67 Lý Thường Kiệt, Xuân Lộc', lat: 21.0534, lng: 105.7289, phone: '0956789012', image_url: 'https://images.unsplash.com/photo-1558857563-b371033873b8?w=400', category: 'Trà & Đồ uống', rating: 4.7, total_reviews: 278, delivery_time: 22, delivery_fee: 12000, min_order: 30000, is_open: true, open_time: '09:00', close_time: '23:00' },
]

async function main() {
  console.log('🚀 Bắt đầu seed data...\n')

  // Test connection
  const { data: test, error: testErr } = await supabase.from('restaurants').select('count').limit(1)
  if (testErr && testErr.code === '42P01') {
    console.error('❌ Bảng chưa tồn tại! Hãy chạy schema.sql trước trong Supabase Dashboard SQL Editor')
    console.log('\n📋 Hướng dẫn:')
    console.log('1. Vào https://supabase.com/dashboard/project/cxbptnwnlfdaokbyahyy')
    console.log('2. SQL Editor → New Query')
    console.log('3. Paste nội dung file supabase/schema.sql → Run')
    console.log('4. Chạy lại: node scripts/migrate.mjs')
    process.exit(1)
  }

  // Upsert restaurants
  const { error: rErr } = await supabase
    .from('restaurants')
    .insert(restaurants)
  if (rErr) { console.error('❌ Lỗi seed restaurants:', rErr.message); process.exit(1) }
  console.log(`✅ Đã seed ${restaurants.length} nhà hàng`)

  // Fetch restaurant IDs for menu items
  const { data: rData } = await supabase.from('restaurants').select('id, name')
  const rMap = Object.fromEntries(rData.map(r => [r.name, r.id]))

  const menuItems = [
    { restaurant_id: rMap['Phở Hoài Đức'], name: 'Phở bò tái chín', description: 'Phở bò tái chín đặc biệt', price: 65000, category: 'Phở', is_available: true },
    { restaurant_id: rMap['Phở Hoài Đức'], name: 'Phở bò đặc biệt', description: 'Đủ loại topping: gân, sách, tái, chín', price: 85000, category: 'Phở', is_available: true },
    { restaurant_id: rMap['Phở Hoài Đức'], name: 'Phở gà', description: 'Phở gà ta thả vườn', price: 60000, category: 'Phở', is_available: true },
    { restaurant_id: rMap['Cơm Tấm Sài Gòn'], name: 'Cơm tấm sườn bì chả', description: 'Sườn nướng, bì, chả trứng', price: 55000, category: 'Cơm tấm', is_available: true },
    { restaurant_id: rMap['Cơm Tấm Sài Gòn'], name: 'Cơm tấm sườn đơn', description: 'Sườn nướng thơm, cơm dẻo', price: 45000, category: 'Cơm tấm', is_available: true },
    { restaurant_id: rMap['Gà Rán Crispy'], name: 'Gà rán 2 miếng', description: 'Giòn rụm, sốt đặc biệt', price: 55000, category: 'Gà rán', is_available: true },
    { restaurant_id: rMap['Gà Rán Crispy'], name: 'Burger gà cay', description: 'Gà giòn cay, phô mai, rau tươi', price: 65000, category: 'Burger', is_available: true },
    { restaurant_id: rMap['Bánh Mì Thanh Hương'], name: 'Bánh mì thịt nướng', description: 'Thịt nướng, pate, rau sống', price: 25000, category: 'Bánh mì', is_available: true },
    { restaurant_id: rMap['Bánh Mì Thanh Hương'], name: 'Bánh mì trứng ốp la', description: 'Trứng ốp la, pate, dưa leo', price: 20000, category: 'Bánh mì', is_available: true },
    { restaurant_id: rMap['Trà Sữa Mochi'], name: 'Trà sữa trân châu đen', description: 'Trân châu nấu mềm, size L', price: 40000, category: 'Trà sữa', is_available: true },
    { restaurant_id: rMap['Trà Sữa Mochi'], name: 'Cà phê dừa', description: 'Cà phê đen đá, nước cốt dừa béo ngậy', price: 45000, category: 'Cà phê', is_available: true },
  ]

  const { error: mErr } = await supabase.from('menu_items').insert(menuItems)
  if (mErr) { console.error('❌ Lỗi seed menu:', mErr.message); process.exit(1) }
  console.log(`✅ Đã seed ${menuItems.length} món ăn`)

  console.log('\n🎉 Seed data hoàn tất!')
}

main()
