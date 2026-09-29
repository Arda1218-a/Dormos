# 🏢 5 Katlı Akıllı Yurt Tasarımı ve Detaylı Maliyet Analizi
> **Kapasite:** 50 Oda (5 Kat x 10 Oda) + Bodrum Katı (Mekanik & Sunucu)  
> **Döviz Kuru:** **1 USD = 48.10 TL**  
> **Kapsam:** Donanım, Ağ/İnternet Altyapısı, Su Arıtma, Kurye Dolabı, Montaj ve İşçilik Maliyetleri (Patent hariç)

---

## 1. 📐 Kat Dağılımı ve Mekânsal Mimari Tasarım

Bina **Bodrum + 5 Kat** olarak planlanmış olup toplam 50 oda birimi ve bodrum mekanik alanları şu şekilde paylaştırılmıştır:

### 📍 Zemin Kat (Giriş & İdare & Sosyal Alan - 10 Oda Birimi)
* **Oda 01:** 👔 **Yurt Müdürü Odası** (Özel interkom paneli, idari yönetim yetkisi)
* **Oda 02:** 🧠 **Rehberlik & Psikolog Odası** (Sessiz destek hattı bağlantılı)
* **Oda 03:** 🚑 **Revir & Eczane Odası** (Acil durum triyaj ekranı, güvenli ilaç dolabı)
* **Oda 04:** 📦 **Kurye & Akıllı Kargo Odası** (24 gözlü akıllı teslimat dolabı, kurye QR terminali)
* **Oda 05 - 07 (3 Oda Büyüklüğünde):** 🍽️ **Kantin & Mutfak** (Sipariş hazırlık ekranı, pos terminali)
* **Oda 08:** 🧹 **Zemin Kat Temizlik Deposu**
* **Oda 09:** 🛡️ **Kat Sorumlusu / Nöbetçi Memur Odası**
* **Oda 10 (Giriş Holü):** 🚪 **Ana Güvenlik & Turnike İstasyonu** (Merkezi SIP danışma paneli)

### 📍 1. Kat (8 Öğrenci Odası + 2 İdari/Destek = 10 Oda)
* **Oda 101:** 🛡️ **1. Kat Sorumlusu Odası**
* **Oda 102:** 🧹 **Kat Temizlik Deposu 2**
* **Oda 103 – 110:** 🛏️ **8 Adet Öğrenci Odası** (Oda başı 3-4 yatak kapasiteli)
* **Kat Koridoru:** 💧 **2.5 Tonluk Paslanmaz Temiz Su Deposu & IoT Akıllı Sebil İstasyonu**

### 📍 2. Kat (9 Öğrenci Odası + 1 İdari = 10 Oda)
* **Oda 201:** 🛡️ **2. Kat Sorumlusu Odası**
* **Oda 202 – 210:** 🛏️ **9 Adet Öğrenci Odası**
* **Kat Koridoru:** 💧 **2.5 Tonluk Paslanmaz Temiz Su Deposu & IoT Akıllı Sebil İstasyonu**

### 📍 3. Kat (9 Öğrenci Odası + 1 İdari = 10 Oda)
* **Oda 301:** 🛡️ **3. Kat Sorumlusu Odası**
* **Oda 302 – 310:** 🛏️ **9 Adet Öğrenci Odası**
* **Kat Koridoru:** 💧 **2.5 Tonluk Paslanmaz Temiz Su Deposu & IoT Akıllı Sebil İstasyonu**

### 📍 4. Kat (9 Öğrenci Odası + 1 İdari = 10 Oda)
* **Oda 401:** 🛡️ **4. Kat Sorumlusu Odası**
* **Oda 402 – 410:** 🛏️ **9 Adet Öğrenci Odası**
* **Kat Koridoru:** 💧 **2.5 Tonluk Paslanmaz Temiz Su Deposu & IoT Akıllı Sebil İstasyonu**

---

### 📍 Bodrum Katı (Bina Dijital & Mekanik Kalbi)
1. **🖥️ Veri Merkezi & Sunucu Odası:**
   * 19" 42U Yangına Dayanıklı Rack Kabin.
   * DormOS Ana Sunucusu (Asterisk SIP Santrali + FastAPI + PostgreSQL + AI Anomali Motoru).
   * 6 kVA Çift Çevrimli Online Kesintisiz Güç Kaynağı (UPS).
2. **💧 Merkezi Sürdürülebilir Su Arıtma İstasyonu:**
   * Endüstriyel Ters Osmoz (RO) + Tortu + Aktif Karbon + UV Dezenfeksiyon + Remineralizasyon filtre grubu.
   * Ham su giriş tankı (10 Ton) ve katlara basınçlı arıtılmış su basan paslanmaz frekans kontrollü hidroforlar.
   * IoT Su Kalitesi İzleme Paneli (TDS, pH, Bulanıklık, Klor seviyeleri).
3. **🔥 Kalorifer & İklimlendirme (HVAC) Odası:**
   * Akıllı kazan kontrol ünitesi (Odalardaki sıcaklık talebine göre dinamik ısıtma).
