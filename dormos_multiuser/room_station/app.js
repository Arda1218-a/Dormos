// ====================================================================
// DormOS Multi-User: Çok Kişilik Akıllı Oda İstasyonu Mantığı (v2.1)
// ====================================================================

// --- 1. ODA & SAKİNLER VERİ MODELİ ---
let currentCapacity = 5; // 3 veya 5

const residentsData5 = [
  { id: "u1", bed: 1, name: "Ali Yılmaz", initials: "AY", pin: "1234", phone: "0555***1122", chore: "Oda Zemini Süpürme", kargo: null, focusMode: false },
  { id: "u2", bed: 2, name: "Mehmet Kaya", initials: "MK", pin: "4921", phone: "0532***4488", chore: "Banyo & Lavabo Temizliği", kargo: { slot: "DOLAP #07", pin: "3914" }, focusMode: false },
  { id: "u3", bed: 3, name: "Burak Demir", initials: "BD", pin: "5678", phone: "0544***9900", chore: "Çöp Boşaltma & Havalandırma", kargo: null, focusMode: false },
  { id: "u4", bed: 4, name: "Can Öztürk", initials: "CÖ", pin: "1122", phone: "0505***3344", chore: "Masa Düzeni & Raflar", kargo: null, focusMode: false },
  { id: "u5", bed: 5, name: "Emre Çelik", initials: "EÇ", pin: "3344", phone: "0533***7788", chore: "Cam & Ayna Silme", kargo: null, focusMode: false }
];

const residentsData3 = [
  { id: "u1", bed: 1, name: "Ali Yılmaz", initials: "AY", pin: "1234", phone: "0555***1122", chore: "Oda Zemini & Çöp", kargo: null, focusMode: false },
  { id: "u2", bed: 2, name: "Mehmet Kaya", initials: "MK", pin: "4921", phone: "0532***4488", chore: "Banyo & Lavabo", kargo: { slot: "DOLAP #07", pin: "3914" }, focusMode: false },
  { id: "u3", bed: 3, name: "Burak Demir", initials: "BD", pin: "5678", phone: "0544***9900", chore: "Masa & Havalandırma", kargo: null, focusMode: false }
];

let activeResident = null;
let sessionCountdownInterval = null;
let sessionTimeLeft = 60;

// Çamaşırhane Rezervasyon Takibi
let laundryReservations = {
  mach3: { isReserved: false, by: null, minutesLeft: 0 },
  mach4: { isReserved: false, by: null, minutesLeft: 0 }
};

// --- 2. MQTT BAĞLANTISI (dormos_v2 İzolasyonu) ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-MultiUser-Room104-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;

function initMultiUserMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initMultiUserMQTT, 3000);
  };

  mqttClient.onMessageArrived = (message) => {
    const topic = message.destinationName;
    const payload = message.payloadString;
    console.log(`[MULTI-USER MQTT] ${topic} -> ${payload}`);

    // Dışarıdan veya İdareden Arama Geldi (Oturum Açık Olmasa Bile Çalar)
    if (topic === "dormos_v2/room104/incoming_call") {
      simulateIncomingCall(payload || "Yurt Danışma");
    }

    // Kuryeden Hedef Öğrenciye Özel Kargo Geldi
    else if (topic === "dormos_v2/room104/kargo/target") {
      try {
        const kData = JSON.parse(payload);
        const list = currentCapacity === 5 ? residentsData5 : residentsData3;
        const targetStudent = list.find(r => r.name.toLowerCase().includes(kData.studentName.toLowerCase()) || r.bed == kData.bed);
        if (targetStudent) {
          targetStudent.kargo = { slot: kData.slot, pin: kData.pin };
          renderResidentsGrid();
          if (activeResident && activeResident.id === targetStudent.id) {
            updatePersonalKargoView(targetStudent.kargo);
          }
        }
      } catch (e) {}
    }

    // Eczaneden Stok Yanıtı Geldi
    else if (topic === "dormos_v2/pharmacy/response/room104") {
      const respBox = document.getElementById("pharmacy-response-box");
      if (respBox) {
        respBox.innerHTML = `<strong>🟢 Eczane Yanıtı:</strong> ${payload}`;
      }
    }
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [MULTI-USER] Oda İstasyonu Buluta Bağlandı!");
      mqttClient.subscribe("dormos_v2/room104/incoming_call");
      mqttClient.subscribe("dormos_v2/room104/kargo/target");
      mqttClient.subscribe("dormos_v2/pharmacy/response/room104");
    }
  });
}

