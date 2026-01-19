from flask import current_app
from openai import OpenAI # Example for OpenAI, could be GoogleGenerativeAI for Gemini
import google.generativeai as genai # Example for Google Gemini
from app.models import GeneratedDocument
import os

def _get_llm_client():
    """Initializes and returns the appropriate LLM client based on config."""
    llm_model_name = current_app.config.get('LLM_MODEL_NAME', 'gpt-3.5-turbo').lower()
    api_key = current_app.config.get('LLM_API_KEY')

    if not api_key:
        raise ValueError("LLM_API_KEY is not set in environment variables.")

    if 'gpt' in llm_model_name:
        return OpenAI(api_key=api_key)
    elif 'gemini' in llm_model_name:
        genai.configure(api_key=api_key)
        return genai
    else:
        raise ValueError(f"Unsupported LLM model: {llm_model_name}. Supported: GPT, Gemini.")

def generate_document_llm(document_type: str, admin_inputs: dict, rag_context: list[str]) -> str:
    """
    Generates an academic document using an LLM, incorporating RAG context.
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
        raise
