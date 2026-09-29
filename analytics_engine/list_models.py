import urllib.request
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

NVIDIA_API_KEY = "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"

req = urllib.request.Request(
    "https://integrate.api.nvidia.com/v1/models",
    headers={"Authorization": f"Bearer {NVIDIA_API_KEY}"}
)

try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("Mevcut NVIDIA NIM Modelleri:")
        for m in data.get('data', []):
            print(f"- {m['id']}")
except Exception as e:
    print("Hata:", str(e))