function publishMulti(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
  }
}

// --- 3. ODA KAPASİTESİ (3 veya 5 Kişilik) ---
function setRoomCapacity(cap) {
  currentCapacity = cap;
  document.getElementById("btn-cap-3").className = cap === 3 ? "btn-cap active" : "btn-cap";
  document.getElementById("btn-cap-5").className = cap === 5 ? "btn-cap active" : "btn-cap";
  document.getElementById("room-subtitle").innerText = `${cap} Kişilik Standart KYK Odası • 1. Kat`;
  renderResidentsGrid();
}

function renderResidentsGrid() {
  const container = document.getElementById("residents-grid");
  container.innerHTML = "";

  const list = currentCapacity === 5 ? residentsData5 : residentsData3;

  list.forEach(r => {
    const card = document.createElement("div");
    card.className = "resident-card";
    card.onclick = () => openOtpLogin(r);

    card.innerHTML = `
      ${r.kargo ? '<div class="kargo-notification-pip">📦</div>' : ''}
      <div class="res-avatar">${r.initials}</div>
      <span class="res-bed">Yatak ${r.bed}</span>
      <h4 class="res-name">${r.name}</h4>
      <span class="res-badge ${r.focusMode ? 'focus-active' : 'in-room'}">
        ${r.focusMode ? '📚 Odak Modu' : 'Odada'}
      </span>
    `;

    container.appendChild(card);
  });
}

// --- 4. OTP / PIN GİRİŞ SİSTEMİ ---
let pendingStudent = null;
let currentEnteredPin = "";

function openOtpLogin(student) {
  pendingStudent = student;
  currentEnteredPin = "";
  document.getElementById("pin-input").value = "";
  document.getElementById("otp-avatar").innerText = student.initials;
  document.getElementById("otp-user-title").innerText = `${student.name} (Yatak ${student.bed})`;
  document.getElementById("simulated-sms-badge").innerHTML = `📲 <em>${student.phone} Numarasına Gönderilen SMS Kodu: <strong>${student.pin}</strong></em>`;
  document.getElementById("otp-modal").classList.add("active");
}

function pressOtpDigit(digit) {
  if (currentEnteredPin.length < 4) {
    currentEnteredPin += digit;
    document.getElementById("pin-input").value = currentEnteredPin;

    if (currentEnteredPin.length === 4) {
      setTimeout(verifyPinAndLogin, 200);
    }
  }
}

function clearOtp() {
  currentEnteredPin = "";
  document.getElementById("pin-input").value = "";
}

function closeOtpModal() {
  document.getElementById("otp-modal").classList.remove("active");
  pendingStudent = null;
}

function verifyPinAndLogin() {
  if (pendingStudent && currentEnteredPin === pendingStudent.pin) {
    document.getElementById("otp-modal").classList.remove("active");
    openPersonalDashboard(pendingStudent);
  } else {
    alert("❌ Hatalı PIN veya SMS Kodu! Lütfen tekrar deneyin.");
    clearOtp();
  }
}

// --- 5. BİREYSEL PROFİL EKRANI ---
function openPersonalDashboard(student) {
  activeResident = student;

  document.getElementById("user-avatar").innerText = student.initials;
  document.getElementById("active-user-name").innerText = student.name;
  document.getElementById("active-user-bed").innerText = `Yatak ${student.bed} • Kişisel Özel Oturum`;

  updatePersonalKargoView(student.kargo);

  // Kütüphane / Odak Modu Durumu
  document.getElementById("chk-focus-mode").checked = student.focusMode;
  updateFocusModeUI(student.focusMode);

  // Nöbet çizelgesi
  document.getElementById("user-chore-text").innerText = student.chore;
  renderChoreTeamList(student.id);

  // Ekranları değiştir
  document.getElementById("screen-standby").classList.remove("active");
  document.getElementById("screen-personal").classList.add("active");

  startSessionTimer();
}

function updatePersonalKargoView(kargo) {
  const box = document.getElementById("personal-kargo-box");
  if (kargo) {
    box.innerHTML = `
      <div class="kargo-icon-large">🎁</div>
      <div>
        <h4>1 Adet Bekleyen Paketiniz Var</h4>
        <p>Lobi Kargo Dolabı: <strong>${kargo.slot}</strong></p>
        <p class="pin-display">Açma Şifreniz: <strong>${kargo.pin}</strong></p>
        <small class="pin-warning">⚠️ Bu şifre sadece sizin telefonunuza ve profilinize gönderilmiştir.</small>
      </div>
    `;
  } else {
    box.innerHTML = `
      <div class="kargo-icon-large">📭</div>
      <div>
        <h4>Bekleyen Kargonuz Yok</h4>
        <p>Gelen paketleriniz olduğunda doğrudan buraya ve telefonunuza PIN düşecektir.</p>
      </div>
    `;
  }
}

