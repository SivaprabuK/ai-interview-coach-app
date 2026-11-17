from google import genai
from google.genai import types
from app.core.config import settings


class EmbeddingService:

    BATCH_SIZE = 50

    def __init__(self) -> None:
        if not settings.gemini_api_key:
            raise ValueError("GEMINI_API_KEY is not configured")

        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    def generate_embedding(self, text: str) -> list[float]:
        embeddings = self.generate_embeddings([text])
        return embeddings[0]

    def generate_embeddings(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if not texts:
            return []

        if any(not text.strip() for text in texts):
            raise ValueError("Texts cannot contain empty values")

        all_embeddings = []

        for start in range(0, len(texts), self.BATCH_SIZE):
            batch = texts[start:start + self.BATCH_SIZE]

            contents = [
                types.Content(
                    role="user",
                    parts=[
                        types.Part.from_text(text=text)
                    ],
                )
                for text in batch
            ]

            response = self.client.models.embed_content(
                model=settings.gemini_embedding_model,
                contents=contents,
                config=types.EmbedContentConfig(
                    output_dimensionality=settings.gemini_embedding_dimensions,
                ),
            )

            if not response.embeddings:
                raise RuntimeError("Gemini returned empty embeddings")

            if len(response.embeddings) != len(batch):
                raise RuntimeError(
                    "Mismatch between input texts and generated embeddings"
                )

            for item in response.embeddings:
                embedding = item.values

                if embedding is None:
                    raise RuntimeError(
                        "Gemini returned an empty embedding vector"
                    )

                if len(embedding) != settings.gemini_embedding_dimensions:
                    raise RuntimeError(
                        "Unexpected embedding dimensions"
                    )

                all_embeddings.append(embedding)

        return all_embeddings
