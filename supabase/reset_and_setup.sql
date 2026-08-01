-- KUYUMCU TAKİP - TEMİZ KURULUM
-- UYARI: Bu script mevcut public.invoices ve public.invoice_counters tablolarını siler.

begin;

 drop function if exists public.create_invoice(text, text, numeric, numeric);
 drop table if exists public.invoices cascade;
 drop table if exists public.invoice_counters cascade;
 drop type if exists public.invoice_status cascade;

create type public.invoice_status as enum ('Bekliyor', 'Kesildi');

create table public.invoice_counters (
  counter_key text primary key,
  last_number bigint not null,
  updated_at timestamptz not null default now()
);

-- İlk oluşturulacak dosya numarası 2026000000082 olsun diye 81 ile başlar.
insert into public.invoice_counters (counter_key, last_number)
values ('invoice', 2026000000081);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number bigint not null unique,
  tc text null,
  customer_name text null,
  product text not null default '24 Ayar' check (product = '24 Ayar'),
  gram numeric(12,3) not null check (gram > 0),
  gram_price numeric(14,2) not null check (gram_price > 0),
  total numeric(18,2) generated always as (round(gram * gram_price, 2)) stored,
  status public.invoice_status not null default 'Bekliyor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_tc_format check (tc is null or tc = '' or tc ~ '^[0-9]{11}$'),
  constraint invoices_customer_length check (customer_name is null or char_length(customer_name) <= 120)
);

create index invoices_user_created_idx on public.invoices(user_id, created_at desc);
create index invoices_user_status_idx on public.invoices(user_id, status);
create index invoices_number_idx on public.invoices(invoice_number);
create index invoices_tc_idx on public.invoices(tc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create or replace function public.create_invoice(
  p_tc text,
  p_customer_name text,
  p_gram numeric,
  p_gram_price numeric
)
returns public.invoices
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_invoice_number bigint;
  v_invoice public.invoices;
  v_tc text := nullif(btrim(coalesce(p_tc, '')), '');
  v_customer_name text := nullif(btrim(coalesce(p_customer_name, '')), '');
begin
  if v_user_id is null then
    raise exception 'Oturum açmanız gerekiyor' using errcode = '42501';
  end if;

  if v_tc is not null and v_tc !~ '^[0-9]{11}$' then
    raise exception 'TC Kimlik No boş bırakılmalı veya 11 rakam olmalıdır' using errcode = '22023';
  end if;

  if v_customer_name is not null and char_length(v_customer_name) > 120 then
    raise exception 'Müşteri adı en fazla 120 karakter olabilir' using errcode = '22023';
  end if;

  if p_gram is null or p_gram <= 0 then
    raise exception 'Gram sıfırdan büyük olmalıdır' using errcode = '22023';
  end if;

  if p_gram_price is null or p_gram_price <= 0 then
    raise exception 'Gram fiyatı sıfırdan büyük olmalıdır' using errcode = '22023';
  end if;

  update public.invoice_counters
  set last_number = last_number + 1,
      updated_at = now()
  where counter_key = 'invoice'
  returning last_number into v_invoice_number;

  if v_invoice_number is null then
    raise exception 'Dosya numarası sayacı bulunamadı';
  end if;

  insert into public.invoices (
    user_id, invoice_number, tc, customer_name, product, gram, gram_price, status
  ) values (
    v_user_id, v_invoice_number, v_tc, v_customer_name, '24 Ayar', round(p_gram, 3), round(p_gram_price, 2), 'Bekliyor'
  )
  returning * into v_invoice;

  return v_invoice;
end;
$$;

alter table public.invoices enable row level security;
alter table public.invoice_counters enable row level security;

create policy "Kullanıcı kendi faturalarını okuyabilir"
on public.invoices for select
to authenticated
using (auth.uid() = user_id);

create policy "Kullanıcı kendi faturalarını güncelleyebilir"
on public.invoices for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Kullanıcı kendi faturalarını silebilir"
on public.invoices for delete
to authenticated
using (auth.uid() = user_id);

-- Kayıt ekleme sadece create_invoice RPC fonksiyonuyla yapılır.
revoke all on public.invoice_counters from anon, authenticated;
revoke insert on public.invoices from anon, authenticated;
grant select, update, delete on public.invoices to authenticated;
grant execute on function public.create_invoice(text, text, numeric, numeric) to authenticated;

notify pgrst, 'reload schema';

commit;
