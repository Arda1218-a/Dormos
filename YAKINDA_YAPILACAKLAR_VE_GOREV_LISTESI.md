# 📋 DormOS: Yakında Yapılacaklar ve Kalan Görevler Listesi (Backlog)
> **Tarih:** 2026-09-16  
> **Durum:** v2.1 Çekirdek Sistemler %100 Tamamlandı • İleri Seviye Ar-Ge ve Saha Görevleri Listelenmiştir.

---

## 🎯 1. Mevcut Durum Özeti (Neler Tamamlandı?)

* ✅ **Faz 1 (Çekirdek Donanım & IoT):** ESP32, TFT Renkli Ekran, DHT22, PIR, Röle, MQTT haberleşmesi ve Wokwi simülasyonu.
* ✅ **Faz 2 (Yaşam Modülleri & Güvenlik):** 50 odalı Güvenlik Masası, Kurye Kiosku, 10.1" iPad dokunmatik paneli.
* ✅ **Faz 3 (Çökmez Ağ & Kesinti Dayanıklılığı):** PoE kablo kesilse bile 85ms içinde çalışan Thread / ESP-NOW 4 sekmeli Mesh simülasyonu.
* ✅ **Faz 4 (Yapay Zeka & Ar-Ge):** Web Audio FFT Spektrogramı ile Uçta Ses Analizi (TinyML), 15 saniyelik sahte alarm filtresi, Kestirimci Su Kaçağı & Ark Arıza tespiti.
* ✅ **NVIDIA NIM Entegrasyonu:** Llama-3.2 Vision-Instruct ve Riva ses modellerinin resmi API anahtarlarıyla canlı bağlanması.
* ✅ **DormOS Multi-User (3 ve 5 Kişilik Odalar):**
  * 7/24 oturumsuz arka plan güvenliği (mmWave, yangın, su, gelen telefon aramaları).
  * Cep telefonu SMS/OTP ile bireysel profil girişi.
  * Kişiye özel gizli kargo dolap PIN kodu.
  * Bağımsız Kantin/Mutfak ve Eczane/Revir operasyon terminalleri.
  * Canlı Kampüs Ring/Otobüs takip şeridi (HUD).
  * Kütüphane & Odaklanma Modu (Focus Mode).
  * Akıllı Çamaşırhane makine rezervasyonu.
  * Dinamik QR kodlu ve PIN doğrulamalı Akıllı Taksi çağırma sistemi.

---

## ⏳ 2. Yakında Yapılacaklar Listesi (Kalan İleri Seviye Görevler)

Aşağıdaki görevler, sistemi prototip aşamasından **gerçek dünya kampüslerinde ticari kuruluma** geçirecek olan ileri seviye Ar-Ge adımlarıdır:

```
+----------------------------------------------------------------------------------------------------+
| NO | GÖREV ADI                                    | ÖNCELİK  | KATEGORİ         | ZORLUK SEVİYESİ  |
+----------------------------------------------------------------------------------------------------+
| 01 | mmWave Radar ile 23:00 Sessiz Gece Yoklaması | YÜKSEK   | Otonom Güvenlik  | Orta             |
| 02 | NVIDIA Riva'nın Çoklu Odaya Entegre Edilmesi | ORTA     | Sesli Yapay Zeka | Kolay            |
| 03 | Mobil PWA & Canlı Push Bildirim Servisi     | YÜKSEK   | Mobil Entegrasyon| Kolay - Orta     |
| 04 | Üniversite OBS / Yurt İzin Veritabanı API'si | ORTA     | Veri Tabanı      | Orta             |
| 05 | Fiziksel ESP32-S3 PCB & PoE Saha Prototipi  | İLERİ    | Donanım / Üretim | İleri (Donanım)  |
| 06 | KVKK & Siber Güvenlik / Şifreleme Denetimi   | DÜŞÜK    | Regülasyon & Güv.| Orta             |
| 07 | Anti-Hırsızlık Sürgülü Kapı & Otonom Kilit   | KRİTİK   | Fiziksel Güvenlik| Orta             |
+----------------------------------------------------------------------------------------------------+
```

---

### 📝 Görev Detayları:

### 🌙 Görev 01: mmWave Radar ile 23:00 Sessiz Gece Yoklaması
* **Amaç:** Gece 23:00'te görevlilerin kapı kapı dolaşıp öğrencileri uyandırmasını engellemek.
* **Yapılacak İş:**
  * Tavandaki mmWave radarının nokta bulutu (point-cloud) verisinden odadaki mikro-solunum hareketlerini analiz eden algoritmanın simülasyonunu kodlamak.
  * Gece saat 23:00 olduğunda Güvenlik Masasına otomatik rapor düşürmek:  
    `"Oda 104: 5 Kişilik Oda -> 4 Kişi Yatağında Mevcut (1 Kişi İzinli) -> DURUM: TAMAM"`.

