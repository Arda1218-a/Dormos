// ====================================================================
// DormOS 10.1" Tablet Arayüzü & MQTT + NVIDIA Riva AI Asistanı
// ====================================================================

// --- 1. MQTT WEBSOCKET BAĞLANTISI (HiveMQ) ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-WebPanel-104-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let isMQTTConnected = false;

function initMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = onConnectionLost;
  mqttClient.onMessageArrived = onMessageArrived;

  const options = {
    useSSL: true,
    timeout: 5,
    onSuccess: onConnectSuccess,
    onFailure: onConnectFailure
  };

  mqttClient.connect(options);
}

function onConnectSuccess() {
  isMQTTConnected = true;
  console.log("✅ [MQTT] Web Panel Buluta Bağlandı!");

  mqttClient.subscribe("dormos/room104/sensors");
  mqttClient.subscribe("dormos/room104/light/state");
  mqttClient.subscribe("dormos/room104/sos");
  mqttClient.subscribe("dormos/room104/sos/reset");
  mqttClient.subscribe("dormos/room104/kargo");

  updateConnectionBadge(true);
}

function onConnectFailure(err) {
  isMQTTConnected = false;
  updateConnectionBadge(false);
  setTimeout(initMQTT, 5000);
}

function onConnectionLost(responseObject) {
  isMQTTConnected = false;
  updateConnectionBadge(false);
  setTimeout(initMQTT, 3000);
}

function onMessageArrived(message) {
  const topic = message.destinationName;
  const payload = message.payloadString;

  if (topic === "dormos/room104/sensors") {
    try {
      const data = JSON.parse(payload);
      if (data.temperature) document.getElementById("disp-temp").innerText = data.temperature + "°C";
      if (data.humidity) document.getElementById("disp-hum").innerText = "%" + data.humidity;
      
      const motionElem = document.getElementById("disp-motion");
      if (data.motion) {
        motionElem.innerText = "Dolu (Hareket Algılandı)";
        motionElem.className = "text-green";
      } else {
        motionElem.innerText = "Oda Boş (Hareketsiz)";
        motionElem.className = "text-muted";
      }

      if (data.light !== undefined) {
        document.getElementById("toggle-main-light").checked = data.light;
      }
    } catch (e) {}
  }
  else if (topic === "dormos/room104/light/state") {
    const isLightOn = (payload === "1" || payload === "ON");
    document.getElementById("toggle-main-light").checked = isLightOn;
  }
  else if (topic === "dormos/room104/sos") {
    showEmergencyModal("DONANIMSAL SOS BUTONU VEYA RADAR TETİKLEMESİ");
  }
  else if (topic === "dormos/room104/sos/reset") {
    hideEmergencyModal();
  }
  else if (topic === "dormos/room104/kargo") {
    try {
      const k = JSON.parse(payload);
      const kargoCard = document.querySelector(".kargo-card .locker-info");
      if (kargoCard) {
        kargoCard.innerHTML = `
          <div class="locker-icon">🎁</div>
          <div>
            <h4>1 Adet Yeni Kargounuz Geldi!</h4>
            <p>Lobi Akıllı Dolap: <strong>${k.slot}</strong></p>
            <p class="pin-code">Açma PIN Kodu: <strong>${k.pin}</strong></p>
          </div>
        `;
        alert(`📦 YENİ KARGO TESLİMATI!\nPaketiniz ${k.slot} numaralı dolaba bırakıldı.\nAçma Şifreniz: ${k.pin}`);
      }
    } catch (e) {}
  }
}

function publishMQTT(topic, payload) {
  if (mqttClient && isMQTTConnected) {
    const message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    mqttClient.send(message);
  }
}

function updateConnectionBadge(connected) {
  const indicator = document.querySelector(".status-indicator");
  const subText = document.querySelector(".status-sub");
  if (connected) {
    indicator.className = "status-indicator online";
    subText.innerText = "Çevrimiçi • Canlı MQTT Aktif";
  } else {
    indicator.className = "status-indicator";
    indicator.style.background = "#ef4444";
    subText.innerText = "Bağlanıyor...";
  }
}

