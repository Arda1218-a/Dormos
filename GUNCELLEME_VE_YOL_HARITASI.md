# 🚀 DormOS v2.1 Güncelleme Paketi & Gelecek Yol Haritası
> **Doküman:** Yakında Eklenecek İnovasyonlar ve Saha Entegrasyon Şartnamesi  
> **Kapsam:** Yaşam Kolaylığı, Akıllı Ulaşım, Kütüphane ve Otonom Kampüs Operasyonları

---

## 1. 📚 Kütüphane Modu & Canlı Doluluk Takibi (Focus & Smart Library)

### A. Odaklanma (Focus) Protokolü:
* Öğrenci panelden veya telefonundan *"Kütüphane / Odak Modu"*nu aktif ettiğinde:
  * Odadaki panel ve telefon bildirimleri sessize alınır (yalnızca hayati acil durumlar/SOS hariç).
  * Öğrencinin çalışma masası ışığı 4000K doğal odaklanma ışığına ayarlanır.
  * Oda arkadaşlarına panelde *"Mehmet şu an ders çalışıyor"* bildirim ikonu gösterilir.

### B. Canlı Kampüs Kütüphanesi Sorgulama:
* Öğrenci odadan çıkmadan önce kampüs kütüphanelerinin doluluk durumunu tek bakışta görür:
  * **Merkez Kütüphane:** %82 Dolu (Mevcut Boş Masa: 36) • *Mesafe: 1.4 km (16 dk Yürüyüş)*
  * **Mühendislik Çalışma Salonu:** %34 Dolu (Mevcut Boş Masa: 110) • *Mesafe: 600 metre (7 dk Yürüyüş)*
* **Entegrasyon:** Kütüphane turnikelerindeki manyetik kart sayaçlarından MQTT / REST API ile anlık veri çekilir.

---

## 2. 🚌 Kampüs Ring & Şehir Otobüsü Canlı Bilgi Paneli (Transit HUD)

Özellikle şehir merkezine uzak, dağ veya banliyö kampüslerindeki öğrenciler için hayati bir modüldür. Kilit ekranında ortak olarak akar.

### Gösterilecek Canlı Bilgiler:
```
+-----------------------------------------------------------------------------------+
| 🚌 KAMPÜS DURAĞI CANLI OTOBÜS HATLARI                                             |
+-----------------------------------------------------------------------------------+
| 🟡 Ring 1 (Merkez Kampüs - Metro İstasyonu):     ⏳ 3 Dakika Sonra (Otobüs Yolda)  |
| 🔵 Hat 130A (Kampüs -> Kadıköy Şehir Merkezi):    ⏳ 11 Dakika Sonra (Durakta)     |
| 🟢 Gece Ringi (Yurtlar Bölgesi Ring Seferi):      ⏳ 25 Dakika Sonra               |
+-----------------------------------------------------------------------------------+
```
* **Entegrasyon:** Belediye Açık Veri Portalları (GTFS Realtime API) ve Kampüs Ring araçlarının GPS telemetri sistemi.

---

## 3. 🚖 Akıllı Taksi Çağırma & "QR Kodlu" Güvenli Biniş Eşleşmesi

### Problem (Gerçek Dünya Kaosu):
Yağmurlu veya sınav günlerinde yurt kapısına aynı anda 5 farklı taksi/araç gelir. Kapıda bekleyen 15 öğrenci *"Bu taksi kime geldi?"* kargaşası yaşar, başkasının taksisine binilir veya kuryeler/taksiciler kapıda gereksiz kuyruk oluşturur.

### Çözüm: "Dinamik QR & Biniş Eşleşme Protokolü"
1. Öğrenci odasındaki panelden tek tuşla taksi çağırır (Biniş Noktası: *Yurt Nizamiyesi* veya *Otobüs Durağı Yanı*).
2. Sistem öğrencinin telefonuna ve paneline **Dinamik Bir QR Kod ve 4 Haneli Eşleşme Kodu (Örn: PIN 8392)** üretir.
3. Taksi kapıya yaklaştığında sürücü ekranında veya plaka tarayıcıda bu kod doğrulanır:
   * Sürücü öğrencinin telefonundaki QR kodu taratır veya PIN kodunu girer.
   * Kod eşleştiği an biniş onaylanır; yanlış kişinin araca binmesi %100 engellenir!
