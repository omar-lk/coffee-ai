# Coffee AI — Project Analysis

A RAG (Retrieval-Augmented Generation) app that answers natural-language questions
about coffee shops in Marrakech. Stack: **Next.js 16 (App Router) + React 19 +
Supabase/pgvector + OpenAI embeddings + Anthropic (Claude) generation + Tailwind v4**.

> Status: analysis only. No source files were changed. Awaiting approval before any
> implementation.

---

## 1. Current Architecture

### 1.1 Folder structure

```
coffee-ai/
├─ app/                          # Next.js App Router
│  ├─ layout.tsx                 # Root layout (Geist fonts; metadata still "Create Next App")
│  ├─ page.tsx                   # Home → renders <Chat/>
│  ├─ globals.css                # Tailwind v4 styles
│  └─ api/                       # Route handlers (server)
│     ├─ chat/route.ts           # ★ POST — main RAG endpoint
│     ├─ generate-embeddings/route.ts  # GET — builds & stores embeddings
│     ├─ search-test/route.ts    # GET — debug: semantic search only
│     ├─ embedding-test/route.ts # GET — debug: embed one string
│     ├─ claude-test/route.ts    # GET — debug: raw Claude call  ⚠ BROKEN
│     └─ test/route.ts           # GET — debug: dump coffee_shops table
├─ components/                   # All "use client"
│  ├─ Chat.tsx                   # State + fetch orchestration
│  ├─ ChatInput.tsx              # Input box + send button
│  ├─ MessageList.tsx            # Maps messages → <Message/>
│  ├─ Message.tsx                # Renders markdown + source cards
│  └─ CoffeeCard.tsx             # One coffee-shop source card
├─ services/                     # Server-side business logic
│  ├─ chat.ts                    # Orchestrates search → prompt → Claude
│  ├─ searchCoffeeShops.ts       # Embed query + pgvector RPC
│  ├─ buildPrompt.ts             # Assembles the RAG prompt
│  ├─ claude.ts                  # Anthropic client + askClaude()
│  ├─ embeddings.ts              # OpenAI client + generateEmbedding()
│  ├─ createCoffeeDescription.ts # Shop row → rich text for embedding
│  ├─ rag.ts                     # ⚠ EMPTY (0 bytes)
│  └─ retrieval.ts               # ⚠ EMPTY (0 bytes)
├─ lib/
│  └─ supabase.ts                # Supabase client (anon key)
├─ scripts/
│  └─ generateEmbeddings.ts      # ⚠ Misnamed — only SELECTs, never generates
├─ types/
│  ├─ chat.ts                    # Message + CoffeeShop (variant A)
│  └─ coffee-shop.ts             # CoffeeShop (variant B) — conflicts with A
├─ data/
│  └─ coffee-shops.json          # ⚠ EMPTY (0 bytes)
├─ .env.local                    # ANTHROPIC_MODEL, ANTHROPIC_API_KEY,
│                                #   NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, OPENAI_API_KEY
├─ AGENTS.md / CLAUDE.md         # "This is NOT the Next.js you know" — read node_modules/next docs
└─ next.config.ts, tsconfig.json, eslint.config.mjs, postcss.config.mjs
```

**Not in the repo (lives in Supabase):** the `coffee_shops` table, the
`coffee_shop_chunks` pgvector table, and the `match_coffee_shops` SQL RPC. There is
no SQL/migration file checked in.

### 1.2 Data flow (end to end)

```
User types question
   → Chat.tsx: optimistic user message, POST /api/chat { question }
      → app/api/chat/route.ts (validates question present)
         → services/chat.ts
            → searchCoffeeShops(question)
                 → generateEmbedding(question)      [OpenAI text-embedding-3-small]
                 → supabase.rpc('match_coffee_shops', { query_embedding, match_count: 5, similarity_threshold: 0 })
            → buildPrompt(question, sources)         [stuffs context + rules]
            → askClaude(prompt)                      [Anthropic messages.create]
         ← { answer, sources }
   ← Chat.tsx appends assistant message { content: answer, sources }
      → Message.tsx renders markdown (react-markdown) + CoffeeCard per source
```

### 1.3 API flow

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Production RAG endpoint. Body `{ question }` → `{ answer, sources }`. |
| `/api/generate-embeddings` | GET | Reads all `coffee_shops`, builds a description, embeds it, inserts into `coffee_shop_chunks`. One-shot ingestion. |
| `/api/search-test` | GET | Hard-coded query → raw RPC results. Debug only. |
| `/api/embedding-test` | GET | Embeds one fixed string, returns dimension + first 10 values. Debug only. |
| `/api/claude-test` | GET | Raw Claude "say hello". **Broken** (see Bugs). Debug only. |
| `/api/test` | GET | Dumps entire `coffee_shops` table. Debug only. |

### 1.4 How embeddings work

- `createCoffeeDescription(shop)` turns a DB row into a natural-language blurb
  (name, neighborhood, address, wifi/noise/outlet scores, notes, use-cases).
