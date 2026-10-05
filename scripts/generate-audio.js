const fs = require("fs");
const path = require("path");

const VOICE_ID = "7mzPatjHwOs2bAMf0qIb";
const API_KEY = process.env.ELEVENLABS_API_KEY;
const LIMIT = Number(process.env.TTS_LIMIT || "10");

if (!API_KEY) {
  console.error("Missing ELEVENLABS_API_KEY");
  process.exit(1);
}

const names = JSON.parse(fs.readFileSync("names.json", "utf8"));
const audioDir = path.join(process.cwd(), "audio");
fs.mkdirSync(audioDir, { recursive: true });

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generate(name) {
  const out = path.join(audioDir, `${name.id}.mp3`);
  if (fs.existsSync(out)) {
    console.log(`SKIP ${name.id}: audio already exists`);
    return false;
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: name.ar,
        model_id: "eleven_multilingual_v2"
      })
    }
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${name.id}: ElevenLabs ${response.status} ${detail}`);
  }

  fs.writeFileSync(out, Buffer.from(await response.arrayBuffer()));
  console.log(`CREATED ${name.id}.mp3 — ${name.ar}`);
  return true;
}

(async () => {
  let created = 0;
  for (const name of names) {
    if (!name?.id || !name?.ar) continue;
    if (created >= LIMIT) break;
    if (await generate(name)) {
      created++;
      await sleep(500);
    }
  }
  console.log(`Finished. Created ${created} new recording(s).`);
})().catch(err => {
  console.error(err);
  process.exit(1);
});
