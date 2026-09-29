import urllib.request
import json
import sys

# Windows terminal UTF-8 uyumlulugu
sys.stdout.reconfigure(encoding='utf-8')

NVIDIA_API_KEY = "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"

# Test edilecek modeller
models_to_test = [
    "meta/llama-3.1-70b-instruct",
    "meta/llama-3.1-8b-instruct",
    "meta/llama3-70b-instruct",
    "mistralai/mistral-large-2-instruct",
    "nvidia/nemotron-4-340b-instruct"
]

endpoint = "https://integrate.api.nvidia.com/v1/chat/completions"

for model in models_to_test:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {NVIDIA_API_KEY}"
    }

    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Merhaba, DormOS test."}
        ],
        "max_tokens": 50
    }

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            res_json = json.loads(res_body)
            print(f"[BASARILI] Model calisiyor: {model}")
            print("Yanit:", res_json['choices'][0]['message']['content'])
            break
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        print(f"[HATA] Model: {model} -> Kod: {e.code}, Mesaj: {err_msg}")
    except Exception as e:
        print(f"[HATA] {model} -> {str(e)}")
