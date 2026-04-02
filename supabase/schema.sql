-- ============================================================
-- Hoài Đức Express — Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS
-- ============================================================
create table users (
  id uuid primary key default uuid_generate_v4(),
  phone text unique not null,
  name text not null,
  email text,
  role text not null default 'customer' check (role in ('customer','driver','restaurant','admin')),
  avatar_url text,
  address text,
  lat float,
  lng float,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table users enable row level security;
create policy "Users can read own profile" on users for select using (auth.uid() = id);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- ============================================================
-- RESTAURANTS
-- ============================================================
create table restaurants (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id) on delete cascade,
  name text not null,
  description text,
  address text not null,
  lat float not null,
  lng float not null,
  phone text not null,
  image_url text,
  category text not null,
  rating float default 5.0,
  total_reviews int default 0,
  delivery_time int default 30, -- minutes
  delivery_fee int not null default 15000,
  min_order int not null default 50000,
  is_open boolean default true,
  open_time text default '07:00',
  close_time text default '21:00',
  created_at timestamptz default now()
);

alter table restaurants enable row level security;
create policy "Anyone can read restaurants" on restaurants for select using (true);
create policy "Owners can manage restaurant" on restaurants for all using (auth.uid() = owner_id);

-- ============================================================
-- MENU ITEMS
-- ============================================================
create table menu_items (
  id uuid primary key default uuid_generate_v4(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  description text,
  price int not null,
  image_url text,
  category text not null default 'Món chính',
  is_available boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table menu_items enable row level security;
create policy "Anyone can read available menu items" on menu_items for select using (is_available = true);
create policy "Restaurant owners can manage menu" on menu_items for all
  using (exists (select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  customer_id uuid references users(id),
  driver_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  delivery_type text not null default 'food' check (delivery_type in ('food','package')),
  status text not null default 'pending' check (
    status in ('pending','confirmed','preparing','ready','picking_up','delivering','delivered','cancelled')
  ),
  subtotal int not null default 0,
  delivery_fee int not null default 0,
  total int not null,
  delivery_address text not null,
  delivery_lat float,
  delivery_lng float,
  pickup_address text,
  pickup_lat float,
  pickup_lng float,
  note text,
  pay_method text default 'cash' check (pay_method in ('cash','transfer','momo','vnpay')),
  estimated_delivery timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table orders enable row level security;
create policy "Customers see own orders" on orders for select using (auth.uid() = customer_id);
create policy "Drivers see assigned orders" on orders for select using (auth.uid() = driver_id);
create policy "Restaurant owners see orders" on orders for select
  using (exists (select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));
create policy "Customers can create orders" on orders for insert with check (auth.uid() = customer_id);
create policy "Drivers can update order status" on orders for update using (auth.uid() = driver_id);
create policy "Restaurant can confirm orders" on orders for update
  using (exists (select 1 from restaurants r where r.id = restaurant_id and r.owner_id = auth.uid()));

-- Auto update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;
create trigger orders_updated_at before update on orders for each row execute function update_updated_at();

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  name text not null,
  price int not null,
  quantity int not null default 1
);

alter table order_items enable row level security;
create policy "Order items visible with order" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.customer_id = auth.uid() or o.driver_id = auth.uid())));

-- ============================================================
-- REVIEWS
-- ============================================================
create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  customer_id uuid references users(id),
  restaurant_id uuid references restaurants(id),
  driver_id uuid references users(id),
  restaurant_rating int check (restaurant_rating between 1 and 5),
  driver_rating int check (driver_rating between 1 and 5),
  comment text,
  created_at timestamptz default now()
);

-- Update restaurant rating on new review
create or replace function update_restaurant_rating()
returns trigger as $$
begin
  update restaurants set
    rating = (select round(avg(restaurant_rating)::numeric, 1) from reviews where restaurant_id = new.restaurant_id),
    total_reviews = (select count(*) from reviews where restaurant_id = new.restaurant_id)
  where id = new.restaurant_id;
  return new;
end;
$$ language plpgsql;
create trigger review_rating_update after insert on reviews for each row execute function update_restaurant_rating();

-- ============================================================
-- REALTIME
-- ============================================================
alter publication supabase_realtime add table orders;
alter publication supabase_realtime add table order_items;
