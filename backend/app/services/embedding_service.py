from sentence_transformers import SentenceTransformer
from app import db
from app.models import Embedding, UploadedDocument
from flask import current_app
from sqlalchemy import text # For raw SQL with pgvector

# Initialize embedding model globally (or lazily)
# This model will be loaded once when the app starts or first requested
_embedding_model = None

def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        try:
            model_name = current_app.config.get('EMBEDDING_MODEL_NAME', 'all-MiniLM-L6-v2')
            current_app.logger.info(f"Loading embedding model: {model_name}")
            _embedding_model = SentenceTransformer(model_name)
        except Exception as e:
            current_app.logger.error(f"Failed to load embedding model: {e}")
            # Return None to indicate embedding model is unavailable
            _embedding_model = False  # Use False to indicate failed attempt
    return _embedding_model if _embedding_model is not False else None

def generate_embedding(text: str):
    """Generates a vector embedding for a given text."""
    try:
        model = get_embedding_model()
        if model is None:
            current_app.logger.warning("Embedding model not available, returning empty embedding")
            return [0.0] * 384  # Return dummy embedding (384 is default for all-MiniLM-L6-v2)
        return model.encode(text).tolist()
    except Exception as e:
        current_app.logger.error(f"Failed to generate embedding: {e}")
        return [0.0] * 384  # Return dummy embedding on error

def create_embeddings_for_document(doc_id: int, text_chunks: list[str]):
    """
    Generates embeddings for all text chunks of an uploaded document
    and stores them in the database.
    """
    embeddings_to_add = []
    for i, chunk in enumerate(text_chunks):
        embedding_vector = generate_embedding(chunk)
        new_embedding = Embedding(
            uploaded_document_id=doc_id,
            text_chunk=chunk,
            embedding=embedding_vector,
            chunk_index=i
        )
        embeddings_to_add.append(new_embedding)
    
    db.session.add_all(embeddings_to_add)
    db.session.commit()
    current_app.logger.info(f"Created {len(embeddings_to_add)} embeddings for document ID {doc_id}")

def get_embeddings_for_query(query_text: str, top_k: int = 5):
    """
    Generates an embedding for the query and performs a vector similarity search
    to retrieve the most relevant text chunks from the knowledge base.
    Falls back gracefully if database doesn't support pgvector (e.g., SQLite).
    """
    try:
        # First, check if there are any embeddings in the database
        embedding_count = db.session.query(Embedding).count()
        if embedding_count == 0:
            current_app.logger.info("No embeddings found in database, returning empty list")
            return []
        
        query_embedding = generate_embedding(query_text)

        # Try PostgreSQL pgvector approach first
        query_embedding_str = f"ARRAY{query_embedding}"

        results = db.session.execute(
            text(f"""
            SELECT id, text_chunk, uploaded_document_id, embedding <-> CAST(:query_embedding AS vector) AS distance
            FROM embeddings
            ORDER BY distance
            LIMIT :top_k
            """),
            {'query_embedding': query_embedding_str, 'top_k': top_k}
        ).fetchall()

        relevant_chunks = []
        for row in results:
            relevant_chunks.append({
                "id": row.id,
                "text_chunk": row.text_chunk,
                "uploaded_document_id": row.uploaded_document_id,
                "distance": row.distance
            })
        
        current_app.logger.debug(f"RAG retrieved {len(relevant_chunks)} chunks for query: '{query_text[:50]}...'")
        return relevant_chunks
    
    except Exception as e:
        # Fallback for SQLite or other databases that don't support pgvector
        current_app.logger.warning(f"Vector similarity search failed, using simple text search fallback: {e}")
        try:
            # Simple fallback: search by text content similarity using LIKE
            embeddings = db.session.query(Embedding).limit(top_k).all()
            relevant_chunks = []
            for emb in embeddings:
                relevant_chunks.append({
                    "id": emb.id,
                    "text_chunk": emb.text_chunk,
                    "uploaded_document_id": emb.uploaded_document_id,
                    "distance": 0
                })
            current_app.logger.debug(f"RAG fallback retrieved {len(relevant_chunks)} chunks")
            return relevant_chunks
        except Exception as fallback_error:
            current_app.logger.error(f"RAG fallback also failed: {fallback_error}")
            return []

def get_chunks_by_ids(chunk_ids: list[int]):
    """Retrieves specific text chunks by their IDs."""
    chunks = Embedding.query.filter(Embedding.id.in_(chunk_ids)).all()
    return [{
        "id": chunk.id,
        "text_chunk": chunk.text_chunk,
        "uploaded_document_id": chunk.uploaded_document_id
    } for chunk in chunks]
