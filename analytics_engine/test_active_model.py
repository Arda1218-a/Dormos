import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

NVIDIA_API_KEY = "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"
endpoint = "https://integrate.api.nvidia.com/v1/chat/completions"

models = [
    "nv-mistralai/mistral-nemo-12b-instruct",
    "mistralai/mistral-7b-instruct-v0.3",
    "google/gemma-3-12b-it",
    "meta/llama-3.2-11b-vision-instruct",
    "ibm/granite-3.0-8b-instruct"
]

for model in models:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NVIDIA_API_KEY}"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "Sen DormOS Akıllı Yurt Asistanısın. Türkçe, zeki ve kısa cevap ver."},
            {"role": "user", "content": "Oda sıcaklığı 24 derece, bana sınav için motivasyon ver."}
        ],
        "max_tokens": 100
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_json = json.loads(response.read().decode('utf-8'))
            print(f"🎉 [TAM ÇALIŞIYOR]: {model}")
            print("Yanıt:", res_json['choices'][0]['message']['content'])
            print("="*60)
            break
    except Exception as e:
        print(f"Hata ({model}):", str(e))
