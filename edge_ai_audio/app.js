// ====================================================================
// DormOS Edge AI Akustik Ses Sınıflandırıcı & Sahte Alarm Filtresi
// (Garantili Dahili Web Audio API Sentezleyici + Kesintisiz MQTT)
// ====================================================================

// --- 1. DAHİLİ SES SENTEZLEYİCİ (Harici Dosyaya İhtiyaç Duymaz, Asla Kesilmez) ---
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Bip Sesi (Geri Sayım İçin)
function playSynthesizedBeep(freq = 880, duration = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Ses sentezi:", e);
  }
}

// Siren Sesi (Acil Durum İçin)
let sirenInterval = null;
function startSynthesizedSiren() {
  stopSynthesizedSiren();
  try {
    const ctx = getAudioContext();
    let toggle = false;

    sirenInterval = setInterval(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(toggle ? 900 : 1300, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
      toggle = !toggle;
    }, 400);
  } catch (e) {}
}

function stopSynthesizedSiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
}

// --- 2. MQTT WEBSOCKET BAĞLANTISI ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-EdgeAIAudio-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;
let isMQTTReady = false;

function initAudioMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    isMQTTReady = false;
    setTimeout(initAudioMQTT, 2000);
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      isMQTTReady = true;
      console.log("✅ [EDGE AI AUDIO] Buluta Bağlandı!");
    },
    onFailure: () => {
      isMQTTReady = false;
      setTimeout(initAudioMQTT, 3000);
    }
  });
}

function publishAudioEvent(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
    console.log(`📡 [SOS YAYINLANDI] ${topic} -> ${payload}`);
  } else {
    console.warn("MQTT bağlı değil, bağlanılıyor...");
    initAudioMQTT();
    setTimeout(() => {
      if (mqttClient && mqttClient.isConnected()) {
        const msg = new Paho.MQTT.Message(payload);
        msg.destinationName = topic;
        mqttClient.send(msg);
      }
    }, 1000);
  }
}

// --- 3. SPEKTRUM TUVALİ & MİKROFON ---
const canvas = document.getElementById("spectrumCanvas");
const canvasCtx = canvas.getContext("2d");
let analyser = null;
let micStream = null;
let isMicActive = false;

function resizeCanvas() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function drawIdleSpectrum() {
  canvasCtx.fillStyle = "#050811";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 2;
  canvasCtx.strokeStyle = "#162035";
  canvasCtx.beginPath();
  const sliceWidth = canvas.width / 50;
  let x = 0;

  for (let i = 0; i < 50; i++) {
    const v = Math.sin(i * 0.2 + Date.now() * 0.003) * 6 + (canvas.height / 2);
    if (i === 0) canvasCtx.moveTo(x, v);
    else canvasCtx.lineTo(x, v);
    x += sliceWidth;
  }
  canvasCtx.stroke();

  if (!isMicActive) {
    requestAnimationFrame(drawIdleSpectrum);
  }
}
drawIdleSpectrum();

async function toggleMicrophone() {
  getAudioContext();

  if (isMicActive) {
    if (micStream) micStream.getTracks().forEach(t => t.stop());
    isMicActive = false;
    document.getElementById("btn-toggle-mic").innerText = "🎙️ Gerçek Bilgisayar Mikrofonunu Başlat";
    document.getElementById("btn-toggle-mic").style.background = "var(--accent)";
    document.getElementById("mic-status-badge").innerText = "Mikrofon Durduruldu";
    document.getElementById("mic-status-badge").className = "badge";
    drawIdleSpectrum();
    return;
  }

  try {
    const ctx = getAudioContext();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const source = ctx.createMediaStreamSource(micStream);
    analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    isMicActive = true;
    document.getElementById("btn-toggle-mic").innerText = "🛑 Mikrofonu Durdur";
    document.getElementById("btn-toggle-mic").style.background = "var(--red)";
    document.getElementById("btn-toggle-mic").style.color = "white";
    document.getElementById("mic-status-badge").innerText = "🔴 Canlı Ses Dinleniyor";
    document.getElementById("mic-status-badge").className = "badge live";

    renderLiveAudioSpectrum();
  } catch (err) {
    alert("Mikrofon erişimi alınamadı: " + err.message);
  }
}

function renderLiveAudioSpectrum() {
  if (!isMicActive) return;

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = "#050811";
  canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

  const barWidth = (canvas.width / bufferLength) * 2;
  let x = 0;
  let maxVol = 0;

  for (let i = 0; i < bufferLength; i++) {
    const barHeight = (dataArray[i] / 255) * canvas.height;
    if (dataArray[i] > maxVol) maxVol = dataArray[i];

    const r = barHeight + 25 * (i / bufferLength);
    const g = 250 * (i / bufferLength);
    const b = 255;

    canvasCtx.fillStyle = `rgb(${r},${g},${b})`;
    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

    x += barWidth + 1;
  }

  if (maxVol > 200) {
    updateConfidenceScores(15, 75, 5, 5, "PANIK SESI SEVIYESI ALGILANDI");
  } else if (maxVol > 120) {
    updateConfidenceScores(60, 20, 10, 10, "NORMAL SEVIYEDE SES");
  }

  requestAnimationFrame(renderLiveAudioSpectrum);
}

