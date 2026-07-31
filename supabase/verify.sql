-- Kurulumdan sonra Supabase SQL Editor'da çalıştırılabilecek salt-okunur kontrol.
select
  (select last_number from public.invoice_counters where counter_key = 'invoice') as son_numara,
  (select count(*) from public.invoices) as fatura_sayisi,
  (select relrowsecurity from pg_class where oid = 'public.invoices'::regclass) as rls_aktif,
  (select relforcerowsecurity from pg_class where oid = 'public.invoices'::regclass) as rls_zorunlu;
