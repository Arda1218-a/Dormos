// ====================================================================
// DormOS Kantin & Mutfak Operasyon Terminali Mantığı
// ====================================================================

const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-CanteenStation-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let pendingOrders = [];

// Stok Listesi
let stockInventory = [
  { id: 1, name: "🍲 Mercimek Çorbası", count: 18, isAvailable: true },
  { id: 2, name: "🥪 Kaşarlı Tost", count: 25, isAvailable: true },
  { id: 3, name: "🍗 Tavuk Sote & Pilav", count: 7, isAvailable: true },
  { id: 4, name: "🥣 Şifalı Hasta Çorbası", count: 10, isAvailable: true },
  { id: 5, name: "🥤 Doğal Maden Suyu / Ayran", count: 35, isAvailable: true },
  { id: 6, name: "🍵 Bitki Çayı & Ihlamur", count: 40, isAvailable: true }
];

function initCanteenMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initCanteenMQTT, 3000);
  };

  mqttClient.onMessageArrived = (message) => {
    if (message.destinationName === "dormos_v2/canteen/orders") {
      try {
        const order = JSON.parse(message.payloadString);
        handleIncomingOrder(order);
      } catch (e) {}
    }
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [KANTİN TERMİNALİ] Buluta Bağlandı!");
      mqttClient.subscribe("dormos_v2/canteen/orders");
    }
  });
}

function handleIncomingOrder(order) {
  pendingOrders.unshift(order);
  updateOrdersUI();

  // Stoğu bir düşür
  const matchedItem = stockInventory.find(i => order.item.includes(i.name.split(" ")[1]));
  if (matchedItem && matchedItem.count > 0) {
    matchedItem.count--;
    renderStockUI();
  }
}

function updateOrdersUI() {
  const list = document.getElementById("orders-list");
  document.getElementById("pending-count").innerText = pendingOrders.length;

  if (pendingOrders.length === 0) {
    list.innerHTML = '<p class="empty-orders">Henüz yeni sipariş gelmedi. Bekleniyor...</p>';
    return;
  }

  list.innerHTML = "";
  pendingOrders.forEach((o, index) => {
    const card = document.createElement("div");
    card.className = "order-item-card";
    card.innerHTML = `
      <div class="order-info">
        <h3>🏢 Oda ${o.room} • Yatak ${o.bed} (${o.studentName})</h3>
        <p>${o.item} • ${o.price === 0 ? 'Ücretsiz (Hasta)' : o.price + ' TL'}</p>
        <small>Zaman: ${o.time || new Date().toLocaleTimeString('tr-TR')}</small>
      </div>
      <div class="order-actions">
        <button class="btn-prep" onclick="updateOrderStatus(${index}, 'Hazırlanıyor')">⏳ Hazırlanıyor</button>
        <button class="btn-dispatch" onclick="dispatchOrder(${index})">🚴 Odaya Gönder</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function updateOrderStatus(index, status) {
  alert(`Sipariş durumu "${status}" olarak işaretlendi.`);
}

function dispatchOrder(index) {
  const o = pendingOrders[index];
  alert(`🚴 Oda ${o.room} - Yatak ${o.bed} (${o.studentName}) siparişi kata servis edildi!`);
  pendingOrders.splice(index, 1);
  updateOrdersUI();
}

// Stok Arayüzü
function renderStockUI() {
  const container = document.getElementById("stock-cards-container");
  container.innerHTML = "";

  stockInventory.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = `stock-row ${item.count <= 5 ? 'low' : ''}`;
    row.innerHTML = `
      <span class="name">${item.name}</span>
      <span class="count">${item.isAvailable ? item.count + ' Adet' : 'TÜKENDİ'}</span>
      <button class="btn-toggle-stock" onclick="toggleItemStock(${index})">
        ${item.isAvailable ? 'Bitir' : 'Aç'}
      </button>
    `;
    container.appendChild(row);
  });
}

function toggleItemStock(index) {
  stockInventory[index].isAvailable = !stockInventory[index].isAvailable;
  renderStockUI();
}

function resetDefaultStock() {
  stockInventory.forEach(i => { i.count = 20; i.isAvailable = true; });
  renderStockUI();
}

function broadcastCanteenAnn() {
  const text = document.getElementById("input-canteen-ann").value.trim();
  if (!text) return;

  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(text);
    msg.destinationName = "dormos_v2/canteen/announcement";
    mqttClient.send(msg);
    alert(`📢 Kantin duyurusu tüm odalara gönderildi: "${text}"`);
    document.getElementById("input-canteen-ann").value = "";
  }
}

// Saat
setInterval(() => {
  document.getElementById("canteen-clock").innerText = new Date().toLocaleTimeString("tr-TR");
}, 1000);

renderStockUI();
initCanteenMQTT();