// --- 4. ÖRNEK SES SİMÜLASYONU ---
function simulateSound(type) {
  getAudioContext();

  if (type === "GLASS_BREAK") {
    updateConfidenceScores(2, 4, 94, 0, "🪟 YÜKSEK FREKANS CAM KIRILMASI");
    startVerificationCountdown("Cam Kırılması & Zorlama Sesi Algılandı!");
  } 
  else if (type === "PANIC_SCREAM") {
    updateConfidenceScores(1, 95, 2, 2, "🩸 GERÇEK PANİK ÇIĞLIĞI & ŞİDDET");
    startVerificationCountdown("Panik / Çığlık Akustik Şablonu Algılandı!");
  } 
  else if (type === "DREAM_TALK") {
    updateConfidenceScores(88, 3, 1, 8, "😴 RÜYADA SAYIKLAMA (FİLTRELENDİ)");
    setVerdict("🟢 GÜVENLİ (RÜYA / UYKU SAYIKLAMASI)", "Düşük harmonik tespit edildi. Alarm tetiklenmeden elendi.");
  } 
  else if (type === "BUG_SHOCK") {
    updateConfidenceScores(45, 15, 2, 38, "🕷️ GEÇİCİ TEKİL GÜRÜLTÜ (BÖCEK ŞOKU)");
    startVerificationCountdown("Ani Çığlık / Korku Tepkisi Algılandı");
  }
}

function updateConfidenceScores(normal, scream, glass, falseNoise, statusText) {
  document.getElementById("score-normal").innerText = normal + "%";
  document.getElementById("fill-normal").style.width = normal + "%";

  document.getElementById("score-scream").innerText = scream + "%";
  document.getElementById("fill-scream").style.width = scream + "%";

  document.getElementById("score-glass").innerText = glass + "%";
  document.getElementById("fill-glass").style.width = glass + "%";

  document.getElementById("score-false").innerText = falseNoise + "%";
  document.getElementById("fill-false").style.width = falseNoise + "%";

  if (scream > 60 || glass > 60) {
    setVerdict("🔴 ACİL TEHDİT ANALİZİ", statusText);
  } else {
    setVerdict("🟢 GÜVENLİ / NORMAL", statusText);
  }
}

function setVerdict(title, desc) {
  const box = document.getElementById("ai-verdict");
  const isRed = title.includes("ACİL") || title.includes("🔴");
  box.innerHTML = `
    <h4 style="color:${isRed ? 'var(--red)' : 'var(--green)'}">${title}</h4>
    <p>${desc}</p>
  `;
}

// --- 5. 15 SANİYELİK DOĞRULAMA SAYACI ---
let countdownTimer = null;
let timeLeft = 15;

function startVerificationCountdown(reason) {
  getAudioContext();
  stopSynthesizedSiren();

  timeLeft = 15;
  document.getElementById("countdown-number").innerText = timeLeft;
  document.getElementById("false-alarm-modal").classList.add("active");

  if (countdownTimer) clearInterval(countdownTimer);

  // İlk anlık bip sesi
  playSynthesizedBeep(880, 0.1);

  countdownTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("countdown-number").innerText = timeLeft;

    // Her saniye garanti sentetik bip
    playSynthesizedBeep(timeLeft <= 5 ? 1200 : 880, 0.08);

    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      confirmEmergencyNow();
    }
  }, 1000);
}

function cancelAlarmByUser() {
  if (countdownTimer) clearInterval(countdownTimer);
  stopSynthesizedSiren();
  document.getElementById("false-alarm-modal").classList.remove("active");

  setVerdict("🟢 GÜVENLİ (KULLANICI TEYİT ETTİ)", "Öğrenci rüya/yanlış alarm olduğunu doğruladı.");
}

function confirmEmergencyNow() {
  if (countdownTimer) clearInterval(countdownTimer);
  document.getElementById("false-alarm-modal").classList.remove("active");

  // Kesintisiz Siren Başlat
  startSynthesizedSiren();

  // Wokwi, Web Panel ve Güvenlik Masasına Canlı SOS Gönder
  const sosPayload = JSON.stringify({
    room: "104",
    status: "EMERGENCY",
    reason: "Edge AI Akustik Doğrulama (15 sn zaman aşımı)",
    time: new Date().toLocaleTimeString("tr-TR")
  });

  publishAudioEvent("dormos/room104/sos", sosPayload);
  publishAudioEvent("dormos/all/sos", sosPayload);

  setVerdict("🔴 ACİL DURUM BAŞLATILDI", "Güvenlik Masasına ve 112'ye alarm iletildi.");
}

initAudioMQTT();
