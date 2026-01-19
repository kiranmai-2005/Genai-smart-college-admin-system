# Architecture Diagram Explanation

The "Gen-AI Smart College Admin Assistant" follows a client-server architecture, typical of modern web applications, enhanced with AI components for document generation and retrieval.

## High-Level Components:

1.  **Frontend (React Application):**
    *   **Role:** User interface for administrators.
    *   **Functionality:** Provides a login page, forms for inputting academic details, a section for uploading PDF documents, a preview area for generated documents, and a document history page.
    *   **Technology:** React.js, consuming RESTful APIs from the backend.

2.  **Backend (Flask REST API):**
    *   **Role:** The central brain of the application, handling all business logic, data persistence, and integration with AI services.
    *   **Technology:** Python with Flask framework.
    *   **Key Modules:**
        *   **Authentication & Authorization:** Manages admin login and access control.
        *   **Document Management API:** Handles CRUD operations for documents, metadata, and history.
        *   **PDF Parsing API:** Receives uploaded PDFs, extracts text and patterns, and feeds them into the RAG system.
        *   **RAG API:** Manages the knowledge base, converts documents to embeddings, performs vector similarity searches, and provides context to the LLM.
        *   **LLM Integration Service:** Interfaces with the chosen Large Language Model (e.g., OpenAI, Gemini) to generate document content.
        *   **Timetable Module API:** Provides endpoints for generating timetable drafts, enforcing rules, and exposing Explainable AI insights.

3.  **Database (PostgreSQL with `pgvector`):**
    *   **Role:** Persistent storage for all application data.
    *   **Technology:** PostgreSQL with the `pgvector` extension.
    *   **Stores:**
        *   User (Admin) credentials.
        *   Uploaded and generated academic documents.
        *   Metadata associated with documents and admin inputs.
        *   Document history and audit trails.
        *   Vector embeddings of historical documents, directly within PostgreSQL tables, for efficient similarity search.

4.  **Large Language Model (LLM) Provider:**
    *   **Role:** External service (or potentially self-hosted) responsible for intelligent text generation.
    *   **Integration:** The Backend communicates with the LLM API to generate circulars, notices, schedules, and email templates.
    *   **Key Characteristic:** Generates professional, formal, and institution-ready text based on provided prompts and RAG context.

## Data Flow & Interactions:

1.  **Admin Interaction:** An administrator logs into the **Frontend**.
2.  **Data Input:** The admin uses forms on the dashboard to input academic details (event name, date, department, etc.) or uploads historical PDF documents.
3.  **API Calls:** The **Frontend** sends these inputs or uploaded files via RESTful API calls to the **Backend**.
4.  **Backend Processing:**
    *   **PDF Upload:** If a PDF is uploaded, the **Backend's PDF Parsing module** extracts relevant text, structure, and patterns. This extracted information is then processed by the **RAG module** to generate vector embeddings, which are stored in the **Database**.
    *   **Document Generation Request:** For generating new documents (circulars, notices), the **Backend's Document Generation Service** combines the admin's input with relevant historical context retrieved from the **RAG module** (by querying the **Database's** vector embeddings).
    *   **LLM Invocation:** The combined input and RAG context form a prompt sent to the **LLM Provider**.
    *   **LLM Response:** The **LLM Provider** generates the document content and sends it back to the **Backend**.
    *   **Timetable Generation:** For timetable drafts, the **Backend's Timetable Module** uses admin inputs and predefined rules to generate a draft, storing the choices and rejections (Explainable AI layer) in the **Database**.
5.  **Database Operations:** The **Backend** interacts with the **PostgreSQL Database** for storing and retrieving all data, including documents, metadata, history, and vector embeddings.
6.  **Response to Frontend:** The **Backend** sends the generated document content (or timetable draft, or history data) back to the **Frontend**.
7.  **Display & Download:** The **Frontend** displays the generated document in a read-only preview and offers options to download it as a PDF. Document history is also fetched and displayed.

This architecture ensures a clear separation of concerns, scalability, and modularity, making the system maintainable and extensible. The tight integration of RAG and LLM components within the backend is crucial for intelligent and context-aware document generation.
