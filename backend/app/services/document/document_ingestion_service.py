from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk
from app.services.ai.chunking_service import ChunkingService
from app.services.ai.embedding_service import EmbeddingService
from app.services.document.document_extraction_service import (
    DocumentExtractionService,
)


class DocumentIngestionService:

    def __init__(self) -> None:
        self.extraction_service = DocumentExtractionService()
        self.chunking_service = ChunkingService()
        self.embedding_service = EmbeddingService()

    def ingest_document(
        self,
        db: Session,
        document: Document,
    ) -> Document:

        try:
            document.status = "processing"
            db.commit()

            extracted_text = self.extraction_service.extract_text(
                document.file_path
            )

            if not extracted_text.strip():
                raise ValueError("No text could be extracted from the document")

            chunks = self.chunking_service.split_text(extracted_text)

            if not chunks:
                raise ValueError("No chunks were generated from the document")

            chunk_records = []

            embeddings = self.embedding_service.generate_embeddings(chunks)

            if len(embeddings) != len(chunks):
                raise RuntimeError("Embedding count does not match chunk count")

            chunk_records = [
                DocumentChunk(
                    document_id=document.id,
                    chunk_index=index,
                    content=chunk,
                    embedding=embedding,
                    chunk_metadata={
                        "filename": document.filename,
                        "chunk_length": len(chunk),
                    },
                )
                for index, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            ]   

            db.query(DocumentChunk).filter(
                DocumentChunk.document_id == document.id
            ).delete(synchronize_session=False)

            db.add_all(chunk_records)

            document.status = "processed"

            db.commit()
            db.refresh(document)

            return document

        except Exception:
            db.rollback()

            failed_document = db.get(Document, document.id)

            if failed_document:
                failed_document.status = "failed"
                db.commit()

            raise
