# 🤖 AI Compiler Platform

A multi-stage AI pipeline that converts natural language app descriptions into structured, validated, executable application schemas — like a compiler, but for software generation.

> **Reference inspiration:** [base44.com](https://base44.com)

---

## 🎯 What It Does

You type:

```
Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments. Admins can see analytics.
```

The system outputs a complete, validated JSON schema including:

- 🗄️ **Database schema** — tables, columns, types, foreign keys
- 🔌 **API schema** — endpoints, methods, auth requirements, payload validation
- 🖥️ **UI schema** — pages, routes, components, connected endpoints
- 🔐 **Auth schema** — roles, permissions per role

---

## 🏗️ Architecture

```
User Prompt
     │
     ▼
┌──────────────────────────────────────┐
│           4-Stage Pipeline           │
├──────────────────────────────────────┤
│  Stage 1 │ Intent Extraction         │
│          │ features, roles, entities  │
├──────────────────────────────────────┤
│  Stage 2 │ System Design             │
│          │ pages, endpoints, flows    │
├──────────────────────────────────────┤
│  Stage 3 │ Schema Generation         │
│          │ DB + API + UI + Auth       │
├──────────────────────────────────────┤
│  Stage 4 │ Refinement                │
│          │ cross-layer consistency    │
└──────────────────────────────────────┘
     │
     ▼
Validated JSON Output
```

Each stage feeds into the next. No single-prompt generation — this is a deliberate compiler-style pipeline.

---

## 📁 Project Structure

```
ai-compiler-platform/
├── backend/
│   ├── src/
│   │   ├── index.js                   # Express server entry point
│   │   ├── controllers/
│   │   │   └── compilerController.js  # Request handler
│   │   ├── routes/
│   │   │   └── compilerRoutes.js      # POST /api/compile
│   │   ├── services/
│   │   │   └── llmEngine.js           # 4-stage pipeline + retry/repair
│   │   ├── models/
│   │   │   └── schemaContracts.js     # Zod validation contracts
│   │   └── prompts/
│   │       └── systemPrompts.js       # Stage-specific LLM prompts
│   ├── .env                           # GEMINI_API_KEY goes here
│   └── package.json
├── frontend/
│   └── app/
│       └── page.tsx                   # Next.js UI
├── database/
│   └── init.sql
└── docker-compose.yml
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-compiler-platform.git
cd ai-compiler-platform
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:

```env
GEMINI_API_KEY=AIza...your_key_here
PORT=8080
```

Start the backend:

```bash
node src/index.js
```

Expected output:

```
GEMINI_API_KEY loaded: true
🚀 Backend running on port 8080
```

### 3. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open your browser at **http://localhost:3000**

---

## 🧪 API Usage

### Endpoint

```
POST http://localhost:8080/api/compile
Content-Type: application/json
```

### Request body

```json
{
  "prompt": "Build a CRM with login, contacts, dashboard, role-based access, and premium plan with payments."
}
```

### Response structure

```json
{
  "status": "success",
  "metrics": {
    "stages": {
      "intent": 1807,
      "systemDesign": 1958,
      "draftSchema": 3248,
      "finalSchema": 3776
    },
    "totalMs": 10790
  },
  "stages": {
    "intent": { "appName": "...", "features": [], "roles": [], "entities": [] },
    "systemDesign": { "pages": [], "apiEndpoints": [], "entities": [] },
    "draftSchema": { "ui": {}, "api": {}, "database": {}, "auth": {} }
  },
  "finalOutput": {
    "database": { "tables": [] },
    "api": { "endpoints": [] },
    "ui": { "pages": [] },
    "auth": { "roles": [], "permissions": [] }
  }
}
```

### PowerShell test

```powershell
Invoke-RestMethod -Uri "http://localhost:8080/api/compile" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"prompt": "Build a todo app with user login and team collaboration"}' `
| ConvertTo-Json -Depth 20
```

---

## 🔧 Key Design Decisions

### Why multi-stage?

A single prompt cannot reliably produce a consistent 4-layer schema. Breaking it into stages:

- Reduces hallucination — each stage has a narrow, well-defined task
- Enables targeted repair — if one stage fails, only that stage retries
- Mirrors how real compilers work: lex → parse → analyze → generate

### Validation + Repair Engine

Each stage validates required keys before accepting output:

| Stage | Required Keys |
|---|---|
| `intent` | `features`, `roles`, `entities` |
| `systemDesign` | `pages`, `apiEndpoints`, `entities` |
| `draftSchema` | `ui`, `api`, `database`, `auth` |
| `finalSchema` | `ui`, `api`, `database`, `auth` |

If validation fails, the system:

1. Attempts JSON repair (strips markdown fences, extracts valid JSON)
2. Retries up to **3 times** with exponential backoff (1.5s → 3s → 4.5s)
3. Returns a specific error identifying which stage and keys failed

### Determinism

- Temperature set to `0.1` across all stages
- Prompts include explicit JSON structure templates
- `responseMimeType: "application/json"` enforced at the API level

---

## 📊 Evaluation Metrics

The pipeline returns per-stage latency in every response:

| Metric | Description |
|---|---|
| `metrics.stages.intent` | Intent extraction time (ms) |
| `metrics.stages.systemDesign` | System design time (ms) |
| `metrics.stages.draftSchema` | Schema generation time (ms) |
| `metrics.stages.finalSchema` | Refinement time (ms) |
| `metrics.totalMs` | Total end-to-end latency (ms) |

Typical performance: **8–12 seconds** end-to-end.

---

## ⚠️ Failure Handling

| Failure Type | Behavior |
|---|---|
| Invalid JSON from LLM | Automatic repair attempted |
| Missing required keys | Targeted retry of that stage only |
| All retries exhausted | 500 error with stage + key details |
| Empty prompt | 400 error returned immediately |
| Invalid API key | 500 error with clear message |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| LLM | Google Gemini 1.5 Flash |
| Validation | Zod |
| Frontend | Next.js 16, TypeScript |
| Containerization | Docker + Docker Compose |

---

## 🔑 Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ Yes | Your Google Gemini API key |
| `PORT` | No | Backend port (default: `8080`) |

---

## 📝 License

MIT
