// ====================================================================
// DormOS Kestirimci Bakım & Anomali Tespit AI Motoru (JavaScript)
// ====================================================================

// --- 1. MQTT WEBSOCKET BAĞLANTISI ---
const MQTT_BROKER = "broker.hivemq.com";
const MQTT_PORT = 8884;
const CLIENT_ID = "DormOS-AnalyticsEngine-" + Math.random().toString(16).substr(2, 8);

let mqttClient = null;

function initEngineMQTT() {
  mqttClient = new Paho.MQTT.Client(MQTT_BROKER, Number(MQTT_PORT), "/mqtt", CLIENT_ID);

  mqttClient.onConnectionLost = () => {
    setTimeout(initEngineMQTT, 3000);
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 5,
    onSuccess: () => {
      console.log("✅ [ANOMALİ MOTORU] Buluta Bağlandı!");
    }
  });
}

function publishAnomaly(topic, payload) {
  if (mqttClient && mqttClient.isConnected()) {
    const msg = new Paho.MQTT.Message(payload);
    msg.destinationName = topic;
    mqttClient.send(msg);
  }
}

// --- 2. SAAT GÜNCELLEMESİ ---
function updateClock() {
  const now = new Date();
  document.getElementById("engine-clock").innerText = now.toLocaleTimeString("tr-TR");
}
setInterval(updateClock, 1000);
updateClock();

// --- 3. CANLI GRAFİK (Chart.js) ---
const ctx = document.getElementById('liveChart').getContext('2d');
const maxDataPoints = 15;

const chartData = {
  labels: [],
  datasets: [
    {
      label: 'Şebeke Gücü (kW)',
      borderColor: '#eab308',
      backgroundColor: 'rgba(234, 179, 8, 0.1)',
      data: [],
      tension: 0.3,
      fill: true
    },
    {
      label: 'Su Tüketimi (L/dk)',
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.1)',
      data: [],
      tension: 0.3,
      fill: true
    }
  ]
};

const liveChart = new Chart(ctx, {
  type: 'line',
  data: chartData,
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { grid: { color: '#1e2c4a' }, ticks: { color: '#8b9bb4', font: { size: 10 } } },
      y: { grid: { color: '#1e2c4a' }, ticks: { color: '#8b9bb4', font: { size: 10 } } }
    },
    plugins: {
      legend: { display: false }
    }
  }
});

// Canlı Veri Akışı Simülasyonu
let basePower = 14.5;
let baseWater = 41.0;

function streamTelemetry() {
  const nowStr = new Date().toLocaleTimeString("tr-TR");
  
  // Normal hafif dalgalanmalar
  const currentPower = (basePower + (Math.random() * 1.5 - 0.75)).toFixed(1);
  const currentWater = (baseWater + (Math.random() * 2.0 - 1.0)).toFixed(1);

  document.getElementById("total-power").innerText = currentPower + " kW";
  document.getElementById("total-water").innerText = currentWater + " L/dk";

  chartData.labels.push(nowStr);
  chartData.datasets[0].data.push(currentPower);
  chartData.datasets[1].data.push(currentWater);

  if (chartData.labels.length > maxDataPoints) {
    chartData.labels.shift();
    chartData.datasets[0].data.shift();
    chartData.datasets[1].data.shift();
  }

  liveChart.update();
}
setInterval(streamTelemetry, 2000);

// --- 4. ANOMALİ LİSTESİ VE ALGORİTMA TETİKLEYİCİLERİ ---
let activeAnomalies = [];

function addAnomalyCard(anom) {
  activeAnomalies.unshift(anom);
  updateAnomalyUI();

  // İdare Paneline MQTT ile Bildirim İlet
  publishAnomaly("dormos/admin/anomalies", JSON.stringify(anom));
}

function updateAnomalyUI() {
  const list = document.getElementById("anomalies-list");
  list.innerHTML = "";

  document.getElementById("active-anomaly-count").innerText = `${activeAnomalies.length} Risk`;

  if (activeAnomalies.length === 0) {
    list.innerHTML = '<p class="empty-msg" style="color:var(--green);text-align:center;padding:20px 0;">🛡️ Tüm odalar ve şebeke stabil. Anomali yok.</p>';
    return;
  }

  activeAnomalies.forEach(a => {
    const div = document.createElement("div");
    div.className = `anomaly-item ${a.level === 'warning' ? 'warning' : ''}`;
    div.innerHTML = `
      <div class="anom-top">
        <h4>${a.title}</h4>
        <span class="time">${a.time}</span>
      </div>
      <p>${a.desc}</p>
      <div class="ai-recommendation">
        <strong>💡 AI Kararı:</strong> ${a.action}
      </div>
    `;
    list.appendChild(div);
  });
}

// 1. Gece Su Kaçağı Simülasyonu (NFBA Algoritması)
function simulateLeak() {
  const anom = {
    id: 'leak-' + Date.now(),
    room: '304',
    level: 'critical',
    title: '💧 Oda 304 - Gece Kesintisiz Su Kaçağı / Sızıntı!',
    desc: 'Oda 304 su sayacında gece 03:15\'ten beri sürekli 1.8 L/dk debi okunuyor. Musluk açık unutuldu veya boru patlağı riski var.',
    action: 'Oda paneline "Musluğunuz açık mı?" teyit bildirimi gönderildi. 5 dk içinde yanıt gelmezse vana motoru kısılacak.',
    time: new Date().toLocaleTimeString('tr-TR')
  };
  baseWater += 15.0; // Grafiğe anında fırlar
  addAnomalyCard(anom);
}

// 2. Boş Odada Isıtıcı Unutuldu (Yangın Önleme - PLC Algoritması)
function simulateGhostHeater() {
  const anom = {
    id: 'heater-' + Date.now(),
    room: '202',
    level: 'critical',
    title: '🔥 Oda 202 - Boş Odada Yüksek Güç (Yangın Riski)!',
    desc: 'PIR ve mmWave sensörlerine göre odada 45 dakikadır insan yok. Ancak prizden 2200W sürekli yük çekiliyor (Unutulan Elektrikli Isıtıcı / Ütü).',
    action: 'Güvenlik merkezine yangın riski bayrağı düşürüldü. Güç rölesini uzaktan kapatma yetkisi hazırlandı.',
    time: new Date().toLocaleTimeString('tr-TR')
  };
  basePower += 4.5; // Güç grafiğe fırlar
  addAnomalyCard(anom);
}

// 3. Ark Hatası / Ani Kısa Devre (Spektrum Analizi)
function simulateArcFault() {
  const anom = {
    id: 'arc-' + Date.now(),
    room: '104',
    level: 'warning',
    title: '⚡ Oda 104 - Priz Ark Hatası / Mikro Kısa Devre!',
    desc: 'Oda 104 akım dalga formunda mikro-saniyelik düzensiz kıvılcım arkları tespit edildi. Yan sanayi şarj aleti veya bozuk priz teması.',
    action: 'Oda 104 paneline "Prizinizi kontrol edin" uyarısı gönderildi.',
    time: new Date().toLocaleTimeString('tr-TR')
  };
  addAnomalyCard(anom);
}

function resetAnomalies() {
  activeAnomalies = [];
  basePower = 14.5;
  baseWater = 41.0;
  updateAnomalyUI();
}

// Başlangıçta 2 örnek anomali ile başlat
simulateLeak();
simulateGhostHeater();
initEngineMQTT();
