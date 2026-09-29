// ====================================================================
// DormOS Kurye & Kargo Giriş Kapısı Terminali
// ====================================================================

// --- 1. MQTT WEBSOCKET BAĞLANTISI ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-CourierKiosk-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let selectedRoom = "104";
let isRoomOccupied = true;

function initCourierMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initCourierMQTT, 3000);
  };

  mqttClient.onMessageArrived = (message) => {
    if (message.destinationName === "dormos/room104/sensors") {
      try {
        const d = JSON.parse(message.payloadString);
        isRoomOccupied = d.motion;
        updateOccupancyText();
      } catch (e) {}
    }
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [KURYE KIOSK] Buluta Bağlandı!");
      mqttClient.subscribe("dormos/room104/sensors");
    }
  });
}

function publishCourier(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
    console.log(`📦 [KURYE YAYIN] ${topic} -> ${payload}`);
  }
}

// --- 2. SAAT & EKRAN KONTROLÜ ---
function updateKioskClock() {
  const now = new Date();
  document.getElementById("kiosk-time").innerText = now.toLocaleTimeString("tr-TR");
}
setInterval(updateKioskClock, 1000);
updateKioskClock();

function goToStep(stepNumber) {
  document.querySelectorAll(".kiosk-step").forEach(s => s.classList.remove("active"));
  document.getElementById(`step-${stepNumber}`).classList.add("active");
}

// --- 3. NUMARATÖR KONTROLÜ ---
let roomInputStr = "";

function pressKioskDigit(digit) {
  if (roomInputStr.length < 3) {
    roomInputStr += digit;
    document.getElementById("target-room-input").value = roomInputStr;
  }
}

function clearRoomInput() {
  roomInputStr = "";
  document.getElementById("target-room-input").value = "";
}

function setRoom(roomNo) {
  roomInputStr = roomNo;
  document.getElementById("target-room-input").value = roomNo;
  proceedToDelivery();
}

function proceedToDelivery() {
  const input = document.getElementById("target-room-input").value;
  if (!input || input.trim() === "") {
    alert("Lütfen teslimat yapılacak oda numarasını girin!");
    return;
  }

  selectedRoom = input;
  document.getElementById("delivery-title").innerText = `Oda ${selectedRoom} İçin Teslimat Yöntemi`;
  updateOccupancyText();
  goToStep(2);
}

function updateOccupancyText() {
  const elem = document.getElementById("occupancy-info");
  if (selectedRoom === "104") {
    if (isRoomOccupied) {
      elem.innerHTML = "🟢 <strong>Sensör Durumu:</strong> Öğrenci şu an odasında (Hareket algılandı).";
      elem.style.color = "var(--accent-green)";
    } else {
      elem.innerHTML = "🟡 <strong>Sensör Durumu:</strong> Öğrenci odada görünmüyor (Akıllı Dolap önerilir).";
      elem.style.color = "var(--accent-orange)";
    }
  } else {
    elem.innerHTML = "ℹ️ Standart Teslimat Noktası.";
    elem.style.color = "var(--text-muted)";
  }
}

// --- 4. TESLİMAT AKSİYONLARI ---

// Seçenek 1: Odayı Çaldır
function ringStudentRoom() {
  // Wokwi ve Web Paneli Çaldır
  publishCourier(`dormos/room${selectedRoom}/call`, "RING");
  publishCourier(`dormos/admin/kargo`, JSON.stringify({
    room: selectedRoom,
    type: "DOOR_RING",
    time: new Date().toLocaleTimeString("tr-TR")
  }));

  document.getElementById("res-icon").innerText = "📞";
  document.getElementById("res-title").innerText = `Oda ${selectedRoom} Zili Çalıyor!`;
  document.getElementById("res-desc").innerText = "Öğrenciye kargo kapıda bildirimi yapıldı. Lütfen kapıda bekleyiniz.";
  document.getElementById("locker-result-card").style.display = "none";

  goToStep(3);
}

// Seçenek 2: Akıllı Dolaba Bırak
function dropToSmartLocker() {
  const randomSlot = "DOLAP #" + String(Math.floor(Math.random() * 20) + 1).padStart(2, '0');
  const randomPin = String(Math.floor(1000 + Math.random() * 9000));

  const kargoPayload = {
    room: selectedRoom,
    slot: randomSlot,
    pin: randomPin,
    time: new Date().toLocaleTimeString("tr-TR"),
    status: "READY_FOR_PICKUP"
  };

  // Öğrencinin Tabletine ve İdareye İlet
  publishCourier(`dormos/room${selectedRoom}/kargo`, JSON.stringify(kargoPayload));
  publishCourier(`dormos/admin/kargo`, JSON.stringify(kargoPayload));

  document.getElementById("res-icon").innerText = "🔐";
  document.getElementById("res-title").innerText = "Akıllı Dolap Kapağı Açıldı!";
  document.getElementById("res-desc").innerText = "Lütfen paketi açılan dolap gözüne yerleştirip kapağı kapatınız.";
  
  const lockerCard = document.getElementById("locker-result-card");
  lockerCard.style.display = "block";
  document.getElementById("slot-num").innerText = randomSlot;
  lockerCard.querySelector(".pin-sent-info").innerHTML = `🔑 Öğrencinin tabletine <strong>PIN Kodu (${randomPin})</strong> başarıyla iletildi.`;

  goToStep(3);
}

function resetKiosk() {
  clearRoomInput();
  goToStep(1);
}

initCourierMQTT();
