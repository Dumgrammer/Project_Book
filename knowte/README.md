# Knowte — Frontend

Next.js 16 application with React 19, Material UI 7, and TypeScript.

## Quick start

```bash
npm install
npm run dev
```

Open **http://localhost:3000**

## Environment variables

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

## Project structure

```
app/
├── page.tsx              # Root route → renders HeroLanding
├── layout.tsx            # Root layout (fonts, ThemeRegistry, Providers)
├── theme.ts              # MUI custom theme (palette, typography, shape)
├── ThemeRegistry.tsx      # Emotion cache + ThemeProvider (SSR-safe)
│
├── pages/
│   └── HeroLanding.tsx   # Composes all landing sections
│
├── sections/             # Landing page sections
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── TrustedCompanies.tsx
│   ├── Pricing.tsx
│   ├── Testimonials.tsx
│   ├── FaqSection.tsx
│   └── BottomBanner.tsx
│
├── components/           # Shared UI components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── SectionTitle.tsx
│   └── TestimonialCard.tsx
│
├── data/                 # Static typed data arrays
│   ├── navLinks.ts
│   ├── companiesLogo.ts
│   ├── pricingData.ts
│   ├── testimonialsData.ts
│   └── faqsData.ts
│
├── signin/               # Sign-in feature
│   ├── page.tsx
│   └── components/
│       ├── SignInSide.tsx
│       ├── SignInCard.tsx      # Form → useLogin() hook
│       ├── ForgotPassword.tsx
│       ├── Content.tsx
│       └── CustomIcons.tsx
│
├── register/page.tsx     # Registration (placeholder)
├── dashboard/page.tsx    # Dashboard (placeholder)
│
├── schemas/
│   └── authschema.tsx    # Zod schemas mirroring backend Pydantic models
│
├── models/
│   └── authmodel.tsx     # Type re-exports from schemas
│
├── hooks/
│   └── auth.tsx          # React Query hooks: useLogin, useRegister, useOAuthFirebase, useCurrentUser, useLogout
│
└── lib/
    ├── api.ts            # Axios instance + auth interceptor
    ├── queryClient.ts    # Singleton QueryClient (SSR-safe)
    └── Providers.tsx     # QueryClientProvider wrapper
```

## Authentication flow

```
User submits form
  → Zod validates input (loginSchema)
  → useLogin() calls POST /api/v1/auth/login
  → Response validated with authResponseSchema
  → access_token saved to localStorage
  → Axios interceptor attaches Bearer token
  → Redirect to /dashboard
```

## Available hooks

| Hook | Endpoint | Description |
|------|----------|-------------|
| `useLogin()` | `POST /auth/login` | Email/password sign-in |
| `useRegister()` | `POST /auth/register` | New account registration |
| `useOAuthFirebase()` | `POST /auth/oauth2/firebase` | Firebase ID token login |
| `useCurrentUser()` | `GET /auth/me` | Fetch authenticated user |
| `useLogout()` | — | Clear token, redirect to /signin |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
