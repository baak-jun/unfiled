# UNFILED — Interview Room 04

A quiet room. A witness who keeps changing their story. One more lie beneath every admission.

**Version 0.2.3 · English / 한국어 · Local web game**

## Start playing

1. Install **Node.js 22.9 or later** from https://nodejs.org (a current LTS release is recommended).
2. Extract the entire ZIP into a folder. Do not run it from inside the ZIP.
3. On Windows, double-click `start-en.cmd`. Keep its terminal window open.
4. Open **http://127.0.0.1:4173/en/** in your browser. The link in the header switches to Korean.

On macOS or Linux, open a terminal in the extracted folder and run:

```sh
node --env-file-if-exists=.env server.mjs
```

Then open the same address. No `npm install` is required. Press Ctrl+C in the terminal to stop the server.

The server binds only to this computer. This ZIP is a **downloadable local game**, not an itch.io HTML5 embed. Opening `public/index.html` directly will not run the game.

## Two modes

**Layers of Truth:** Three authored cases, each with four layers. Read your assignment, meet the witness, then hear their account. Select a remark within the conversation and choose Ask about this to follow up and find evidence. Select a false statement and present the evidence that contradicts it. Each successful challenge reveals a new testimony and advances case progress by 25%. A partial admission may conceal another lie. Free conversation alone does not advance the case.

**Object in Mind:** One of twelve fixed objects is selected per round. Ask about its features and submit one object name at a time. The witness replies only **Yes / No / I think so / I do not remember**. Uncertain replies are not proof. The object does not change during a round.

Use Enter to send a question and Shift+Enter for a new line. Mouse and keyboard are supported. The interface adapts to narrow windows; this downloadable package needs a computer running Node.js.

## Optional AI conversation

No key is required to finish the mystery cases. Without a key, conversation uses authored statements and object questions use a limited set of recognized features. Unknown object questions receive “I do not remember.” The demo is deliberately more limited than AI conversation.

On Windows, run `setup-key.cmd`, choose your provider, enter a text/chat model ID and enter your own key. Restart the game afterward. Supported providers: **Raon, OpenAI, Gemini, Claude, DeepSeek, and custom OpenAI-compatible APIs**.

For manual setup, copy `.env.example` to `.env` and set:

```dotenv
AI_PROVIDER=raon
AI_MODEL=raon-1-mini-preview
AI_API_KEY=YOUR_API_KEY
```

Use a model available to your account. Provider pricing, availability and quotas apply; the game includes no API credits. Custom providers also need `AI_BASE_URL`. Never share your `.env` file. No developer key is included in the download.

In AI mode, your questions, relevant fictional case material and part of the conversation are sent to the selected provider. The local server reads the key; it is not placed in frontend assets. The game has no analytics. Do not put personal or sensitive information into your questions.

## Progress and limitations

The two modes and languages keep separate rounds. Progress is temporary: it can be resumed in the same browser tab while the local server is running, but expires after two hours of inactivity or a server restart. There is no permanent save system in this version.

The cases, characters and evidence are fictional. This is a deduction game, not counseling. Authored evidence controls progression even if the AI makes a mistake. AI conversation may be inaccurate. English content is translated and adapted from the Korean edition; both versions use the same puzzle structure.

## Troubleshooting

- **Address already in use:** Stop the previous game terminal, or use a different `PORT` in `.env` and open that port in your browser.
- **Connection refused:** Keep the game terminal open and use the exact local address it prints.
- **Invalid key, quota or model error:** Check your provider settings. The game falls back to authored dialogue or an uncertain object reply; it does not expose provider error details or keys.
- **Changes to `.env` do not apply:** Stop and restart the server.

Source and updates: https://github.com/baak-jun/unfiled

Development checks: `npm test`. Regenerate English interface assets after editing translations with `npm run build:locales`. Build a key-free itch.io ZIP on Windows with `npm run package:itch`.

### 0.2.1 — Conversation-first opening

Added scene-setting, introductions and connected dialogue for all twelve testimony layers in both languages. Follow-up controls now appear only when you select a remark in the conversation.

### 0.2.2 — Character voices

Each witness now has a distinct conversational voice and a mood appropriate to the current layer. AI replies respond to the immediate question, including small talk, without automatically reciting the case. Only the current mood is sent to the model; later revelations stay hidden. Evidence and progression remain deterministic. Korean authored follow-ups have also been rewritten in spoken language.

### 0.2.3 — Dialogue pacing

New dialogue appears gradually with short pauses, including prepared replies. Click the conversation or press Space to read three times faster; repeat to reveal the rest. Previously read dialogue stays visible. Reduced-motion settings use paced text blocks instead of a character animation.
