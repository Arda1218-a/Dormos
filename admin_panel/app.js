// --- 1. SAAT GÜNCELLEMESİ & DAHİLİ SES SENTEZLEYİCİ ---
let adminAudioCtx = null;
let adminSirenInterval = null;

function playAdminSiren() {
  stopAdminSiren();
  try {
    if (!adminAudioCtx) adminAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (adminAudioCtx.state === 'suspended') adminAudioCtx.resume();

    let toggle = false;
    adminSirenInterval = setInterval(() => {
      const osc = adminAudioCtx.createOscillator();
      const gain = adminAudioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(toggle ? 950 : 1400, adminAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.4, adminAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, adminAudioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(adminAudioCtx.destination);

      osc.start();
      osc.stop(adminAudioCtx.currentTime + 0.35);
      toggle = !toggle;
    }, 400);
  } catch (e) {}
}

function stopAdminSiren() {
  if (adminSirenInterval) {
    clearInterval(adminSirenInterval);
    adminSirenInterval = null;
  }
}

function updateAdminClock() {
  const now = new Date();
  document.getElementById("admin-time").innerText = now.toLocaleTimeString("tr-TR");
}
setInterval(updateAdminClock, 1000);
updateAdminClock();

// --- 2. 50 ODALI KAT HARİTASI OLUŞTURMA ---
const floorsData = [
  { floor: 4, name: "4. Kat", rooms: ["401 (Sorumlu)", "402", "403", "404", "405", "406", "407", "408", "409", "410"] },
  { floor: 3, name: "3. Kat", rooms: ["301 (Sorumlu)", "302", "303", "304", "305", "306", "307", "308", "309", "310"] },
  { floor: 2, name: "2. Kat", rooms: ["201 (Sorumlu)", "202", "203", "204", "205", "206", "207", "208", "209", "210"] },
  { floor: 1, name: "1. Kat", rooms: ["101 (Sorumlu)", "102 (Depo)", "103", "104 (Wokwi)", "105", "106", "107", "108", "109", "110"] },
  { floor: 0, name: "Zemin Kat (İdare & Sosyal)", rooms: ["Müdür (01)", "Psikolog (02)", "Revir (03)", "Kargo (04)", "Kantin 1", "Kantin 2", "Kantin 3", "Temizlik", "Sorumlu (09)", "Danışma"] }
];

function buildRoomsMap() {
  const container = document.getElementById("floors-container");
  container.innerHTML = "";

  floorsData.forEach(f => {
    const floorRow = document.createElement("div");
    floorRow.className = "floor-row";

    const header = document.createElement("div");
    header.className = "floor-header";
    header.innerHTML = `<span>🏢 ${f.name}</span> <span>10 Oda / Ünite</span>`;
    floorRow.appendChild(header);

    const grid = document.createElement("div");
    grid.className = "rooms-grid";

    f.rooms.forEach(r => {
      const chip = document.createElement("div");
      const isRoom104 = r.includes("104");
      const isSpecial = f.floor === 0 || r.includes("Sorumlu") || r.includes("Depo");

      chip.className = `room-chip ${isSpecial ? 'special' : 'safe'}`;
      chip.id = `chip-room-${r.split(' ')[0]}`;

      chip.innerHTML = `
        <span class="r-no">${r}</span>
        <span class="r-status" id="status-${r.split(' ')[0]}">${isRoom104 ? 'Canlı Bağlı' : 'Güvenli'}</span>
      `;

      chip.onclick = () => {
        if (isRoom104) callRoom("104");
        else alert(`${r} numaralı oda seçildi. Durum: Normal / Güvenli.`);
      };

      grid.appendChild(chip);
    });

    floorRow.appendChild(grid);
    container.appendChild(floorRow);
  });
}
buildRoomsMap();

// --- 3. MQTT WEBSOCKET BAĞLANTISI (HiveMQ) ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-AdminCenter-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let activeAlarms = [];

function initAdminMQTT() {
  console.log("[ADMIN MQTT] Bağlanılıyor...");
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = (res) => {
    console.warn("[ADMIN MQTT] Koptu:", res.errorMessage);
    setTimeout(initAdminMQTT, 3000);
  };

  mqttClient.onMessageArrived = handleIncomingMQTT;

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [ADMIN MQTT] Güvenlik Merkezi Buluta Bağlandı!");
      mqttClient.subscribe("dormos/+/sensors");
      mqttClient.subscribe("dormos/+/sos");
      mqttClient.subscribe("dormos/+/sos/reset");
      mqttClient.subscribe("dormos/canteen/orders");
      mqttClient.subscribe("dormos/infirmary/triage");
      mqttClient.subscribe("dormos/psychology/requests");
      mqttClient.subscribe("dormos/admin/anomalies");
      mqttClient.subscribe("dormos/admin/kargo");
    },
    onFailure: (e) => {
      console.error("[ADMIN MQTT] Başarısız:", e);
      setTimeout(initAdminMQTT, 5000);
    }
  });
}

