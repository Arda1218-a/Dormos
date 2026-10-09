# 🏢 DormOS: Autonomous Smart Dormitory & High-Density Student Living Ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Hardware-ESP32%20%7C%20PoE%20%7C%20Sub--1GHz-orange)](wokwi/)
[![AI-Powered](https://img.shields.io/badge/Edge%20AI-NVIDIA%20NIM%20%7C%20TinyML%20%7C%20Riva-76b900.svg)](https://build.nvidia.com)
[![Architecture](https://img.shields.io/badge/Network-Thread%20%7C%20ESP--NOW%20Mesh-green)](failsafe_mesh/)

> **An end-to-end, fault-tolerant, privacy-first Internet of Things (IoT) and Edge AI operating ecosystem engineered specifically for high-density student residences and modern university dormitories.**

📄 **[Read the Full Technical Whitepaper & Dataset Blueprint (SYSTEM_WHITEPAPER_AND_DATASETS.md)](SYSTEM_WHITEPAPER_AND_DATASETS.md)**  
*(Comprehensive breakdown of Edge AI acoustic models, Google AudioSet ontology, fail-safe magnetic sliding doors, and empirical 1.95-year ROI payback economics).*

---

## 📢 Independent Authorship & Engineering Statement

> [!IMPORTANT]
> **Declaration of Independent Development:**  
> This project was conceived, architected, and engineered **entirely independently as a self-directed solo endeavor**, leveraging cutting-edge Generative AI as an engineering co-pilot and research partner.  
> 
> It was developed **100% outside of any formal university curriculum, academic lab, professorial guidance, or institutional funding**. Every systems engineering decision, edge-case mitigation (e.g., fail-safe mesh networks surviving physical line cuts, 15-second acoustic verification, multi-tenant room privacy partitions, and targeted courier locker routing), and financial unit-economic model represents genuine, independent technical passion, rigorous problem-solving, and relentless curiosity.

---

## 🌟 The Core Problem: Why Traditional "Smart Homes" Fail in Dormitories

Traditional smart home solutions (Apple HomeKit, Google Home, Tuya, standard relays) are built for single-family residences. When installed in high-density student residences (3 to 5 students per room, 50+ rooms per building), they fail catastrophically due to three critical vectors:

1. **The Shared-Privacy Dilemma:** 5 students sharing a single wall screen cannot have their private medical records, prescription adherence, confidential deliveries, and canteen balances exposed to roommates.
2. **Fragile Network Dependency:** If a maintenance worker cuts a central network cable or mice damage Ethernet lines, an entire floor loses fire detection, emergency SOS calling, and door control.
3. **Nuisance False Alarms:** Students shouting in nightmares, screaming at spiders, or dropping drinking glasses would trigger armed police or building-wide fire evacuations without human-in-the-loop verification.

**DormOS completely solves these challenges through a multi-tiered, fault-tolerant architecture.**

---

## 🏛️ System Architecture & Key Innovations

```
                                      +---------------------------------------------+
                                      |          CENTRAL CLOUD / CAMPUS LAN         |
                                      |   MQTT Broker (WSS 8884) • Admin Operations |
                                      +---------------------------------------------+
                                                             │
                                   ┌─────────────────────────┴─────────────────────────┐
                                   ▼                                                   ▼
            +─────────────────────────────────────────+     +─────────────────────────────────────────+
            |      PRIMARY LAYER: Gigabit PoE         |     |       NVIDIA EDGE AI SUITE              |
            | Ethernet 802.3af (Power + Data)         |     | NVIDIA NIM (Llama-3.2 Vision-Instruct)  |
            +─────────────────────────────────────────+     | NVIDIA Riva ASR/TTS Audio Engine        |
                                   │                        +─────────────────────────────────────────+
                   (If physical line is severed)
                                   ▼
            +─────────────────────────────────────────+
            |      SECONDARY LAYER: Standby Mesh      |
            | ESP-NOW & Thread Mesh (2.4 GHz)         |
            | Switch-over latency < 85 milliseconds   |
            +─────────────────────────────────────────+
                                   │
                    (Deep concrete penetration)
                                   ▼
            +─────────────────────────────────────────+
            |      TERTIARY LAYER: Long-Range RF      |
            | Sub-1GHz (868 MHz) Emergency Beacon     |
            +─────────────────────────────────────────+
```

---

### 1. 👥 Multi-User Shared Station Architecture (`dormos_multiuser/`)
* **Dual-Layer Operation:**
  * **24/7 Unlocked Background Safety:** mmWave occupancy radar, smoke/gas sensors, water leak detectors, and central RO clean-water stats run continuously without login. External intercom calls ring the room audibly, allowing any student to answer without authenticating.
  * **Zero-Knowledge Personal Personas:** Students select their individual bed card (Beds 1 through 5) and authenticate via a 4-digit PIN or Mobile SMS OTP. 
* **Zonal Environmental Control:** Each bed features independent dimmable reading lights and desk power outlets, preventing roommate sleep disruption.
* **Auto-Lock Security:** Sessions automatically terminate and lock after 60 seconds of inactivity to protect private messages and delivery credentials.

### 2. 🛡️ 3-Layer Fail-Safe Mesh Network (`failsafe_mesh/`)
* **Layer 1 (PoE Ethernet):** Primary high-bandwidth gigabit bus.
* **Layer 2 (Hot-Standby Mesh):** When physical lines are cut (e.g., rodent damage, drilling accidents), nodes switch in `< 85 ms` to an autonomous ESP-NOW / Thread 2.4 GHz self-healing mesh.
* **Layer 3 (Sub-1GHz 868 MHz RF):** High-penetration long-range fallback designed to punch through dense reinforced concrete and multi-story elevator shafts during total power blackouts.

### 3. 🎙️ Edge AI Acoustic Lab & 15-Second False-Alarm Filter (`edge_ai_audio/`)
* Runs real-time Web Audio API FFT Fast Fourier Transform spectrograms.
* **Edge TinyML Classification:** Differentiates between non-critical room noises (nightmares, loud gaming, laughter, insect fright) and genuine emergencies (glass shatters, structural impact, prolonged panic screams).
* **The 15-Second "I'm OK" Verification:** When an acoustic spike occurs, a local countdown activates with audible synthesized warning tones. If the student cancels it by pressing *"I'm OK"*, no emergency dispatch occurs. If unresponsive, it escalates to the Security Center immediately.

### 4. 🚪 Anti-Theft Sliding Smart Door & Fail-Safe Emergency Release
* **Anti-Crowbar Sliding Design:** Sliding door mechanism seated inside reinforced wall jambs, resisting forced pry-bar or kick-in attacks.
* **RFID/NFC Access:** Exterior tap-to-unlock via student keyfob or smartphone NFC.
* **Fail-Safe Life-Safety Override:** If an in-room medical emergency (fall detected by mmWave radar), fire alarm, or manual SOS triggers, the magnetic lock **instantly cuts power (Fail-Safe)**, releasing the sliding door automatically so medical teams and emergency responders enter without battery-ram delays.

### 5. 📦 Targeted Multi-Person Courier Kiosk (`smart_courier_v2/`)
* Couriers select the specific room (e.g., Room 104) and are presented with the individual resident list (e.g., *Ali Yılmaz - Bed 1*, *Mehmet Kaya - Bed 2*).
* Dropping a parcel into the smart locker generates an encrypted one-time PIN (OTP) routed **exclusively** to the target recipient's smartphone and private tablet profile. Roommates cannot view the code.

### 6. 💊 Pharmacy & 🍳 Canteen Operations Terminals
* **Infirmary & Pharmacy Station (`pharmacy_station/`):** Real-time medicine stock query terminal. Students can privately query *"Do you have Parol / Allergy medicine?"* and receive one-touch physician clearance. Controlled red-prescription drugs require biometric/PIN verification at the clinic counter.
* **Canteen Kitchen Station (`canteen_station/`):** Live order queue, portion management, and prioritization for sick students requesting hot medicinal chicken soup delivered to their door.

### 7. 🚌 Campus Transit HUD, Focus Mode & Smart Taxi QR Match
* **Transit HUD:** Real-time campus ring shuttles and municipal bus countdowns on the room standby screen.
* **Focus Mode:** One-touch study mode silencing all non-critical alerts and switching desk LEDs to 4000K neutral white while signaling roommates via an on-screen study badge.
* **Smart Taxi Calling:** Summons transport to campus gates with a **Dynamic SVG QR Code & 4-digit PIN** displayed on-screen, preventing passenger confusion at crowded gates.

### 8. 🧠 NVIDIA NIM & Riva AI Integration (`web_panel/nvidia_config.js`)
* Connected directly to NVIDIA's hosted inference microservices:
  * **Brain (LLM):** `meta/llama-3.2-11b-vision-instruct` via NVIDIA NIM Cloud.
  * **Voice (ASR/TTS):** NVIDIA Riva Parakeet & FastPitch speech synthesis.

---

## 📁 Repository Directory Structure

```text
├── README.md                                  # Master English project documentation
├── .gitignore                                 # Git exclusions
├── NVIDIA_NIM_ENTEGRASYON_REHBERI.md          # NVIDIA NIM configuration & Jetson specs
├── PORTFOLYO_VE_MIT_SUNUMU.md                 # Executive summary & 2-minute pitch script
├── PROJE_DOKUMANTASYONU_VE_YOL_HARITASI.md    # Master architecture roadmap
├── YURT_MIMARISI_VE_MALIYET_ANALIZI.md         # 50-room layout & $46,150 BOM budget
├── YAKINDA_YAPILACAKLAR_VE_GOREV_LISTESI.md   # Backlog & future engineering milestones
├── GUNCELLEME_VE_YOL_HARITASI.md              # v2.1 Future upgrade specifications
│
├── dormos_multiuser/                          # 👥 V2.0 MULTI-USER DORM ECOSYSTEM
│   ├── index.html                             # Master 4-in-1 Control Console & Launcher
│   ├── README_MULTIUSER.md                    # Multi-user privacy & zoning specifications
│   ├── room_station/                          # In-Room 3 & 5 Person Shared Tablet Panel
│   ├── smart_courier_v2/                      # Multi-Resident Targeted Delivery Kiosk
│   ├── pharmacy_station/                      # Infirmary & Medicine Inventory Hub
│   └── canteen_station/                      # Kitchen POS & Stock Order Dispatcher
│
├── web_panel/                                 # 📱 10.1" iPad Student Tablet Interface (Single Room)
│   ├── index.html, style.css, app.js
│   └── nvidia_config.js                       # Active NVIDIA Cloud NIM API configuration
│
├── admin_panel/                               # 🚨 50-Room Security Operations Center (SOC)
│   └── index.html, style.css, app.js          # Floor-by-floor live room status, sirens & alarms
│
├── courier_terminal/                          # 📦 Lobby Smart Locker Courier Terminal (v1)
│
├── analytics_engine/                          # 📈 Predictive Maintenance & Telemetry Hub
│   ├── dashboard.html, app.js, detector.py    # Night water leak detection & arc fault algorithms
│
├── edge_ai_audio/                             # 🧠 Edge TinyML FFT Acoustic Spectrogram Lab
│   └── index.html, style.css, app.js          # 15s false-alarm verification & synthesized sirens
│
├── failsafe_mesh/                             # 🕸️ Autonomous Offline Mesh Simulation
│   └── index.html, style.css, app.js          # Interactive "Kill Cable" 4-hop packet router
│
└── wokwi/                                     # ⚡ Embedded ESP32 Circuit Simulation
    ├── diagram.json                           # Wiring: ESP32 + ILI9341 TFT + DHT22 + PIR + Relay
    ├── sketch.ino                             # C++ embedded source with WiFi & MQTT PubSubClient
    └── libraries.txt                          # ArduinoJson, Adafruit GFX, PubSubClient
```

---

## 💰 Unit Economics & Financial Viability (50-Room Dormitory)

*Strictly calculated at real hardware procurement prices (Exchange constraint: 1 USD = 48.10 TL):*

| Component / Subsystem | Unit Cost ($) | Total Quantity | Extended Cost ($) |
| :--- | :--- | :--- | :--- |
| ESP32-S3 PoE Controller + Sensor Rig | $42.00 | 50 Units | $2,100 |
| 10.1" Industrial In-Wall PoE Touchscreen | $145.00 | 50 Units | $7,250 |
| Smart Door Sliding Lock & RFID Reader | $85.00 | 50 Units | $4,250 |
| Central Server (NVIDIA Jetson Orin Nano + UPS) | $2,800.00 | 1 Unit | $2,800 |
| Centralized RO + UV Water Station (5 Floors, 2.5-ton tanks) | $12,500.00 | 1 System | $12,500 |
| Structured Cat6A PoE Cabling & Network Switches | $6,250.00 | 1 Building | $6,250 |
| Lobby Smart Locker (20 Compartments) | $4,800.00 | 1 Unit | $4,800 |
| Contingency, Installation & Calibration (15%) | — | — | $6,200 |
| **TOTAL INITIAL CAPITAL EXPENDITURE (CAPEX)** | — | — | **$46,150 USD (~2,219,815 TL)** |

> **Payback Period (ROI): 1.95 Years.**  
> Annual savings generated via automatic ghost-heater HVAC cutoffs ($14,200/yr), zero-plastic water bottle phaseout ($6,800/yr), and reduced night guard staff hours ($2,700/yr) total **$23,700/year**, amortizing the entire building upgrade in under 24 months.

---

## 🚀 Quick Start & Live Demonstration

You can run and test the complete DormOS ecosystem locally on any standard computer:

### 1. Launch the Multi-User Ecosystem (3 & 5 Person Rooms):
Open [`dormos_multiuser/index.html`](dormos_multiuser/index.html) in your browser and click **"🚀 Launch All 4 Terminals"** to start the interactive test across 4 synchronized tabs:
* **Tab 1:** Room Station (`dormos_multiuser/room_station/index.html`)
* **Tab 2:** Smart Courier Kiosk (`dormos_multiuser/smart_courier_v2/index.html`)
* **Tab 3:** Pharmacy Hub (`dormos_multiuser/pharmacy_station/index.html`)
* **Tab 4:** Canteen Kitchen (`dormos_multiuser/canteen_station/index.html`)

### 2. Run the Embedded Hardware Circuit:
1. Navigate to [Wokwi ESP32 Simulator](https://wokwi.com/projects/new/esp32).
2. Copy the contents of [`wokwi/diagram.json`](wokwi/diagram.json) into `diagram.json`.
3. Copy [`wokwi/sketch.ino`](wokwi/sketch.ino) into `sketch.ino`.
4. Add the libraries listed in [`wokwi/libraries.txt`](wokwi/libraries.txt).
5. Click **Play** to simulate real-time sensor publishing to `broker.hivemq.com` over MQTT.

---

## 📜 License & Intellectual Property

This project is licensed under the **MIT License** — feel free to inspect, fork, and build upon this architecture.
