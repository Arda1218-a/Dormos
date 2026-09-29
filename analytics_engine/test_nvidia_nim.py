"""
DormOS - NVIDIA NIM Canlı API Doğrulama Testi
======================================================
Bu script, build.nvidia.com üzerinden aldığınız resmi API anahtarlarını
doğrudan NVIDIA Cloud NIM Llama-3.1 modeline bağlayarak test eder.
"""

import urllib.request
import json

NVIDIA_API_KEY = "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"
NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions"
MODEL = "meta/llama-3.1-8b-instruct"

def test_nvidia_connection():
    print("="*60)
    print(" [NVIDIA BUILD] Llama-3.1 NIM Canlı Bağlantı Testi...")
    print("="*60)

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NVIDIA_API_KEY}"
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": "Sen DormOS Akıllı Yurt Asistanısın. Türkçe, zeki ve kısa yanıt ver."
            },
            {
                "role": "user",
                "content": "DormOS, oda sıcaklığı 24 derece, bana sınav için motivasyon ver ve ışığı aç."
            }
        ],
        "temperature": 0.5,
        "max_tokens": 150
    }

    req = urllib.request.Request(
        NVIDIA_ENDPOINT,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            ai_reply = res_json['choices'][0]['message']['content']
            
            print("\n✅ [BAŞARILI] NVIDIA NIM Bulut Yanıtı Alındı:")
            print("-" * 50)
            print(ai_reply)
            print("-" * 50)
            print("\n🎉 Tebrikler! NVIDIA API anahtarınız %100 çalışıyor ve DormOS sisteminize bağlandı.")

    except urllib.error.HTTPError as e:
        print(f"\n❌ [HATA] NVIDIA API HTTP Hatası: {e.code} - {e.reason}")
        print(e.read().decode('utf-8'))
    except Exception as e:
        print(f"\n❌ [HATA] Bağlantı Hatası: {str(e)}")

if __name__ == "__main__":
    test_nvidia_connection()
