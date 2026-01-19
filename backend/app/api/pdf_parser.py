from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import hashlib
from app import db
from app.models import UploadedDocument
from app.utils.pdf_extractor import extract_text_from_pdf, chunk_text
# from app.services.embedding_service import create_embeddings_for_document
from datetime import datetime

pdf_parser_bp = Blueprint('pdf_parser', __name__)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

@pdf_parser_bp.route('/upload-pdf', methods=['POST'])
@jwt_required()
def upload_pdf():
    current_user_id = get_jwt_identity()

    if 'pdf_file' not in request.files:
        return jsonify({"message": "No file part in the request"}), 400

    file = request.files['pdf_file']

    if file.filename == '':
        return jsonify({"message": "No selected file"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)

        try:
            # 1. Parse PDF
            parsed_text, metadata = extract_text_from_pdf(filepath)
            if not parsed_text:
                raise ValueError("Could not extract text from PDF.")

            # Calculate hash of the extracted text content for deduplication
            content_hash = hashlib.sha256(parsed_text.encode('utf-8')).hexdigest()

            # Check for duplicates based on content hash
            existing_doc = UploadedDocument.query.filter_by(original_content_hash=content_hash).first()
            if existing_doc:
                os.remove(filepath) # Remove the newly uploaded duplicate file
                return jsonify({
                    "message": "PDF content already exists in knowledge base.",
                    "document_id": existing_doc.id,
                    "status": "duplicate"
                }), 200

            # 2. Store document metadata and parsed text
            new_doc = UploadedDocument(
                filename=filename,
                filepath=filepath,
                uploaded_by=current_user_id,
                document_type=request.form.get('document_type', 'unknown'), # Can be passed from frontend form
                original_content_hash=content_hash,
                document_metadata=metadata,
                parsed_text=parsed_text,
                status='processed'
            )
            db.session.add(new_doc)
            db.session.commit()

            # 3. Create Embeddings for RAG
            # chunks = chunk_text(parsed_text, current_app.config['CHUNK_SIZE'], current_app.config['CHUNK_OVERLAP'])
            # create_embeddings_for_document(new_doc.id, chunks)

            return jsonify({"message": "PDF uploaded and processed successfully", "document_id": new_doc.id}), 201

        except Exception as e:
            current_app.logger.error(f"Error processing PDF {filepath}: {e}")
            if os.path.exists(filepath):
                os.remove(filepath) # Clean up file if processing failed
            return jsonify({"message": f"Failed to process PDF: {str(e)}"}), 500
    else:
        return jsonify({"message": "File type not allowed"}), 400
