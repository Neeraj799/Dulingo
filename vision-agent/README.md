# Vision Agent - AI Language Teacher Service

Real-time voice-only AI language teacher service powered by [Vision Agents](https://visionagents.ai), OpenAI Realtime API (`gpt-4o-realtime-preview` / `gpt-realtime-2`), and Stream Edge WebRTC transport.

## Overview

The AI teacher always speaks English by default while teaching the selected target language through conversational voice interactions, vocabulary exercises, and instant feedback.

## Requirements & Environment

1. Python 3.10+
2. Environment variables (configured in `.env` or parent `../.env`):
   - `STREAM_API_KEY` - Stream API key (reused from parent `.env`)
   - `STREAM_API_SECRET` - Stream API secret (reused from parent `.env`)
   - `OPENAI_API_KEY` - OpenAI API Key with access to Realtime API models

## Installation

```bash
# Install dependencies
pip install -r requirements.txt
# or
pip install vision-agents vision-agents-plugins-openai vision-agents-plugins-getstream python-dotenv
```

## Running the Service

### Console / Development Mode

Run the agent locally to connect with the browser preview:

```bash
python agent.py run
```

### HTTP Server Mode (Production)

Start the HTTP server with session orchestration endpoints:

```bash
python agent.py serve --host 0.0.0.0 --port 8000
```

### HTTP Endpoints

- `POST /calls/{call_id}/sessions` - Start an agent session for a call
- `DELETE /calls/{call_id}/sessions/{session_id}` - End session
- `GET /health` - Liveness check
- `GET /ready` - Readiness check
