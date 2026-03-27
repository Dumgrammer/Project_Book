# Knowte — Frontend

Next.js 16 app with React 19, MUI 7, TypeScript, React Query, and Zod.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

## Environment variables

Create `knowte/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## Project structure

```
app/
├── page.tsx                # Landing route
├── layout.tsx              # Root layout + providers
├── theme.ts                # MUI theme
├── ThemeRegistry.tsx
│
├── pages/
│   └── HeroLanding.tsx
├── sections/
├── components/
├── data/
│
├── signin/
├── register/
├── home/                   # Main AI workspace
│   ├── layout.tsx
│   ├── page.tsx
│   └── components/
│       ├── ChatArea.tsx
│       ├── ChannelSidebar.tsx
│       └── ServerBar.tsx
│
├── schemas/
│   ├── authschema.tsx
│   ├── agentschema.tsx
│   ├── documentschema.tsx
│   └── flashcardschema.tsx
│
├── models/
│   ├── authmodel.tsx
│   ├── agentmodel.tsx
│   ├── documentmodel.tsx
│   └── flashcardmodel.tsx
│
├── hooks/
│   ├── auth.tsx
│   ├── agent.tsx
│   ├── document.tsx
│   └── flashcard.tsx
│
└── lib/
    ├── api.ts
    ├── cookies.ts
    ├── queryClient.ts
    └── Providers.tsx
```

## Authentication flow

```
User submits sign-in form
  → Zod validates input
  → useLogin() calls POST /api/v1/auth/login
  → Response validated with Zod
  → access_token saved to cookies
  → Axios interceptor attaches Bearer token
  → Redirect to /home
```

## Available hooks

### Auth hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useLogin()` | `POST /auth/login` | Email/password sign-in |
| `useRegister()` | `POST /auth/register` | New account registration |
| `useOAuthFirebase()` | `POST /auth/oauth2/firebase` | Firebase ID token login |
| `useCurrentUser()` | `GET /auth/me` | Fetch authenticated user |
| `useLogout()` | — | Clear token cookie + redirect |

### Agent hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useAgentChat()` | `POST /agent/chat` | Single full AI response |
| `useAgentStream()` | `POST /agent/chat/stream` | SSE streaming AI response |
| `useAgentConversations(userId)` | `GET /agent/conversations/{user_id}` | List conversation history for sidebar |
| `useAgentConversationMessages(userId, conversationId)` | `GET /agent/conversations/{user_id}/{conversation_id}` | Load messages for selected conversation |
| `useAgentSidebarHistory(userId)` | Uses conversation endpoints above | Groups chats into Today / Yesterday / Previous 7 Days / Older |

### Document hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useDocumentUpload()` | `POST /document/upload` | Upload PDF |
| `useDocumentAsk()` | `POST /document/{id}/ask` | Ask DocVQA question per page |
| `useDocumentText()` | `GET /document/{id}/text` | Get extracted text context |

### Flashcard hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useGenerateFlashcards()` | `POST /flashcard/generate` | Generate flashcards from uploaded doc text |

## Home chat flow (`app/home/components/ChatArea.tsx`)

1. User must be authenticated (`useCurrentUser`) before sending chat requests.
2. User optionally selects a PDF.
3. PDF is staged in UI, then uploaded when user clicks **Send**.
4. Frontend fetches extracted text from backend.
5. Message is sent to `useAgentStream()` with:
   - required `user_id` from the authenticated user,
   - optional `conversation_id` (from URL `?c=` or active stream conversation),
   - `history` from local chat messages,
   - optional `system_prompt` context built from document text.
6. Assistant response streams chunk-by-chunk into the chat bubble.
7. If the message intent is flashcard/quiz, ChatArea opens `FlashcardPanel` / `QuizPanel` instead of a normal chat reply.

## Chat request contract

Frontend and backend are aligned on this payload shape:

```ts
{
  user_id: string;
  message: string;
  conversation_id?: string | null;
  history?: { role: "user" | "assistant" | "system"; content: string }[];
  system_prompt?: string | null;
}
```

## Flashcard generation flow

1. Upload a PDF first and get `document_id`.
2. Call `useGenerateFlashcards()` with:
   - `document_id`
   - `prompt` (e.g. "focus on key terms")
   - `count` (3-30, default 12)
3. Backend returns a deck of `{ question, answer }` items.

## Quiz generation flow

1. Upload a PDF first and get `document_id`.
2. Trigger quiz intent from suggestion chips or typed prompt.
3. ChatArea opens `QuizPanel` for generation and viewing multiple-choice questions.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Local verification checklist

1. Sign in using a valid account and confirm redirect to `/home`.
2. Send a chat message without a file and verify assistant reply appears.
3. Upload a PDF and send a follow-up question.
4. Confirm streaming output renders incrementally in chat.
5. Generate flashcards from an uploaded document.
6. Generate a quiz from an uploaded document.
7. Open a previous conversation from sidebar (`?c=<conversation_id>`) and verify messages hydrate correctly.

## Troubleshooting

- Requests fail with `Network Error`:
  - verify backend is running,
  - confirm `NEXT_PUBLIC_API_URL` is correct in `.env.local`.
- Frequent `401` responses:
  - check token cookie presence,
  - ensure auth response schema still matches backend fields.
- Chat stream not updating:
  - inspect browser console for SSE/request errors,
  - validate backend stream endpoint is returning `text/event-stream` chunks.

## Contribution notes

1. Keep Zod schemas, model types, and hook payloads aligned.
2. If backend contracts change, update:
   - `app/schemas/*`
   - `app/models/*`
   - related `app/hooks/*`
3. Prefer colocating feature-specific UI under its route folder (`signin`, `register`, `home`, `flashcard`, `rooms`).
