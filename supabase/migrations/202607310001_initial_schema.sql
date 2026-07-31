-- Kuyumcu Takip - ilk üretim şeması
-- Bu dosya Supabase SQL Editor'da tek parça olarak çalıştırılabilir.

begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.invoice_status as enum ('bekliyor', 'kesildi');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.invoice_counters (
  counter_key text primary key,
  last_number bigint not null,
  updated_at timestamptz not null default now(),
  constraint invoice_counters_positive check (last_number > 0)
);

insert into public.invoice_counters (counter_key, last_number)
values ('invoice', 2026000000081)
on conflict (counter_key) do nothing;

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  invoice_number bigint not null unique,
  tc text not null,
  customer_name text,
  product text not null default '24 Ayar',
  gram numeric(12, 3) not null,
  gram_price numeric(14, 2) not null,
  total numeric(18, 2) generated always as (round(gram * gram_price, 2)) stored,
  status public.invoice_status not null default 'bekliyor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_tc_format check (tc ~ '^[0-9]{11}$'),
  constraint invoices_customer_name_length check (
    customer_name is null or char_length(customer_name) between 1 and 120
  ),
  constraint invoices_product check (product = '24 Ayar'),
  constraint invoices_gram_positive check (gram > 0),
  constraint invoices_gram_price_positive check (gram_price > 0)
);

create index if not exists invoices_user_created_idx
  on public.invoices (user_id, created_at desc);
create index if not exists invoices_user_status_created_idx
  on public.invoices (user_id, status, created_at desc);
create index if not exists invoices_user_tc_idx
  on public.invoices (user_id, tc);

create or replace function public.is_valid_tc(p_tc text)
returns boolean
language plpgsql
immutable
strict
set search_path = ''
as $$
declare
  d int[];
  i int;
begin
  if p_tc !~ '^[0-9]{11}$' or left(p_tc, 1) = '0' then
    return false;
  end if;

  d := array[]::int[];
  for i in 1..11 loop
    d := array_append(d, substring(p_tc from i for 1)::int);
  end loop;

  return (((d[1] + d[3] + d[5] + d[7] + d[9]) * 7
      - (d[2] + d[4] + d[6] + d[8])) % 10 + 10) % 10 = d[10]
    and (d[1] + d[2] + d[3] + d[4] + d[5]
      + d[6] + d[7] + d[8] + d[9] + d[10]) % 10 = d[11];
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create or replace function public.create_invoice(
  p_tc text,
  p_customer_name text,
  p_product text,
  p_gram numeric,
  p_gram_price numeric,
  p_status public.invoice_status
)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invoice_number bigint;
  v_invoice public.invoices;
begin
  if v_user_id is null then
    raise exception 'Oturum açmanız gerekiyor' using errcode = '42501';
  end if;
  if not public.is_valid_tc(btrim(p_tc)) then
    raise exception 'Geçerli bir TC Kimlik No girin' using errcode = '22023';
  end if;
  if p_product <> '24 Ayar' then
    raise exception 'Geçersiz ürün' using errcode = '22023';
  end if;
  if p_gram is null or p_gram <= 0 or p_gram > 999999999.999 then
    raise exception 'Gram sıfırdan büyük olmalıdır' using errcode = '22023';
  end if;
  if p_gram_price is null or p_gram_price <= 0 or p_gram_price > 999999999999.99 then
    raise exception 'Gram fiyatı sıfırdan büyük olmalıdır' using errcode = '22023';
  end if;
  if nullif(btrim(coalesce(p_customer_name, '')), '') is not null
    and char_length(btrim(p_customer_name)) > 120 then
    raise exception 'Müşteri adı en fazla 120 karakter olabilir' using errcode = '22023';
  end if;

  select last_number + 1
    into v_invoice_number
    from public.invoice_counters
    where counter_key = 'invoice'
    for update;

  if v_invoice_number is null then
    raise exception 'Fatura sayacı bulunamadı';
  end if;

  update public.invoice_counters
    set last_number = v_invoice_number, updated_at = now()
    where counter_key = 'invoice';

  insert into public.invoices (
    user_id, invoice_number, tc, customer_name, product, gram, gram_price, status
  ) values (
    v_user_id,
    v_invoice_number,
    btrim(p_tc),
    nullif(btrim(coalesce(p_customer_name, '')), ''),
    p_product,
    round(p_gram, 3),
    round(p_gram_price, 2),
    p_status
  ) returning * into v_invoice;

  return v_invoice;
end;
$$;

create or replace function public.set_invoice_status(
  p_invoice_id uuid,
  p_status public.invoice_status
)
returns public.invoices
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_invoice public.invoices;
begin
  if v_user_id is null then
    raise exception 'Oturum açmanız gerekiyor' using errcode = '42501';
  end if;

  update public.invoices
    set status = p_status
    where id = p_invoice_id and user_id = v_user_id
    returning * into v_invoice;

  if v_invoice.id is null then
    raise exception 'Fatura bulunamadı' using errcode = 'P0002';
  end if;

  return v_invoice;
end;
$$;

create or replace function public.search_invoices(
  p_query text default null,
  p_status public.invoice_status default null,
  p_limit integer default 50
)
returns setof public.invoices
language sql
stable
security invoker
set search_path = ''
as $$
  select i.*
  from public.invoices i
  where i.user_id = auth.uid()
    and (p_status is null or i.status = p_status)
    and (
      nullif(btrim(coalesce(p_query, '')), '') is null
      or i.invoice_number::text ilike '%' || btrim(p_query) || '%'
      or i.tc ilike '%' || btrim(p_query) || '%'
      or coalesce(i.customer_name, '') ilike '%' || btrim(p_query) || '%'
    )
  order by i.created_at desc
  limit least(greatest(coalesce(p_limit, 50), 1), 100);
$$;

create or replace function public.get_dashboard_stats()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'waiting_count', count(*) filter (where status = 'bekliyor'),
    'completed_count', count(*) filter (where status = 'kesildi'),
    'total_count', count(*),
    'waiting_total', coalesce(sum(total) filter (where status = 'bekliyor'), 0),
    'completed_total', coalesce(sum(total) filter (where status = 'kesildi'), 0),
    'today_count', count(*) filter (
      where created_at >= date_trunc('day', now() at time zone 'Europe/Istanbul') at time zone 'Europe/Istanbul'
    )
  )
  from public.invoices
  where user_id = auth.uid();
$$;

alter table public.invoices enable row level security;
alter table public.invoices force row level security;
alter table public.invoice_counters enable row level security;
alter table public.invoice_counters force row level security;

drop policy if exists "Kullanıcı kendi faturalarını görür" on public.invoices;
create policy "Kullanıcı kendi faturalarını görür"
on public.invoices for select
to authenticated
using ((select auth.uid()) = user_id);

revoke all on table public.invoices from anon, authenticated;
revoke all on table public.invoice_counters from anon, authenticated;
grant select on table public.invoices to authenticated;

revoke all on function public.create_invoice(text, text, text, numeric, numeric, public.invoice_status) from public, anon;
revoke all on function public.set_invoice_status(uuid, public.invoice_status) from public, anon;
revoke all on function public.search_invoices(text, public.invoice_status, integer) from public, anon;
revoke all on function public.get_dashboard_stats() from public, anon;
grant execute on function public.create_invoice(text, text, text, numeric, numeric, public.invoice_status) to authenticated;
grant execute on function public.set_invoice_status(uuid, public.invoice_status) to authenticated;
grant execute on function public.search_invoices(text, public.invoice_status, integer) to authenticated;
grant execute on function public.get_dashboard_stats() to authenticated;

commit;
