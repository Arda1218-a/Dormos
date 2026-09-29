/*
 * ====================================================================
 *  DormOS - Akıllı Yurt Oda Kontrol Ünitesi (Wokwi + Canlı MQTT Köprüsü)
 *  Faz 1 & 2: Çift Yönlü Canlı Bulut Haberleşmesi
 * ====================================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <SPI.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ILI9341.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- PIN TANIMLARI ---
#define TFT_CS    15
#define TFT_DC    2
#define TFT_RST   4

#define DHTPIN    14
#define DHTTYPE   DHT22

#define PIR_PIN   27
#define RELAY_PIN 12
#define SOS_BTN   32
#define BUZZER    25

// --- WI-FI & MQTT AYARLARI (Wokwi Sanal Ağı) ---
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;

// MQTT Konuları (Topics)
const char* TOPIC_LIGHT_SET   = "dormos/room104/light/set";
const char* TOPIC_LIGHT_STATE = "dormos/room104/light/state";
const char* TOPIC_SENSORS     = "dormos/room104/sensors";
const char* TOPIC_SOS         = "dormos/room104/sos";
const char* TOPIC_SOS_RESET   = "dormos/room104/sos/reset";
const char* TOPIC_CALL        = "dormos/room104/call";

WiFiClient espClient;
PubSubClient client(espClient);

Adafruit_ILI9341 tft = Adafruit_ILI9341(TFT_CS, TFT_DC, TFT_RST);
DHT dht(DHTPIN, DHTTYPE);

// --- DURUM DEĞİŞKENLERİ ---
bool isLightOn = false;
bool isEmergency = false;
bool motionDetected = false;
float temperature = 24.0;
float humidity = 45.0;
unsigned long lastSensorPublish = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("\n[DormOS] Sistem Baslatiliyor...");

  pinMode(PIR_PIN, INPUT);
  pinMode(SOS_BTN, INPUT_PULLDOWN);
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(BUZZER, OUTPUT);

  digitalWrite(RELAY_PIN, LOW);
  digitalWrite(BUZZER, LOW);

  // Ekran Başlatma
  tft.begin();
  tft.setRotation(1);
  tft.fillScreen(ILI9341_BLACK);

  // Başlangıç Ekranı
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(30, 80);
  tft.println("DormOS Baslatiliyor...");
  tft.setTextSize(1);
  tft.setCursor(30, 120);
  tft.println("Wi-Fi Agina Baglaniliyor...");

  dht.begin();

  // Wi-Fi Bağlantısı
  setupWiFi();

  // MQTT Bağlantısı
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  drawStaticUI();
  updateDynamicUI();
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  unsigned long now = millis();

  // 1. SOS Buton Kontrolü (Donanımsal Kırmızı Buton)
  if (digitalRead(SOS_BTN) == HIGH && !isEmergency) {
    triggerEmergency("DONANIMSAL SOS BUTONU");
  }

  // 2. PIR Hareket Algılama & Canlı Bildirim
  bool currentMotion = (digitalRead(PIR_PIN) == HIGH);
  if (currentMotion != motionDetected) {
    motionDetected = currentMotion;
    Serial.print("[PIR] Hareket: ");
    Serial.println(motionDetected ? "ODADA VARLIK VAR" : "ODA BOS");
    updateDynamicUI();
    publishSensors(); // Anlık durumu web paneline ilet
  }

  // 3. Periyodik Sensör Okuma ve MQTT Gönderimi (Her 3 saniyede)
  if (now - lastSensorPublish >= 3000) {
    lastSensorPublish = now;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    if (!isnan(t) && !isnan(h)) {
      temperature = t;
      humidity = h;
      updateDynamicUI();
      publishSensors();
    }
  }

  // Acil durum ses efekti
  if (isEmergency) {
    tone(BUZZER, 1000, 200);
    delay(300);
    tone(BUZZER, 1600, 200);
    delay(300);
  } else {
    noTone(BUZZER);
    delay(30);
  }
}

// Wi-Fi Kurulumu
void setupWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("[Wi-Fi] Baglaniliyor: ");
  Serial.println(ssid);

  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) {
    delay(500);
    Serial.print(".");
    retries++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n[Wi-Fi] Baglandi! IP Adresi: " + WiFi.localIP().toString());
  } else {
    Serial.println("\n[Wi-Fi] Baglanti zaman asimi, tekrar denenecek.");
  }
}

// MQTT Gelen Mesaj Dinleyicisi
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  message.trim();

  Serial.print("[MQTT GELEN] Topic: ");
  Serial.print(topic);
  Serial.print(" | Mesaj: ");
  Serial.println(message);

  // Web Panelden Işık Açma/Kapama Komutu
  if (String(topic) == TOPIC_LIGHT_SET) {
    if (message == "1" || message == "ON") {
      setLight(true);
    } else if (message == "0" || message == "OFF") {
      setLight(false);
    }
  }
  // Web Panelden veya Güvenlikten Arama/Zil Komutu
  else if (String(topic) == TOPIC_CALL) {
    Serial.println("[SIP] Gelen arama zili caliyor...");
    ringBuzzer();
  }
  // Alarm Sıfırlama Komutu
  else if (String(topic) == TOPIC_SOS_RESET) {
    resetEmergency();
  }
}

// Işık Durumunu Değiştir ve MQTT'ye Durumu Bildir
void setLight(bool state) {
  isLightOn = state;
  digitalWrite(RELAY_PIN, isLightOn ? HIGH : LOW);
  client.publish(TOPIC_LIGHT_STATE, isLightOn ? "1" : "0", true);
  Serial.println(isLightOn ? "[RÖLE] Isik ACILDI (LED YANDI)" : "[RÖLE] Isik KAPATILDI");
  updateDynamicUI();
}

// Sensör Verilerini JSON Olarak Web Paneline Yayınla
void publishSensors() {
  StaticJsonDocument<200> doc;
  doc["room"] = "104";
  doc["temperature"] = serialized(String(temperature, 1));
  doc["humidity"] = (int)humidity;
  doc["motion"] = motionDetected;
  doc["light"] = isLightOn;
  doc["emergency"] = isEmergency;

  char buffer[256];
  serializeJson(doc, buffer);
  client.publish(TOPIC_SENSORS, buffer);
}

// Acil Durum Tetikleme
void triggerEmergency(String source) {
  isEmergency = true;
  Serial.println("[ACIL DURUM ALARMI TETIKLENDI] Kaynak: " + source);
  
  // Buluta / Web Paneline / Güvenliğe Acil Sinyali Yolla
  client.publish(TOPIC_SOS, "{\"room\":\"104\",\"status\":\"EMERGENCY\",\"reason\":\"SOS Button Pressed\"}");

  tft.fillScreen(ILI9341_RED);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(3);
  tft.setCursor(15, 35);
  tft.println("! ACIL DURUM !");

  tft.setTextSize(2);
  tft.setCursor(15, 95);
  tft.println("GUVENLIK & 112'YE");
  tft.setCursor(15, 125);
  tft.println("CANLI BILGI GITTI!");

  tft.setTextSize(1);
  tft.setCursor(15, 185);
  tft.println("Web Panelinden veya Guvenlikten sifirlanabilir.");
}

void resetEmergency() {
  isEmergency = false;
  noTone(BUZZER);
  Serial.println("[ACIL] Alarm Sifirlandi. Sistem Normal.");
  drawStaticUI();
  updateDynamicUI();
  publishSensors();
}

void ringBuzzer() {
  for (int i = 0; i < 2; i++) {
    tone(BUZZER, 800, 300);
    delay(400);
    tone(BUZZER, 800, 300);
    delay(700);
  }
}

// MQTT Yeniden Bağlantı
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("[MQTT] Broker'a Baglaniliyor (HiveMQ)... ");
    String clientId = "DormOS-Room104-" + String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str())) {
      Serial.println("BAGLANDI!");
      // Konulara abone ol
      client.subscribe(TOPIC_LIGHT_SET);
      client.subscribe(TOPIC_CALL);
      client.subscribe(TOPIC_SOS_RESET);
      publishSensors();
    } else {
      Serial.print("Basarisiz, rc=");
      Serial.print(client.state());
      Serial.println(" 3 sn sonra tekrar denenecek");
      delay(3000);
    }
  }
}

// Ekran Tasarımları
void drawStaticUI() {
  tft.fillScreen(ILI9341_BLACK);

  // Üst Başlık Barı
  tft.fillRect(0, 0, 320, 32, ILI9341_NAVY);
  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(10, 8);
  tft.print("DormOS");

  tft.setTextColor(ILI9341_CYAN);
  tft.setCursor(205, 8);
  tft.print("ODA 104");

  // Çerçeveler
  tft.drawRect(5, 38, 150, 86, ILI9341_DARKGREY);
  tft.drawRect(165, 38, 150, 86, ILI9341_DARKGREY);
  tft.drawRect(5, 132, 310, 98, ILI9341_DARKGREY);
}

void updateDynamicUI() {
  if (isEmergency) return;

  // 1. Sıcaklık & Nem Kutusu
  tft.fillRect(8, 41, 144, 80, ILI9341_BLACK);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(1);
  tft.setCursor(15, 48);
  tft.print("ODA IKLIMI");

  tft.setTextColor(ILI9341_WHITE);
  tft.setTextSize(2);
  tft.setCursor(15, 66);
  tft.print(temperature, 1);
  tft.print(" C");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_LIGHTGREY);
  tft.setCursor(15, 96);
  tft.print("Nem: %");
  tft.print((int)humidity);

  // 2. Aydınlatma Kutusu
  tft.fillRect(168, 41, 144, 80, ILI9341_BLACK);
  tft.setTextColor(ILI9341_YELLOW);
  tft.setTextSize(1);
  tft.setCursor(175, 48);
  tft.print("AYDINLATMA");

  tft.setTextSize(2);
  if (isLightOn) {
    tft.setTextColor(ILI9341_GREEN);
    tft.setCursor(175, 74);
    tft.print("ACIK");
  } else {
    tft.setTextColor(ILI9341_RED);
    tft.setCursor(175, 74);
    tft.print("KAPALI");
  }

  // 3. Durum & Ağ Bilgisi
  tft.fillRect(8, 135, 304, 92, ILI9341_BLACK);
  tft.setTextColor(ILI9341_CYAN);
  tft.setTextSize(1);
  tft.setCursor(15, 142);
  tft.print("DURUM & GUVENLIK");

  tft.setTextSize(1);
  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(15, 162);
  tft.print("Varlik: ");
  if (motionDetected) {
    tft.setTextColor(ILI9341_GREEN);
    tft.print("Odada Insan Var");
  } else {
    tft.setTextColor(ILI9341_DARKGREY);
    tft.print("Oda Bos");
  }

  tft.setTextColor(ILI9341_WHITE);
  tft.setCursor(15, 182);
  tft.print("Bulut Baglantisi: ");
  if (client.connected()) {
    tft.setTextColor(ILI9341_GREEN);
    tft.print("ONLINE (MQTT)");
  } else {
    tft.setTextColor(ILI9341_RED);
    tft.print("OFFLINE");
  }

  tft.setTextColor(ILI9341_GREEN);
  tft.setCursor(15, 204);
  tft.print("Sistem: Guvenli / Stabil");
}
