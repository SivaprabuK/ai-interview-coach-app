import logging
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.document_chunk import DocumentChunk


logger = logging.getLogger(__name__)


class DocumentManagementService:

    def delete_document(
        self,
        db: Session,
        document_id: int,
        user_id: int,
    ) -> bool:

        document = (
            db.query(Document)
            .filter(
                Document.id == document_id,
                Document.user_id == user_id,
            )
            .first()
        )

        if not document:
            return False

        file_path = Path(document.file_path)

        try:
            db.query(DocumentChunk).filter(
                DocumentChunk.document_id == document_id
            ).delete(synchronize_session=False)

            db.delete(document)
            db.commit()

        except Exception:
            db.rollback()
            raise

        if file_path.exists():
            try:
                file_path.unlink()
            except OSError:
                logger.warning(
                    "Could not delete document file: %s",
                    file_path,
                )

        return True