// --- 2. SAAT GÜNCELLEMESİ ---
function updateClock() {
  const now = new Date();
  document.getElementById('current-time').innerText = now.toLocaleTimeString('tr-TR');
}
setInterval(updateClock, 1000);
updateClock();

// --- 3. TAB MENÜ GEÇİŞLERİ ---
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

const titles = {
  dashboard: 'Oda Kontrol Merkezi',
  intercom: 'İnterkom & SIP Arama',
  canteen: 'Kantin & Mutfak Sipariş Portalı',
  health: 'İlk Yardım, Revir & Psikolojik Destek',
  sustainability: 'Sürdürülebilir Su & Enerji Takibi'
};

navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active'));
    tabContents.forEach(t => t.classList.remove('active'));

    item.classList.add('active');
    const target = item.getAttribute('data-tab');
    document.getElementById(`tab-${target}`).classList.add('active');
    pageTitle.innerText = titles[target] || 'DormOS';
  });
});

// --- 4. AYDINLATMA & RÖLE KONTROLÜ ---
function toggleLight(state) {
  publishMQTT("dormos/room104/light/set", state ? "1" : "0");
  document.getElementById("toggle-main-light").checked = state;
}

// --- 5. İNTERKOM & SIP TELEFON ---
let dialNumber = '';
function pressDigit(digit) {
  dialNumber += digit;
  document.getElementById('dial-number').value = dialNumber;
}

function clearDial() {
  dialNumber = dialNumber.slice(0, -1);
  document.getElementById('dial-number').value = dialNumber;
}

function startCall(target) {
  if (!target || target.trim() === '') {
    alert('Lütfen aranacak bir oda numarası veya kişi seçin!');
    return;
  }

  document.getElementById('calling-target').innerText = target;
  document.getElementById('call-modal').classList.add('active');
  publishMQTT("dormos/room104/call", "RING");
}

function endCall() {
  document.getElementById('call-modal').classList.remove('active');
}

// --- 6. KANTİN & MUTFAK PORTALI ---
const standardMenu = [
  { id: 1, name: 'Sıcak Mercimek Çorbası', price: 35.0, icon: '🍲' },
  { id: 2, name: 'Tavuk Sote & Pilav Menü', price: 90.0, icon: '🍗' },
  { id: 3, name: 'Kaşarlı Tost', price: 45.0, icon: '🥪' },
  { id: 4, name: 'Taze Meyve Tabağı (Elma, Muz)', price: 30.0, icon: '🍎' },
  { id: 5, name: 'Bitki Çayı (Nane Limon / Ihlamur)', price: 20.0, icon: '🍵' },
  { id: 6, name: 'Doğal Kaynak Maden Suyu', price: 15.0, icon: '🥤' }
];

const sickMenu = [
  { id: 101, name: 'Şifalı Tavuk Suyu Çorba (Özel Hasta Menüsü)', price: 0.0, icon: '🥣' },
  { id: 102, name: 'Nane Limon & Bal & Zencefil Çayı', price: 0.0, icon: '🫖' },
  { id: 103, name: 'Haşlanmış Patates & Yoğurt', price: 0.0, icon: '🥔' },
  { id: 104, name: 'Taze C Vitamini Meyve Paketi', price: 0.0, icon: '🍊' }
];

let cart = [];

function renderCanteenMenu(isSick) {
  const container = document.getElementById('canteen-items');
  const items = isSick ? sickMenu : standardMenu;
  
  container.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.innerHTML = `
      <div class="food-info">
        <h4>${item.icon} ${item.name}</h4>
        <p>${item.price === 0 ? 'ÜCRETSİZ (Revir Destekli)' : item.price.toFixed(2) + ' TL'}</p>
      </div>
      <button class="btn-add-cart" onclick="addToCart(${item.id}, ${isSick})">+ Ekle</button>
    `;
    container.appendChild(div);
  });
}

function toggleSickMode(isSick) {
  cart = [];
  updateCartUI();
  renderCanteenMenu(isSick);
}

