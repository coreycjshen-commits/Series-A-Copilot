# Series A Memo Copilot

A web app that takes uploaded pitch decks and data room documents for a Series A startup and drafts a structured investment memo using Claude.

Upload a pitch deck PDF, paste founder call notes, and get an 11-section analyst memo with benchmarks, risk analysis, and diligence questions — ready for IC review.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript
- **Styling:** Tailwind CSS
- **Auth / Database / Storage:** Supabase (Postgres + Supabase Auth + Supabase Storage)
- **AI:** Anthropic API (Claude Sonnet), server-side only
- **PDF extraction:** pdf-parse
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd series-a-memo-copilot
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in your Supabase SQL editor:

```bash
# Copy the contents of supabase/migrations/001_initial_schema.sql
# and run it in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
```

This creates the `memos` and `memo_files` tables with Row Level Security policies, and a `memo-files` storage bucket.

3. In Supabase Dashboard → Storage, verify the `memo-files` bucket was created.

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.local.example .env.local
```

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Find your Supabase keys in: Dashboard → Settings → API.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

1. Push to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the four environment variables in the Vercel project settings
4. Deploy

## How It Works

1. **Sign up / sign in** with email and password (Supabase Auth)
2. **Create a new memo** — upload pitch deck PDFs and optionally paste call notes
3. **Files are uploaded** to Supabase Storage, text is extracted server-side with pdf-parse
4. **Claude generates** a structured 11-section Series A investment memo
5. **View the memo** rendered with proper formatting, with status tracking during generation
6. **Dashboard** shows all past memos for review

## Memo Structure

The AI generates memos with these sections:

1. Executive Summary
2. Company Overview
3. Team
4. Market
5. Product & Technology
6. Traction & Metrics
7. Competitive Positioning
8. Deal Terms
9. Key Risks
10. Open Diligence Questions
11. Recommendation Framing

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login and signup pages
│   ├── (dashboard)/     # Dashboard and memo pages (auth-protected)
│   ├── api/memos/       # API routes for memo CRUD + Claude
│   ├── layout.tsx
│   └── page.tsx         # Landing page
├── components/
│   ├── memo-content.tsx # Markdown renderer for memos
│   └── sign-out-button.tsx
├── lib/
│   ├── supabase/        # Supabase client configs
│   ├── extract-text.ts  # PDF/text extraction
│   └── system-prompt.ts # Claude system prompt
└── middleware.ts        # Auth route protection
```
