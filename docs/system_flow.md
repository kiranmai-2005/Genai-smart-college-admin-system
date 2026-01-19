# System Flow Explanation

This section describes the key operational flows within the "Gen-AI Smart College Admin Assistant" system.

## Flow 1: Admin Login and Authentication

```
+-------------------+      +------------------+      +------------------+
|    Admin User     |      |    Frontend      |      |      Backend     |
+-------------------+      +------------------+      +------------------+
        |                          |                          |
        | 1. Navigates to Login    |                          |
        |------------------------->|                          |
        |                          | 2. Displays Login Form   |
        |                          |<-------------------------| (Renders)
        |                          |                          |
        | 3. Enters Credentials    |                          |
        |------------------------->|                          |
        |                          | 4. Sends POST /api/login |
        |                          |------------------------->|
        |                          |                          | 5. Validates Credentials
        |                          |                          |    Queries Database (Users table)
        |                          |                          |    Generates JWT/Session Token
        |                          |<-------------------------| 6. Returns Auth Token / Success
        |                          |                          |
        | 7. Stores Token          |                          |
        |<-------------------------|                          |
        |                          | 8. Redirects to Dashboard|
        |------------------------->|                          |
        |                          |                          |
```

## Flow 2: Uploading Historical PDF Documents for RAG

```
+-------------------+      +------------------+      +------------------+      +------------------+
|    Admin User     |      |    Frontend      |      |      Backend     |      |    Database      |
+-------------------+      +------------------+      +------------------+      +------------------+
        |                          |                          |                          |
        | 1. Navigates to          |                          |                          |
        |    PDF Upload Section    |                          |                          |
        |------------------------->|                          |                          |
        |                          | 2. Displays Upload Form  |                          |
        |                          |<-------------------------| (Renders)                |
        |                          |                          |                          |
        | 3. Uploads PDF File      |                          |                          |
        |------------------------->|                          |                          |
        |                          | 4. Sends POST /api/upload-pdf (File) |              |
        |                          |------------------------->|                          |
        |                          |                          | 5. Saves PDF temporarily |
        |                          |                          |    Invokes PDF Parsing Util  |
        |                          |                          |    (e.g., pdf_extractor.py)  |
        |                          |                          |    Extracts Text, Metadata |
        |                          |                          |                          |
        |                          |                          | 6. Invokes Embedding Service |
        |                          |                          |    Generates Vector Embeddings |
        |                          |                          |    (from extracted text chunks) |----------------->| 7. Stores Embeddings + Doc Metadata
        |                          |                          |                          |    (Documents, Embeddings tables)
        |                          |                          |<-------------------------| 8. Acknowledges Storage
        |                          |<-------------------------| 9. Returns Success / Doc ID|
        |                          |                          |                          |
        | 10. Displays Confirmation|                          |                          |
        |<-------------------------|                          |                          |
```

## Flow 3: Generating a New Academic Document (e.g., Circular)

```
+-------------------+      +------------------+      +------------------+      +------------------+      +------------------+
|    Admin User     |      |    Frontend      |      |      Backend     |      |    Database      |      |       LLM        |
+-------------------+      +------------------+      +------------------+      +------------------+      +------------------+
        |                          |                          |                          |                          |
        | 1. Navigates to          |                          |                          |                          |
        |    Document Generation   |                          |                          |                          |
        |------------------------->|                          |                          |
        |                          | 2. Displays Document Form|                          |                          |
        |                          |<-------------------------| (Renders)                |                          |
        |                          |                          |                          |                          |
        | 3. Enters Details        |                          |                          |                          |
        |    (Event Name, Date,    |                          |                          |                          |
        |     Department, etc.)    |                          |                          |                          |
        |------------------------->|                          |                          |                          |
        |                          | 4. Sends POST /api/generate-document (Inputs) |    |                          |
        |                          |------------------------->|                          |                          |
        |                          |                          | 5. Invokes RAG Service   |                          |
        |                          |                          |    (a) Generates query embedding |                          |
        |                          |                          |    (b) Performs vector similarity search |----------------->| 6. Retrieves relevant historical documents/context
        |                          |                          |                          |    (Embeddings table)          |
        |                          |                          |<-------------------------| 7. Returns context blocks
        |                          |                          |                          |                          |
        |                          |                          | 8. Constructs LLM Prompt |                          |
        |                          |                          |    (Admin Inputs + RAG Context) |                          |
        |                          |                          |------------------------->| 9. Sends Prompt to LLM API
        |                          |                          |                          |                          |
        |                          |                          |<-------------------------| 10. Returns Generated Text
        |                          |                          |                          |                          |
        |                          |                          | 11. Stores Generated Doc + Metadata |----------------->| 12. Stores (GeneratedDocuments table)
        |                          |                          |<-------------------------| 13. Acknowledges Storage
        |                          |<-------------------------| 14. Returns Generated Text / Doc ID |                 |
        |                          |                          |                          |                          |
        | 15. Displays Preview     |                          |                          |                          |
        |    (Read-Only)           |                          |                          |                          |
        |<-------------------------|                          |                          |                          |
        |                          | 16. (Optional) Download PDF |                       |                          |
        |                          |------------------------->| 17. Sends GET /api/documents/<id>/pdf |              |
        |                          |                          |                          | 18. Retrieves doc, generates PDF |
        |                          |                          |<-------------------------| 19. Returns PDF File             |
        |                          |                          |                          |                          |
        |                          |<-------------------------| 20. Downloads PDF        |                          |
```

