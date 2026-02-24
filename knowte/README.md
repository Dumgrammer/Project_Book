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
│   └── documentschema.tsx
│
├── models/
│   ├── authmodel.tsx
│   ├── agentmodel.tsx
│   └── documentmodel.tsx
│
├── hooks/
│   ├── auth.tsx
│   ├── agent.tsx
│   └── document.tsx
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

### Document hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useDocumentUpload()` | `POST /document/upload` | Upload PDF |
| `useDocumentAsk()` | `POST /document/{id}/ask` | Ask DocVQA question per page |
| `useDocumentText()` | `GET /document/{id}/text` | Get extracted text context |

## Home chat flow (`app/home/components/ChatArea.tsx`)

1. User optionally selects a PDF.
2. PDF is staged in UI, then uploaded when user clicks **Send**.
3. Frontend fetches extracted text from backend.
4. Message is sent to `useAgentStream()` with optional `system_prompt` context from document text.
5. Assistant response streams chunk-by-chunk into the chat bubble.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
