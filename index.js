/**
 * AVR Speech-to-Text Service using ElevenLabs
 *
 * This service receives audio data from Asterisk, converts it to WAV format,
 * and uses ElevenLabs API to transcribe the speech to text.
 *
 * @author Agent Voice Response <info@agentvoiceresponse.com>
 * @contributors Giuseppe Careri <info@gcareri.com>, seif walid mamdouh
 * @version 1.0.0
 */

const express = require("express");
const { ElevenLabsClient } = require("elevenlabs");
const wav = require("node-wav");

// Load environment variables
require("dotenv").config();

// Initialize Express app
const app = express();

// Configure middleware for raw binary data
// This allows receiving audio data as a raw buffer
app.use(express.raw({ type: "application/octet-stream", limit: "50mb" }));

/**
 * Handles the transcription request
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with transcription
 */
const handleTranscriptionRequest = async (req, res) => {
  // Log request timestamp
  console.log(
    `\n[${new Date().toISOString()}] Transcription Service: Received request on /transcribe`
  );

  // Extract audio data and metadata from request
  const audioBuffer = req.body;
  const sampleRateHeader = req.headers["x-sample-rate"];
  const sampleRate = parseInt(sampleRateHeader, 10);

  // Default to Asterisk's slin format (Signed Linear PCM)
  const audioFormat = req.headers["x-audio-format"] || "audio/x-signed-linear";

  // Validate audio data
  if (!audioBuffer || audioBuffer.length === 0) {
    console.error("Received empty audio buffer.");
    return res.status(400).json({ message: "Empty audio data received." });
  }

  // Validate sample rate
  if (!sampleRate || isNaN(sampleRate)) {
    console.error(
      `Invalid or missing X-Sample-Rate header: ${sampleRateHeader}`
    );
    return res
      .status(400)
      .json({ message: "Missing or invalid X-Sample-Rate header." });
  }

  // Log audio metadata
  console.log(
    `Received audio buffer: ${(audioBuffer.length / 1024).toFixed(
      2
    )} KB, Sample Rate: ${sampleRate} Hz, Format: ${audioFormat}`
  );

  try {
    // Convert PCM to WAV format
    console.log("Converting PCM to WAV format...");
    
    // Convert the buffer to an array of samples (16-bit PCM)
    const samples = [];
    for (let i = 0; i < audioBuffer.length; i += 2) {
      // Read 16-bit little-endian sample
      const sample = audioBuffer.readInt16LE(i);
      // Normalize to [-1, 1] range for WAV encoding
      samples.push(sample / 32768.0);
    }
    
    // Create a WAV buffer with proper headers
    const wavBuffer = wav.encode([samples], {
      sampleRate: sampleRate,
      float: false,
      bitDepth: 16,
    });
    
    // Log conversion result
    console.log(`Converted to WAV: ${(wavBuffer.length / 1024).toFixed(2)} KB`);
    
    // Create a Blob with the WAV data for ElevenLabs API
    const audioBlob = new Blob([wavBuffer], { type: "audio/wav" });

    // Initialize ElevenLabs client
    const client = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });

    // Send audio to ElevenLabs for transcription
    const transcription = await client.speechToText.convert({
      file: audioBlob,
      model_id: process.env.ELEVENLABS_MODEL_ID || "scribe_v1",
      num_speakers: 1,
      language_code: process.env.ELEVENLABS_LANGUAGE_CODE || "en",
      tag_audio_events: false,
      timestamps_granularity: "none"
    });

    // Log transcription result
    console.log(`Transcription: ${transcription.text || 'No text transcribed'}`);

    // Return transcription text
    return res.json({ transcription: transcription.text || '' });
  } catch (error) {
    // Log and return error
    console.error("Error processing audio:", error);
    return res
      .status(500)
      .json({ message: "Error processing audio", error: error.message });
  }
};

// Register the transcription endpoint
app.post("/transcribe", handleTranscriptionRequest);

// Start the server
const PORT = process.env.PORT || 6022;
app.listen(PORT, () => {
  console.log(`ElevenLabs STT listening on port ${PORT}`);
});
