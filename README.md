# Fictional Goggles

A demo stock portfolio dashboard built to showcase **React**, **Python**, and **Google Cloud**. View live market data, portfolio performance, allocation charts, candlesticks, and news — all from a seeded demo portfolio.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts |
| Backend | Python, FastAPI, Pydantic, yfinance |
| Database | Google Cloud Firestore (holdings + quote cache) |
| Deploy | Cloud Run, Artifact Registry, Cloud Build |

## Architecture

```
Browser (React SPA)
    │
    ├── Cloud Run (Frontend) ── nginx + static build
    │
    └── Cloud Run (Backend) ── FastAPI
            │
            ├── Firestore (holdings + quote cache)
            └── Yahoo Finance (via yfinance)
```

## Demo Portfolio

Pre-seeded holdings:

| Symbol | Shares | Avg Cost |
|--------|--------|----------|
| AAPL   | 10     | $150.00  |
| MSFT   | 5      | $380.00  |
| GOOGL  | 8      | $140.00  |
| NVDA   | 3      | $450.00  |
| AMZN   | 4      | $175.00  |

## Local Development

### Prerequisites

- Node.js 20+
- Python 3.12+
- Docker & Docker Compose (recommended)

### Option 1: Docker Compose (recommended)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs
- Firestore emulator: localhost:8080

The backend auto-seeds the demo portfolio on first startup.

### Option 2: Run services individually

See `.env.example` for required environment variables.

## GCP Deployment

There is **no automatic Git connection** by default. You deploy by running `gcloud` commands **from your laptop**, inside this repo. Those commands upload your local code to Google Cloud Build, which builds Docker images and stores them in Artifact Registry. Cloud Run then runs those images.

```
Your laptop (this repo)
    │  gcloud builds submit
    ▼
Cloud Build  ──builds──▶  Docker image  ──pushes──▶  Artifact Registry
                                                          │
                                                          ▼
                                                    Cloud Run (runs the image)
                                                          │
                                                          ▼
                                                    Firestore
```

Replace `YOUR_PROJECT_ID` with your actual GCP project ID everywhere below.

### 1. Create a GCP project

```bash
gcloud projects create YOUR_PROJECT_ID
gcloud config set project YOUR_PROJECT_ID
```

If you already created a project in the console, just run `gcloud config set project YOUR_PROJECT_ID`.

### 2. Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  firestore.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com
```

### 3. Create Firestore database (required)

Without this step, the backend will crash on startup when it tries to seed holdings.

```bash
gcloud firestore databases create --location=us-central1
```

Verify it exists:

```bash
gcloud firestore databases list
```

### 4. Create Artifact Registry repository

This step only creates **empty storage** for Docker images. Your code is not uploaded yet.

```bash
gcloud artifacts repositories create fictional-goggles \
  --repository-format=docker \
  --location=us-central1

gcloud auth configure-docker us-central1-docker.pkg.dev
```

> If you already created a repo named `portfolio`, you can keep using it — just substitute that name in the image URLs below.

### 4b. Grant Cloud Run access to Firestore

Cloud Run uses a service account that needs permission to read/write Firestore:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/datastore.user"
```

Find your project number: `gcloud projects describe YOUR_PROJECT_ID --format='value(projectNumber)'`

### 5. Deploy the backend (this uploads your code)

Open a terminal **in this repo** on your machine:

```bash
cd backend

gcloud builds submit \
  --tag us-central1-docker.pkg.dev/YOUR_PROJECT_ID/fictional-goggles/fictional-goggles-backend
```

What happens:
1. The `backend/` folder is zipped and sent to Cloud Build
2. Cloud Build runs your `Dockerfile` and creates an image
3. The image is pushed to Artifact Registry

Then deploy it to Cloud Run:

```bash
gcloud run deploy fictional-goggles-backend \
  --image us-central1-docker.pkg.dev/YOUR_PROJECT_ID/fictional-goggles/fictional-goggles-backend \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID,CORS_ORIGINS=http://localhost:5173"
```

**Save the backend URL** from the output, e.g. `https://fictional-goggles-backend-xxxxx-uc.a.run.app`

Test it:

```bash
curl https://YOUR_BACKEND_URL/api/health
```

The backend auto-seeds Firestore on first request. You do **not** need a separate seed step unless you prefer running `python -m app.seed` locally with prod credentials.

### 6. Deploy the frontend

The frontend must be built with your backend URL baked in (`VITE_API_URL`).

**From your laptop:**

```bash
cd frontend

docker build --platform linux/amd64 \
  --build-arg VITE_API_URL=https://fictional-goggles-backend-hujrtrjbkq-uc.a.run.app \
  -t us-central1-docker.pkg.dev/fictional-goggles-499215/fictional-goggles/fictional-goggles-frontend .

docker push us-central1-docker.pkg.dev/fictional-goggles-499215/fictional-goggles/fictional-goggles-frontend

gcloud run deploy fictional-goggles-frontend \
  --image us-central1-docker.pkg.dev/fictional-goggles-499215/fictional-goggles/fictional-goggles-frontend \
  --region us-central1 \
  --allow-unauthenticated
```

**Save the frontend URL**, e.g. `https://fictional-goggles-frontend-xxxxx-uc.a.run.app`

> `gcloud builds submit` alone does not pass `VITE_API_URL` to the frontend build. Use `docker build --build-arg` as above, or use `cloudbuild.yaml`.

### 7. Update CORS on the backend

```bash
gcloud run services update fictional-goggles-backend \
  --region us-central1 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=fictional-goggles-499215,CORS_ORIGINS=https://fictional-goggles-frontend-hujrtrjbkq-uc.a.run.app"
```

### 8. Open the app

Visit `https://YOUR_FRONTEND_URL` — you should see the Fictional Goggles dashboard with live data.

### Optional: connect GitHub for future deploys

If you want pushes to auto-deploy (instead of running `gcloud` locally):

1. Push this repo to GitHub
2. In GCP Console → **Cloud Build** → **Triggers** → connect your repo
3. Create a trigger on push to `main` using `cloudbuild.yaml`

### Optional: one-shot deploy via Cloud Build

Edit `cloudbuild.yaml` substitutions (`_BACKEND_URL`, `_FRONTEND_URL`) after the first backend deploy, then from the repo root:

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Project Structure

```
├── frontend/           # React SPA
├── backend/            # FastAPI service
├── docker-compose.yml  # local dev
├── cloudbuild.yaml     # optional CI/CD
└── README.md
```

## License

Demo project for portfolio purposes. Not financial advice.