function handleIncomingMQTT(message) {
  const topic = message.destinationName;
  const payload = message.payloadString;
  console.log(`📡 [ADMIN ALINDI] ${topic} -> ${payload}`);

  // 1. Oda 104 Sensör Verisi
  if (topic === "dormos/room104/sensors") {
    try {
      const d = JSON.parse(payload);
      const chipStatus = document.getElementById("status-104");
      if (chipStatus) {
        chipStatus.innerText = `${d.temperature}°C • ${d.motion ? 'Odada Var' : 'Boş'}`;
      }
    } catch (e) {}
  }

  // 2. SOS Alarmı Geldi
  else if (topic.endsWith("/sos")) {
    handleSOSAlarm(payload);
  }

  // 3. Alarm Sıfırlandı
  else if (topic.endsWith("/sos/reset")) {
    resolveAlarm("104");
  }

  // 4. Kantin Siparişi Geldi
  else if (topic === "dormos/canteen/orders") {
    handleCanteenOrder(payload);
  }

  // 5. Revir / Sağlık Çağrısı
  else if (topic === "dormos/infirmary/triage" || topic === "dormos/psychology/requests") {
    handleHealthAlert(payload);
  }

  // 6. Kestirimci Bakım / Anomali Alarmı
  else if (topic === "dormos/admin/anomalies") {
    handleAnomalyAlert(payload);
  }
}

function publishAdmin(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
  }
}

// --- 4. ALARM & ACİL DURUM YÖNETİMİ ---
function handleSOSAlarm(payload) {
  let room = "104";
  try {
    const d = JSON.parse(payload);
    if (d.room) room = d.room;
  } catch (e) {}

  // Haritada Odayı Kırmızı Yap
  const chip = document.getElementById(`chip-room-${room}`);
  if (chip) chip.className = "room-chip emergency";

  // Alarm sayısını güncelle
  if (!activeAlarms.includes(room)) activeAlarms.push(room);
  updateAlarmCounter();

  // Siren sesi çal (Dahili Sentezleyici)
  playAdminSiren();

  // Akışa ekle
  const stream = document.getElementById("sos-stream");
  const empty = stream.querySelector(".empty-msg");
  if (empty) empty.remove();

  const item = document.createElement("div");
  item.className = "alert-item";
  item.id = `alert-item-${room}`;
  item.innerHTML = `
    <div>
      <h4>🚨 Oda ${room} ACİL DURUM ÇAĞRISI!</h4>
      <p>Konum: 1. Kat • Zaman: ${new Date().toLocaleTimeString('tr-TR')}</p>
    </div>
    <button class="btn-resolve" onclick="resolveAlarm('${room}')">✅ Müdahale Edildi (Sıfırla)</button>
  `;
  stream.prepend(item);
}

function resolveAlarm(room) {
  // Wokwi'ye ve Web Panele Sıfırlama Gönder
  publishAdmin(`dormos/room${room}/sos/reset`, "RESET");

  // Haritada odayı normale döndür
  const chip = document.getElementById(`chip-room-${room}`);
  if (chip) chip.className = "room-chip safe";

  // Listeden kaldır
  activeAlarms = activeAlarms.filter(r => r !== room);
  updateAlarmCounter();

  const item = document.getElementById(`alert-item-${room}`);
  if (item) item.remove();

  const stream = document.getElementById("sos-stream");
  if (stream.children.length === 0) {
    stream.innerHTML = '<p class="empty-msg">Şu anda aktif bir acil durum uyarısı yok.</p>';
  }

  stopAdminSiren();
}

