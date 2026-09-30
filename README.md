# 🔍 StellarSearch — Pay-Per-Query Web Search for AI Agents

> **Stellar Hackathon 2026 · Agents on Stellar**
> Zero mock data. Real x402 payments. Real Serper.dev Search. Real Groq AI. Real Freighter wallet.

---

## What it is

StellarSearch is a pay-per-query web search API for autonomous AI agents. Every search costs **0.001 USDC**, settled on Stellar in ~5 seconds using the x402 protocol. No subscriptions, no API keys for the end user — agents pay per request and get real web search results back.

---

## Real stack (no mocks)

| Layer | Real package / service |
|---|---|
| Payment protocol | `@x402/express` + `@x402/stellar` + `@x402/core` |
| Blockchain | Stellar Testnet (via Horizon API) |
| Facilitator | OpenZeppelin x402 (`channels.openzeppelin.com`) |
| Wallet connect | `@stellar/freighter-api` (real Freighter extension) |
| Balances / tx | Stellar Horizon REST API (live, not mocked) |
| Search results | Serper.dev API (real Google search results) |
| AI assistant | `groq-sdk` · Llama 3.3 70B (real Groq API) |
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/StellarAgent-AI-Agent-Payment-Rails/Stellar-searchss.git
cd Stellar-searchss          # note: the directory is Stellar-searchss, not stellar-search

npm run setup                # recommended: npm install + copies .env.example → .env
```

Cloning your own fork instead? The URL is `git clone https://github.com/<your-username>/Stellar-searchss.git` — the directory is still `Stellar-searchss`.

`npm run setup` is a thin wrapper around [`scripts/setup.sh`](./scripts/setup.sh). It checks that Node is installed, runs `npm install`, and creates `.env` from `.env.example` if you don't already have one. It is safe to run again.

Prefer doing it by hand? The equivalent is two commands:

```bash
npm install
cp .env.example .env
```

### 2. Get your keys (all free)

