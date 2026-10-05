const VOICE_ID = "7mzPatjHwOs2bAMf0qIb";
const TEST_NAMES = {
  saeb: "صَائِب",
  khaled: "خَالِد",
  zaher: "زَاهِر",
  nizar: "نِزَار",
  riyad: "رِيَاض",
  yahya: "يَحْيَى",
  abdulaziz: "عَبْدُ الْعَزِيز"
};

module.exports = async (req, res) => {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) return res.status(500).json({ error: "ELEVENLABS_API_KEY is not configured" });

  const id = String(req.query.id || "");
  const text = TEST_NAMES[id];
  if (!text) return res.status(400).json({ error: "Unknown test name" });

  const response = await fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/" + VOICE_ID + "?output_format=mp3_44100_128",
    {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2"
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    return res.status(response.status).json({ error: "ElevenLabs request failed", detail });
  }

  const audio = Buffer.from(await response.arrayBuffer());
  res.setHeader("Content-Type", "audio/mpeg");
  res.setHeader("Cache-Control", "private, max-age=3600");
  return res.status(200).send(audio);
};