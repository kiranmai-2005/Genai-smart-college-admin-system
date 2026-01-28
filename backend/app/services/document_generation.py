from flask import current_app
from app.models import GeneratedDocument
import os

# Make these optional imports so app can start without them
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

try:
    import google.generativeai as genai
except ImportError:
    genai = None

def _get_llm_client():
    """Initializes and returns the appropriate LLM client based on config.
    If no API key is configured, returns None so callers can fallback gracefully.
    """
    llm_model_name = current_app.config.get('LLM_MODEL_NAME', 'gpt-3.5-turbo').lower()
    api_key = current_app.config.get('LLM_API_KEY')

    if not api_key:
        current_app.logger.warning("LLM_API_KEY not set; falling back to template-based document generation.")
        return None

    if 'gpt' in llm_model_name:
        if OpenAI is None:
            current_app.logger.warning("OpenAI library not installed")
            return None
        return OpenAI(api_key=api_key)
    elif 'gemini' in llm_model_name:
        if genai is None:
            current_app.logger.warning("Google Generative AI library not installed")
            return None
        genai.configure(api_key=api_key)
        return genai
    else:
        raise ValueError(f"Unsupported LLM model: {llm_model_name}. Supported: GPT, Gemini.")

def generate_document_llm(document_type: str, admin_inputs: dict, rag_context: list[str]) -> str:
    """
    Generates an academic document using an LLM, incorporating RAG context.
    If LLM is unavailable, falls back to a simple template.
    """
    llm_client = _get_llm_client()
    llm_model_name = current_app.config.get('LLM_MODEL_NAME', 'gpt-3.5-turbo')

    base_prompt = (
        f"You are a professional college administrative assistant AI. "
        f"Your task is to generate a formal and institution-ready '{document_type}' based on the provided information. "
        f"Ensure an official tone, clarity, and consistent formatting. Do NOT include conversational elements."
    )

    context_str = ""
    if rag_context:
        context_str = "Below is relevant historical content from previously approved documents to guide your generation for consistency and accuracy:\n"
        for i, chunk in enumerate(rag_context):
            context_str += f"--- Context Chunk {i+1} ---\n{chunk}\n\n"
        context_str += "--- End of Context ---\n\n"

    input_details = ""
    if admin_inputs:
        input_details += "Here are the specific details for the document:\n"
        for key, value in admin_inputs.items():
            if value: # Only add if value is not empty
                input_details += f"- {key.replace('_', ' ').title()}: {value}\n"
        input_details += "\n"
    
    # Construct the final prompt
    final_prompt = f"{base_prompt}\n\n{context_str}{input_details}\n\nGenerate the complete document now:"

    # If no LLM client is available, fallback to a deterministic template
    if llm_client is None:
        current_app.logger.info("Using fallback template for document generation (LLM not configured).")
        fallback_lines = [
            f"*** {document_type.upper()} ***",
            "",
            "This is an auto-generated document using the built-in template.",
            "Please review and edit as needed.",
            "",
            "Details provided:",
        ]
        for key, value in (admin_inputs or {}).items():
            if value:
                fallback_lines.append(f"- {key.replace('_', ' ').title()}: {value}")
        if rag_context:
            fallback_lines.append("")
            fallback_lines.append("Context snippets:")
            for i, chunk in enumerate(rag_context[:3]):
                fallback_lines.append(f"  {i+1}. {chunk[:200]}{'...' if len(chunk)>200 else ''}")
        fallback_lines.append("")
        fallback_lines.append("Thank you.")
        return "\n".join(fallback_lines)

    current_app.logger.debug(f"Sending prompt to LLM (model: {llm_model_name}): {final_prompt[:500]}...")

    try:
        if 'gpt' in llm_model_name.lower():
            response = llm_client.chat.completions.create(
                model=llm_model_name,
                messages=[
                    {"role": "system", "content": base_prompt},
                    {"role": "user", "content": final_prompt}
                ],
                temperature=0.7,
                max_tokens=1500, # Adjust as needed for document length
            )
            generated_content = response.choices[0].message.content
        elif 'gemini' in llm_model_name.lower():
            model = llm_client.GenerativeModel(llm_model_name)
            response = model.generate_content(
                contents=final_prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1500,
                )
            )
            generated_content = response.text
        else:
            raise ValueError(f"Unsupported LLM model for generation: {llm_model_name}")

        return generated_content
    except Exception as e:
        current_app.logger.error(f"Error during LLM content generation: {e}")
        # Fallback to template if LLM call fails
        fallback_lines = [
            f"*** {document_type.upper()} ***",
            "",
            "This document was generated using the fallback template due to an LLM error.",
            f"Error: {e}",
            "",
            "Details provided:",
        ]
        for key, value in (admin_inputs or {}).items():
            if value:
                fallback_lines.append(f"- {key.replace('_', ' ').title()}: {value}")
        fallback_lines.append("")
        fallback_lines.append("Please review and edit as needed.")
        return "\n".join(fallback_lines)
