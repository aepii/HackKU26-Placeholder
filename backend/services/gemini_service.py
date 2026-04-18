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

GATEKEEPER_PROMPT = """Look at this image. Is it a whiteboard or paper diagram showing a software/system architecture?

Return ONLY valid JSON:
{
  "is_architecture": true,
  "confidence": 0.95,
  "reason": "Contains server boxes, database symbols, and labeled arrows"
}"""


async def is_architecture_diagram(image_bytes: bytes, mime_type: str) -> dict:
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            GATEKEEPER_PROMPT,
        ],
    )
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        result = json.loads(raw)
        return result
    except json.JSONDecodeError:
        # fallback
        return {
            "is_architecture": "true" in response.text.lower(),
            "confidence": 0.5,
            "reason": "",
        }


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
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}")

    for edge in data.get("edges", []):
        edge["label"] = edge.get("label") or ""
        edge["protocol"] = edge.get("protocol") or None
        if "bidirectional" not in edge:
            edge["bidirectional"] = False

    for node in data.get("nodes", []):
        node["label"] = node.get("label") or ""
        node["description"] = node.get("description") or ""
        node["zone"] = node.get("zone") or None

    return data


IMPROVEMENT_PROMPT = """You are a senior software architect refactoring an existing system architecture.

FEEDBACK:
{feedback}

CURRENT ARCHITECTURE:
{current_json}

Refactoring philosophy:
- Prefer SIMPLIFICATION over addition
- Only add components if they directly resolve feedback
- Maximum 5 structural changes total
- Add at most 2 new nodes
- Prefer modifying existing nodes
- Removing components is allowed
- Preserve original intent and scale
- Do NOT redesign the system

Allowed change types:
- modify existing node
- merge components
- improve connections/protocols
- remove unnecessary parts
- add minimal missing infrastructure

Return ONLY valid JSON:
{{
  "nodes": [{{"id": "string", "type": "string", "label": "string", "description": "string"}}],
  "edges": [{{"source": "string", "target": "string", "label": "string"}}],
  "feedback": ["string"],
  "improvements": ["string"]
}}
"""


# This function takes the current nodes, edges, and feedback for an architecture diagram, formats them into a prompt,
# and sends it to the Gemini API to receive an improved architecture diagram based on the feedback.
# It returns the new set of nodes, edges, feedback, and a list of specific improvements made.
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


ASK_PROMPT = """You are a senior software architect reviewing this system architecture:

{context}

Answer this question concisely in 2-3 sentences, like a staff engineer would in a code review:
{question}"""


async def ask_about_architecture(
    nodes: list, edges: list, zones: list, question: str
) -> str:
    context = json.dumps({"nodes": nodes, "edges": edges, "zones": zones}, indent=2)
    filled = ASK_PROMPT.format(context=context, question=question)

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[filled],
    )
    return response.text.strip()
