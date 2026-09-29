# 👥 DormOS Multi-User: Çok Kişilik Odalar (3 ve 5 Kişilik) ve Modüler Kampüs Ekosistemi
> **Ana Kural:** Önceki sistem dosyalarına dokunulmamış, bu yeni mimari tamamen bağımsız olarak `dormos_multiuser/` klasöründe inşa edilmiştir.

---

## 1. 🎯 Temel Problem ve Çözüm Mimarisi

### Problem:
İlk nesil sistemler odada **tek bir kişi** kalıyormuş gibi tasarlandı. Oysa KYK ve üniversite yurtlarında odalar genellikle **3, 4 veya 5 kişiliktir**. 
Tek bir duvardaki ekranda herkesin kargo şifreleri, sağlık kayıtları, kantin borçları ve siparişleri birbirine karışamaz.

### Çözüm: "Çift Katmanlı Hibrit Mimari (Shared Hardware + Private Personas)"
1. **Katman 1: 7/24 Kesintisiz Arka Plan Güvenliği (Oturum Açma Gerekmez):**
   * Yangın/duman, su baskını, mmWave düşme/hareketsizlik ve akustik panik sensörleri bağımsız olarak 7/24 çalışır.
   * Dışarıdan veya idareden arama geldiğinde panel çalar; odadaki herhangi bir öğrenci oturum açmadan "Yanıtla" diyerek görüşebilir.
   * Kat su deposu seviyesi ve acil SOS butonları kilit ekranında herkese açıktır.
2. **Katman 2: Bireysel Profil & Mobil OTP Güvenliği:**
   * Öğrenci ekranda kendi yatağını/adını seçer (Örn: *Yatak 2 - Mehmet Kaya*).
   * Cep telefonuna gelen tek kullanımlık SMS/OTP kodunu veya 4 haneli şifresini girer.
   * Yalnızca ona ait panel açılır: Bireysel masa ışığı, kendi kargo dolap PIN'i, kişisel ilaç saatleri, kantin siparişi.
   * 60 saniye hareketsizlikte otomatik kilitlenerek gizliliği korur.

---

## 2. 💡 Gözden Kaçan Noktalar ve Eklenen Kritik Mühendislik Çözümleri

1. **🛌 Bireysel Yatak & Masa Aydınlatması (Zonal Lighting):**
   * 5 kişilik odada 1 kişi uyurken 1 kişi ders çalışmak ister. Genel lamba yerine **Yatak 1, 2, 3, 4, 5 ve Çalışma Masaları** bağımsız kontrol edilir.
2. **🧹 Oda Temizlik & Nöbet Çizelgesi (Smart Chore Rotation):**
   * 3 ve 5 kişilik odaların en büyük sürtüşme noktası temizliktir. Sistem her hafta kimin nöbetçi olduğunu panelde gösterir.
3. **🌙 Sessiz / Uyku Modu (Sleep Protocol):**
   * Odada çoğunluk uyku moduna geçtiğinde panel parlaklığını kısar, sesli bildirimleri fısıltı moduna alır.
4. **📦 Kişiye Özel Kurye & Dolap Yönlendirmesi:**
   * Kurye odaya değil, *kişiye* teslimat yapar. Kargo dolap PIN kodu sadece o öğrencinin profiline ve telefonuna düşer.

---

## 3. 📂 Modül Dosya Yapısı (`dormos_multiuser/`)

* 📱 [`room_station/`](file:///c:/Users/LENOVO/Documents/yurt/dormos_multiuser/room_station/index.html) ➔ 3 ve 5 Kişilik Akıllı Oda İstasyonu (Kilitli Güvenlik Modu + Bireysel Profil Girişi)
* 🍽️ [`canteen_station/`](file:///c:/Users/LENOVO/Documents/yurt/dormos_multiuser/canteen_station/index.html) ➔ Kantin Mutfak Terminali & Canlı Stok/Sipariş Yönetimi
* 💊 [`pharmacy_station/`](file:///c:/Users/LENOVO/Documents/yurt/dormos_multiuser/pharmacy_station/index.html) ➔ Revir & Eczane İlaç Envanteri, Reçete Onayı ve Canlı İlaç Sorma Portalı
* 📦 [`smart_courier_v2/`](file:///c:/Users/LENOVO/Documents/yurt/dormos_multiuser/smart_courier_v2/index.html) ➔ Çok Kişilik Odalar İçin Birey Hedefli Kurye Kiosk Terminali
