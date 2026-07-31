# Kuyumcu Takip

Kuyumcular için geliştirilmiş, mobil öncelikli 24 ayar fatura takip sistemi. Next.js 15, TypeScript, Tailwind CSS ve Supabase kullanır; Vercel'e doğrudan dağıtılabilir ve iPhone ana ekranına PWA olarak kurulabilir.

## Özellikler

- Genel bakış paneli ve anlık istatistikler
- Yeni fatura kaydı: TC, müşteri, gram ve gram fiyatı
- Toplam tutarın hem arayüzde hem veritabanında otomatik hesaplanması
- Bekleyen ve kesilen faturaların ayrı listeleri
- Fatura no, TC veya müşteri adına göre arama
- İlk başarılı kayıtta `2026000000082` ile başlayan, eşzamanlı işlemlerde çakışmayan ve başarısız kayıtlarda numara tüketmeyen otomatik numaralandırma
- Supabase Auth ile e-posta/şifre girişi
- RLS ile her kullanıcının yalnızca kendi kayıtlarını görmesi
- Açık/koyu tema, responsive Apple esintili arayüz
- iPhone kurulumu, manifest, servis çalışanı ve çevrimdışı açılış ekranı
- Türkçe TC Kimlik No algoritma doğrulaması

## Gereksinimler

- Node.js 20.9 veya üzeri
- Bir Supabase projesi
- Dağıtım için Vercel hesabı

## 1. Supabase kurulumu

1. [Supabase](https://supabase.com/dashboard) üzerinde yeni bir proje oluşturun.
2. Sol menüden **SQL Editor → New query** sayfasını açın.
3. `supabase/migrations/202607310001_initial_schema.sql` dosyasının tamamını yapıştırıp **Run** düğmesine basın.
4. İsterseniz `supabase/verify.sql` dosyasını çalıştırın. Son numara `2026000000081`, `rls_aktif` ve `rls_zorunlu` değerleri `true` görünmelidir.
5. **Authentication → Users → Add user** üzerinden işletme hesabınızı oluşturun. E-posta ve en az 8 karakterlik güçlü bir şifre belirleyin.
6. **Authentication → Providers → Email** altında herkese açık kayıt özelliğini kapalı tutun. Uygulama yalnızca yönetici tarafından oluşturulmuş hesaplarla giriş sunar.

Numara sayacı tabloda `2026000000081` olarak tutulur. İlk kayıt tek işlem içinde sayacı artırdığı için `2026000000082` numarasını alır.

## 2. Ortam değişkenleri

`.env.example` dosyasını `.env.local` adıyla kopyalayın:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJE_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=SUPABASE_ANON_KEY
```

Bu iki değeri Supabase'de **Project Settings → API** bölümünden alın. `service_role` anahtarını hiçbir zaman bu uygulamaya veya Vercel'e eklemeyin.

## 3. Yerel çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:3000` adresini açın ve Supabase'de oluşturduğunuz kullanıcıyla giriş yapın.

## 4. Vercel dağıtımı

1. Projeyi bir GitHub deposuna gönderin.
2. Vercel'de **New Project** ile depoyu seçin.
3. Framework otomatik olarak **Next.js** seçilir; ek build ayarı gerekmez.
4. **Environment Variables** bölümüne `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` değerlerini hem Production hem Preview için ekleyin.
5. **Deploy** düğmesine basın.
6. Supabase **Authentication → URL Configuration** bölümünde **Site URL** alanını Vercel adresinizle güncelleyin.

Uygulama Frankfurt (`fra1`) bölgesine ayarlanmıştır. Supabase projenizi mümkünse Avrupa bölgesinde oluşturun.

## iPhone'a kurulum

1. Vercel adresini iPhone'da Safari ile açın.
2. Safari'nin **Paylaş** düğmesine dokunun.
3. **Ana Ekrana Ekle** seçeneğine dokunun.
4. **Ekle** diyerek kurulumu tamamlayın.

Uygulama bağımsız pencere olarak açılır. Güvenlik nedeniyle fatura verileri çevrimdışı önbelleğe alınmaz; bağlantı yokken yalnızca güvenli çevrimdışı ekran gösterilir.

## Komutlar

| Komut | Açıklama |
| --- | --- |
| `npm run dev` | Geliştirme sunucusunu başlatır |
| `npm run build` | Üretim derlemesini oluşturur |
| `npm run start` | Üretim sunucusunu çalıştırır |
| `npm run lint` | Kod kalite kontrolünü çalıştırır |
| `npm run typecheck` | TypeScript tip kontrolünü çalıştırır |
| `npm test` | Birim testlerini çalıştırır |

## Güvenlik mimarisi

- Fatura tablosunda RLS ve `FORCE ROW LEVEL SECURITY` açıktır.
- Kullanıcılar tabloya doğrudan kayıt ekleyemez veya güncelleme yapamaz.
- Kayıt oluşturma ve durum değiştirme, oturumdaki kullanıcıyı doğrulayan kontrollü SQL fonksiyonlarıyla yapılır.
- Toplam tutar PostgreSQL generated column olarak hesaplanır; tarayıcıdan gönderilen bir toplam değerine güvenilmez.
- Sayaç satırı `FOR UPDATE` ile kilitlenir. Aynı anda yapılan kayıtlarda çakışma olmaz; işlem geri alınırsa numara da tüketilmez.
- `service_role` anahtarı kullanılmaz. Yalnızca tarayıcıda paylaşılması güvenli olan anon key gerekir.
- Hassas fatura sayfaları servis çalışanı önbelleğine alınmaz.

## Proje yapısı

```text
app/                 Sayfalar, layout'lar ve Server Actions
components/          Tekrar kullanılabilir arayüz bileşenleri
lib/                 Doğrulama, biçimlendirme ve Supabase istemcileri
services/            Tekrar kullanılabilir fatura veri servisi
supabase/migrations/ Üretim veritabanı şeması ve RLS
public/              PWA manifesti, ikonlar ve çevrimdışı ekran
tests/               Birim testleri
types/               TypeScript alan modelleri
```

## Yedekleme ve bakım

- Supabase'de Point-in-Time Recovery veya günlük yedek planını etkinleştirin.
- Üretimde şema değişikliklerini yeni tarihli migration dosyalarıyla uygulayın; ilk migration dosyasını değiştirmeyin.
- Fatura numarası yasal süreçlerinize bağlıysa dönem başında sayaç değişikliğini mali müşavirinizle doğrulayın.
- `invoice_counters.last_number` değerini aktif kullanım sırasında elle değiştirmeyin.

## Lisans

Bu proje Sümer Kuyumculuk için hazırlanmıştır. İzinsiz dağıtım amaçlanmamıştır.
