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
  "nodes": [{"id": "string", "type": "string", "label": "string", "description": "string", "zone": "string|null"}],
  "edges": [{"source": "string", "target": "string", "label": "string", "protocol": "string|null", "bidirectional": false}],
  "zones": [{"id": "string", "label": "string", "color": "string"}],
  "feedback": ["string"]
}
Rules:
- id values must be unique strings ("1", "2", etc.)
- node type should be one of: server, database, queue, cache, client, loadbalancer, cdn, other
- node zone must match a zone id, or null if the node doesn't belong to a zone
- zones represent logical groupings like: vpc, dmz, internet, internal, cloud, mobile, frontend, backend
- zone color should be one of: blue, green, orange, purple, red, slate
- edges protocol should be one of: HTTP, HTTPS, TCP, gRPC, WebSocket, AMQP, SQL, Redis, null
- bidirectional true means data flows both ways on that edge
- feedback should contain 3-5 specific architectural critiques (security, scalability, single points of failure)
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

IMPROVEMENT_PROMPT = """You are a senior software architect. You previously analyzed a diagram and gave this feedback:

FEEDBACK:
{feedback}

Here is the current architecture:
{current_json}

Return ONLY valid JSON — no markdown, no explanation — with this exact schema:
{{
  "nodes": [{{"id": "string", "type": "string", "label": "string", "description": "string"}}],
  "edges": [{{"source": "string", "target": "string", "label": "string"}}],
  "feedback": ["string"],
  "improvements": ["string"]
}}

Rules:
- Apply your feedback: add missing components, remove single points of failure, add security layers, etc.
- improvements should list 3-5 concrete changes you made vs the original
- feedback should now reflect remaining concerns on the NEW diagram
- Keep all existing id values stable where possible; add new nodes with new unique ids
Return ONLY the JSON object."""

# This function takes the current nodes, edges, and feedback for an architecture diagram, formats them into a prompt, and sends it to the Gemini API to receive an improved architecture diagram based on the feedback. It returns the new set of nodes, edges, feedback, and a list of specific improvements made.


async def improve_architecture(nodes: list, edges: list, feedback: list[str]) -> dict:
    current_json = json.dumps({"nodes": nodes, "edges": edges}, indent=2)
    filled = IMPROVEMENT_PROMPT.format(
        feedback="\n".join(f"- {f}" for f in feedback),
        current_json=current_json,
    )
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[filled],
    )
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}")
