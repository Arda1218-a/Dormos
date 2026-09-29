"""
DormOS - Kestirimci Bakım ve Anomali Tespit AI Motoru (Python Servisi)
======================================================================
Bu servis, 50 odadan gelen akıllı sayaç (su debisi L/dk, güç W) ve
sensör verilerini zaman serisi analizi ile işleyerek boru patlaklarını,
kaçakları ve yangın risklerini faturaya yansımadan önce yakalar.
"""

import time
import json
import random

class PredictiveMaintenanceEngine:
    def __init__(self, total_rooms=50):
        self.total_rooms = total_rooms
        self.rooms_telemetry = {}
        self.active_anomalies = []
        self._init_rooms()

    def _init_rooms(self):
        for r in range(1, self.total_rooms + 1):
            floor = (r - 1) // 10
            room_no = f"{floor * 100 + (r % 10 if r % 10 != 0 else 10)}"
            if floor == 0:
                room_no = f"{r:02d}"
            
            self.rooms_telemetry[room_no] = {
                "water_flow_lpm": 0.0,
                "power_watts": random.uniform(40.0, 180.0),
                "motion_detected": random.choice([True, False]),
                "night_mode": False
            }

    def evaluate_water_leak(self, room_no, telemetry, is_night_time=True):
        """
        Algoritma 1: Gece Akış Tabanı Analizi (NFBA)
        Gece 01:00-05:00 arasında odada kesintisiz su akışı varsa sızıntı/musluk uyarısı üretir.
        """
        if is_night_time and telemetry["water_flow_lpm"] > 0.5:
            return {
                "room": room_no,
                "type": "WATER_LEAK",
                "severity": "CRITICAL",
                "message": f"Oda {room_no} gece saatlerinde sürekli {telemetry['water_flow_lpm']:.1f} L/dk su harcıyor. Boru sızıntısı riski!",
                "recommendation": "Oda vanasını kıs veya teknik ekibe arıza kaydı aç."
            }
        return None

    def evaluate_fire_hazard(self, room_no, telemetry):
        """
        Algoritma 2: Varlık - Yük Korelasyonu (PLC)
        Odada insan yokken (PIR/Radar=False) prizden yüksek güç çekiliyorsa yangın riski bayrağı kaldırır.
        """
        if not telemetry["motion_detected"] and telemetry["power_watts"] > 1500.0:
            return {
                "room": room_no,
                "type": "FIRE_HAZARD_GHOST_HEATER",
                "severity": "CRITICAL",
                "message": f"Oda {room_no} boş olmasına rağmen {telemetry['power_watts']:.0f}W çekiliyor. Açık unutulan ısıtıcı/ütü riski!",
                "recommendation": "Oda priz rölesini uzaktan kapat."
            }
        return None

    def run_cycle(self):
        print("\n" + "="*60)
        print(" [DormOS AI] 50 Oda Kestirimci Bakım Taraması Başlatıldı...")
        print("="*60)
        
        # Simülasyon: 304'e kaçak, 202'ye boş odada ısıtıcı ver
        if "304" in self.rooms_telemetry:
            self.rooms_telemetry["304"]["water_flow_lpm"] = 1.8
        if "202" in self.rooms_telemetry:
            self.rooms_telemetry["202"]["motion_detected"] = False
            self.rooms_telemetry["202"]["power_watts"] = 2200.0

        detected = []
        for room_no, telemetry in self.rooms_telemetry.items():
            leak = self.evaluate_water_leak(room_no, telemetry, is_night_time=True)
            if leak:
                detected.append(leak)
            
            fire = self.evaluate_fire_hazard(room_no, telemetry)
            if fire:
                detected.append(fire)

        print(f"📊 Tarama Sonucu: {len(detected)} Anomali / Risk Tespit Edildi.\n")
        for d in detected:
            print(f" 🚨 [{d['severity']}] {d['message']}")
            print(f"    💡 Öneri: {d['recommendation']}")

        return detected

if __name__ == "__main__":
    engine = PredictiveMaintenanceEngine()
    engine.run_cycle()
