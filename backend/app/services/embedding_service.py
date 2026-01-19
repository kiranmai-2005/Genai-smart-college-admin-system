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
        model_name = current_app.config.get('EMBEDDING_MODEL_NAME', 'all-MiniLM-L6-v2')
        current_app.logger.info(f"Loading embedding model: {model_name}")
        _embedding_model = SentenceTransformer(model_name)
    return _embedding_model

def generate_embedding(text: str):
    """Generates a vector embedding for a given text."""
    model = get_embedding_model()
    return model.encode(text).tolist()

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
    """
    query_embedding = generate_embedding(query_text)

    # Convert query_embedding to a PostgreSQL array literal string for the query
    query_embedding_str = f"ARRAY{query_embedding}"

    # Use raw SQL for pgvector similarity search (cosine distance is common for SBERT)
    # The 'VECTOR' type casting assumes you've used `db.ARRAY(db.Float)` for the column in models.py
    # and the 'vector' extension is installed in PostgreSQL.
    # Adjust `vector_cosine_ops` to `vector_l2_ops` if using Euclidean distance.
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

def get_chunks_by_ids(chunk_ids: list[int]):
    """Retrieves specific text chunks by their IDs."""
    chunks = Embedding.query.filter(Embedding.id.in_(chunk_ids)).all()
    return [{
        "id": chunk.id,
        "text_chunk": chunk.text_chunk,
        "uploaded_document_id": chunk.uploaded_document_id
    } for chunk in chunks]
