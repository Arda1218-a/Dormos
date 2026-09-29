// ====================================================================
// DormOS Faz 3: Çökmez Ağ (Fail-Safe Mesh) Topolojisi & Simülatörü
// ====================================================================

const canvas = document.getElementById("topologyCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = canvas.parentElement.clientHeight;
}
window.addEventListener("resize", resize);
resize();

// Ağ Düğümleri (Nodes) - 5 Kat
const nodes = [
  { id: "404", label: "Oda 404", floor: 4, x: 120, y: 50, color: "#38bdf8" },
  { id: "402", label: "Oda 402", floor: 4, x: 280, y: 50, color: "#38bdf8" },
  
  { id: "304", label: "Oda 304", floor: 3, x: 120, y: 105, color: "#38bdf8" },
  { id: "302", label: "Oda 302", floor: 3, x: 280, y: 105, color: "#38bdf8" },
  
  { id: "204", label: "Oda 204", floor: 2, x: 120, y: 160, color: "#38bdf8" },
  { id: "202", label: "Oda 202", floor: 2, x: 280, y: 160, color: "#38bdf8" },
  
  { id: "104", label: "Oda 104 (Wokwi)", floor: 1, x: 120, y: 215, color: "#22c55e" },
  { id: "102", label: "Oda 102", floor: 1, x: 280, y: 215, color: "#38bdf8" },
  
  { id: "GW", label: "Lobi Ana Gateway", floor: 0, x: 200, y: 260, color: "#eab308" }
];

let isCableCut = false;
let activePackets = [];

// Çizim Döngüsü
function drawTopology() {
  ctx.fillStyle = "#060a16";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 1. Hatları Çiz
  if (!isCableCut) {
    // Normal PoE Kablolu Hatlar (Yeşil)
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
    nodes.forEach(n => {
      if (n.id !== "GW") {
        ctx.beginPath();
        ctx.moveTo(n.x, n.y);
        ctx.lineTo(200, 260); // Gateway'e doğrudan kablo
        ctx.stroke();
      }
    });
  } else {
    // Kesinti Durumu: Kablosuz Mesh Atlama Hatları (Turuncu/Mor Kesikli)
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "rgba(249, 115, 22, 0.6)";

    // Dikey ve yatay komşuluk mesh bağları
    ctx.beginPath();
    ctx.moveTo(120, 50); ctx.lineTo(120, 105); // 404 -> 304
    ctx.moveTo(120, 105); ctx.lineTo(120, 160); // 304 -> 204
    ctx.moveTo(120, 160); ctx.lineTo(120, 215); // 204 -> 104
    ctx.moveTo(120, 215); ctx.lineTo(200, 260); // 104 -> GW
    ctx.moveTo(280, 50); ctx.lineTo(280, 105);
    ctx.moveTo(280, 105); ctx.lineTo(280, 160);
    ctx.moveTo(280, 160); ctx.lineTo(280, 215);
    ctx.moveTo(280, 215); ctx.lineTo(200, 260);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 2. Düğümleri Çiz
  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n.x, n.y, n.id === "GW" ? 10 : 7, 0, Math.PI * 2);
    ctx.fillStyle = isCableCut ? "#f97316" : n.color;
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Etiket
    ctx.fillStyle = "#f8fafc";
    ctx.font = "10px Inter";
    ctx.fillText(n.label, n.x + 12, n.y + 3);
  });

  // 3. Hareket Eden Paketleri Çiz
  activePackets.forEach((p, idx) => {
    p.progress += 0.03;
    const curX = p.fromX + (p.toX - p.fromX) * p.progress;
    const curY = p.fromY + (p.toY - p.fromY) * p.progress;

    ctx.beginPath();
    ctx.arc(curX, curY, 5, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 10;
    ctx.shadowColor = p.color;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (p.progress >= 1.0) {
      activePackets.splice(idx, 1);
      if (p.onComplete) p.onComplete();
    }
  });

  requestAnimationFrame(drawTopology);
}
drawTopology();

