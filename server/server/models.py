from pydantic import BaseModel


class EmbedRequest(BaseModel):
    """Request body for /embed endpoint."""

    texts: list[str]


class EmbedResponse(BaseModel):
    """Response body for /embed endpoint."""

    embeddings: list[list[float]]


class MatchRequest(BaseModel):
    """Request body for /match endpoint.

    field_descriptions: text descriptions extracted from form fields
    user_data_keys: keys from the user's stored data (e.g. "first name", "email")
    threshold: minimum similarity score to consider a match (0-1)
    """

    field_descriptions: list[str]
    user_data_keys: list[str]
    threshold: float = 0.35


class MatchEntry(BaseModel):
    """A single field-to-key match."""

    field_index: int
    field_description: str
    matched_key: str
    score: float


class MatchResponse(BaseModel):
    """Response body for /match endpoint."""

    matches: list[MatchEntry]
