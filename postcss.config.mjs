begin;

drop function if exists public.create_invoice(text,text,numeric,numeric) cascade;
drop table if exists public.invoices cascade;
drop table if exists public.invoice_counters cascade;
drop type if exists public.invoice_status cascade;

create type public.invoice_status as enum ('Bekliyor','Kesildi');
create table public.invoice_counters (
  counter_key text primary key,
  last_number bigint not null,
  updated_at timestamptz not null default now()
);
insert into public.invoice_counters(counter_key,last_number) values ('invoice',2026000000081);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invoice_number bigint not null unique,
  tc text null check (tc is null or tc ~ '^[0-9]{11}$'),
  customer_name text null check (customer_name is null or char_length(customer_name) <= 120),
  product text not null default '24 Ayar' check (product='24 Ayar'),
  gram numeric(12,3) not null check (gram > 0),
  gram_price numeric(14,2) not null check (gram_price > 0),
  total numeric(18,2) generated always as (round(gram * gram_price,2)) stored,
  status public.invoice_status not null default 'Bekliyor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index invoices_user_created_idx on public.invoices(user_id,created_at desc);
create index invoices_user_status_idx on public.invoices(user_id,status);

create or replace function public.create_invoice(p_tc text,p_customer_name text,p_gram numeric,p_gram_price numeric)
returns public.invoices
language plpgsql security definer set search_path=public,auth
as $$
declare
  v_user uuid := auth.uid();
  v_number bigint;
  v_row public.invoices;
  v_tc text := nullif(btrim(coalesce(p_tc,'')),'');
  v_customer text := nullif(btrim(coalesce(p_customer_name,'')),'');
begin
  if v_user is null then raise exception 'Oturum açmanız gerekiyor' using errcode='42501'; end if;
  if v_tc is not null and v_tc !~ '^[0-9]{11}$' then raise exception 'TC boş bırakılmalı veya 11 rakam olmalıdır' using errcode='22023'; end if;
  if p_gram is null or p_gram <= 0 then raise exception 'Gram sıfırdan büyük olmalıdır' using errcode='22023'; end if;
  if p_gram_price is null or p_gram_price <= 0 then raise exception 'Gram fiyatı sıfırdan büyük olmalıdır' using errcode='22023'; end if;
  update public.invoice_counters set last_number=last_number+1,updated_at=now() where counter_key='invoice' returning last_number into v_number;
  insert into public.invoices(user_id,invoice_number,tc,customer_name,gram,gram_price)
  values(v_user,v_number,v_tc,v_customer,round(p_gram,3),round(p_gram_price,2)) returning * into v_row;
  return v_row;
end; $$;

alter table public.invoices enable row level security;
alter table public.invoice_counters enable row level security;
create policy "own_select" on public.invoices for select to authenticated using (auth.uid()=user_id);
create policy "own_update" on public.invoices for update to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "own_delete" on public.invoices for delete to authenticated using (auth.uid()=user_id);
revoke all on public.invoice_counters from anon,authenticated;
revoke insert on public.invoices from anon,authenticated;
grant select,update,delete on public.invoices to authenticated;
grant execute on function public.create_invoice(text,text,numeric,numeric) to authenticated;
notify pgrst,'reload schema';
commit;
