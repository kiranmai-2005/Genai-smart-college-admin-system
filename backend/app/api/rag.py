from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required
# from app.services.embedding_service import get_embeddings_for_query, get_chunks_by_ids

rag_bp = Blueprint('rag', __name__)

@rag_bp.route('/rag/search', methods=['POST'])
@jwt_required()
def rag_search():
    data = request.json
    query_text = data.get('query')
    top_k = data.get('top_k', current_app.config['RAG_TOP_K'])

    if not query_text:
        return jsonify({"message": "Missing query text"}), 400

    try:
        relevant_chunks = get_embeddings_for_query(query_text, top_k=top_k)
        return jsonify(relevant_chunks), 200
    except Exception as e:
        current_app.logger.error(f"RAG search failed: {e}")
        return jsonify({"message": f"RAG search failed: {str(e)}"}), 500

@rag_bp.route('/rag/chunks/<string:chunk_ids>', methods=['GET'])
@jwt_required()
def get_rag_chunks_by_id(chunk_ids):
    try:
        ids = [int(x) for x in chunk_ids.split(',')]
        chunks = get_chunks_by_ids(ids)
        return jsonify(chunks), 200
    except ValueError:
        return jsonify({"message": "Invalid chunk IDs format. Expected comma-separated integers."}), 400
    except Exception as e:
        current_app.logger.error(f"Failed to retrieve chunks: {e}")
        return jsonify({"message": f"Failed to retrieve chunks: {str(e)}"}), 500
