# 🎓 College Admin Pro - Smart Timetable System

## 🌐 **Access URLs**
- **Frontend UI:** http://localhost:3000 (Beautiful React Interface)
- **Backend API:** http://localhost:5000 (Flask REST API)
- **Demo Page:** timetable_demo.html (Static Showcase)

## 🚀 **Quick Start**
```bash
# One-click start (Windows)
open_demo.bat

# Manual start:
cd backend && python wsgi.py    # Start API server
cd frontend && npm start       # Start UI server
```

## Project Overview

This project introduces a Gen-AI Smart College Admin Assistant to automate the creation of routine academic documents such as circulars, notices, timetables, and event schedules. Traditional manual processes are time-consuming and error-prone. The system leverages Large Language Models (LLMs) for intelligent text generation and Retrieval-Augmented Generation (RAG) to incorporate historical documents, ensuring accuracy and consistency. Administrators input basic details (e.g., event names, dates), and the system generates polished outputs. A PDF parser extracts patterns from past documents to enhance performance. The solution features an interactive React-based admin dashboard and uses PostgreSQL with pgvector for storing templates, history, metadata, and embeddings. Additionally, it includes rule-based timetable drafting with Explainable AI. This automation reduces workload, minimizes errors, ensures uniformity, and accelerates institutional communication.

**Keywords:** Gen-AI, RAG, LLMs, Intelligent Automation, Template Retrieval Systems

## Core Features

*   **Automated Document Generation:** Creates professional academic documents using LLMs.
*   **Retrieval-Augmented Generation (RAG):** Utilizes a knowledge base of historical documents for contextual accuracy and consistency, powered by vector embeddings and similarity search.
*   **PDF Parsing:** Extracts structure, common phrases, and formatting from uploaded PDF documents to enrich the RAG knowledge base.
*   **Admin Dashboard (React):** An interactive interface for PDF uploads, input forms, generated document previews, and download options.
*   **REST API Backend (Flask):** Handles document generation, RAG, PDF parsing, timetable logic, and database operations.
*   **PostgreSQL Database:** Stores all project data, including documents, metadata, admin inputs, history, and vector embeddings.
*   **Timetable Draft Generation:** A rule-based module that generates preliminary timetable drafts, incorporating faculty availability, workload, and other academic constraints, with an Explainable AI layer.

## Technology Stack

*   **Frontend:** React.js
*   **Backend:** Python (Flask)
*   **Database:** PostgreSQL (with `pgvector` for embeddings)
*   **LLM Provider:** (e.g., OpenAI API, Google Gemini API, or a self-hosted open-source model)
*   **PDF Parsing:** `PyPDF2`, `pdfminer.six`
*   **Embeddings:** `SentenceTransformers` (or similar for local models)

## Setup Instructions

### Prerequisites

*   Python 3.8+
*   Node.js (LTS version)
*   PostgreSQL
*   Git (optional, for cloning the repository)

### 1. Clone the Repository (Optional)

```bash
git clone <repository_url>
cd gen-ai-smart-college-admin-assistant
```

### 2. Database Setup

1.  **Install PostgreSQL:** If you don't have PostgreSQL installed, follow the instructions for your operating system.
2.  **Create Database:**
    ```sql
    CREATE DATABASE college_admin_db;
    ```
3.  **Enable `pgvector` extension:**
    Connect to your `college_admin_db` and run:
    ```sql
    CREATE EXTENSION IF NOT EXISTS vector;
    ```
4.  **Run Migrations:** The backend setup (step 3) will handle database migrations.

### 3. Backend Setup (Flask)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
4.  **Configure Environment Variables:**
    Create a `.flaskenv` file in the `backend/` directory and add the following (replace with your actual values):
    ```env
    FLASK_APP=app
    FLASK_ENV=development
    DATABASE_URL="postgresql://user:password@host:port/college_admin_db"
    SECRET_KEY="your_super_secret_key"
    LLM_API_KEY="your_llm_provider_api_key"
    LLM_MODEL_NAME="gpt-3.5-turbo" # or "gemini-pro" etc.
    EMBEDDING_MODEL_NAME="all-MiniLM-L6-v2" # or similar
    ```
    *   `DATABASE_URL`: Ensure this matches your PostgreSQL setup.
    *   `SECRET_KEY`: A strong, random key for session management/JWTs.
    *   `LLM_API_KEY`: Your API key for the chosen LLM provider.
    *   `LLM_MODEL_NAME`: The specific model to use (e.g., `gpt-3.5-turbo`, `gemini-pro`).
    *   `EMBEDDING_MODEL_NAME`: The embedding model for RAG.
5.  **Initialize and Run Database Migrations:**
    ```bash
    flask db upgrade
    ```
6.  **Run the Flask application:**
    ```bash
    flask run
    ```
    The backend will run on `http://localhost:5000` (accessible on network).

### 4. Frontend Setup (React)

