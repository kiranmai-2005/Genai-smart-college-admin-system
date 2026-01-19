from app import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy import func
import bcrypt # For password hashing

# Helper function for password hashing
def set_password(password):
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed_password.decode('utf-8')

# Helper function for password verification
def check_password(hashed_password, password):
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(120), unique=True)
    is_admin = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    uploaded_documents = db.relationship('UploadedDocument', backref='uploader', lazy=True)
    generated_documents = db.relationship('GeneratedDocument', backref='generator', lazy=True)
    timetable_configurations = db.relationship('TimetableConfiguration', backref='creator', lazy=True)
    timetable_drafts = db.relationship('TimetableDraft', backref='draft_generator', lazy=True)

    def set_password(self, password):
        self.password_hash = set_password(password)

    def check_password(self, password):
        return check_password(self.password_hash, password)

    def __repr__(self):
        return f'<User {self.username}>'

class UploadedDocument(db.Model):
    __tablename__ = 'uploaded_documents'
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    filepath = db.Column(db.String(255), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    upload_date = db.Column(db.DateTime(timezone=True), default=func.now())
    document_type = db.Column(db.String(50))
    original_content_hash = db.Column(db.String(64), unique=True)
    document_metadata = db.Column(db.JSON)
    parsed_text = db.Column(db.Text)
    status = db.Column(db.String(20), default='processed')
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    embeddings = db.relationship('Embedding', backref='source_document', lazy=True)

    def __repr__(self):
        return f'<UploadedDocument {self.filename}>'

class Embedding(db.Model):
    __tablename__ = 'embeddings'
    id = db.Column(db.Integer, primary_key=True)
    uploaded_document_id = db.Column(db.Integer, db.ForeignKey('uploaded_documents.id', ondelete='CASCADE'))
    text_chunk = db.Column(db.Text, nullable=False)
    embedding = db.Column(db.Text) # Store as JSON list
    chunk_index = db.Column(db.Integer)
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())

    def __repr__(self):
        return f'<Embedding {self.id} from Doc {self.uploaded_document_id}>'

class GeneratedDocument(db.Model):
    __tablename__ = 'generated_documents'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    document_type = db.Column(db.String(50), nullable=False)
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    generation_date = db.Column(db.DateTime(timezone=True), default=func.now())
    content = db.Column(db.Text, nullable=False)
    pdf_filepath = db.Column(db.String(255))
    admin_inputs = db.Column(db.JSON)
    rag_context_ids = db.Column(db.Text) # Store as JSON list
    status = db.Column(db.String(20), default='draft')
    version = db.Column(db.Integer, default=1)
    parent_document_id = db.Column(db.Integer, db.ForeignKey('generated_documents.id', ondelete='SET NULL'))
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationship for versioning (self-referencing)
    children_documents = db.relationship('GeneratedDocument', backref=db.backref('parent_document', remote_side=[id]), lazy=True)

    def __repr__(self):
        return f'<GeneratedDocument {self.title}>'

class TimetableConfiguration(db.Model):
    __tablename__ = 'timetable_configurations'
    id = db.Column(db.Integer, primary_key=True)
    config_name = db.Column(db.String(100), unique=True, nullable=False)
    academic_year = db.Column(db.String(10), nullable=False)
    semester = db.Column(db.String(20), nullable=False)
    branches = db.Column(db.JSON)
    sections_per_branch = db.Column(db.JSON)
    slots_per_day = db.Column(db.JSON)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    timetable_drafts = db.relationship('TimetableDraft', backref='config', lazy=True)

    def __repr__(self):
        return f'<TimetableConfig {self.config_name}>'

class Faculty(db.Model):
    __tablename__ = 'faculties'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    employee_id = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    max_weekly_workload = db.Column(db.Integer)
    max_daily_periods = db.Column(db.Integer)
    availability = db.Column(db.JSON) # e.g., {'Monday': ['09:00-10:00', '11:00-12:00']}
    created_at = db.Column(db.DateTime(timezone=True), default=func.now())
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f'<Faculty {self.name}>'

class Subject(db.Model):
    __tablename__ = 'subjects'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    code = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    is_lab = db.Column(db.Boolean, default=False)
    credits = db.Column(db.Integer)
    required_frequency_per_week = db.Column(db.Integer)
    lecture_periods = db.Column(db.Integer, default=1)
    lab_periods = db.Column(db.Integer, default=2) # Number of consecutive periods for lab

    def __repr__(self):
        return f'<Subject {self.name}>'

class Room(db.Model):
    __tablename__ = 'rooms'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    room_type = db.Column(db.String(50), nullable=False)
    capacity = db.Column(db.Integer)
    is_lab = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f'<Room {self.name}>'

class TimetableDraft(db.Model):
    __tablename__ = 'timetable_drafts'
    id = db.Column(db.Integer, primary_key=True)
    config_id = db.Column(db.Integer, db.ForeignKey('timetable_configurations.id', ondelete='CASCADE'))
    generated_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    generation_date = db.Column(db.DateTime(timezone=True), default=func.now())
    status = db.Column(db.String(20), default='draft')
    draft_content = db.Column(db.JSON) # Stores the full generated timetable structure
    last_validated_at = db.Column(db.DateTime(timezone=True))
    updated_at = db.Column(db.DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Relationships
    xai_logs = db.relationship('XaiLog', backref='timetable_draft', lazy=True)

    def __repr__(self):
        return f'<TimetableDraft {self.id}>'

class XaiLog(db.Model):
    __tablename__ = 'xai_logs'
    id = db.Column(db.Integer, primary_key=True)
    timetable_draft_id = db.Column(db.Integer, db.ForeignKey('timetable_drafts.id', ondelete='CASCADE'))
    log_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime(timezone=True), default=func.now())
    rule_name = db.Column(db.String(100), nullable=False)
    slot_details = db.Column(db.JSON)
    explanation = db.Column(db.Text, nullable=False)
    priority = db.Column(db.Integer, default=1)

    def __repr__(self):
        return f'<XaiLog {self.id} for Draft {self.timetable_draft_id}>'