4. **🧺 Akıllı Çamaşırhane Odası:**
   * Çamaşır/Kurutma makinelerine bağlı akıllı prizler (Öğrenci odasındaki panelden makinenin boş olup olmadığını ve süresini görür).

---

## 2. 💡 Yurdun Değerini Katlayacak Ekstra İleri Seviye Özellikler

1. **🚀 10G Fiber Omurga + Wi-Fi 7 Altyapısı:**
   * Odalarda hem kablolu Cat6A Gigabit portu hem de her katta tavan tipi çift bant Wi-Fi 6/7 Access Point.
   * Öğrencilerin ders, araştırma ve video/oyun gecikmelerini sıfıra indiren kurumsal QoS bant genişliği optimizasyonu.
2. **☀️ Çatı Hibrit Güneş Enerjisi & Akıllı Microgrid:**
   * Çatıya 15-20 kWp güneş paneli yerleştirilerek yurt ortak aydınlatması, sunucu odası ve su pompalarının enerjisi bedavaya getirilir.
3. **💧 Canlı Su Kalitesi Ekranı (Panelde Gösterim):**
   * Öğrenci panelinde: *"Bugün binamızda arıtılan su kalitesi: %99.8 Saflık / TDS: 35 ppm (İdeal Kaynak Suyu). Pet şişe almayarak doğayı korudunuz."* bildirimi.
4. **🪟 Akıllı Duman & Yangın Tahliye Otomasyonu:**
   * Herhangi bir odada duman algılandığında, o katın yangın tahliye kapağı otomatik açılır ve o kattaki tüm panellerde kaçış yönü ışıkla gösterilir.

---

## 3. 💰 50 Odalı Yurt İçin Toplam Maliyet Analizi (BOM & İşçilik)

> 📌 **Hesaplama Kuru:** **1 USD = 48.10 TL**

### 1. Kategori: Oda İçi Akıllı Donanımlar (50 Nokta)
| Parça / Ekipman | Açıklama | Adet | Birim ($) | Toplam ($) | Toplam (TL - 48.10) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **10.1" PoE Android Duvar Paneli** | Pilsiz, endüstriyel, duvara gömme, mikrofonlu/hoparlörlü | 50 | \$140 | \$7,000 | 336.700 TL |
| **ESP32-S3 Gömülü Röle Kartı** | Işık, priz, acil durum radyo mesh kontrol kartı | 50 | \$25 | \$1,250 | 60.125 TL |
| **Sensör Paketi (mmWave + Mikrofon)** | 60GHz düşme/varlık radarı + TinyML I2S mikrofon + Sıcaklık/Nem | 50 | \$30 | \$1,500 | 72.150 TL |
| **Akıllı Manyetik/RFID Kapı Kilidi** | Panel ve öğrenci kartı ile entegre kilit sistemi | 50 | \$45 | \$2,250 | 108.225 TL |
| **Ara Toplam (Oda Donanımı)** | | | | **\$12,000** | **577.200 TL** |

---

### 2. Kategori: Ağ, İnternet ve Sunucu Altyapısı
| Parça / Ekipman | Açıklama | Adet | Birim ($) | Toplam ($) | Toplam (TL - 48.10) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **DormOS 2U Rack Sunucu** | 32 Core CPU, 64GB ECC RAM, 2TB NVMe SSD (SIP+DB+AI) | 1 | \$2,200 | \$2,200 | 105.820 TL |
| **48 Port Gigabit PoE+ Core Switch** | Bodrum ana dağıtım switch'i | 2 | \$600 | \$1,200 | 57.720 TL |
| **24 Port Gigabit PoE+ Kat Switch** | Her kat panosuna 1'er adet | 5 | \$240 | \$1,200 | 57.720 TL |
| **Enterprise Wi-Fi 6/7 Access Point** | Her kata 2 adet koridor tavan tipi | 10 | \$120 | \$1,200 | 57.720 TL |
| **19" 42U Rack Kabin & Patch Paneller** | Kablolama düzenleme, fan ve PDU ünitesi | 1 | \$750 | \$750 | 36.075 TL |
| **Cat6A Halogen-Free Yangına Dayanıklı Ağ Kablosu** | 10 Drum (3.050 metre) + RJ45 konnektörler ve kanalet | 1 Set | \$1,200 | \$1,200 | 57.720 TL |
| **6 kVA Online Kesintisiz Güç Kaynağı (UPS)** | Elektrik kesintisinde sistemi 2 saat ayakta tutan akü grubu | 1 | \$1,400 | \$1,400 | 67.340 TL |
| **Ara Toplam (Ağ & Sunucu)** | | | | **\$9,150** | **440.115 TL** |

---

