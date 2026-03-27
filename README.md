# Knowte

AI-powered study companion with a FastAPI backend and Next.js frontend.

| Package | Stack | Port |
|---------|-------|------|
| `api-knowte` | FastAPI, Python 3.12+, Ollama, Transformers | `8000` |
| `knowte` | Next.js 16, React 19, MUI 7 | `3000` |

## Repository structure

```
Project_Book/
├── api-knowte/   # backend
├── knowte/       # frontend
└── README.md     # this file
```

For detailed package docs:

- Backend: `api-knowte/README.md`
- Frontend: `knowte/README.md`

## Latest changes (March 2026)

- Added room features end-to-end:
   - rooms UI, hooks, and Zod schemas on the frontend,
   - room APIs and Supabase Postgres integration on the backend.
- Added AI study tools in chat:
   - flashcard generation endpoint/models/services,
   - quiz generation support,
   - tools menu integration in chat UI for flashcard/quiz actions.
- Added `FlashcardPanel` UI for generating and viewing flashcards directly in the app.
- Improved conversation handling:
   - added `user_id` to conversation model,
   - added conversation retrieval endpoints.
- Implemented file upload + AI chat flow in room service and connected UI components.
- Refactored authentication model/schemas and performed general codebase cleanup for readability/maintainability.

---

## Quick start (end-to-end)

### 1) Backend

```bash
cd api-knowte
Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

### 2) Ollama (separate terminal)

```bash
ollama serve
ollama pull phi3
```

### 3) Frontend

```bash
cd knowte
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:3000`
- Backend docs: `http://127.0.0.1:8000/docs`

---

## General process flow

### Auth flow

1. User logs in on frontend.
2. Backend returns token.
3. Frontend stores token in cookies.
4. Axios interceptor sends `Authorization: Bearer <token>`.

### Chat flow (phi3)

1. Frontend sends `POST /api/v1/agent/chat` or `/chat/stream` with required `user_id`.
2. Backend `AgentService` builds message history + system prompt.
3. Backend calls Ollama (`phi3`) and returns response (full or stream).
4. Frontend can fetch conversation history via:
   - `GET /api/v1/agent/conversations/{user_id}`
   - `GET /api/v1/agent/conversations/{user_id}/{conversation_id}`

### Document QA flow (Donut)

1. User selects a PDF in `home` page.
2. File is staged in UI and uploaded when user clicks **Send**.
3. Backend `DocumentService`:
   - validates file,
   - stores PDF in `uploads/`,
   - extracts text with PyMuPDF,
   - converts pages to images,
   - runs Donut DocVQA for page-question answering.
4. Frontend can also fetch extracted text (`GET /document/{id}/text`) and pass it as context to phi3.

---

## Current non-DB behavior

Data is currently in-memory for fast iteration:

- Agent conversations stored in memory
- Document metadata/page images stored in memory
- Uploaded PDFs stored in `api-knowte/uploads/`

Current safeguards:

- max upload size
- max documents/conversations
- max messages per conversation
- TTL cleanup for docs and conversations

Stopping backend process clears memory maps; files on disk remain unless deleted.

---

## Suggested development loop

1. Start backend + Ollama + frontend.
2. Use `/docs` to verify endpoint behavior.
3. Test UI flow in `/home`:
   - ask without file,
   - upload PDF then ask,
   - stream + stop behavior.
4. Tune prompts, limits, and UI behavior.
5. Add DB persistence later when ready (users, chats, documents).

---

## Useful workspace commands

Run from repository root (`Project_Book`):

```bash
# backend
cd api-knowte
uvicorn app:app --reload --host 127.0.0.1 --port 8000

# frontend
cd knowte
npm run dev
```

## Troubleshooting

- `401 Unauthorized` on frontend calls:
   - check login flow succeeds,
   - verify auth token exists in cookies,
   - confirm backend `AUTH_SECRET_KEY` and token settings are consistent.
- `500` or AI timeout during chat/quiz/flashcards:
   - ensure `ollama serve` is running,
   - verify required models are pulled (`phi3`, `qwen3.5:4b`).
- CORS issues in browser console:
   - update `CORS_ORIGINS` in backend `.env` to include frontend origin.

## Contributing

1. Keep API schemas and frontend Zod schemas aligned.
2. Update the nearest package README when adding or changing endpoints.
3. Prefer small, focused pull requests grouped by feature (`auth`, `agent`, `document`, `flashcard`, `quiz`, `room`).
