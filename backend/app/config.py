import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .flaskenv

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///college_admin.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = os.getenv('SECRET_KEY', 'a_very_secret_key_that_should_be_changed_in_production')
    JWT_SECRET_KEY = os.getenv('SECRET_KEY', 'a_very_secret_key_that_should_be_changed_in_production') # Use the same for simplicity
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)

    # LLM Configuration
    LLM_API_KEY = os.getenv('LLM_API_KEY')
    LLM_MODEL_NAME = os.getenv('LLM_MODEL_NAME', 'gpt-3.5-turbo') # e.g., 'gemini-pro', 'gpt-4'
    EMBEDDING_MODEL_NAME = os.getenv('EMBEDDING_MODEL_NAME', 'all-MiniLM-L6-v2') # For SentenceTransformers

    # File Uploads
    UPLOAD_FOLDER = os.path.join(os.getcwd(), 'uploads') # Directory to store uploaded PDFs
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16 MB limit for uploads
    ALLOWED_EXTENSIONS = {'pdf'}

    # Ensure upload folder exists
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    # RAG Configuration
    RAG_TOP_K = 5 # Number of top similar documents/chunks to retrieve
    CHUNK_SIZE = 500 # Characters per text chunk
    CHUNK_OVERLAP = 50 # Characters for overlap between chunks    npm install -g vercel
    cd frontend
    vercel --prod
