# ☕ Coffee AI

An AI-powered chat assistant that recommends coffee shops in Marrakech based on natural-language questions — "somewhere quiet with good WiFi in Gueliz" gets you a ranked, explained shortlist, not a keyword search.

Built on a Retrieval-Augmented Generation (RAG) pipeline: user questions are embedded, matched against a vector database of coffee shops, and reasoned over by Claude to produce grounded, cited recommendations.

## Demo

> _Add a link to a hosted deployment (e.g. Vercel) or a short screen recording here._

```
🔗 Live demo: <add-url>
🎥 Video walkthrough: <add-url>
```

## Screenshots

> _Add screenshots of the chat UI (empty state, an answer with source cards, mobile view) here._

| Empty state | Answer with sources |
|---|---|
| `<screenshot>` | `<screenshot>` |

## Architecture

```
┌──────────────┐        POST /api/chat            ┌───────────────────┐
│   Chat UI     │ ───────────{ question }────────▶ │  Next.js Route     │
│ (React/Next)  │                                  │  Handler            │
└──────┬────────┘                                  └─────────┬──────────┘
       │ ◀────────────{ answer, sources }────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         services/chat.ts (orchestrator)               │
│                                                                        │
│  1. analyzeQuestion()   → detect preferences (quiet, wifi, outlets…) │
│  2. searchCoffeeShops() → embed question (OpenAI) → pgvector search  │
│  3. buildPrompt()       → stuff retrieved shops + preferences         │
│  4. askClaude()         → Anthropic Claude generates the answer       │
└──────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌───────────────────┐        vector similarity search
│  Supabase / pgvector │ ◀────────────────────────────
│  coffee_shop_chunks  │
└───────────────────┘
```

The app is a single Next.js (App Router) project — a client-side chat UI and server-side API route that share the same TypeScript codebase, with Supabase acting as the vector store.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Language | TypeScript |
| Embeddings | [OpenAI](https://platform.openai.com) `text-embedding-3-small` |
| Generation | [Anthropic Claude](https://www.anthropic.com) via `@anthropic-ai/sdk` |
| Vector store | [Supabase](https://supabase.com) (Postgres + `pgvector`) |
| Markdown rendering | `react-markdown` |
| Icons | `lucide-react` |

## AI Pipeline

The core flow lives in `services/`, orchestrated by `services/chat.ts`:

1. **Preference detection** (`analyzeQuestion.ts`) — a lightweight, deterministic regex-based scan of the question for signals like noise level, WiFi, outlets, remote-work fit, coffee quality, atmosphere, and neighborhood. No extra LLM call — keeps retrieval fast and predictable.
2. **Embedding** (`embeddings.ts`) — the question is embedded with OpenAI's `text-embedding-3-small` model.
3. **Retrieval** (`searchCoffeeShops.ts`) — the embedding is matched against `coffee_shop_chunks` in Supabase via the `match_coffee_shops` Postgres RPC, returning the top candidate coffee shops.
4. **Prompt construction** (`buildPrompt.ts`) — retrieved candidates and detected preferences are assembled into a single prompt instructing Claude to compare, rank, and justify recommendations using only the provided context (no hallucinated details).
5. **Generation** (`claude.ts`) — the prompt is sent to Claude, which returns a natural-language answer explaining *why* each shop fits.
6. **Response** — the answer and the structured source shops are returned to the client, where sources are rendered as cards (name, scores, notes, and a "View on Google Maps" link).

Ingestion (offline, via `/api/generate-embeddings`): each coffee shop record is turned into a natural-language description (`createCoffeeDescription.ts`), embedded, and stored in the vector table — using the same embedding model as query time to keep retrieval consistent.

## Features

- 💬 Conversational chat interface for discovering coffee shops
- 🧠 Retrieval-Augmented Generation grounded in real coffee shop data — no hallucinated recommendations
- 🎯 Automatic preference detection (quiet, WiFi, outlets, remote-work friendly, coffee quality, atmosphere, neighborhood)
- 📊 Source cards showing WiFi, noise, and outlet scores for every recommended shop
- 🗺️ One-click "Open in Google Maps" for any recommended shop
- ⚡ Optimistic UI updates with loading and error states
- 📱 Responsive, mobile-friendly design with Tailwind CSS

## Local Installation

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project with `pgvector` enabled, a `coffee_shops` table, a `coffee_shop_chunks` vector table, and a `match_coffee_shops` RPC
- An [OpenAI](https://platform.openai.com) API key (embeddings)
- An [Anthropic](https://console.anthropic.com) API key (generation)

### Setup

```bash
# 1. Clone and install dependencies
git clone <repo-url>
cd coffee-ai
npm install

# 2. Configure environment variables
cp .env.local.example .env.local  # or create .env.local manually
```

Populate `.env.local` with:

```bash
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

```bash
# 3. Seed embeddings for your coffee shop data (one-time)
# hits /api/generate-embeddings against a running dev server

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Future Improvements

- **Multi-turn memory** — pass conversation history to Claude for natural follow-up questions
- **Streaming responses** — stream Claude's answer token-by-token instead of waiting for the full response
- **Relevance thresholding** — filter out low-similarity matches instead of always returning a fixed number of results
- **Checked-in database schema** — version-controlled SQL migrations for tables and the retrieval RPC
- **Idempotent ingestion** — upsert embeddings instead of inserting duplicates on re-runs
- **Auth & rate limiting** — protect ingestion and chat endpoints from abuse
- **Prompt caching** — cache the static instruction portion of the prompt to reduce cost and latency
- **Automated testing** — unit tests for retrieval/prompt logic, integration tests for the chat API
- **Observability** — token usage and latency logging for the AI pipeline
