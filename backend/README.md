# Legal Tool Backend

Express backend for contract generation, analysis, risk detection, clause redlining, and document Q&A.

## 1) Setup

1. Copy `.env.example` to `.env`
2. Add your OpenRouter key:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
PORT=5001
# Optional strict CORS allowlist (comma-separated)
CORS_ORIGINS=https://your-app.vercel.app,https://your-app.netlify.app
```

3. Install dependencies:

```bash
npm install
```

4. Start server:

```bash
npm start
```

Server runs on `http://localhost:5001`.

### CORS behavior

- If `CORS_ORIGINS` is empty, all origins are allowed (easy setup).
- In production, set `CORS_ORIGINS` to your deployed frontend domains.
- Multiple origins must be comma-separated.

## 2) API Endpoints

- `POST /api/generate`
- `POST /api/analyze`
- `POST /api/risk`
- `POST /api/redline`
- `POST /api/ask`
- `GET /health`

## 3) Model Routing

Primary model: `minimax/minimax-m2.5:free`  
Fallback model: `mistralai/mistral-7b-instruct`

## 4) Example Requests

### Generate

```json
{
  "type": "NDA",
  "jurisdiction": "India",
  "details": "Two companies sharing confidential data"
}
```

### Analyze

```json
{
  "text": "full contract text"
}
```

### Risk

```json
{
  "text": "clause or contract text"
}
```

### Redline

```json
{
  "text": "original clause text"
}
```

### Ask

```json
{
  "text": "full contract text",
  "question": "What is the termination notice period?"
}
```
