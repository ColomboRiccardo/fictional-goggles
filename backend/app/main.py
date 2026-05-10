from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routes import health, portfolio, stocks
from app.seed import seed_portfolio


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        seed_portfolio()
    except Exception as exc:
        print(f"Warning: portfolio seed failed (app will still start): {exc}")
    yield


app = FastAPI(
    title="Fictional Goggles API",
    description="Stock portfolio API for Fictional Goggles — FastAPI and Google Cloud Firestore",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(stocks.router, prefix="/api")