### 3. Kategori: Ortak Alanlar, Kurye & Lojistik Ekipmanları
| Parça / Ekipman | Açıklama | Adet | Birim ($) | Toplam ($) | Toplam (TL - 48.10) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Modüler 24 Gözlü Akıllı Kurye Dolabı** | Dokunmatik ekran, barkod okuyucu ve elektromanyetik kilitler | 1 Set | \$2,600 | \$2,600 | 125.060 TL |
| **Giriş Turnike & Biyometrik İstasyon** | Çift geçişli paslanmaz turnike + RFID/Kart okuyucu | 1 Set | \$1,900 | \$1,900 | 91.390 TL |
| **Kantin POS & Dokunmatik Hazırlık Ekranı**| Sipariş takip ve termal fiş yazıcı terminali | 1 Set | \$550 | \$550 | 26.455 TL |
| **Revir Akıllı İlaç Dolabı & Termal Takip**| Soğuk zincir ve PIN/NFC kilitli ilaç güvenliği | 1 | \$950 | \$950 | 45.695 TL |
| **Ara Toplam (Ortak Alanlar)** | | | | **\$6,000** | **288.600 TL** |

---

### 4. Kategori: Sürdürülebilir Su Arıtma & Kat Depolama Sistemi
| Parça / Ekipman | Açıklama | Adet | Birim ($) | Toplam ($) | Toplam (TL - 48.10) |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Merkezi Endüstriyel RO + UV Arıtma Sistemi** | Günde 8-10 ton kapasiteli çok kademeli arıtma ünitesi | 1 | \$3,200 | \$3,200 | 153.920 TL |
| **2.5 Tonluk AISI 304 Paslanmaz Su Deposu** | Her kata 1 adet hijyenik gıda normlu su tankı | 5 | \$1,000 | \$5,000 | 240.500 TL |
| **Paslanmaz Akıllı Su Sebili & Dolum Noktası** | IoT TDS ve akış ölçerli hijyenik dolum istasyonu | 5 | \$400 | \$2,000 | 96.200 TL |
| **Frekans Kontrollü Paslanmaz Hidrofor Grubu**| Katlara sabit basınçla su basan ikiz pompa | 1 Set | \$1,500 | \$1,500 | 72.150 TL |
| **Ara Toplam (Su Arıtma & Tesisat)** | | | | **\$11,700** | **562.770 TL** |

---

### 5. Kategori: Montaj, Kablolama, Birleştirme & Devreye Alma İşçiliği
| Hizmet / İşçilik Kalemi | Açıklama | Gün / Ekip | Toplam ($) | Toplam (TL - 48.10) |
| :--- | :--- | :---: | :---: | :---: |
| **Yapısal Kablolama & Kanalet İşçiliği** | 50 oda + ortak alanlar kablo çekimi ve sonlandırma | 3 Teknisyen / 10 Gün | \$2,800 | 134.680 TL |
| **Oda Panelleri & Kilit Montajı** | 50 odanın gömme montajı ve röle bağlantıları | 2 Teknisyen / 5 Gün | \$1,500 | 72.150 TL |
| **Su Arıtma & Hidrofor Tesisat Montajı** | Paslanmaz borulama ve tank montajı | Tesisatçı Ekip | \$1,200 | 57.720 TL |
| **Sunucu, SIP Santral & Sistem Devreye Alma** | Ağ konfigürasyonu, yazılım kurulumu ve saha testleri | Sistem Mühendisi | \$1,800 | 86.580 TL |
| **Ara Toplam (İşçilik & Montaj)** | | | **\$7,300** | **351.130 TL** |

---

## 4. 📊 GENEL MALİYET TABLOSU (ÖZET)

```
+-----------------------------------------------------------+----------------+--------------------+
| Maliyet Kategorisi                                        | Tutar (USD)    | Tutar (TL - 48.10) |
+-----------------------------------------------------------+----------------+--------------------+
| 1. Oda İçi Akıllı Donanımlar (50 Oda)                     | $12,000        | 577.200 TL         |
| 2. Ağ, İnternet ve Sunucu Altyapısı                       | $9,150         | 440.115 TL         |
| 3. Ortak Alanlar, Kurye Dolabı & Lojistik                 | $6,000         | 288.600 TL         |
| 4. Sürdürülebilir Su Arıtma & Kat Depoları                | $11,700        | 562.770 TL         |
| 5. Montaj, Kablolama, Birleştirme & İşçilik               | $7,300         | 351.130 TL         |
+-----------------------------------------------------------+----------------+--------------------+
| 💰 TOPLAM MALZEME VE BİRLEŞTİRME MALİYETİ                 | $46,150        | 2.219.815 TL       |
+-----------------------------------------------------------+----------------+--------------------+
```

### 💡 Finansal Analiz & Geri Dönüş (ROI) (1 USD = 48.10 TL):
* **Oda Başına Toplam Yatırım:** **\$923 (44.396 TL)**
* **Yıllık Toplam Tasarruf:**
  * Su damacana masraflarının sıfırlanması: **~$6,000/yıl (288.600 TL/yıl)**
  * Boşa yanan elektrik ve su sızıntılarının engellenmesi: **~$7,500/yıl (360.750 TL/yıl)**
  * Güvenlik, kargo ve lojistik personel iş yükü optimizasyonu: **~$10,000/yıl (481.000 TL/yıl)**
  * **Toplam Yıllık Kazanç:** **~ 1.130.350 TL / Yıl**
* **Sistemin Kendini Amorti Etme Süresi:** **Yaklaşık 1.95 Yıl (~ 23-24 Ay)**
