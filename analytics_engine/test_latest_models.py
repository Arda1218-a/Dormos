import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

NVIDIA_API_KEY = "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"

# 2026 Guncel NIM Modelleri
models_to_test = [
    "meta/llama-3.3-70b-instruct",
    "meta/llama-3.2-3b-instruct",
    "meta/llama-3.2-1b-instruct",
    "nvidia/llama-3.1-nemotron-70b-instruct",
    "mistralai/mistral-large-2407",
    "deepseek-ai/deepseek-r1",
    "qwen/qwen2.5-72b-instruct",
    "meta/llama-3.1-405b-instruct"
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
            {"role": "user", "content": "Merhaba DormOS!"}
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
            print(f"✅ [ÇALIŞIYOR - TAM İSİM]: {model}")
            print("NVIDIA Yanıtı:", res_json['choices'][0]['message']['content'])
            print("-" * 50)
    except urllib.error.HTTPError as e:
        print(f"❌ {model} -> Kod: {e.code}")
    except Exception as e:
        print(f"❌ {model} -> {str(e)}")