- `generateEmbedding(text)` calls OpenAI `text-embedding-3-small` and returns the
  raw vector (`response.data[0].embedding`) — **1536 dimensions**.
- `/api/generate-embeddings` loops every shop → description → embedding → `insert`
  into `coffee_shop_chunks { coffee_shop_id, content, embedding }`.
- The pgvector column dimension must be **1536** to match the model (schema is
  external — unverified in-repo).

### 1.5 How semantic search works

- `searchCoffeeShops(question)` embeds the user's question with the **same** model,
  then calls the Postgres RPC `match_coffee_shops(query_embedding, match_count=5,
  similarity_threshold=0)`.
- The RPC (defined in Supabase, not in repo) does the cosine/inner-product search
  over `coffee_shop_chunks.embedding` and returns the top 5. `similarity_threshold:
  0` means **no relevance filtering** — it always returns 5 rows.
- Return value is untyped (`rpc` returns `any`), so downstream typing is not enforced.

### 1.6 How Claude is called

- `services/claude.ts` constructs `new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })`.
- `askClaude(prompt)` → `anthropic.messages.create({ model: process.env.ANTHROPIC_MODEL, max_tokens: 1200, messages: [{ role: 'user', content: prompt }] })`.
- The response is flattened by filtering `type === 'text'` blocks and joining their
  `.text`. Non-streaming, single-shot, no system prompt (all instructions are in the
  user-turn prompt), no conversation history, no `thinking`/`effort` config.

---

## 2. Strengths

- **Clean separation of concerns.** `services/` isolates search, prompt-building,
  embedding, and generation; routes stay thin; `chat.ts` reads as a clear 3-step
  pipeline. Easy to test and extend.
- **Correct RAG shape.** Same embedding model for ingestion and query; context is
  stuffed with an explicit "only answer from context / say you don't know" guardrail,
  which reduces hallucination.
- **Good UX scaffolding.** Optimistic user message, loading state, markdown rendering,
  and source cards give a real chat feel with provenance.
- **Sensible model/provider split.** OpenAI for embeddings (cheap, strong) + Anthropic
  for generation is a reasonable, standard division.
- **Config via env**, not hardcoded keys; TypeScript strict mode on; path alias `@/*`.

---

## 3. Weaknesses

- **Two conflicting `CoffeeShop` types.** `types/chat.ts` (has `coffee_shop_id`,
  `similarity`, non-null scores) vs `types/coffee-shop.ts` (nullable scores, no
  similarity). `CoffeeCard` imports the former, `createCoffeeDescription` the latter.
  Divergence waiting to bite.
- **Untyped retrieval boundary.** `supabase.rpc(...)` returns `any`; `buildPrompt`
  declares a `{content, similarity}[]` param but nothing guarantees the RPC actually
  returns the shape `CoffeeCard` needs (`name`, `neighborhood`, `wifi_score`, …). If
  the RPC returns only chunk `content`+`similarity`, the source cards render blank.
  **Unverified — the RPC body isn't in the repo.**
