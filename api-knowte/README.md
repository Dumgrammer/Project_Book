# Knowte API (Backend)

FastAPI backend for authentication, chat with `phi3` via Ollama, and document QA (PDF upload + Donut DocVQA).

## Base URL

- Local: `http://127.0.0.1:8000`
- API prefix: `/api/v1`
- Swagger: `http://127.0.0.1:8000/docs`

## Prerequisites

- Python 3.11+ (3.12 recommended)
- Firebase project
- Firebase service account JSON file
- Firebase Authentication with `Email/Password` enabled
- Ollama installed locally (`ollama serve`)
- `phi3` model pulled in Ollama (`ollama pull phi3`)

## Environment Variables

Create/update `api-knowte/.env`:

```env
APP_NAME=Knowte API
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
CORS_ORIGINS=*

AUTH_SECRET_KEY=replace-with-strong-random-string
AUTH_SALT=replace-with-strong-random-salt
AUTH_TOKEN_TTL_SECONDS=3600

FIREBASE_CREDENTIALS_PATH=./firebase/your-service-account.json
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_WEB_API_KEY=your-web-api-key

# AI / LLM
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=phi3
```

## Run

From `api-knowte`:

```bash
pip install -r requirements.txt
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

For Ollama (run in another terminal):

```bash
ollama serve
ollama pull phi3
```

---

## API Reference

### `GET /health`

Simple health check.

**Response 200**

```json
{
  "status": "ok"
}
```

---

### `POST /api/v1/agent/chat`

Single-response chat endpoint using Ollama `phi3`.

**Request Body (JSON)**

```json
{
  "message": "Explain photosynthesis simply.",
  "conversation_id": "optional-conversation-id",
  "history": [
    { "role": "user", "content": "What is photosynthesis?" },
    { "role": "assistant", "content": "It is how plants convert light into energy." }
  ],
  "system_prompt": "Optional hidden instructions for the AI."
}
```

**Response 200**

```json
{
  "conversation_id": "uuid",
  "reply": "Photosynthesis is ...",
  "model": "phi3"
}
```

---

### `POST /api/v1/agent/chat/stream`

Streaming chat endpoint (SSE / `text/event-stream`).

Each event is emitted as:

```json
{
  "conversation_id": "uuid",
  "delta": "partial text chunk",
  "done": false
}
```

Final chunk has `done: true`.

---

### `POST /api/v1/document/upload`

Upload a PDF for DocVQA processing.

**Content-Type**

- `multipart/form-data`
- Required field name: `file`

**Response 201**

```json
{
  "document_id": "uuid",
  "filename": "notes.pdf",
  "page_count": 12
}
```

---

### `POST /api/v1/document/{document_id}/ask`

Ask a question about a specific uploaded page using Donut (`naver-clova-ix/donut-base-finetuned-docvqa`).

**Request Body (JSON)**

```json
{
  "question": "What is the title?",
  "page": 1
}
```

**Response 200**

```json
{
  "document_id": "uuid",
  "question": "What is the title?",
  "answer": "Biology Module 1",
  "confidence": 0.84,
  "model": "naver-clova-ix/donut-base-finetuned-docvqa"
}
```

---

### `GET /api/v1/document/{document_id}/text`

Returns extracted plain text from uploaded PDF (useful as context for phi3).

**Response 200**

```json
{
  "document_id": "uuid",
  "text": "extracted text..."
}
```

---

### `POST /api/v1/auth/register`

Create a new Firebase user and return app auth token.

**Request Body (JSON)**

```json
{
  "email": "test@example.com",
  "password": "testpass123",
  "full_name": "Test User"
}
```

**Validation**

- `email`: valid email
- `password`: 8-128 chars
- `full_name`: optional

**Response 201**

```json
{
  "user": {
    "id": "firebase_uid_here",
    "email": "test@example.com",
    "is_active": true,
    "full_name": "Test User"
  },
  "token": {
    "access_token": "your_app_token",
    "token_type": "bearer",
    "expires_in": 3600
  }
}
```

**Common Errors**

- `409`: user already exists
- `500`: Firebase setup/credential issue

---

### `POST /api/v1/auth/login`

Email/password login through Firebase, then returns app auth token.

**Request Body (JSON)**

```json
{
  "email": "test@example.com",
  "password": "testpass123"
}
```

**Response 200**

Same shape as register (`AuthResponse`).

**Common Errors**

- `401`: invalid email/password
- `500`: missing `FIREBASE_WEB_API_KEY`
- `502`: Firebase endpoint unreachable

---

### `POST /api/v1/auth/token`

OAuth2 password grant endpoint used by Swagger Authorize.

**Content-Type**

- `application/x-www-form-urlencoded` (not JSON)

**Form fields**

- `username` (email)
- `password`

**cURL example**

```bash
curl -X POST "http://127.0.0.1:8000/api/v1/auth/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test@example.com&password=testpass123"
```

**Response 200**

```json
{
  "access_token": "your_app_token",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### `POST /api/v1/auth/oauth2/firebase`

Login with a Firebase ID token from client-side Firebase SDK.

**Request Body (JSON)**

```json
{
  "id_token": "firebase_id_token_here"
}
```

**Response 200**

Same shape as register/login (`AuthResponse`).

**Common Errors**

- `401`: invalid/expired Firebase ID token
- `400`: token missing email claim

---

### `GET /api/v1/auth/me`

Get current user from app bearer token.

**Headers**

- `Authorization: Bearer <access_token>`

**Response 200**

```json
{
  "id": "firebase_uid_here",
  "email": "test@example.com",
  "is_active": true,
  "full_name": "Test User"
}
```

**Common Errors**

- `401`: invalid/expired token
- `401`: token subject does not map to Firebase user

---

## Swagger: Exact Test Flow

1. Open `http://127.0.0.1:8000/docs`
2. Call `POST /api/v1/auth/register` (or use an existing account with `/auth/login`)
3. Click **Authorize**
4. In popup:
   - `username`: your email
   - `password`: your password
   - `client_id`: leave blank
   - `client_secret`: leave blank
5. Click **Authorize**
6. Call `GET /api/v1/auth/me`

If authorize popup shows token URL `/auth/token`, restart uvicorn and hard-refresh docs (`Ctrl+F5`).

## Response Models

- `TokenResponse`
  - `access_token: str`
  - `token_type: str` (`bearer`)
  - `expires_in: int`
- `UserResponse`
  - `id: str`
  - `email: str`
  - `is_active: bool`
  - `full_name: str | null`
- `AuthResponse`
  - `user: UserResponse`
  - `token: TokenResponse`

---

## In-memory storage behavior (no DB yet)

The current AI/document layers are intentionally in-memory.

- Agent conversations live in memory (`_conversations`)
- Uploaded docs metadata/images live in memory (`_documents`, `_page_images`)
- Uploaded PDF files are written to `api-knowte/uploads/`

### Safety controls currently enabled

- Upload size limit: **10MB**
- Max stored docs: **20**
- Max extracted text chars per doc: **200,000**
- Max conversations: **200**
- Max messages per conversation: **50**
- TTL cleanup:
  - Documents: **24 hours**
  - Conversations: **24 hours**

Stopping the API process clears in-memory maps. Files under `uploads/` remain unless cleaned.
