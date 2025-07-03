import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { execPromise } from "./utils.js";
import { getSummaryAndTags } from "./lib/gemini.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json("✅ Server is working!");
});

app.post("/transcribe", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required." });

  console.log("📥 Received URL:", url);

  const filename = `audio_${Date.now()}`;
  const audioDir = path.resolve("audio");
  const audioPath = path.join(audioDir, `${filename}.mp3`);
  const txtPath = path.join(audioDir, `${filename}.txt`);
  const ytDlpPath = path.resolve("bin", "yt-dlp"); // ✅ Local yt-dlp binary

  try {
    // Ensure audio directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir);
    }

    // ✅ 1. Download audio using local yt-dlp
    console.log("🎧 Downloading audio...");
    await execPromise(`"${ytDlpPath}" --extract-audio --audio-format mp3 -o "${audioPath}" "${url}"`);

    // ✅ 2. Transcribe using whisper.cpp
    console.log("🧠 Transcribing with whisper.cpp...");
    const whisperCmd = `./whisper-cli -m models/ggml-base.en.bin -f "${audioPath}" -otxt -of "${path.join(audioDir, filename)}"`;
    await execPromise(whisperCmd);

    // ✅ 3. Read and process transcription
    console.log("📖 Reading transcription...");
    const transcription = fs.readFileSync(txtPath, "utf-8");

    console.log("🤖 Getting summary and tags...");
    const summary = await getSummaryAndTags(transcription);

    res.status(200).json({ transcription, summary });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server started on http://localhost:3000");
});