// --- KESİNTİ SİMÜLASYONU KONTROLÜ ---
function toggleCableCut() {
  isCableCut = !isCableCut;

  const btn = document.getElementById("btn-cut-cable");
  const pill = document.getElementById("network-status-pill");
  const dot = document.getElementById("status-dot");
  const title = document.getElementById("network-mode-title");

  const l1 = document.getElementById("layer-1-card");
  const l2 = document.getElementById("layer-2-card");
  const l1b = document.getElementById("l1-badge");
  const l2b = document.getElementById("l2-badge");

  if (isCableCut) {
    btn.innerText = "🔌 Ana Kabloyu / İnterneti TEKRAR BAĞLA";
    btn.className = "btn-kill danger reconnect";

    dot.className = "dot orange";
    title.innerText = "YEDEK MOD: Thread/ESP-NOW Kablosuz Mesh Aktif";

    l1.className = "layer-card cut-off";
    l1b.innerText = "KOPUK (ÇEVRİMDIŞI)";
    
    l2.className = "layer-card fallback-active";
    l2b.innerText = "CANLI DEVREDE (< 85 ms)";

    addLog("danger", "🚨 KRİTİK: Ana PoE Ethernet omurgası koptu! İnternet kesildi.");
    addLog("warn", "⚡ Hata Toleransı: Sistem 85 ms içinde Thread 2.4GHz Mesh moduna geçti.");
    addLog("success", "🛡️ 50 Oda kablosuz yerel telsiz ağı ile birbirine bağlandı.");
  } else {
    btn.innerText = "✂️ Ana Ethernet Kablosunu / İnterneti KOPAR";
    btn.className = "btn-kill danger";

    dot.className = "dot green";
    title.innerText = "BİRİNCİL HAT: PoE Gigabit Ethernet (1000 Mbps)";

    l1.className = "layer-card active";
    l1b.innerText = "AKTİF & ÇEVRİMİÇİ";

    l2.className = "layer-card standby";
    l2b.innerText = "SICAK YEDEK (STANDBY)";

    addLog("info", "✅ Ana PoE omurgası onarıldı. 1000 Mbps yüksek hızlı bulut hattı devrede.");
  }
}

// --- MESH PAKET ATLAMA (HOPPING) TESTİ ---
function sendMeshEmergencyPacket() {
  const badge = document.getElementById("packet-status-badge");
  badge.innerText = "📡 Paket İletiliyor (4 Hop)...";
  badge.style.background = "rgba(168, 85, 247, 0.2)";
  badge.style.color = "#a855f7";

  addLog("hop", "🚀 [HOP 0] Oda 404 Acil Durum Sinyali Fırlattı (Hedef: Lobi)");

  // Hop 1: 404 -> 304
  animatePacket(120, 50, 120, 105, "#a855f7", () => {
    addLog("hop", "📡 [HOP 1] Paket Oda 304'e ulaştı ve sekerek aşağı aktarıldı.");

    // Hop 2: 304 -> 204
    animatePacket(120, 105, 120, 160, "#a855f7", () => {
      addLog("hop", "📡 [HOP 2] Paket Oda 204'e ulaştı ve sekerek aşağı aktarıldı.");

      // Hop 3: 204 -> 104
      animatePacket(120, 160, 120, 215, "#a855f7", () => {
        addLog("hop", "📡 [HOP 3] Paket Oda 104'e (Wokwi Düğümü) ulaştı.");

        // Hop 4: 104 -> Gateway
        animatePacket(120, 215, 200, 260, "#22c55e", () => {
          addLog("success", "🏆 [HOP 4 - BAŞARILI] Paket Lobi Ana Merkezine Sıfır Kayıpla Ulaştı!");
          badge.innerText = "✅ Paket Teslim Edildi";
          badge.style.background = "rgba(34, 197, 94, 0.2)";
          badge.style.color = "#22c55e";
        });
      });
    });
  });
}

function animatePacket(fromX, fromY, toX, toY, color, onComplete) {
  activePackets.push({
    fromX, fromY, toX, toY, color, progress: 0, onComplete
  });
}

function addLog(type, text) {
  const logs = document.getElementById("mesh-logs");
  const entry = document.createElement("div");
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="time">[${new Date().toLocaleTimeString('tr-TR')}]</span> <span>${text}</span>`;
  logs.prepend(entry);
}

function clearLogs() {
  document.getElementById("mesh-logs").innerHTML = "";
}
