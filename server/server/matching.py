import numpy as np

from .embeddings import compute_embeddings
from .models import MatchEntry


def find_matches(
    field_descriptions: list[str],
    user_data_keys: list[str],
    threshold: float = 0.35,
) -> list[MatchEntry]:
    """Match form field descriptions to user data keys via embedding similarity.

    Computes embeddings for both sets, builds a similarity matrix via dot product
    (embeddings are pre-normalized), and returns the best match per field if it
    exceeds the threshold.
    """
    if not field_descriptions or not user_data_keys:
        return []

    field_embeddings = compute_embeddings(field_descriptions)
    key_embeddings = compute_embeddings(user_data_keys)

    # Similarity matrix: (num_fields, num_keys)
    # Since embeddings are L2-normalized, dot product == cosine similarity
    similarity = np.dot(field_embeddings, key_embeddings.T)

    matches: list[MatchEntry] = []
    for i, desc in enumerate(field_descriptions):
        best_j = int(np.argmax(similarity[i]))
        score = float(similarity[i, best_j])
        if score >= threshold:
            matches.append(
                MatchEntry(
                    field_index=i,
                    field_description=desc,
                    matched_key=user_data_keys[best_j],
                    score=round(score, 4),
                )
            )

    return matches