function renderChoreTeamList(activeId) {
  const list = currentCapacity === 5 ? residentsData5 : residentsData3;
  const choreContainer = document.getElementById("chore-team-list");
  choreContainer.innerHTML = "";

  list.forEach(r => {
    if (r.id !== activeId) {
      const li = document.createElement("li");
      li.innerHTML = `<span>Yatak ${r.bed} (${r.name}):</span> <strong>${r.chore}</strong>`;
      choreContainer.appendChild(li);
    }
  });
}

function startSessionTimer() {
  if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);
  sessionTimeLeft = 60;
  document.getElementById("session-countdown").innerText = `${sessionTimeLeft}s`;

  sessionCountdownInterval = setInterval(() => {
    sessionTimeLeft--;
    document.getElementById("session-countdown").innerText = `${sessionTimeLeft}s`;

    if (sessionTimeLeft <= 0) {
      clearInterval(sessionCountdownInterval);
      logoutSession();
    }
  }, 1000);
}

function logoutSession() {
  if (sessionCountdownInterval) clearInterval(sessionCountdownInterval);
  activeResident = null;
  document.getElementById("screen-personal").classList.remove("active");
  document.getElementById("screen-standby").classList.add("active");
}

// Bireysel Işık Kontrolü
function toggleBedLight(state) {
  if (activeResident) {
    console.log(`[BÖLGESEL IŞIK] Yatak ${activeResident.bed} (${activeResident.name}) Işığı: ${state ? 'AÇIK' : 'KAPALI'}`);
    publishMulti(`dormos_v2/room104/bed_${activeResident.bed}/light`, state ? "1" : "0");
  }
}

// 📚 Kütüphane / Odak Modu
function toggleFocusMode(state) {
  if (!activeResident) return;
  activeResident.focusMode = state;
  updateFocusModeUI(state);
  renderResidentsGrid();

  if (state) {
    // Masa ışığını otomatik aç
    document.getElementById("chk-desk-light").checked = true;
    publishMulti(`dormos_v2/room104/bed_${activeResident.bed}/focus`, "ACTIVE");
  } else {
    publishMulti(`dormos_v2/room104/bed_${activeResident.bed}/focus`, "INACTIVE");
  }
}

function updateFocusModeUI(isActive) {
  const badge = document.getElementById("focus-mode-badge");
  const hint = document.getElementById("focus-hint-text");
  if (isActive) {
    badge.innerText = "📚 Odak Modu (Sessiz)";
    badge.className = "badge blue";
    hint.innerText = "🔇 Bildirimler sessize alındı. Çalışma masası 4000K doğal beyaz ışığa ayarlandı.";
  } else {
    badge.innerText = "Normal Mod";
    badge.className = "badge green";
    hint.innerText = "🌱 Odak modu açıldığında bildirimler sessize alınır ve masa ışığı 4000K beyaz çalışma ışığına geçer.";
  }
}

// 🧺 Akıllı Çamaşırhane Rezervasyonu
function reserveLaundryMachine(machNum) {
  if (!activeResident) return;

  const machKey = `mach${machNum}`;
  laundryReservations[machKey] = {
    isReserved: true,
    by: activeResident.name,
    minutesLeft: 45
  };

  document.getElementById(`mach-${machNum}-box`).className = "machine-box busy";
  document.getElementById(`mach-${machNum}-status`).innerText = `Rezerve: ${activeResident.name} (45 dk)`;
  document.getElementById(`btn-reserve-${machNum}`).style.display = "none";

  // Özet barını güncelle
  updateLaundrySummaryBadge();

  alert(`🧺 Makine #${machNum}, ${activeResident.name} adına 45 dakikalığına rezerve edildi!\nÇamaşırınız bittiğinde telefonunuza bildirim gelecektir.`);
}

function updateLaundrySummaryBadge() {
  let freeCount = 0;
  if (!laundryReservations.mach3.isReserved) freeCount++;
  if (!laundryReservations.mach4.isReserved) freeCount++;

  const summary = document.getElementById("laundry-summary");
  if (summary) {
    summary.innerText = freeCount > 0 ? `${freeCount} Boş Makine` : "Tüm Makineler Dolu";
    summary.className = freeCount > 0 ? "text-blue" : "text-orange";
  }
}

