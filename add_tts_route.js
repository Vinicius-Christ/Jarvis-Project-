import fs from 'fs';

let content = fs.readFileSync('server.ts', 'utf8');

const ttsRoute = `

// Speech-to-Text configuration is handled client-side via Web Speech API.
// TTS via ElevenLabs or OpenAI if keys are provided
app.post("/api/tts", async (req, res) => {
  const { text, voiceId, service } = req.body;
  if (!text) {
    return res.status(400).json({ error: "No text provided" });
  }

  const { ELEVENLABS_API_KEY, OPENAI_API_KEY } = process.env;

  try {
    if (ELEVENLABS_API_KEY && (service === "elevenlabs" || !service)) {
      // Setup ElevenLabs TTS
      // Default voice is Rachel (or user provided id)
      const voice = voiceId || "21m00Tcm4TlvDq8ikWAM"; 
      const response = await fetch(\`https://api.elevenlabs.io/v1/text-to-speech/\${voice}\`, {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "xi-api-key": ELEVENLABS_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            similarity_boost: 0.75,
            stability: 0.5
          }
        })
      });

      if (!response.ok) {
        throw new Error("ElevenLabs API error");
      }

      const buffer = await response.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      return res.send(Buffer.from(buffer));
      
    } else if (OPENAI_API_KEY && (service === "openai" || !service)) {
      // Setup OpenAI TTS
      const voice = voiceId || "alloy"; // alloy, echo, fable, onyx, nova, shimmer
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": \`Bearer \${OPENAI_API_KEY}\`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "tts-1",
          voice: voice,
          input: text
        })
      });

      if (!response.ok) {
        throw new Error("OpenAI API error");
      }

      const buffer = await response.arrayBuffer();
      res.set('Content-Type', 'audio/mpeg');
      return res.send(Buffer.from(buffer));
    }
    
    // No keys, return 404 so client knows to fallback to Web Speech
    return res.status(404).json({ error: "No TTS API keys configured" });

  } catch (error) {
    console.error("TTS Error:", error);
    return res.status(500).json({ error: "TTS generation failed" });
  }
});

app.post("/api/chat", async (req, res) => {`;

content = content.replace('app.post("/api/chat", async (req, res) => {', ttsRoute);

fs.writeFileSync('server.ts', content);
console.log("TTS Route added");