---

### 🎙️ Görev 02: NVIDIA Riva Sesli Asistanının Çoklu Odaya Entegre Edilmesi
* **Amaç:** İlk sistemdeki NVIDIA sesli asistanı, yeni yaptığımız `dormos_multiuser/room_station` paneline de bağlamak.
* **Yapılacak İş:**
  * Öğrenci kendi profili açıkken mikrofona basıp:
    * *"DormOS, kampüs nizamiyesine taksi çağır"*
    * *"Bodrum çamaşırhanesinde boş makine var mı?"*
    * *"Kütüphane odak modunu aç"*
    dediğinde NVIDIA Llama modelinin bu yeni eylemleri sesle tetiklemesini sağlamak.

---

### 📱 Görev 03: Mobil PWA & Canlı Push Bildirim Servisi
* **Amaç:** Simüle edilen SMS'lerin yerine öğrencinin gerçek akıllı telefonuna anlık bildirim göndermek.
* **Yapılacak İş:**
  * Web Push API (Service Worker) entegrasyonu.
  * Kurye dolaba paket bıraktığında öğrencinin telefon kilit ekranına doğrudan *"Dolap #07 açma şifreniz: 3914"* bildirimi düşmesi.
  * Rezerve edilen çamaşır makinesi bittiğinde *"Çamaşırınız bitti, lütfen boşaltın"* uyarısı gitmesi.

---

### 📊 Görev 04: Üniversite OBS / Yurt İzin Veritabanı API'si
* **Amaç:** Öğrencinin hafta sonu ev izni, staj izni veya sağlık raporlarının sisteme otomatik akması.
* **Yapılacak İş:**
  * Mock (Simüle) bir PostgreSQL/REST API uç noktası tasarlamak.
  * Öğrenci hafta sonu izinliyse, 23:00 yoklamasında sistemin onu *"İzinli / Mazeretli"* sayması ve gereksiz kırmızı alarm üretmemesi.

---

### ⚡ Görev 05: Fiziksel ESP32-S3 PCB & PoE Saha Prototipi
* **Amaç:** Yazılım ve simülasyonu biten sistemi gerçek fiziksel duvara monte edilecek prototip kart haline getirmek.
* **Yapılacak İş:**
  * KiCad ile ESP32-S3 + Ethernet W5500 (PoE destekli) şematik çizimi.
  * 3B Yazıcı için duvara gömme 10.1 inç tablet ve sensör kutusu (enclosure) tasarımı.

---

### 🛡️ Görev 06: KVKK & Siber Güvenlik / Şifreleme Denetimi
* **Amaç:** Kamusal KYK veya özel yurt şartnamelerinde talep edilen siber güvenlik standartlarını belgelemek.
* **Yapılacak İş:**
  * MQTT veri trafiğinin WSS/TLS (Port 8884) ile tam şifreli olduğunun dokümantasyonu.
  * Oda içinde kesinlikle kamera/mikrofon kaydı tutulmadığına dair **KVKK Uyumluluk Beyannamesi** hazırlamak.

---

### 🚪 Görev 07: Anti-Hırsızlık Sürgülü Akıllı Kapı & Otonom Acil Durum Kilidi (Fail-Safe Sliding Door)
* **Problem & Çözüm Fikri:**
  * Geleneksel kanatlı kapılar tekmeyle veya levye ile zorlanabilir; ayrıca koridorda yer kaplar.
  * Oda giriş kapısı **Anti-Hırsızlık Sürgülü (Sliding) ve Manyetik Kilitli** tasarlanır:
    * *Dışarıdan Giriş:* RFID / NFC Çipli Öğrenci Kartı veya telefon teması ile açılır.
    * *İçeriden Çıkış:* Odadaki 10.1" dokunmatik tablet ekrandan tek tuşla veya acil çıkış butonuna dokunularak açılır.
* **Hayati Acil Durum Çözümü (Fail-Safe Life-Safety Override):**
  * Öğrenci bayıldığında/yere düştüğünde (mmWave radar algılaması), yangın/gaz alarmında veya manuel SOS verildiğinde **manyetik kilit anında serbest kalır ve sürgülü kapı kendiliğinden açılır / aralanır**.
  * Böylece içeriye koşan revir hekimi, güvenlik veya itfaiye görevlileri kilitli kapıyı kırmak/baltayla parçalamak zorunda kalmaz; **içeride baygın yatan öğrenciye saniyeler içinde ilk müdahale yapılır!**

---

## 🚀 Sonuç
Projenin şu anki haliyle **tüm yazılım, kullanıcı arayüzleri, kurye, eczane, kantin, taksi ve otobüs sistemleri eksiksiz çalışmaktadır.** Yukarıdaki liste, projeyi gerçek bir şirket/girişim ürününe veya uluslararası bir patente dönüştürmek istediğinizde takip edeceğimiz Ar-Ge adımlarıdır.