// 🚖 Akıllı Taksi Çağırma & Dinamik QR Eşleşmesi
function summonSmartTaxi() {
  if (!activeResident) return;

  const pickupPoint = document.getElementById("pickup-location").value;
  const matchPin = String(Math.floor(1000 + Math.random() * 9000));
  const plateNum = "34 TKS " + Math.floor(10 + Math.random() * 89);

  document.getElementById("taxi-pickup-info").innerText = `Alış Noktası: ${pickupPoint} (${activeResident.name} İçin)`;
  document.getElementById("taxi-match-pin").innerText = `PIN: ${matchPin}`;
  document.getElementById("taxi-plate").innerText = `${plateNum} (Sarı Ticari)`;

  document.getElementById("taxi-modal").classList.add("active");

  publishMulti("dormos_v2/taxi/orders", JSON.stringify({
    room: "104",
    student: activeResident.name,
    pickup: pickupPoint,
    pin: matchPin,
    plate: plateNum,
    time: new Date().toLocaleTimeString("tr-TR")
  }));
}

function closeTaxiModal() {
  document.getElementById("taxi-modal").classList.remove("active");
}

// Eczane İlaç Sorgulama
function askPharmacyStock() {
  const queryInput = document.getElementById("input-med-query");
  const text = queryInput.value.trim();
  if (!text) return;

  const respBox = document.getElementById("pharmacy-response-box");
  respBox.innerHTML = `<em>"${text}" için eczane stok sorgusu iletildi, bekleniyor...</em>`;

  publishMulti("dormos_v2/pharmacy/queries", JSON.stringify({
    room: "104",
    bed: activeResident ? activeResident.bed : 1,
    studentName: activeResident ? activeResident.name : "Öğrenci",
    query: text,
    time: new Date().toLocaleTimeString("tr-TR")
  }));

  queryInput.value = "";
}

// Kantin Siparişi
function orderFoodForUser(foodName, price) {
  if (!activeResident) return;

  const feedback = document.getElementById("canteen-order-feedback");
  feedback.innerText = `✅ ${foodName} siparişiniz alındı! (${activeResident.name} adına mutfağa iletildi).`;

  publishMulti("dormos_v2/canteen/orders", JSON.stringify({
    room: "104",
    bed: activeResident.bed,
    studentName: activeResident.name,
    item: foodName,
    price: price,
    time: new Date().toLocaleTimeString("tr-TR")
  }));

  setTimeout(() => {
    feedback.innerText = "";
  }, 4000);
}

// --- 6. OTOBÜS / RİNG CANLI GERİ SAYIM MOTORU ---
let ringMinutes = 3;
let cityBusMinutes = 11;

function updateBusTimers() {
  ringMinutes--;
  cityBusMinutes--;

  if (ringMinutes <= 0) ringMinutes = 15;
  if (cityBusMinutes <= 0) cityBusMinutes = 20;

  const ringElem = document.getElementById("ring-time");
  const cityElem = document.getElementById("city-bus-time");

  if (ringElem) ringElem.innerText = ringMinutes === 1 ? "DURAKTA" : `${ringMinutes} dk`;
  if (cityElem) cityElem.innerText = `${cityBusMinutes} dk`;
}
setInterval(updateBusTimers, 60000); // Dakikada bir güncelle

// Gelen Arama & SOS
function simulateIncomingCall(callerName) {
  document.getElementById("call-caller-name").innerText = callerName;
  document.getElementById("incoming-call-modal").classList.add("active");
}

function answerCall() {
  alert("📞 Arama yanıtlandı! Mikrofon ve hoparlör iki yönlü aktif.");
  document.getElementById("incoming-call-modal").classList.remove("active");
}

function rejectCall() {
  document.getElementById("incoming-call-modal").classList.remove("active");
}

function triggerEmergencyBypass() {
  publishMulti("dormos_v2/room104/emergency", JSON.stringify({
    room: "104",
    type: "SOS_BYPASS",
    time: new Date().toLocaleTimeString("tr-TR")
  }));
  alert("🚨 112, Güvenlik ve Revire acil durum sinyali gönderildi!");
}

// Saat
setInterval(() => {
  document.getElementById("standby-clock").innerText = new Date().toLocaleTimeString("tr-TR");
}, 1000);

// Başlat
setRoomCapacity(5);
initMultiUserMQTT();
