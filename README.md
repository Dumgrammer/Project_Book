# Knowte

An AI-powered study companion that helps students streamline their learning. The project is split into two packages:

| Package | Stack | Port |
|---------|-------|------|
| **api-knowte** | FastAPI, Python 3.12+ | `8000` |
| **knowte** | Next.js 16, React 19, MUI 7 | `3000` |

---

## Repository structure

```
Project_Book/
├── api-knowte/          # FastAPI backend
│   ├── models/          # Domain dataclasses
│   ├── schemas/         # Pydantic request / response models
│   ├── services/        # Business logic
│   ├── routes/v1/       # Versioned API endpoints
│   ├── firebase/        # Firebase Admin SDK key (git-ignored)
│   ├── config.py        # Centralised settings (reads .env)
│   └── app.py           # Uvicorn entrypoint
│
├── knowte/              # Next.js frontend
│   └── app/
│       ├── components/  # Reusable UI components (Navbar, Footer, etc.)
│       ├── sections/    # Landing-page sections (Hero, Features, Pricing, …)
│       ├── pages/       # Composed page layouts (HeroLanding)
│       ├── signin/      # Sign-in page + sub-components
│       ├── register/    # Registration page (placeholder)
│       ├── dashboard/   # Dashboard page (placeholder)
│       ├── schemas/     # Zod validation schemas
│       ├── models/      # TypeScript type re-exports
│       ├── hooks/       # React Query hooks (auth)
│       ├── lib/         # Axios client, QueryClient, Providers
│       ├── data/        # Static data arrays (nav links, pricing, FAQs, …)
│       ├── theme.ts     # MUI custom theme
│       ├── ThemeRegistry.tsx  # Emotion SSR + ThemeProvider
│       └── layout.tsx   # Root layout (fonts, ThemeRegistry, Providers)
│
└── README.md            # ← you are here
```

---

## Backend — api-knowte

### Prerequisites

- Python 3.12+
- A Firebase project with a **service-account key** JSON file

### Setup

```bash
cd api-knowte

# Create virtual environment (already done at project root)
python -m venv .

# Activate
# Windows:
Scripts\activate
# macOS / Linux:
source bin/activate

# Install dependencies
pip install fastapi[standard] uvicorn firebase-admin pydantic[email]
```

### Environment variables

Copy the example and fill in real values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | Knowte API | Displayed in /docs |
| `APP_ENV` | development | `development` or `production` |
| `APP_HOST` | 127.0.0.1 | Bind address |
| `APP_PORT` | 8000 | Bind port |
| `CORS_ORIGINS` | * | Comma-separated origins |
| `AUTH_SECRET_KEY` | — | HMAC key for JWT signing |
| `AUTH_SALT` | — | Salt for password hashing |
| `AUTH_TOKEN_TTL_SECONDS` | 3600 | Token lifetime |
| `FIREBASE_CREDENTIALS_PATH` | — | Path to service-account JSON |
| `FIREBASE_PROJECT_ID` | — | Firebase project ID |

### Running

```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

Interactive docs available at **http://127.0.0.1:8000/docs**

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/auth/register` | Register with email + password |
| `POST` | `/api/v1/auth/login` | Login with email + password |
| `POST` | `/api/v1/auth/token` | OAuth2 password grant (form-based) |
| `POST` | `/api/v1/auth/oauth2/firebase` | Login with Firebase ID token |
| `GET`  | `/api/v1/auth/me` | Get current user (Bearer token) |
| `GET`  | `/health` | Health check |

### Architecture

- **models/** — Plain Python dataclasses representing domain entities (`AuthUser`, `TokenPayload`).
- **schemas/** — Pydantic models for request validation and response serialization.
- **services/** — Core logic: password hashing (PBKDF2-HMAC-SHA256), JWT creation/verification, Firebase Admin SDK integration with lazy loading.
- **routes/** — Thin FastAPI router layer; delegates to services via dependency injection.
- **config.py** — Reads `.env` at import time and exposes a frozen `Settings` dataclass.

---

## Frontend — knowte

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
cd knowte
npm install
```

### Environment variables

Create `knowte/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

If omitted, the frontend defaults to `http://127.0.0.1:8000/api/v1`.

### Running

```bash
npm run dev
```

Open **http://localhost:3000**

### Key libraries

| Library | Purpose |
|---------|---------|
| **MUI 7** (`@mui/material`) | Component library + theming |
| **Emotion** | CSS-in-JS (MUI's styling engine) |
| **Axios** | HTTP client for API calls |
| **Zod** | Runtime schema validation |
| **React Query** (`@tanstack/react-query`) | Server-state management |
| **Lucide React** | Icon set |
| **React Fast Marquee** | Scrolling logo banner |

### Pages

| Route | Component | Status |
|-------|-----------|--------|
| `/` | `HeroLanding` — full marketing landing page | Done |
| `/signin` | `SignInSide` — email/password sign-in with MUI template | Done |
| `/register` | Registration form | Placeholder |
| `/dashboard` | Authenticated dashboard | Placeholder |

### Authentication flow

1. User submits the sign-in form.
2. `SignInCard` validates input with `loginSchema` (Zod).
3. `useLogin()` calls `POST /api/v1/auth/login` via Axios.
4. Response is validated with `authResponseSchema` (Zod).
5. `access_token` is persisted to `localStorage`.
6. Axios interceptor attaches `Authorization: Bearer <token>` to subsequent requests.
7. User is redirected to `/dashboard`.

### Frontend architecture

- **schemas/** — Zod schemas that mirror the backend Pydantic models exactly, plus inferred TypeScript types.
- **models/** — Re-exports the Zod-inferred types for clean imports.
- **hooks/** — React Query mutations (`useLogin`, `useRegister`, `useOAuthFirebase`) and queries (`useCurrentUser`), plus `useLogout`.
- **lib/api.ts** — Axios instance with base URL and auth interceptor.
- **lib/Providers.tsx** — `QueryClientProvider` wrapper used in `layout.tsx`.
- **ThemeRegistry.tsx** — Emotion cache + `ThemeProvider` for SSR-safe MUI in Next.js App Router.

---

## GitLab CI/CD

Environment variables listed above can be set as **CI/CD Variables** in GitLab (Settings > CI/CD > Variables) instead of a `.env` file. The backend's `config.py` reads from `os.environ` first, falling back to `.env` only for local development.
