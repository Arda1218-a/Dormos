// ====================================================================
// DormOS NVIDIA NIM API Canlı Konfigürasyonu
// ====================================================================

const NVIDIA_CONFIG = {
  // 1. Zeka, Görme ve Karar Verme (NVIDIA NIM Llama-3.2)
  LLM_API_KEY: "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",
  LLM_MODEL: "meta/llama-3.2-11b-vision-instruct",
  LLM_ENDPOINT: "https://integrate.api.nvidia.com/v1/chat/completions",

  // 2. Ses Tanıma (ASR / Parakeet & Whisper)
  ASR_API_KEY: "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",

  // 3. Ses Üretme (TTS / FastPitch & HiFi-GAN)
  TTS_API_KEY: "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",

  // 4. Güvenlik & NeMo Guardrails
  GUARD_API_KEY: "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"
};