* **Entegrasyon:** Uber Mobility SDK, TAG, Waymo veya Yerel Taksi Kooperatifi Çağrı API'leri.

---

## 4. 🧺 Akıllı Çamaşırhane Takibi & Rezervasyon (Smart Laundry HaaS)

### Problem:
Öğrenciler 4 kat aşağı çamaşır sepetiyle inip tüm makinelerin çalıştığını görür, boşuna geri döner veya çamaşırlar makinede unutulduğu için kavgalar çıkar.

### Çözüm:
* Bodrum katındaki her çamaşır ve kurutma makinesinin prizine **akım algılayıcı IoT röle (CT Clamp)** takılır.
* Makine çalıştığında güç çeker (ÇALIŞIYOR), bittiğinde güç sıfırlanır (BOŞ).
* Öğrenci odasındaki panelden:
  * *"Makine #04 boş, 45 dakikalığına rezerve et"* der.
  * Çamaşırı bittiğinde telefonuna anında bildirim düşer: *"Çamaşırınız bitti, lütfen 15 dakika içinde makineyi boşaltınız."*

---

## 5. 🌙 mmWave Radar ile 23:00 Sessiz Gece Yoklaması (Autonomous Smart Roll-Call)

### Problem:
Geleneksel yurtlarda görevliler gece 23:00'te kapıları çalar, uyuyan öğrencileri uyandırır, imza defteri dolaştırır; bu durum hem personel yükü hem de öğrenci konforu açısından ilkeldir.

### Çözüm:
* Odadaki tavanda bulunan 60GHz mmWave Hayati Belirti Radarı:
  * Odadaki mikro-solunum hareketlerini tarar.
  * Hiçbir kamera veya mikrofon olmadan, sadece radar yansımasıyla yataklardaki kişi sayısını belirler.
* **Gece 23:00 Otomatik Raporu (İdare Ekranına):**
  * `Oda 104: 5 Kişilik Oda -> 4 Kişi Yatağında Mevcut (1 Kişi İzinli Sisteminde Kayıtlı) -> DURUM: EKSİKSİZ / TAMAM`
* Görevli hiçbir kapıyı çalmaz; idare tek ekranda 50 odanın yoklamasını 1 saniyede alır!

---

## 6. 🚪 Anti-Hırsızlık Sürgülü Akıllı Kapı & Otonom Acil Durum Kilidi (Fail-Safe Sliding Door)

### Problem & Çözüm Fikri:
* Geleneksel menteşeli kapılar levye/tekmeyle kolayca zorlanabilir ve koridorda alan daraltır.
* Oda kapısı **Sürgülü (Sliding) Anti-Hırsızlık Mekanizması** ve manyetik kilit ile tasarlanır:
  * **Dışarıdan Giriş:** RFID / NFC Çipli Öğrenci Kartı veya mobil telefon teması ile açılır.
  * **İçeriden Çıkış:** Odadaki 10.1" dokunmatik panelden veya acil çıkış butonundan açılır.

### Hayati Acil Durum Çözümü (Fail-Safe Life-Safety Override):
* *"Öğrenci yere düştü / bayıldı, acil durum butonu otomatik veya manuel çalıştı, kilitli kapı nasıl açılacak?"*
* **Cevap:** mmWave radar düşme algıladığında, yangın/duman alarmında veya SOS tetiklendiğinde manyetik kilit **otomatik olarak enerjiyi keser (Fail-Safe) ve sürgülü kapı kendiliğinden serbest kalarak aralanır**.
* Böylece revir hekimi, güvenlik veya itfaiye kilitli kapıyı kırmak zorunda kalmadan içeriye saniyeler içinde girip hayat kurtarır!

---

## 📅 Uygulama & Entegrasyon Yol Haritası

| Sürüm | Eklenecek Modül | Tahmini Geliştirme Süresi |
| :--- | :--- | :--- |
| **v2.1 (A)** | 📚 Kütüphane Modu & 🚌 Otobüs Canlı HUD Arayüzü | 1 Gün |
| **v2.1 (B)** | 🧺 Akıllı Çamaşırhane Rezervasyon Simülatörü | 1 Gün |
| **v2.2** | 🚖 Taksi / QR Biniş Entegrasyonu & 🌙 mmWave Gece Yoklaması | 2 Gün |
| **v2.3** | 🚪 Anti-Hırsızlık Sürgülü Kapı & Otonom Acil Tahliye Kilidi | 2 Gün |
