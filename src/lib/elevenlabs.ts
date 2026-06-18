const API_URL = "https://api.elevenlabs.io/v1";

function apiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
  return key;
}

export async function synthesizeSpeech(text: string, voiceId: string): Promise<Buffer> {
  const res = await fetch(`${API_URL}/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey(),
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_monolingual_v1",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(`ElevenLabs error ${res.status}: ${msg}`);
  }

  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

export async function listVoices(): Promise<{ voice_id: string; name: string }[]> {
  const res = await fetch(`${API_URL}/voices`, {
    headers: { "xi-api-key": apiKey() },
  });
  if (!res.ok) throw new Error(`ElevenLabs voices error ${res.status}`);
  const data = await res.json();
  return data.voices ?? [];
}
