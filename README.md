# takikuyum

## Sunucusuz kullanım

1. `MAILLE_96_GERCEK_FOTOGRAF_KATALOG.html` dosyasını Chrome veya Edge ile açın.
2. `JSON dosyasını bağla` düğmesine basıp proje klasöründeki `katalog.json` dosyasını seçin ve yazma izni verin. Katalog, dosya bağlandığında görüntülenir.
3. Ürün ve kategori değişiklikleri doğrudan bağlanan dosyaya kaydedilir. Tarayıcı yeniden izin isteyebilir.

Tek veri kaynağı `katalog.json` dosyasıdır. Başlangıç içeriği kurtarılan 93 ürün ve 19 kategoridir. Fotoğraflar da bu dosyada bulunur. Sunucu veya kurulum gerekmez.

## Paylaşım

Git ile paylaşırken proje klasöründeki güncel `katalog.json` dosyasını da değişikliklere ekleyip commit ve push edin. Uygulama Git işlemlerini otomatik yapmaz. Alıcı, güncel dosyaları aldıktan sonra kendi klasöründeki `katalog.json` dosyasını bağlamalıdır.

Dosyaları doğrudan paylaşırken HTML, CSS, JavaScript ve `katalog.json` dosyalarının tamamını birlikte gönderin. Düzenlemelerin Git'e yansıması için, başka bir klasördeki aynı isimli dosyayı değil, Git projesindeki dosyayı seçin.

JSON başka bir yerde değiştirildiyse uygulama üzerine yazmaz; dosyayı yeniden bağlayın. Önceki sürümlere dönmek için Git geçmişini kullanabilirsiniz.

## Kod Yapısı

- `catalog.js`: Katalog dosyasını açma, doğrulama ve kaydetme.
- `categories.js`: Kategori işlemleri.
- `products.js`: Ürün listesi, ürün düzenleme ve CSV aktarımı.
- `photos.js`: Fotoğraf arama, düzenleme ve galeri.
- `app.js`: Arayüz olaylarını bağlama ve uygulamayı başlatma.