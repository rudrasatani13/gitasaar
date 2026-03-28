---
name: media-ai-manager
description: Handles the Gemini AI chat (Krishna persona), quiz generation, ElevenLabs TTS audio, and AudioPlayer component for GitaSaar. Invoke when working on chat, AI responses, voice playback, or quiz features.
disable-model-invocation: true
allowed-tools: Read, Edit, Grep
---

# Media & AI Manager — GitaSaar

## Scope

You are operating in **media-ai-manager** mode. You may ONLY read or edit files in the list below. If any fix requires touching a file outside this list, STOP and tell the user which out-of-scope file is needed before proceeding.

### Owned Files

```
src/screens/ChatScreen.js
src/screens/QuizScreen.js
src/components/AudioPlayer.js
src/components/VoiceInput.js
src/components/TypeWriter.js
src/utils/geminiApi.js
functions/index.js          ← only functions: generateGeminiResponse (lines 195–254), generateQuizQuestions (lines 259–329), generateSpeechAudio (lines 332–410)
```

---

## Architecture

### Gemini AI
- **Model**: `gemini-2.5-pro` — do NOT downgrade without explicit user approval.
- **Persona**: Lord Krishna. The system prompt defines tone, response format, and spiritual framing. Never alter the persona instructions without user approval.
- **Response format** (structured tags, must be preserved):
  ```
  [RESPONSE]     → Krishna's reply text
  [VERSE_START]  → begins extracted verse block
  [VERSE_END]    → ends verse block
  [ADVICE]       → standalone advice line
  ```
- **Conversation history**: Managed client-side in `ChatHistoryContext`. The full history array is sent with every request. Never truncate history server-side.
- **Languages supported**: hinglish, hindi, english, gujarati, marathi, tamil, telugu, kannada, bengali, punjabi, malayalam, odia.

### ElevenLabs TTS (Audio)
- API key is **server-side only** — proxied via `generateSpeechAudio` Cloud Function.
- Returns **base64-encoded audio**; `AudioPlayer.js` decodes and plays locally.
- Verse reference prefixes (`[Chapter X:Y]`) are stripped before sending text to ElevenLabs — preserve this stripping logic.
- Native: audio files are cached by hash-based filename. Do NOT change the cache key scheme without migrating existing cache.
- Web: base64 is played inline (no file caching).
- **Fallback**: If ElevenLabs fails, `AudioPlayer.js` falls back to device TTS. Always keep this fallback path intact.

### Quiz Generation
- Cloud Function generates exactly **3 multiple-choice questions** in valid JSON.
- Client must validate JSON before rendering — malformed responses must show a user-facing error, not crash.
- Rate limit: 5 requests/min per user (enforced server-side in-memory; resets on cold start).

### Rate Limits (all enforced server-side)
| Function | Limit |
|----------|-------|
| `generateGeminiResponse` | 15 req/min/user |
| `generateQuizQuestions` | 5 req/min/user |
| `generateSpeechAudio` | 10 req/min/user |

Client-side rate limiting in `geminiApi.js` is a UX guard only — never rely on it for security.

---

## Coding Standards

1. **Never** embed `GEMINI_API_KEY` or `ELEVENLABS_API_KEY` in client-side code. All AI calls must go through Cloud Function proxies.
2. The Gemini system prompt (Krishna persona) must be sent on **every** request — never cache or omit it.
3. Audio playback state (playing, paused, loading) must be managed entirely within `AudioPlayer.js`. Screens must not hold audio state.
4. `VoiceInput.js` must release the microphone on unmount — always call `stopRecording()` in the cleanup effect.
5. `TypeWriter.js` animation must be cancellable — if the component unmounts before text finishes, clear the interval to prevent state-update-on-unmounted-component warnings.
6. Quiz answer selection must be disabled after the user submits — prevent double-submission by setting a `submitted` flag before any async call.

---

## Known Pitfalls

### Gemini Session Lockout
- **Where**: `generateGeminiResponse` Cloud Function (lines 195–254) + `geminiApi.js`.
- **Risk**: If a request is mid-flight and the user sends another, the in-memory rate limiter may count both, temporarily locking out the user even though they haven't exceeded limits meaningfully.
- **Fix**: The client must disable the send button while a request is in-flight (`isSending` flag). Do NOT allow concurrent requests from the same session.

### Audio Limit Exploit
- **Where**: `AudioPlayer.js` + `PremiumContext.js` usage counter.
- **Risk**: If the usage counter is decremented at the start of playback (optimistically), a user can trigger multiple plays before the counter updates by spamming the play button.
- **Fix**: Decrement the counter only after `generateSpeechAudio` returns a successful response. Keep a `isRequesting` guard to block concurrent audio requests.

### ElevenLabs Timeout
- **Where**: `generateSpeechAudio` Cloud Function (timeout: 30 seconds).
- **Risk**: Long verses cause ElevenLabs to exceed the Cloud Function timeout.
- **Fix**: Trim input text to a maximum length before sending. If text exceeds the safe limit (currently ~800 chars), split and play sequentially, or fall back to device TTS immediately.

### Quiz JSON Parse Failure
- **Where**: `QuizScreen.js` rendering Gemini's quiz response.
- **Risk**: Model occasionally returns malformed JSON or wraps JSON in markdown code fences.
- **Fix**: Strip markdown fences before `JSON.parse()`. Wrap parse in try/catch and show a retry prompt — never let a parse error propagate to a crash.

---

## Do Not Touch

- `src/theme/PremiumContext.js` — owned by `payment-manager` (usage limit reads are OK; writes are not)
- `src/theme/ChatHistoryContext.js` — read-only from this skill; structural changes go through `ui-theme-manager`
- `src/utils/firebase.js` — owned by `auth-manager`
- `functions/index.js` lines 35–129 — owned by `payment-manager`
