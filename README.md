# Agent Voice Response - ElevenLabs Speech-to-Text Integration

This repository provides a speech-to-text transcription service using **ElevenLabs API** integrated with the **Agent Voice Response** system. The code sets up an Express.js server that accepts audio input from Agent Voice Response Core, transcribes the audio using the ElevenLabs API, and returns the transcription to the Agent Voice Response Core.

## Prerequisites

Before setting up the project, ensure you have the following:

1. **Node.js** and **npm** installed.
2. An **ElevenLabs account** with API access. You can sign up at [ElevenLabs](https://elevenlabs.io/).
3. An **ElevenLabs API Key** with the necessary permissions to access the Speech-to-Text API. You can create an API key in your ElevenLabs dashboard.

## Setup

### 1. Clone the Repository

```bash
git clone https://github.com/agentvoiceresponse/avr-stt-elevenlabs.git
cd avr-stt-elevenlabs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up ElevenLabs Credentials

Create a `.env` file in the root directory of the project by copying the `.env.example` file:

```bash
cp .env.example .env
```

Then, edit the `.env` file and replace `xxxx` with your actual ElevenLabs API Key obtained in the prerequisites step.

### 4. Configuration

Ensure that you have the following environment variables set in your `.env` file:

```
PORT=6022
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here # Replace with your actual API key
ELEVENLABS_MODEL_ID=scribe_v1 # Optional, defaults to scribe_v1 if not specified
ELEVENLABS_LANGUAGE_CODE=en # Optional, defaults to en if not specified
```

You can adjust the port number as needed.

## How It Works

This application sets up an Express.js server that accepts audio input from clients and uses the ElevenLabs API to transcribe the audio. The transcribed text is then returned to the Agent Voice Response Core. Below is an overview of the core components:

### 1. **Express.js Server**

The server listens for audio input on a specific route (`/transcribe`) and passes the audio to the ElevenLabs API for transcription.

### 2. **Audio Processing**

The application processes the incoming audio data from Asterisk (typically in PCM format) and converts it to WAV format before sending it to the ElevenLabs API. This ensures compatibility with the API requirements.

### 3. **ElevenLabs Speech-to-Text API**

The API processes the audio data received from the client and converts it into text using ElevenLabs' advanced speech recognition capabilities.

### 4. **Route /transcribe**

This route accepts audio input from the client and transmits it for transcription. The transcription is sent back to the client once processing is complete.

## Example Code Overview

Here's a high-level breakdown of the key parts of the code:

- **Server Setup**: Configures the Express.js server and the ElevenLabs API integration.
- **Audio Processing**: A function that handles the incoming audio from clients. It:
  - Converts the PCM audio data to WAV format
  - Sends the audio to the ElevenLabs API for transcription
  - Returns the transcribed text to the client
  
- **Express.js Route**: The route `/transcribe` processes the audio input and returns the transcription.

## Running the Application

To start the application:

```bash
npm run start
```

or

```bash
npm run start:dev
```

The server will start and listen on the port specified in the `.env` file or default to `PORT=6022`.

### Sample Request

You can send audio data to the `/transcribe` endpoint using a client that can send audio files or streams. The audio should be in PCM format with the following headers:

- `X-Sample-Rate`: The sample rate of the audio (e.g., 16000 for 16kHz)
- `X-Audio-Format`: Optional, the format of the audio (defaults to "audio/x-signed-linear")

The response will be a JSON object containing the transcribed text:

```json
{
  "transcription": "This is the transcribed text from the audio."
}
```