- **Stateless conversation.** The UI keeps `messages[]` but the API ignores history;
  `buildPrompt` only sees the current question. Follow-ups ("what about the first
  one?") lose all context.
- **No relevance gate.** `similarity_threshold: 0` always returns 5 shops, so 5 source
  cards appear even for off-topic questions.
- **Misleading error handling.** `/api/chat` catches *everything* (Supabase down,
  OpenAI/Claude failure, JSON parse error) and returns `400 "Invalid request body"`.
  Real failures are indistinguishable from bad input.
- **Fragile client error path.** `Chat.tsx` never checks `res.ok`; on failure it
  appends an assistant message with `content: undefined` and no user-facing error.
- **No streaming.** Users wait for the full Claude response (`max_tokens: 1200`) with
  only a `...` button.
- **Dead/placeholder files.** `services/rag.ts`, `services/retrieval.ts`, and
  `data/coffee-shops.json` are empty; `scripts/generateEmbeddings.ts` is misnamed (it
  only SELECTs, it doesn't generate).
- **Unauthenticated, non-idempotent ingestion.** `/api/generate-embeddings` is a
  public GET with no auth and `insert` (not upsert) — every call duplicates rows and
  spends OpenAI credits. Same for the other debug GETs shipping in the app.
- **Env assumed, never validated.** Non-null assertions (`!`) on every env var —
  missing config crashes at runtime with an opaque error.
- **Boilerplate leftovers.** `layout.tsx` metadata still says "Create Next App".

---

## 4. Missing Features

- **Multi-turn memory** — pass prior turns to Claude (and a system prompt).
- **Streaming responses** — token-by-token UI via `messages.stream()`.
- **Checked-in DB schema** — SQL migration for `coffee_shops`, `coffee_shop_chunks`
  (with the correct 1536-dim vector column + index), and the `match_coffee_shops`
  RPC. Right now the app can't be reproduced from the repo.
- **Seed pipeline** — `data/coffee-shops.json` is empty; there's no documented path
  from raw data → `coffee_shops` table.
- **Idempotent re-embedding** — upsert keyed on `coffee_shop_id`; skip unchanged rows.
- **Auth + rate limiting** on all routes; remove or gate debug endpoints for prod.
- **Relevance threshold + graceful "no matches"** handling.
- **Prompt caching** for the static instruction block (cost/latency win).
- **Proper error/empty/loading states + retry** in the UI.
- **Tests** (unit for services, integration for `/api/chat`) — none exist.
- **Observability** — token usage / latency logging.

---

## 5. Bugs Found

1. **`/api/claude-test` won't compile/run — bad import.**
   It does `import { anthropic } from '@/services/claude'`, but `claude.ts` only
   exports `askClaude`; `anthropic` is a private const. This route throws on load.
   *(`app/api/claude-test/route.ts:1`, `services/claude.ts:3`)*

2. **`/api/claude-test` uses an invalid model ID.**
   It hardcodes `model: 'claude-sonnet-5'`, which is not a real Anthropic model ID and
   returns a **404 `not_found_error`**. Current valid IDs include `claude-opus-4-8`,
   `claude-sonnet-4-6`, `claude-haiku-4-5` (verified against the bundled Claude API
   reference). The production path (`services/claude.ts`) instead reads
   `process.env.ANTHROPIC_MODEL` — **confirm that env value is a valid current model
   ID**, or `/api/chat` fails the same way.
   *(`app/api/claude-test/route.ts:5`)*

3. **Conflicting `CoffeeShop` types** (see §3) — a latent type-safety bug; whichever
   shape the RPC actually returns, one of the two consumers is mistyped.

4. **`/api/chat` misclassifies all errors as `400 "Invalid request body"`** (see §3) —
   a correctness/observability bug, not just style.

5. **Client ignores `res.ok`** — failed requests produce an assistant bubble with
   `undefined` content. *(`components/Chat.tsx:41-51`)*

6. **`generate-embeddings` inserts duplicates on every call** (no upsert / no
   pre-clear) — data-integrity bug that also inflates search results.
   *(`app/api/generate-embeddings/route.ts:33-40`)*

7. **Potential blank source cards** — if `match_coffee_shops` doesn't return the full
   shop columns, `CoffeeCard` renders empty fields. Needs verification against the
   live RPC definition.

---

## 6. Exact Implementation Roadmap

Ordered by dependency; each step is independently reviewable. **Not yet implemented —
awaiting approval.** Per `AGENTS.md`, any Next.js code will be written only after
reading the relevant guide in `node_modules/next/dist/docs/` (Next 16 has breaking
changes vs. training data).

### Phase 0 — Correctness & hygiene (fast, low-risk)
1. Fix `/api/claude-test`: export `anthropic` from `claude.ts` (or call `askClaude`),
   and replace `'claude-sonnet-5'` with a valid model ID / `process.env.ANTHROPIC_MODEL`.
2. Verify `ANTHROPIC_MODEL` in `.env.local` is a current, valid model ID.
3. Unify the two `CoffeeShop` types into one source of truth (`types/coffee-shop.ts`),
   re-point all imports.
4. Fix `/api/chat` error handling: 400 only for missing/invalid body; 500 (with a
   logged cause) for downstream failures.
5. Handle `!res.ok` in `Chat.tsx`; show an inline error bubble + allow retry.
6. Update `layout.tsx` metadata (title/description).
7. Delete or implement the empty `services/rag.ts`, `services/retrieval.ts`, and
   `data/coffee-shops.json`; rename/repurpose `scripts/generateEmbeddings.ts`.

### Phase 1 — Data layer reproducibility
8. Add checked-in SQL: `coffee_shops`, `coffee_shop_chunks` (vector(1536) + ivfflat/hnsw
   index), and the `match_coffee_shops` RPC. Confirm the RPC returns the shop columns
   `CoffeeCard` needs (join `coffee_shop_chunks → coffee_shops`).
9. Add env validation at startup (fail fast with a clear message).
10. Make ingestion idempotent: upsert on `coffee_shop_id` (or clear-then-insert);
    gate the endpoint behind a secret/admin check.

### Phase 2 — Retrieval quality
11. Raise `similarity_threshold` above 0 (tune) and handle the "no relevant matches"
    case explicitly in `buildPrompt` and the UI.
12. Only render source cards whose similarity clears the threshold.

### Phase 3 — Claude call quality
13. Move the instruction block into a proper `system` prompt; keep only the retrieved
    context + question in the user turn. Add prompt caching on the static prefix.
14. Add streaming (`messages.stream()`) end-to-end; stream tokens to the UI.
15. Pass conversation history for multi-turn follow-ups.

### Phase 4 — Hardening
16. Rate limiting + auth on all routes; strip/guard debug endpoints for production.
17. Tests: unit for each `services/*`, integration for `/api/chat` (happy path +
    error path + empty-results path).
18. Token-usage / latency logging.

---

**Awaiting your approval before implementing any of the above.**