function addToCart(id, isSick) {
  const items = isSick ? sickMenu : standardMenu;
  const item = items.find(i => i.id === id);
  if (item) {
    cart.push(item);
    updateCartUI();
  }
}

function updateCartUI() {
  const cartList = document.getElementById('cart-list');
  const totalElem = document.getElementById('cart-total-price');

  if (cart.length === 0) {
    cartList.innerHTML = '<p class="empty-cart">Sepetiniz henüz boş</p>';
    totalElem.innerText = '0.00 TL';
    return;
  }

  cartList.innerHTML = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price;
    const row = document.createElement('div');
    row.className = 'cart-row';
    row.innerHTML = `
      <span>${item.name}</span>
      <strong>${item.price === 0 ? '0 TL' : item.price.toFixed(2) + ' TL'}</strong>
    `;
    cartList.appendChild(row);
  });

  totalElem.innerText = total.toFixed(2) + ' TL';
}

function placeOrder() {
  if (cart.length === 0) {
    alert('Lütfen önce sepetinize ürün ekleyin!');
    return;
  }

  const isSick = document.getElementById('chk-sick').checked;
  const orderData = {
    room: "104",
    floor: 1,
    isSick: isSick,
    items: cart,
    total: document.getElementById('cart-total-price').innerText,
    time: new Date().toLocaleTimeString('tr-TR')
  };

  publishMQTT("dormos/canteen/orders", JSON.stringify(orderData));

  const msg = isSick 
    ? '✅ Hasta siparişiniz öncelikli olarak mutfağa iletildi! Sıcak yemek 15-20 dk içinde Oda 104 kapısına getirilecektir.'
    : `✅ Siparişiniz kantine iletildi! Toplam: ${orderData.total}. Hazırlık başladı.`;

  alert(msg);
  cart = [];
  updateCartUI();
}

// --- 7. İLK YARDIM & TRİYAJ ---
function triggerTriage(category) {
  const conf = confirm(`🚨 DİKKAT: "${category}" acil durum bildirimi revire ve güvenliğe gönderilsin mi?`);
  if (conf) {
    const triageData = {
      room: "104",
      floor: 1,
      category: category,
      time: new Date().toLocaleTimeString('tr-TR')
    };
    publishMQTT("dormos/infirmary/triage", JSON.stringify(triageData));
    alert(`🚨 BİLDİRİM İLETİLDİ!\nOda 104 için "${category}" protokolü başlatıldı.`);
  }
}

function requestMentalSupport() {
  const data = {
    room: "104",
    type: "SILENT_PSYCH_SUPPORT",
    time: new Date().toLocaleTimeString('tr-TR')
  };
  publishMQTT("dormos/psychology/requests", JSON.stringify(data));
  alert('🕊️ Sessiz Destek Talebi Alındı.\nNöbetçi rehberlik danışmanı sizinle iletişime geçecektir.');
}

function triggerSOS() {
  publishMQTT("dormos/room104/sos", JSON.stringify({ room: "104", status: "EMERGENCY", reason: "Web Panel SOS" }));
  alert('🚨 GENEL ACİL DURUM TETİKLENDİ!');
}

function showEmergencyModal(reason) {
  alert(`🚨 ACİL DURUM ALARMI AKTİF!\nOda 104: ${reason}`);
}

function hideEmergencyModal() {}

// ====================================================================
// --- 8. NVIDIA RIVA & LLAMA-3.1 AI ASİSTAN MANTIĞI ---
// ====================================================================

function toggleNvidiaAssistant() {
  const modal = document.getElementById("nvidia-modal");
  modal.classList.toggle("active");
}

function handleNvidiaKeyPress(event) {
  if (event.key === "Enter") {
    sendNvidiaCommand();
  }
}

function sendNvidiaCommand() {
  const input = document.getElementById("nvidia-input-text");
  const text = input.value.trim();
  if (!text) return;

  addChatMessage(text, "user");
  input.value = "";

  processNvidiaIntent(text);
}

