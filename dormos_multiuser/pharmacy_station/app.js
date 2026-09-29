// ====================================================================
// DormOS Revir & Eczane İlaç Masası Mantığı
// ====================================================================

const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-PharmacyStation-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let incomingQueries = [];

// İlaç Envanteri
let medicineInventory = [
  { name: "Parol 500mg Tablet", category: "Ağrı Kesici / Ateş Düşürücü", stock: 45, isRed: false },
  { name: "Augmentin 1000mg", category: "Antibiyotik (Hekim Onaylı)", stock: 8, isRed: true },
  { name: "Aerius 5mg Tablet", category: "Antihistaminik / Alerji", stock: 16, isRed: false },
  { name: "Nexium 40mg Kapsül", category: "Mide Koruyucu", stock: 22, isRed: false },
  { name: "Tylolhot Poşet Granül", category: "Grip & Soğuk Algınlığı", stock: 38, isRed: false },
  { name: "Majezik Sprey", category: "Boğaz Ağrısı / Antiseptik", stock: 12, isRed: false },
  { name: "Concerta / Ritalin", category: "Kırmızı Reçete (Zimmetli)", stock: 3, isRed: true }
];

function initPharmacyMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initPharmacyMQTT, 3000);
  };

  mqttClient.onMessageArrived = (message) => {
    if (message.destinationName === "dormos_v2/pharmacy/queries") {
      try {
        const queryData = JSON.parse(message.payloadString);
        handleIncomingQuery(queryData);
      } catch (e) {}
    }
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [ECZANE & REVİR] Buluta Bağlandı!");
      mqttClient.subscribe("dormos_v2/pharmacy/queries");
    }
  });
}

function handleIncomingQuery(q) {
  incomingQueries.unshift(q);
  updateQueriesUI();
}

function updateQueriesUI() {
  const container = document.getElementById("queries-list");
  document.getElementById("query-count").innerText = `${incomingQueries.length} Bekleyen`;

  if (incomingQueries.length === 0) {
    container.innerHTML = '<p class="empty-msg">Bekleyen öğrenci ilaç sorusu yok.</p>';
    return;
  }

  container.innerHTML = "";
  incomingQueries.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "query-card";
    card.innerHTML = `
      <div class="q-top">
        <h4>🏢 Oda ${q.room} • Yatak ${q.bed} (${q.studentName})</h4>
        <small>${q.time || new Date().toLocaleTimeString('tr-TR')}</small>
      </div>
      <div class="q-body">
        ❓ <strong>Soru:</strong> "${q.query}"
      </div>
      <div class="q-reply-actions">
        <button class="btn-q-reply yes" onclick="replyToStudent(${idx}, '✅ Stokta Mevcut: Revire gelip kimliğinizle teslim alabilirsiniz.')">
          ✅ Var, Revire Gel
        </button>
        <button class="btn-q-reply no" onclick="replyToStudent(${idx}, '❌ Üzgünüz, bu ilaç şu an stoklarımızda tükendi.')">
          ❌ Tükendi
        </button>
        <button class="btn-q-reply visit" onclick="replyToStudent(${idx}, '⚠️ Hekim Muayenesi Gerekli: Bu ilaç reçetesiz verilemez.')">
          👨‍⚕️ Muayene Şart
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function replyToStudent(idx, replyText) {
  const q = incomingQueries[idx];

  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(replyText);
    msg.destinationName = `dormos_v2/pharmacy/response/room${q.room}`;
    mqttClient.send(msg);
  }

  alert(`Öğrenciye (${q.studentName} - Oda ${q.room}) yanıt iletildi.`);
  incomingQueries.splice(idx, 1);
  updateQueriesUI();
}

function renderMedTable() {
  const tbody = document.getElementById("med-table-body");
  tbody.innerHTML = "";

  medicineInventory.forEach(m => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${m.name}</strong></td>
      <td>${m.category}</td>
      <td><strong>${m.stock} Kutu</strong></td>
      <td><span class="${m.isRed ? 'tag-red' : 'tag-otc'}">${m.isRed ? 'Kırmızı Reçete' : 'Serbest / OTC'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function quickAddMedicine() {
  const name = prompt("Eklenecek İlaç Adı:", "B-Vitamini Kompleks");
  if (name) {
    medicineInventory.push({
      name: name,
      category: "Vitamin & Takviye",
      stock: 20,
      isRed: false
    });
    renderMedTable();
  }
}

// Saat
setInterval(() => {
  document.getElementById("pharmacy-clock").innerText = new Date().toLocaleTimeString("tr-TR");
}, 1000);

renderMedTable();
initPharmacyMQTT();