function updateAlarmCounter() {
  document.getElementById("alarm-count-text").innerText = activeAlarms.length;
}

// --- 5. KANTİN VE REVİR AKIŞLARI ---
function handleCanteenOrder(payload) {
  try {
    const o = JSON.parse(payload);
    const stream = document.getElementById("canteen-stream");
    const empty = stream.querySelector(".empty-msg");
    if (empty) empty.remove();

    const itemsSummary = o.items.map(i => i.name).join(", ");
    const div = document.createElement("div");
    div.className = "canteen-item";
    div.innerHTML = `
      <div>
        <h4>🍲 Oda ${o.room} - ${o.isSick ? '🤒 HASTA MENÜSÜ' : 'Sipariş'} (${o.total})</h4>
        <p>${itemsSummary}</p>
      </div>
      <button class="btn-canteen-done" onclick="this.parentElement.remove()">🚴 Yola Çıkar</button>
    `;
    stream.prepend(div);
  } catch (e) {}
}

function handleHealthAlert(payload) {
  try {
    const d = JSON.parse(payload);
    const stream = document.getElementById("infirmary-stream");
    const empty = stream.querySelector(".empty-msg");
    if (empty) empty.remove();

    const div = document.createElement("div");
    div.className = "alert-item";
    div.style.borderColor = "var(--purple)";
    div.style.background = "rgba(139, 92, 246, 0.15)";
    div.innerHTML = `
      <div>
        <h4 style="color:var(--purple)">🚑 Oda ${d.room} - ${d.category || 'Sessiz Psikolojik Destek'}</h4>
        <p>Zaman: ${d.time || new Date().toLocaleTimeString('tr-TR')}</p>
      </div>
      <button class="btn-resolve" style="background:var(--purple)" onclick="this.parentElement.remove()">👨‍⚕️ İlgileniliyor</button>
    `;
    stream.prepend(div);
  } catch (e) {}
}

// --- 6. HIZLI BUTONLAR ---
function callRoom(room) {
  publishAdmin(`dormos/room${room}/call`, "RING");
  alert(`📞 Oda ${room}'e arama sinyali gönderildi! (Wokwi Buzzer zili çalıyor)`);
}

function broadcastAnnouncement() {
  const text = prompt("Tüm odalara yapılacak sesli anons metnini girin:", "Lütfen dikkat: 10 dakika sonra bina su arıtma bakımı başlayacaktır.");
  if (text) {
    publishAdmin("dormos/broadcast/announcement", text);
    alert("📣 Genel anons 50 odanın tüm panellerine başarıyla iletildi!");
  }
}

function handleAnomalyAlert(payload) {
  try {
    const a = JSON.parse(payload);
    const stream = document.getElementById("anomaly-stream");
    const empty = stream.querySelector(".empty-msg");
    if (empty) empty.remove();

    const div = document.createElement("div");
    div.className = "alert-item";
    div.style.borderColor = a.level === 'warning' ? "var(--orange)" : "var(--red)";
    div.style.background = a.level === 'warning' ? "rgba(245, 158, 11, 0.15)" : "rgba(239, 68, 68, 0.15)";
    div.innerHTML = `
      <div>
        <h4 style="color:${a.level === 'warning' ? 'var(--orange)' : 'var(--red)'}">${a.title}</h4>
        <p>${a.desc}</p>
        <p style="color:var(--blue);font-weight:600;margin-top:4px;">💡 ${a.action}</p>
      </div>
      <button class="btn-resolve" style="background:var(--blue)" onclick="this.parentElement.remove()">🔧 İncele</button>
    `;
    stream.prepend(div);
  } catch (e) {}
}

function resetAllAlarms() {
  resolveAlarm("104");
  alert("Tüm alarmlar sıfırlandı.");
}

initAdminMQTT();
