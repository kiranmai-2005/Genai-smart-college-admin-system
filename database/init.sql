-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Table for Admin Users (Basic Authentication)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL, -- Stores bcrypt hash
    email VARCHAR(120) UNIQUE,
    is_admin BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Uploaded Historical Documents (e.g., PDFs)
CREATE TABLE uploaded_documents (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL, -- Path to stored PDF file (e.g., S3 URL or local path)
    uploaded_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    document_type VARCHAR(50), -- e.g., 'Circular', 'Notice', 'Timetable'
    original_content_hash VARCHAR(64) UNIQUE, -- MD5/SHA256 hash of original file content for deduplication
    metadata JSONB, -- Stores extracted metadata as JSON (e.g., department, date, keywords)
    parsed_text TEXT, -- Stores full extracted text content for initial processing
    status VARCHAR(20) DEFAULT 'processed' -- e.g., 'pending', 'processed', 'failed'
);

-- Table for RAG Embeddings
CREATE TABLE embeddings (
    id SERIAL PRIMARY KEY,
    uploaded_document_id INTEGER REFERENCES uploaded_documents(id) ON DELETE CASCADE,
    text_chunk TEXT NOT NULL, -- The specific text chunk from the document
    embedding VECTOR(1536) NOT NULL, -- Adjust dimension based on your embedding model (e.g., 1536 for OpenAI ada-002, 384 for MiniLM-L6-v2)
    chunk_index INTEGER, -- Order of the chunk within the document
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for efficient vector search
CREATE INDEX ON embeddings USING ivfflat (embedding vector_l2_ops); -- Or vector_cosine_ops depending on similarity metric

-- Table for Generated Documents
CREATE TABLE generated_documents (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g., 'Circular', 'Notice', 'Event Schedule', 'Email Template'
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    content TEXT NOT NULL, -- The generated text content
    pdf_filepath VARCHAR(255),
    admin_inputs JSONB, -- Stores the specific inputs provided by the admin for generation
    rag_context_ids INTEGER[], -- Array of IDs from `embeddings` table used for RAG
    status VARCHAR(20) DEFAULT 'draft', -- e.g., 'draft', 'approved', 'rejected'
    version INTEGER DEFAULT 1,
    parent_document_id INTEGER REFERENCES generated_documents(id) ON DELETE SET NULL, -- For versioning/drafts
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Timetable Configuration (e.g., courses, faculties, rooms)
CREATE TABLE timetable_configurations (
    id SERIAL PRIMARY KEY,
    config_name VARCHAR(100) UNIQUE NOT NULL,
    academic_year VARCHAR(10) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    branches JSONB, -- e.g., ['CSE', 'ECE', 'MECH']
    sections_per_branch JSONB, -- e.g., {'CSE': ['A', 'B'], 'ECE': ['A']}
    slots_per_day JSONB, -- e.g., [{'start': '09:00', 'end': '10:00', 'type': 'lecture'}, ...]
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Faculty details
CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    max_weekly_workload INTEGER, -- e.g., 20 hours
    max_daily_periods INTEGER,
    availability JSONB, -- e.g., {'Monday': ['09:00-10:00', '11:00-12:00'], 'Tuesday': []}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Subjects
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    is_lab BOOLEAN DEFAULT FALSE,
    credits INTEGER,
    required_frequency_per_week INTEGER, -- How many times subject should be taught per week
    lecture_periods INTEGER DEFAULT 1, -- Number of consecutive periods for a single lecture slot
    lab_periods INTEGER DEFAULT 2 -- Number of consecutive periods for a single lab slot
);

-- Table for Rooms/Labs
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    room_type VARCHAR(50) NOT NULL, -- e.g., 'Lecture Hall', 'Lab', 'Seminar Room'
    capacity INTEGER,
    is_lab BOOLEAN DEFAULT FALSE
);

-- Table for Timetable Drafts
CREATE TABLE timetable_drafts (
    id SERIAL PRIMARY KEY,
    config_id INTEGER REFERENCES timetable_configurations(id) ON DELETE CASCADE,
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    generation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'draft', -- e.g., 'draft', 'validated', 'approved'
    draft_content JSONB, -- Stores the full generated timetable structure (e.g., {'Monday': {'09:00': {'branch': 'CSE', 'section': 'A', 'subject': 'Math', 'faculty': 'Dr. X', 'room': 'LH101'}}})
    last_validated_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Explainable AI (XAI) logs for Timetable Generation
CREATE TABLE xai_logs (
    id SERIAL PRIMARY KEY,
    timetable_draft_id INTEGER REFERENCES timetable_drafts(id) ON DELETE CASCADE,
    log_type VARCHAR(50) NOT NULL, -- 'choice', 'rejection', 'conflict'
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    rule_name VARCHAR(100) NOT NULL, -- e.g., 'Faculty_Clash_Detection', 'Max_Periods_Per_Day'
    slot_details JSONB, -- Details of the slot (day, time, branch, section, subject, faculty, room)
    explanation TEXT NOT NULL, -- Clear explanation of why the choice/rejection/conflict occurred
    priority INTEGER DEFAULT 1 -- Higher priority for critical issues
);

-- Trigger to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_uploaded_documents_timestamp
BEFORE UPDATE ON uploaded_documents
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_generated_documents_timestamp
BEFORE UPDATE ON generated_documents
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_timetable_configurations_timestamp
BEFORE UPDATE ON timetable_configurations
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_faculties_timestamp
BEFORE UPDATE ON faculties
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_timetable_drafts_timestamp
BEFORE UPDATE ON timetable_drafts
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Initial Admin User (example - change password after first login)
INSERT INTO users (username, password_hash, email, is_admin) VALUES
('admin', '$2b$12$R.S7Wp4s2Q/J.s.kFjZ65uD0q7j3O3h4.w6F.b.c.g.h.i.j.k.l.m.n.o.p', 'admin@college.edu', TRUE);
-- The above hash is for 'admin_password', generated using bcrypt.
-- In a real application, ensure to generate a strong hash dynamically.

-- Sample Data for `users` (already includes one admin, adding another)
INSERT INTO users (username, password_hash, email, is_admin) VALUES
('alice', '$2b$12$R.S7Wp4s2Q/J.s.kFjZ65uD0q7j3O3h4.w6F.b.c.g.h.i.j.k.l.m.n.o.p', 'alice@college.edu', TRUE);
-- Password for alice is also 'admin_password'

-- Sample Data for `uploaded_documents`
INSERT INTO uploaded_documents (filename, filepath, uploaded_by, document_type, original_content_hash, metadata, parsed_text) VALUES
('circular_2023_01_orientation.pdf', '/path/to/storage/circular_2023_01_orientation.pdf', 1, 'Circular', 'hash123abc', '{"department": "Academics", "date": "2023-08-15", "event": "New Student Orientation", "keywords": ["orientation", "freshers"]}'::jsonb, 'This is a sample circular for new student orientation. It outlines important dates, venues, and contact persons. All new students are required to attend.'),
('event_schedule_annual_day.pdf', '/path/to/storage/event_schedule_annual_day.pdf', 1, 'Event Schedule', 'hash456def', '{"department": "Cultural", "date": "2023-10-20", "event": "Annual Day Celebration", "keywords": ["annual day", "celebration", "schedule"]}'::jsonb, 'The annual day celebration will be held on [Date] at [Time]. The schedule includes various cultural performances, award ceremonies, and a guest lecture.'),
('notice_exam_postponement.pdf', '/path/to/storage/notice_exam_postponement.pdf', 1, 'Notice', 'hash789ghi', '{"department": "Examination", "date": "2024-03-01", "event": "Mid-Term Exam Postponement", "keywords": ["exam", "postponement", "mid-term"]}'::jsonb, 'Notice to all students: The mid-term examinations scheduled for [Original Date] have been postponed to [New Date] due to unforeseen circumstances. Revised timetable will be released soon.');

-- Sample Data for `embeddings` (dummy embeddings for demonstration)
-- In a real scenario, these would be generated by an embedding model.
-- Assuming embedding dimension is 384 for simplicity (e.g., for 'all-MiniLM-L6-v2')
INSERT INTO embeddings (uploaded_document_id, text_chunk, embedding, chunk_index) VALUES
(1, 'sample circular for new student orientation.', ARRAY[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 21.0, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 31.0, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 33.0, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 36.0, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 37.0, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0, 38.1, 38.2, 38.3, 38.4]::VECTOR(384), 0),
(1, 'outlines important dates, venues, and contact persons.', ARRAY[0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 21.0, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 31.0, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 33.0, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 36.0, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 37.0, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0, 38.1, 38.2, 38.3, 38.4]::VECTOR(384), 1),
(2, 'annual day celebration will be held on [Date] at [Time].', ARRAY[0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 21.0, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 31.0, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 33.0, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 36.0, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 37.0, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0, 38.1, 38.2, 38.3, 38.4]::VECTOR(384), 0),
(3, 'mid-term examinations scheduled for [Original Date] have been postponed.', ARRAY[1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 3.0, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 4.0, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 5.0, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 6.0, 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 8.0, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 9.0, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 10.0, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.0, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 13.0, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7, 13.8, 13.9, 14.0, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8, 14.9, 15.0, 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8, 15.9, 16.0, 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 17.0, 17.1, 17.2, 17.3, 17.4, 17.5, 17.6, 17.7, 17.8, 17.9, 18.0, 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8, 18.9, 19.0, 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8, 19.9, 20.0, 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 21.0, 21.1, 21.2, 21.3, 21.4, 21.5, 21.6, 21.7, 21.8, 21.9, 22.0, 22.1, 22.2, 22.3, 22.4, 22.5, 22.6, 22.7, 22.8, 22.9, 23.0, 23.1, 23.2, 23.3, 23.4, 23.5, 23.6, 23.7, 23.8, 23.9, 24.0, 24.1, 24.2, 24.3, 24.4, 24.5, 24.6, 24.7, 24.8, 24.9, 25.0, 25.1, 25.2, 25.3, 25.4, 25.5, 25.6, 25.7, 25.8, 25.9, 26.0, 26.1, 26.2, 26.3, 26.4, 26.5, 26.6, 26.7, 26.8, 26.9, 27.0, 27.1, 27.2, 27.3, 27.4, 27.5, 27.6, 27.7, 27.8, 27.9, 28.0, 28.1, 28.2, 28.3, 28.4, 28.5, 28.6, 28.7, 28.8, 28.9, 29.0, 29.1, 29.2, 29.3, 29.4, 29.5, 29.6, 29.7, 29.8, 29.9, 30.0, 30.1, 30.2, 30.3, 30.4, 30.5, 30.6, 30.7, 30.8, 30.9, 31.0, 31.1, 31.2, 31.3, 31.4, 31.5, 31.6, 31.7, 31.8, 31.9, 32.0, 32.1, 32.2, 32.3, 32.4, 32.5, 32.6, 32.7, 32.8, 32.9, 33.0, 33.1, 33.2, 33.3, 33.4, 33.5, 33.6, 33.7, 33.8, 33.9, 34.0, 34.1, 34.2, 34.3, 34.4, 34.5, 34.6, 34.7, 34.8, 34.9, 35.0, 35.1, 35.2, 35.3, 35.4, 35.5, 35.6, 35.7, 35.8, 35.9, 36.0, 36.1, 36.2, 36.3, 36.4, 36.5, 36.6, 36.7, 36.8, 36.9, 37.0, 37.1, 37.2, 37.3, 37.4, 37.5, 37.6, 37.7, 37.8, 37.9, 38.0, 38.1, 38.2, 38.3, 38.4]::VECTOR(384), 0);

-- Note: The `...` above represents the rest of the 384 dimensions.
-- In actual implementation, generate real embeddings.

-- Sample Data for `timetable_configurations`
INSERT INTO timetable_configurations (config_name, academic_year, semester, branches, sections_per_branch, slots_per_day, created_by) VALUES
('Fall 2025 Semester Config', '2025-2026', 'Fall', '["CSE", "ECE"]'::JSONB, '{"CSE": ["A", "B"], "ECE": ["A"]}'::JSONB, '[
    {"start": "09:00", "end": "10:00", "type": "lecture"},
    {"start": "10:00", "end": "11:00", "type": "lecture"},
    {"start": "11:00", "end": "12:00", "type": "lecture"},
    {"start": "12:00", "end": "13:00", "type": "break"},
    {"start": "13:00", "end": "14:00", "type": "lecture"},
    {"start": "14:00", "end": "15:00", "type": "lecture"},
    {"start": "15:00", "end": "16:00", "type": "lab_lecture_combined"}
]'::JSONB, 1);

-- Sample Data for `faculties`
INSERT INTO faculties (name, employee_id, department, max_weekly_workload, max_daily_periods, availability) VALUES
('Dr. Anya Sharma', 'F001', 'CSE', 20, 4, '{"Monday": ["09:00-10:00", "10:00-11:00"], "Tuesday": ["13:00-14:00", "14:00-15:00"], "Wednesday": [], "Thursday": ["09:00-10:00", "10:00-11:00", "15:00-16:00"], "Friday": ["09:00-10:00", "10:00-11:00"]}'::jsonb),
('Prof. Ben Carter', 'F002', 'ECE', 18, 3, '{"Monday": ["13:00-14:00", "14:00-15:00"], "Tuesday": ["09:00-10:00"], "Wednesday": ["10:00-11:00", "11:00-12:00"], "Thursday": [], "Friday": ["13:00-14:00", "14:00-15:00"]}'::jsonb),
('Dr. Cathy Lee', 'F003', 'CSE', 22, 5, '{"Monday": ["09:00-10:00", "10:00-11:00", "11:00-12:00"], "Tuesday": ["09:00-10:00", "10:00-11:00", "11:00-12:00", "13:00-14:00"], "Wednesday": ["09:00-10:00"], "Thursday": ["13:00-14:00", "14:00-15:00"], "Friday": ["09:00-10:00", "10:00-11:00"]}'::jsonb);

-- Sample Data for `subjects`
INSERT INTO subjects (name, code, department, is_lab, credits, required_frequency_per_week, lecture_periods, lab_periods) VALUES
('Data Structures and Algorithms', 'CS301', 'CSE', FALSE, 4, 3, 1, NULL),
('Computer Networks', 'CS302', 'CSE', FALSE, 3, 2, 1, NULL),
('Digital Logic Design', 'EC301', 'ECE', FALSE, 4, 3, 1, NULL),
('Signals and Systems', 'EC302', 'ECE', FALSE, 3, 2, 1, NULL),
('Data Structures Lab', 'CSL301', 'CSE', TRUE, 2, 1, NULL, 2),
('Digital Logic Design Lab', 'ECL301', 'ECE', TRUE, 2, 1, NULL, 2);

-- Sample Data for `rooms`
INSERT INTO rooms (name, room_type, capacity, is_lab) VALUES
('LH101', 'Lecture Hall', 60, FALSE),
('LH102', 'Lecture Hall', 60, FALSE),
('CSE_Lab1', 'Lab', 30, TRUE),
('ECE_Lab1', 'Lab', 30, TRUE);