| Key | Where to get it | Needed for |
|---|---|---|
| `SERPER_API_KEY` | [serper.dev](https://serper.dev/) — free tier: 2.5k queries/month | Search results — the only key you need to see the app working |
| `GROQ_API_KEY` | [console.groq.com/keys](https://console.groq.com/keys) — free | AI assistant and result summaries |
| `STELLAR_RECEIVING_ADDRESS` | [Stellar Lab](https://laboratory.stellar.org/#account-creator?network=test) — generate a testnet keypair | The paid `/search` route only |

No other key is required: the facilitator, network and port values in `.env.example` already have working testnet defaults.

> **Not touching the payment flow?** Set only `SERPER_API_KEY` and `GROQ_API_KEY` and skip `STELLAR_RECEIVING_ADDRESS` entirely — the server boots either way, every page renders, and the AI assistant works. Only the paid `/search` call needs the receiving address.

### 3. Configure

```bash
# Skip this if you ran `npm run setup` — it already created .env
cp .env.example .env
```

Then open `.env` and fill in the keys from step 2. Leave the remaining values at their defaults.

### 4. Install Freighter

Only needed if you are working on the payment flow. Install the [Freighter browser extension](https://freighter.app), create a testnet wallet, and fund it with USDC at [Stellar Lab](https://laboratory.stellar.org).

### 5. Run

One command starts both processes:

```bash
npm run dev:all     # backend :3001 + frontend :5173, via concurrently
```

Or run them in separate terminals to see each log stream on its own:

```bash
# Terminal 1 — backend
npm run server

# Terminal 2 — frontend
npm run dev
# → http://localhost:5173
```

### 6. Verify it works

```bash
# The server answers even with no keys configured
curl http://localhost:3001/health
# → {"status":"ok","network":"stellar:testnet",...}

# End-to-end check of the x402 gate (server must be running)
npm run test:search "Stellar blockchain"
```

`test:search` does not sign a payment, so it needs no wallet: it calls `/search`, prints the `HTTP 402 Payment Required` it gets back, and reports which keys the server has configured.

---

## npm scripts

Every script in `package.json`, and when to use it:

| Script | What it does |
|---|---|
| `npm run setup` | Installs dependencies and copies `.env.example` → `.env` (runs `scripts/setup.sh`). Run this first. |
| `npm run server` | Starts the Express + x402 backend on port 3001 with `tsx`. |
| `npm run dev` | Starts the Vite dev server for the frontend at http://localhost:5173, with HMR and a proxy to the backend. |
| `npm run dev:all` | Runs `server` and `dev` together in one terminal via `concurrently`. |
| `npm run build` | Typechecks with `tsc`, then builds the production bundle into `dist/`. |
| `npm run preview` | Serves the built `dist/` locally at http://localhost:4173. Run `npm run build` first. |
| `npm run test:search` | End-to-end check that the x402 payment gate is enforced on `/search`. Needs a running server. Default query is `"Stellar blockchain"`. |
| `npm run test:suggestions` | The same check with `--count 3`, for the search-suggestions path. |
| `npm run mcp` | Starts the MCP server over stdio for Claude Code and other MCP clients (`SEARCH_API_URL`, `GROQ_API_KEY`). |
| `npm run deploy` | `npm run build` followed by `vercel --prod`. Requires the Vercel CLI and a logged-in account. |

---

## How the x402 payment flow works

```
Browser (Freighter) → GET /search?q=...
                     ← HTTP 402 + payment requirements
                     → Sign Soroban auth entry (Freighter prompt)
                     → GET /search + X-Payment: <signature>
                     ← OpenZeppelin facilitator verifies + settles 0.001 USDC
                     ← 200 OK + Search results
```

1. Agent hits `/search` — the `@x402/express` middleware intercepts
2. Returns `HTTP 402 Payment Required` with price + network + payTo address
3. The x402 client signs a Soroban authorization entry via Freighter wallet
4. Retries with `X-Payment` header containing the signed entry
5. OpenZeppelin facilitator at `channels.openzeppelin.com/x402/testnet` verifies the signature and settles 0.001 USDC on Stellar testnet
6. Server receives confirmation and returns search results

---

## Project structure

```
Stellar-searchss/
├── src/                             # React 18 frontend (TypeScript)
│   ├── components/
│   │   ├── ai/GroqAssistant.tsx          # Real Groq AI chat panel
│   │   ├── layout/                       # Navbar, Footer, LiveTicker, AnimatedBackground
│   │   ├── search/                       # SearchBar, SearchResults, SearchSuggestions,
│   │   │                                 #   PaymentFlowVisualizer
│   │   ├── ui/                           # StatsGrid (polls /health), ZeroBalanceBanner
│   │   ├── wallet/WalletPanel.tsx        # Real Freighter connect + live balances
│   │   └── index.ts                      # Barrel export for all components
│   ├── hooks/
│   │   ├── useFreighterWallet.ts         # Real Freighter + Horizon integration
│   │   └── useSearch.ts                  # Calls real server endpoint
│   ├── lib/
│   │   ├── stellar.ts                    # Horizon helpers
│   │   └── constants.ts                  # Network, USDC amounts, addresses
│   ├── pages/
│   │   ├── SearchPage.tsx
│   │   ├── DocsPage.tsx
│   │   └── DashboardPage.tsx             # Live Horizon tx history
│   ├── types/index.ts                    # Shared types
│   ├── App.tsx
│   └── main.tsx
├── server/
│   ├── index.ts                     # Express + @x402/express + Serper.dev + Groq
│   ├── corsConfig.ts                # Origin allow-list
│   └── logger.ts                    # Winston logger
├── api/                             # Vercel serverless equivalents of the server routes
│   ├── index.ts
│   ├── search.ts
│   ├── health.ts
│   └── ai/chat.ts
├── mcp-server/
│   └── index.ts                     # MCP tools: web_search, ai_summarize, check_balance
├── scripts/
│   ├── setup.sh                     # Backs `npm run setup`
│   └── test-search.ts               # End-to-end x402 test script
├── .env.example
├── claude_mcp.json
├── CONTRIBUTING.md
├── TROUBLESHOOTING.md
└── README.md
```

---

## Claude Code / MCP integration

```json
// claude_mcp.json
{
  "mcpServers": {
    "stellar-search": {
      "command": "npx",
      "args": ["tsx", "./mcp-server/index.ts"],
      "env": {
        "GROQ_API_KEY": "your_groq_api_key",
        "SEARCH_API_URL": "http://localhost:3001"
      }
    }
  }
}
```

`claude_mcp.json` is checked in — point it at your own keys, or run the server yourself with `npm run mcp`. Then tell Claude Code: `"Search for the latest Stellar x402 examples"` — it calls `web_search`, the server pays via x402, and Claude gets real results.

---

## Hackathon requirements

| Requirement | ✓ |
|---|---|
| Open-source repo + README | ✅ |
| 2–3 min video demo | Record showing: connect Freighter → search → see 402 → payment settles → results |
| Real Stellar testnet transactions | ✅ Every search settles 0.001 USDC via OpenZeppelin facilitator |
| x402 protocol | ✅ `@x402/express` + `@x402/stellar` |
| Addresses explicit demand signal | ✅ "pay-per-query web search instead of monthly subscriptions" |
