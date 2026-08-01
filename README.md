# Kuyumcu Takip

24 ayar fatura ön hazırlık ve bekleyen/kesilen kayıt takibi için mobil öncelikli web uygulaması.

## Özellikler

- İlk dosya numarası: `2026000000082`
- Her kayıtta dosya numarası otomatik 1 artar
- TC Kimlik No isteğe bağlıdır; girilirse yalnızca 11 rakam kabul edilir
- Müşteri adı isteğe bağlıdır
- Ürün sabit: `24 Ayar`
- Gram × gram fiyatı otomatik toplam
- Bekliyor / Kesildi durum değişimi
- Dosya no, TC veya müşteri adına göre arama
- Kayıt silme
- Supabase e-posta/şifre girişi
- RLS ile kullanıcı bazlı veri güvenliği
- iPhone ana ekranına eklenebilir PWA
- Vercel uyumlu

## 1. Supabase temiz kurulumu

Supabase projenizde:

1. **SQL Editor → New Query** açın.
2. `supabase/reset_and_setup.sql` içeriğinin tamamını yapıştırın.
3. **Run** düğmesine basın.
4. `Success. No rows returned` görünmelidir.

> Bu script mevcut `invoices` ve `invoice_counters` tablolarını silerek temiz kurulum yapar.

## 2. Kullanıcı oluşturma

Supabase:

1. **Authentication → Users**
2. **Add user → Create new user**
3. E-posta ve şifre girin
4. **Auto Confirm User** seçeneğini açın

## 3. Vercel ortam değişkenleri

Vercel → Project → Settings → Environment Variables:

```text
NEXT_PUBLIC_SUPABASE_URL
```

Değeri Supabase **Project URL** olmalıdır:

```text
https://PROJE_KODU.supabase.co
```

İkinci değişken:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Değeri Supabase **Publishable key** olmalıdır (`sb_publishable_...`). Secret key kullanmayın.

Değişkenleri Production ve Preview ortamlarına ekleyin ve ardından yeni deployment oluşturun.

## 4. GitHub'a yükleme

ZIP'i çıkardıktan sonra klasörün kendisini değil, içindeki tüm dosya ve klasörleri repo köküne yükleyin. GitHub ana sayfasında en az şunlar aynı seviyede görünmelidir:

```text
app/
components/
lib/
public/
supabase/
package.json
tsconfig.json
next.config.mjs
```

## 5. Yerel çalıştırma

```bash
npm install
npm run dev
```

## Kullanım

1. Uygulamaya Supabase kullanıcısıyla giriş yapın.
2. Yeni sekmesinde gram ve gram fiyatını girin.
3. TC ve müşteri adı boş bırakılabilir.
4. Kaydettiğiniz kayıt otomatik olarak `Bekliyor` durumuna geçer.
5. GİB faturasını kestikten sonra `Kesildi yap` düğmesine basın.
