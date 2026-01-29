from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .embeddings import get_model, compute_embeddings
from .matching import find_matches
from .models import EmbedRequest, EmbedResponse, MatchRequest, MatchResponse


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Pre-load the embedding model on startup."""
    get_model()
    yield


app = FastAPI(title="Vector Autofill Server", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_origins=["http://127.0.0.1:8766"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/embed", response_model=EmbedResponse)
async def embed(req: EmbedRequest) -> EmbedResponse:
    embeddings = compute_embeddings(req.texts)
    return EmbedResponse(embeddings=embeddings.tolist())


@app.post("/match", response_model=MatchResponse)
async def match(req: MatchRequest) -> MatchResponse:
    matches = find_matches(req.field_descriptions, req.user_data_keys, req.threshold)
    return MatchResponse(matches=matches)
