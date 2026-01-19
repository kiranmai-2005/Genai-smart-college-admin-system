import fitz # PyMuPDF for better text extraction and metadata
import io
import re
from collections import defaultdict

def extract_text_from_pdf(filepath):
    """
    Extracts text, basic structure, and common metadata from a PDF file.
    Uses PyMuPDF (fitz) for robust extraction.
    """
    text_content = ""
    metadata = {}
    try:
        with fitz.open(filepath) as doc:
            metadata = doc.metadata or {}
            full_text_blocks = []
            for page_num, page in enumerate(doc):
                # Extract text blocks with their coordinates to infer structure
                text_blocks = page.get_text("dict")["blocks"]
                for block in text_blocks:
                    if block['type'] == 0: # This is a text block
                        block_text = ""
                        for line in block["lines"]:
                            for span in line["spans"]:
                                block_text += span["text"] + " "
                            block_text += "\n" # Newline after each line in a block
                        full_text_blocks.append(block_text.strip())

            text_content = "\n\n".join(full_text_blocks) # Join blocks with double newlines

            # Further basic metadata extraction from text
            metadata['extracted_title'] = _extract_title_from_text(text_content)
            metadata['extracted_date'] = _extract_date_from_text(text_content)
            metadata['extracted_department'] = _extract_department_from_text(text_content)

        return text_content, metadata
    except Exception as e:
        print(f"Error extracting text from PDF {filepath}: {e}")
        return "", {}

def _extract_title_from_text(text):
    """Simple logic to guess title from the first few lines."""
    lines = text.strip().split('\n')
    if len(lines) > 0:
        # Take the first line, or first two if they look like a heading
        if len(lines) > 1 and len(lines[0]) < 100 and len(lines[1]) < 100 and lines[0].isupper():
            return (lines[0] + ' ' + lines[1]).strip()
        return lines[0].strip()
    return None

def _extract_date_from_text(text):
    """Simple regex to find common date patterns."""
    date_patterns = [
        r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December|\w{3})\s+\d{1,2},\s+\d{4}\b',
        r'\b\d{1,2}/\d{1,2}/\d{2,4}\b',
        r'\b\d{1,2}-\d{1,2}-\d{2,4}\b',
        r'\b(?:\d{4}-\d{2}-\d{2})\b'
    ]
    for pattern in date_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return match.group(0)
    return None

def _extract_department_from_text(text):
    """Simple regex to find department names."""
    department_keywords = [
        r'Department of\s+([A-Za-z\s]+)',
        r'([A-Z\s]+)\s+Department',
        r'(Academics|Examination|Cultural|Administration)\s+Department',
        r'Dean,?\s+(.*?)\b' # Catch "Dean, School of..." or "Dean of..."
    ]
    for pattern in department_keywords:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            # Clean up the extracted department name
            dept = match.group(1).strip()
            # Basic capitalization
            return ' '.join([word.capitalize() for word in dept.split() if word.lower() not in ['of', 'and']])
    return None

def chunk_text(text: str, chunk_size: int, chunk_overlap: int) -> list[str]:
    """
    Splits text into chunks with a specified size and overlap.
    Aims to split at natural sentence or paragraph breaks where possible.
    """
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    current_position = 0

    while current_position < len(text):
        end_position = min(current_position + chunk_size, len(text))
        chunk = text[current_position:end_position]

        # Try to find a natural break point (end of sentence/paragraph)
        if end_position < len(text):
            # Prioritize splitting by double newline (paragraph)
            last_double_newline = chunk.rfind('\n\n')
            if last_double_newline != -1 and last_double_newline > chunk_size * 0.7: # Ensure chunk is substantial
                chunk = chunk[:last_double_newline].strip()
                next_start = current_position + last_double_newline + 2 # +2 for '\n\n'
            else:
                # Fallback to single newline or period
                last_newline = chunk.rfind('\n')
                last_period = chunk.rfind('.')
                if last_period != -1 and last_period > chunk_size * 0.8:
                    chunk = chunk[:last_period + 1].strip()
                    next_start = current_position + last_period + 1
                elif last_newline != -1 and last_newline > chunk_size * 0.8:
                    chunk = chunk[:last_newline].strip()
                    next_start = current_position + last_newline + 1
                else:
                    # If no good natural break, just split
                    next_start = current_position + chunk_size
        else:
            next_start = end_position

        chunks.append(chunk.strip())
        current_position = next_start - chunk_overlap
        if current_position < 0: # Ensure we don't go before start of text
            current_position = 0

    return [c for c in chunks if c] # Filter out empty chunks
