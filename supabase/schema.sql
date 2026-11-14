-- Campus Bites Supabase schema. Run in Supabase SQL Editor.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  college_id text unique,
  full_name text not null,
  role text not null check (role in ('student','faculty','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id text primary key, name text not null, category text not null,
  price integer not null check (price > 0), emoji text not null default '🍽️',
  available boolean not null default true, updated_at timestamptz not null default now()
);

create table if not exists public.token_recharges (
  id bigint generated always as identity primary key,
  college_id text not null, member_name text not null, member_role text not null,
  amount integer not null check (amount > 0), note text,
  admin_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists token_recharges_created_at_idx on public.token_recharges(created_at desc);
create index if not exists token_recharges_college_id_idx on public.token_recharges(college_id);

alter table public.profiles enable row level security;
alter table public.menu_items enable row level security;
alter table public.token_recharges enable row level security;

-- Users can read only their own profile. Admins can read profiles for admin workflows.
drop policy if exists "read own profile or admin" on public.profiles;
create policy "read own profile or admin" on public.profiles for select to authenticated
using (auth.uid() = user_id);

-- Students can read the published menu; only admins can modify it.
drop policy if exists "authenticated read menu" on public.menu_items;
create policy "authenticated read menu" on public.menu_items for select to authenticated using (true);
drop policy if exists "admins manage menu" on public.menu_items;
create policy "admins manage menu" on public.menu_items for all to authenticated
using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- Only admins can view and insert recharge audit records.
drop policy if exists "admins read recharges" on public.token_recharges;
create policy "admins read recharges" on public.token_recharges for select to authenticated
using (exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));
drop policy if exists "admins insert recharges" on public.token_recharges;
create policy "admins insert recharges" on public.token_recharges for insert to authenticated
with check (admin_user_id = auth.uid() and exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin'));

-- Seed the current C++ menu. These rows are the admin catalogue; C++ currently has its own hardcoded catalogue.
insert into public.menu_items (id,name,category,price,emoji,available) values
('M001','Campus Burger','Burgers',69,'🍔',true),('M002','Cheese Pizza','Pizza',99,'🍕',true),
('M003','Masala Noodles','Noodles',50,'🍜',true),('M004','French Fries','Snacks',49,'🍟',true),
('M005','Cold Coffee','Drinks',45,'🥤',true),('M006','Chocolate Brownie','Desserts',55,'🍫',true),
('M017','Aloo Tikki Burger','Burgers',49,'🍔',true),('M018','Double Cheese Burger','Burgers',89,'🍔',true),
('M019','Farmhouse Pizza','Pizza',129,'🍕',true),('M020','Paneer Pizza','Pizza',139,'🍕',true),
('M021','Schezwan Noodles','Noodles',70,'🍜',true),('M022','Veg Momos','Snacks',50,'🥟',true),
('M023','Fried Momos','Snacks',65,'🥟',true),('M024','Cheese Sandwich','Snacks',55,'🥪',true),
('M025','Paneer Wrap','Snacks',79,'🌯',true),('M026','Peri Peri Fries','Snacks',59,'🍟',true),
('M027','Mango Shake','Drinks',60,'🥭',true),('M028','Oreo Shake','Drinks',75,'🥤',true),
('M029','Hot Coffee','Drinks',25,'☕',true),('M030','Gulab Jamun','Desserts',35,'🍮',true),
('M031','Chocolate Waffle','Desserts',69,'🧇',true) on conflict (id) do nothing;

-- IMPORTANT: create auth users in Supabase Authentication first, then insert their profile rows manually.
-- Example (replace UUID and values):
-- insert into public.profiles(user_id,college_id,full_name,role) values ('AUTH-USER-UUID','ADMIN001','Canteen Admin','admin');


-- Automatically create a STUDENT profile after email signup. The role is fixed server-side;
-- users cannot promote themselves by changing signup metadata.
create or replace function public.handle_new_campus_bites_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, college_id, full_name, role)
  values (
    new.id,
    upper(trim(coalesce(new.raw_user_meta_data ->> 'college_id', ''))),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Campus Bites Student'),
    'student'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_campus_bites on auth.users;
create trigger on_auth_user_created_campus_bites
after insert on auth.users
for each row execute procedure public.handle_new_campus_bites_user();

-- The signup trigger creates profiles. Users can only read their own profile;
-- role changes and profile edits are intentionally not exposed to browser clients.
