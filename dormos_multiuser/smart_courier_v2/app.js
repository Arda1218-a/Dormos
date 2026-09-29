// ====================================================================
// DormOS Çok Kişilik Kurye Kiosk Mantığı (v2)
// ====================================================================

const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-CourierV2-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let selectedRoom = "104";
let selectedStudent = null;

const room104Students = [
  { bed: 1, name: "Ali Yılmaz", initials: "AY" },
  { bed: 2, name: "Mehmet Kaya", initials: "MK" },
  { bed: 3, name: "Burak Demir", initials: "BD" },
  { bed: 4, name: "Can Öztürk", initials: "CÖ" },
  { bed: 5, name: "Emre Çelik", initials: "EÇ" }
];

const room202Students = [
  { bed: 1, name: "Ahmet Şahin", initials: "AŞ" },
  { bed: 2, name: "Oğuzhan Kurt", initials: "OK" },
  { bed: 3, name: "Kerem Aksoy", initials: "KA" }
];

function initCourierMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initCourierMQTT, 3000);
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [KURYE V2] Buluta Bağlandı!");
    }
  });
}

function publishCourier(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
  }
}

function selectRoom(roomNo) {
  selectedRoom = roomNo;
  document.querySelectorAll(".btn-room-select").forEach(b => {
    b.className = b.innerText.includes(roomNo) ? "btn-room-select active" : "btn-room-select";
  });
}

function goToStep(stepNo) {
  document.querySelectorAll(".k-step").forEach(s => s.classList.remove("active"));
  document.getElementById(`kiosk-step-${stepNo}`).classList.add("active");
}

function goToStep2() {
  const container = document.getElementById("students-select-grid");
  container.innerHTML = "";

  const list = selectedRoom === "104" ? room104Students : room202Students;

  list.forEach(s => {
    const card = document.createElement("div");
    card.className = "student-card";
    card.onclick = () => selectRecipient(s);
    card.innerHTML = `
      <div class="s-avatar">${s.initials}</div>
      <span class="s-bed">Yatak ${s.bed}</span>
      <h4 class="s-name">${s.name}</h4>
    `;
    container.appendChild(card);
  });

  goToStep(2);
}

function selectRecipient(student) {
  selectedStudent = student;
  document.getElementById("target-recipient-title").innerText = `${student.name} (Oda ${selectedRoom} - Yatak ${student.bed}) İçin Teslimat`;
  goToStep(3);
}

function dispatchDirectCall() {
  publishCourier(`dormos_v2/room${selectedRoom}/incoming_call`, `Kargo Kuryesi (${selectedStudent.name} İçin Kapıda)`);

  document.getElementById("res-icon").innerText = "📞";
  document.getElementById("res-title").innerText = "Arama Yapıldı!";
  document.getElementById("res-details").innerHTML = `
    <p>Oda ${selectedRoom} paneli ve <strong>${selectedStudent.name}</strong> telefonuna çağrı iletildi.</p>
    <p style="color:var(--orange)">Lütfen öğrencinin kapıya inmesini bekleyiniz.</p>
  `;
  goToStep(4);
}

function dispatchSmartLocker() {
  const slotNum = "DOLAP #" + String(Math.floor(Math.random() * 15) + 1).padStart(2, '0');
  const pinCode = String(Math.floor(1000 + Math.random() * 9000));

  // Hedef Öğrenciye Özel Kargo Paketi Yayınla (Sadece onun profiline düşer!)
  const payload = JSON.stringify({
    room: selectedRoom,
    bed: selectedStudent.bed,
    studentName: selectedStudent.name,
    slot: slotNum,
    pin: pinCode,
    time: new Date().toLocaleTimeString("tr-TR")
  });

  publishCourier(`dormos_v2/room${selectedRoom}/kargo/target`, payload);

  document.getElementById("res-icon").innerText = "🔐";
  document.getElementById("res-title").innerText = "Akıllı Dolap Açıldı!";
  document.getElementById("res-details").innerHTML = `
    <h3 style="color:var(--green);font-size:24px;margin-bottom:8px;">${slotNum}</h3>
    <p>Paketi açılan göze koyup kapağı kapatınız.</p>
    <p style="color:var(--blue);margin-top:8px;">🔑 Tek kullanımlık PIN (<strong>${pinCode}</strong>) SADECE <strong>${selectedStudent.name}</strong> telefonuna ve profiline iletildi.</p>
    <small style="color:var(--text-muted)">Odadaki diğer öğrenciler bu şifreyi göremez.</small>
  `;
  goToStep(4);
}

setInterval(() => {
  document.getElementById("kiosk-clock").innerText = new Date().toLocaleTimeString("tr-TR");
}, 1000);

initCourierMQTT();
