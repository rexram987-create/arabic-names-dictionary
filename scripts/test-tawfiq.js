const fs = require("fs");

const VOICE_ID = "7mzPatjHwOs2bAMf0qIb";
const API_KEY = process.env.ELEVENLABS_API_KEY;
if (!API_KEY) process.exit(1);

(async () => {
  // Phonetic spelling: final qaaf gets a short vowel so ElevenLabs does not swallow it.
  const text = "تَوْفِيق.";
  // A full stop gives the final qaaf a hard word boundary without adding a vowel.
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({ text, model_id: "eleven_multilingual_v2" })
    }
  );
  if (!response.ok) throw new Error(await response.text());
  fs.writeFileSync("audio/tawfiq-test3.mp3", Buffer.from(await response.arrayBuffer()));
  console.log("Created Tawfiq pronunciation test 3:", text);
})().catch(e => { console.error(e); process.exit(1); });
