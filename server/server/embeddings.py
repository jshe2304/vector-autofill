from functools import lru_cache

import numpy as np
from numpy.typing import NDArray
from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """Load and cache the sentence transformer model."""
    return SentenceTransformer(MODEL_NAME)


def compute_embeddings(texts: list[str]) -> NDArray[np.float32]:
    """Compute normalized embeddings for a list of texts.

    Returns an (N, D) array of L2-normalized vectors so that
    cosine similarity can be computed via dot product.
    """
    model = get_model()
    embeddings: NDArray[np.float32] = model.encode(
        texts, normalize_embeddings=True, convert_to_numpy=True
    )
    return embeddings