function runQuickNvidia(commandText) {
  addChatMessage(commandText, "user");
  processNvidiaIntent(commandText);
}

function addChatMessage(text, sender) {
  const history = document.getElementById("nvidia-chat-history");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  bubble.innerHTML = `<span>${text}</span>`;
  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;
}

// Gerçek NVIDIA Llama-3.1 NIM API Çağrısı
async function processNvidiaIntent(userText) {
  // Ekranda "Düşünüyor..." balonu göster
  const thinkingId = "thinking-" + Date.now();
  addChatMessage("⚡ NVIDIA Llama-3.1 NIM düşünüyor...", "ai", thinkingId);

  const currentTemp = document.getElementById("disp-temp").innerText;
  const currentHum = document.getElementById("disp-hum").innerText;
  const isLightCurrentlyOn = document.getElementById("toggle-main-light").checked;

  const systemPrompt = `Sen DormOS Akıllı Yurt ve Kampüs Yaşam Asistanısın (NVIDIA Llama-3.1 NIM ile güçlendirildin).
Oda No: 104. Mevcut Durum: Sıcaklık ${currentTemp}, Nem ${currentHum}, Ana Işık ${isLightCurrentlyOn ? 'AÇIK' : 'KAPALI'}.
Görevin: Öğrencinin konuşmasını veya isteğini analiz etmek, ona samimi, zeki ve kısa Türkçe yanıt vermek ve gerekirse şu özel eylem etiketlerini yanıtının içine eklemektir:
- Eğer ışığı açmak/yakmak istiyorsa: [ACTION:LIGHT_ON]
- Eğer ışığı kapatmak/söndürmek istiyorsa: [ACTION:LIGHT_OFF]
- Eğer çorba/yemek/kantin/hastalık siparişi istiyorsa: [ACTION:SICK_SOUP]
- Eğer acil sağlık/bayılma/revir/solunum zorluğu varsa: [ACTION:TRIAGE_EMERGENCY]
- Eğer sınav stresi, yalnızlık, psikolojik destek istiyorsa: [ACTION:MENTAL_SUPPORT]
- Eğer oda iklimi/sıcaklığı soruluyorsa: Sensör verisini söyle.
Yanıtların kısa, net ve öğrenciye yardımcı olmalıdır.`;

  try {
    const response = await fetch(NVIDIA_CONFIG.LLM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NVIDIA_CONFIG.LLM_API_KEY}`
      },
      body: JSON.stringify({
        model: NVIDIA_CONFIG.LLM_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userText }
        ],
        temperature: 0.5,
        max_tokens: 200
      })
    });

    const data = await response.json();
    let aiReply = "";

    if (data.choices && data.choices.length > 0) {
      aiReply = data.choices[0].message.content;
    } else {
      throw new Error("NVIDIA API yanıt döndürmedi.");
    }

    // Eylem Etiketlerini (Action Tags) Yakala ve Donanımı Tetikle
    if (aiReply.includes("[ACTION:LIGHT_ON]")) {
      toggleLight(true);
      aiReply = aiReply.replace("[ACTION:LIGHT_ON]", "").trim();
    }
    if (aiReply.includes("[ACTION:LIGHT_OFF]")) {
      toggleLight(false);
      aiReply = aiReply.replace("[ACTION:LIGHT_OFF]", "").trim();
    }
    if (aiReply.includes("[ACTION:SICK_SOUP]")) {
      document.getElementById("chk-sick").checked = true;
      toggleSickMode(true);
      addToCart(101, true);
      placeOrder();
      aiReply = aiReply.replace("[ACTION:SICK_SOUP]", "").trim();
    }
    if (aiReply.includes("[ACTION:TRIAGE_EMERGENCY]")) {
      triggerTriage("NVIDIA Sesli Asistan Acil Sağlık Bildirimi");
      aiReply = aiReply.replace("[ACTION:TRIAGE_EMERGENCY]", "").trim();
    }
    if (aiReply.includes("[ACTION:MENTAL_SUPPORT]")) {
      requestMentalSupport();
      aiReply = aiReply.replace("[ACTION:MENTAL_SUPPORT]", "").trim();
    }

    // "Düşünüyor..." balonunu gerçek yanıtla güncelle
    const thinkingElem = document.getElementById(thinkingId);
    if (thinkingElem) {
      thinkingElem.innerHTML = `<span>${aiReply}</span>`;
    }

    speakNvidiaTTS(aiReply);

  } catch (err) {
    console.warn("NVIDIA NIM API bağlantısı kurulamadı, yerel motor devreye girdi:", err);
    // Hata durumunda yerel kural motoruna geri dön (Failover)
    fallbackLocalIntent(userText, thinkingId);
  }
}

// Çevrimdışı / Hata Durumu İçin Yerel Kural Motoru (Fallback)
function fallbackLocalIntent(userText, thinkingId) {
  const lower = userText.toLowerCase();
  let aiReply = "";

  if (lower.includes("ışık") || lower.includes("lamba")) {
    if (lower.includes("aç") || lower.includes("yak")) {
      toggleLight(true);
      aiReply = "💡 [Yerel Motor] Ana tavan ışığı açıldı.";
    } else {
      toggleLight(false);
      aiReply = "🌑 [Yerel Motor] Ana tavan ışığı kapatıldı.";
    }
  } else if (lower.includes("çorba") || lower.includes("yemek") || lower.includes("hasta")) {
    document.getElementById("chk-sick").checked = true;
    toggleSickMode(true);
    addToCart(101, true);
    placeOrder();
    aiReply = "🍲 [Yerel Motor] Hasta çorbası siparişiniz mutfağa iletildi.";
  } else if (lower.includes("sıcaklık") || lower.includes("derece")) {
    const temp = document.getElementById("disp-temp").innerText;
    aiReply = `🌡️ [Yerel Motor] Oda sıcaklığınız ${temp}.`;
  } else {
    aiReply = `⚡ [NVIDIA Çevrimdışı Kuralı]: "${userText}" komutu başarıyla alındı.`;
  }

  const thinkingElem = document.getElementById(thinkingId);
  if (thinkingElem) {
    thinkingElem.innerHTML = `<span>${aiReply}</span>`;
  }
  speakNvidiaTTS(aiReply);
}

function runQuickNvidia(commandText) {
  addChatMessage(commandText, "user");
  processNvidiaIntent(commandText);
}

function addChatMessage(text, sender, elementId = null) {
  const history = document.getElementById("nvidia-chat-history");
  const bubble = document.createElement("div");
  bubble.className = `chat-bubble ${sender}`;
  if (elementId) bubble.id = elementId;
  bubble.innerHTML = `<span>${text}</span>`;
  history.appendChild(bubble);
  history.scrollTop = history.scrollHeight;
}
function speakNvidiaTTS(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = 'tr-TR';
    utter.rate = 1.05;
    utter.pitch = 1.0;
    window.speechSynthesis.speak(utter);
  }
}

// Web Speech API ile Gerçek Mikrofon Dinleme (NVIDIA Riva ASR)
function startNvidiaSpeechRecognition() {
  const btn = document.getElementById("btn-nvidia-mic");
  
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    alert("Tarayıcınız ses tanımayı desteklemiyor. Lütfen komutunuzu metin kutusuna yazarak gönderin.");
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognizer = new SpeechRecognition();
  recognizer.lang = 'tr-TR';
  recognizer.continuous = false;
  recognizer.interimResults = false;

  btn.innerText = "🔴 Dinliyor...";
  btn.className = "btn-nv-mic listening";

  recognizer.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById("nvidia-input-text").value = transcript;
    sendNvidiaCommand();
  };

  recognizer.onerror = (event) => {
    console.warn("Ses tanıma hatası:", event.error);
    btn.innerText = "🎙️ Konuş";
    btn.className = "btn-nv-mic";
  };

  recognizer.onend = () => {
    btn.innerText = "🎙️ Konuş";
    btn.className = "btn-nv-mic";
  };

  recognizer.start();
}

// Başlangıç
renderCanteenMenu(false);
initMQTT();