1.  **Navigate to the frontend directory (in a new terminal):**
    ```bash
    cd ../frontend
    ```
2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a `.env` file in the `frontend/` directory and add:
    ```env
    REACT_APP_BACKEND_URL=http://localhost:5000/api
    ```
4.  **Start the React development server:**
    ```bash
    npm start
    ```
    The frontend will open in your browser at `http://localhost:3000`.

### 5. Access the Application

Open your web browser and navigate to `http://localhost:3000` to access the Admin Dashboard.

## Local Deployment Instructions

The setup instructions above serve as local deployment instructions for a development environment. For a production deployment, consider:

*   **Web Server:** Use Gunicorn or uWSGI for the Flask application behind a reverse proxy like Nginx or Apache.
*   **Process Manager:** Use Supervisor or Systemd to manage your backend and frontend processes.
*   **Containerization:** Dockerize both the frontend and backend applications for easier deployment and scaling.
*   **Environment Variables:** Manage sensitive information using a secure method (e.g., Kubernetes secrets, AWS Secrets Manager, environment variable management tools).
*   **HTTPS:** Secure your application with SSL/TLS certificates (e.g., Let's Encrypt).
*   **Database Management:** Use a managed PostgreSQL service for production stability and scalability.

## Future Enhancements

1.  **Advanced LLM Fine-tuning:** Explore fine-tuning open-source LLMs on institution-specific documents for even more tailored and accurate generation.
2.  **Multi-Modal RAG:** Incorporate image and table understanding from PDFs into the RAG pipeline.
3.  **Real-time Collaboration:** Allow multiple administrators to collaborate on document drafts.
4.  **Advanced Timetable Optimization:** Integrate more sophisticated scheduling algorithms (e.g., genetic algorithms, constraint programming solvers) to generate optimized, conflict-free timetables (beyond drafts).
5.  **Version Control for Documents:** Implement robust version control for generated documents, allowing rollback and comparison.
6.  **User Roles and Permissions:** Define granular access controls for different administrative roles.
7.  **Notification System:** Implement email or in-app notifications for document approvals, timetable changes, etc.
8.  **Audit Trails:** Log all actions performed by administrators for accountability and compliance.
9.  **Accessibility Features:** Enhance the frontend for better accessibility.

## Security Considerations

1.  **Authentication:** Use secure password hashing (e.g., `bcrypt`) and robust session management or JSON Web Tokens (JWTs) for API authentication. Implement rate limiting on login attempts.
2.  **Authorization:** Implement role-based access control (RBAC) to ensure administrators only access features they are authorized for.
3.  **Input Validation:** Strictly validate all admin inputs on both the frontend and backend to prevent injection attacks (SQL injection, XSS).
4.  **API Security:** Implement HTTPS for all API communication. Use CORS middleware to control allowed origins.
5.  **LLM API Key Security:** Store LLM API keys securely as environment variables and never hardcode them. Consider using cloud-native secret management services in production.
6.  **PDF Upload Security:** Validate uploaded PDF files (e.g., file type, size limits) and scan for malicious content if deployed in a public-facing environment. Store uploaded files securely, preferably outside the web root.
7.  **Database Security:** Use strong, unique credentials for database access. Implement least privilege principle for database users. Regularly backup the database.
8.  **Dependency Security:** Keep all project dependencies updated to mitigate known vulnerabilities. Use tools like `Snyk` or `Dependabot`.
9.  **Error Handling:** Implement robust error handling that does not reveal sensitive system information.

## System Limitations

1.  **LLM Hallucinations:** While RAG helps, LLMs can still generate factually incorrect or nonsensical information. Human review of generated documents is crucial.
2.  **RAG Context Window:** The effectiveness of RAG is limited by the context window of the underlying LLM. Very long historical documents or complex queries might exceed this limit.
3.  **PDF Parsing Accuracy:** Simple PDF parsing logic might struggle with highly complex or image-based PDF layouts, leading to incomplete or inaccurate extractions.
4.  **Timetable Drafts Only:** The timetable module generates drafts based on rules, but does not perform advanced optimization to create fully conflict-free or highly efficient schedules. Manual intervention and expertise is still required.
5.  **Scalability of Embedding Storage:** While `pgvector` is suitable for moderate datasets, very large document corpora might eventually benefit from specialized vector databases for performance.
6.  **Dependence on External APIs:** The current design relies on external LLM providers. Downtime or changes in API policies/pricing could affect functionality.
7.  **Computational Resources:** Generating embeddings and running LLM inferences can be computationally intensive, requiring adequate server resources.
8.  **Complexity of Rules:** The timetable module's complexity grows significantly with the number and intricacy of academic constraints. Maintaining and extending these rules can become challenging.
9.  **No Full-text Search on Generated Docs:** While documents are stored, advanced full-text search capabilities (beyond basic metadata search) might need further implementation.