## Flow 4: Generating Timetable Draft

```
+-------------------+      +------------------+      +------------------+      +------------------+
|    Admin User     |      |    Frontend      |      |      Backend     |      |    Database      |
+-------------------+      +------------------+      +------------------+      +------------------+
        |                          |                          |                          |
        | 1. Navigates to          |                          |                          |
        |    Timetable Module      |                          |                          |
        |------------------------->|                          |                          |
        |                          | 2. Displays Timetable Form |                      |
        |                          |<-------------------------| (Renders)                |
        |                          |                          |                          |
        | 3. Enters Timetable Inputs |                      |                          |
        |    (Faculties, Subjects, |                          |                          |
        |     Rooms, Availability, etc.) |                      |                          |
        |------------------------->|                          |                          |
        |                          | 4. Sends POST /api/generate-timetable (Inputs) |  |
        |                          |------------------------->|                          |
        |                          |                          | 5. Invokes Timetable Solver Service |                  |
        |                          |                          |    Applies all academic constraints |                  |
        |                          |                          |    (e.g., faculty clash, max periods, labs) |          |
        |                          |                          |    Generates slot choices/rejections |                  |
        |                          |                          |                          |
        |                          |                          | 6. Stores Draft Timetable + XAI Log |--------------->| 7. Stores (Timetables, XaiLogs tables)
        |                          |                          |<-------------------------| 8. Acknowledges Storage
        |                          |<-------------------------| 9. Returns Timetable Draft + XAI Data |              |
        |                          |                          |                          |                          |
        | 10. Displays Draft       |                          |                          |                          |
        |     (with XAI explanations) |                      |                          |                          |
        |<-------------------------|                          |                          |
        |                          | 11. (Optional) Manual Edit |                       |                          |
        |                          |------------------------->| 12. Sends PUT /api/timetable/<id> (Edited Data) |    |
        |                          |                          |                          | 13. Re-validates, updates |
        |                          |                          |<-------------------------| 14. Returns Updated Draft |
```

## Flow 5: Viewing Document History

```
+-------------------+      +------------------+      +------------------+      +------------------+
|    Admin User     |      |    Frontend      |      |    Backend     |      |    Database      |
+-------------------+      +------------------+      +------------------+      +------------------+
        |                          |                          |                          |
        | 1. Navigates to History  |                          |                          |
        |------------------------->|                          |                          |
        |                          | 2. Sends GET /api/documents/history |              |
        |                          |------------------------->|                          |
        |                          |                          | 3. Queries Database (GeneratedDocuments table) |
        |                          |                          |                          |
        |                          |<-------------------------| 4. Returns List of Docs + Metadata |
        |                          |                          |                          |
        | 5. Displays Document List|                          |                          |
        |<-------------------------|                          |                          |
        |                          |                          |                          |
        | 6. Selects Document for  |                          |                          |
        |    Detailed View         |                          |                          |
        |------------------------->|                          |                          |
        |                          | 7. Sends GET /api/documents/<id> |                  |
        |                          |------------------------->|                          |
        |                          |                          | 8. Queries Database |      |
        |                          |<-------------------------| 9. Returns Document Details |
        |                          |                          |                          |
        | 10. Displays Document    |                          |                          |
        |     Details / Preview    |                          |                          |
        |<-------------------------|                          |                          |
```
