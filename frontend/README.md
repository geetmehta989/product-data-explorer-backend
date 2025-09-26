## NL2SQL Frontend (React + Vite + TS)

### Dev

```bash
cd frontend
cp .env.example .env # edit VITE_API_BASE_URL if needed
npm i
npm run dev
```

Open http://localhost:5173

### Build

```bash
npm run build && npm run preview
```

### Deploy (Vercel)

- Import this folder into Vercel as a project
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL` pointing to your FastAPI URL (Render/Heroku)

### Backend Deploy Notes

- Render: Deploy the FastAPI app from `/workspace` with `uvicorn app.main:app --port $PORT --host 0.0.0.0`
- Heroku: Procfile `web: uvicorn app.main:app --host 0.0.0.0 --port $PORT`
