import os
from google import genai
from google.genai import types
import json
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found — check your .env file")

client = genai.Client(api_key=api_key)

GATEKEEPER_PROMPT = """Look at this image. Is it a whiteboard or paper diagram showing a software/system architecture? Answer with only: true or false"""

EXTRACTION_PROMPT = """You are a senior software architect. Analyze this whiteboard diagram and return ONLY valid JSON — no markdown, no explanation — matching this exact schema:
{
  "nodes": [{"id": "string", "type": "string", "label": "string", "description": "string"}],
  "edges": [{"source": "string", "target": "string", "label": "string"}],
  "feedback": ["string"]
}
Rules:
- id values must be unique strings ("1", "2", etc.)
- type should be one of: server, database, queue, cache, client, loadbalancer, cdn, other
- feedback should contain 3-5 specific architectural critiques (security, scalability, single points of failure)
- edges reference node ids via source/target
Return ONLY the JSON object."""


async def is_architecture_diagram(image_bytes: bytes, mime_type: str) -> bool:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            GATEKEEPER_PROMPT,
        ],
    )
    return "true" in response.text.lower()


async def extract_architecture(image_bytes: bytes, mime_type: str) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            EXTRACTION_PROMPT,
        ],
    )
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}")
