import os
from google import genai
from google.genai import types
import json
from dotenv import load_dotenv

# Gemini API client setup
load_dotenv()

# Ensure the API key is available in environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found — check your .env file")

# Initialize the Gemini API client with the provided API key
client = genai.Client(api_key=api_key)

# This prompt is used to determine if an image is an architecture diagram. 
GATEKEEPER_PROMPT = """Look at this image. Is it a whiteboard or paper diagram showing a software/system architecture?

Return ONLY valid JSON:
{
  "is_architecture": true,
  "confidence": 0.95,
  "reason": "Contains server boxes, database symbols, and labeled arrows"
}"""


async def is_architecture_diagram(image_bytes: bytes, mime_type: str) -> dict:
    """This function takes image bytes and their MIME type, sends them to the Gemini API along with a prompt asking if the 
    image is an architecture diagram, and returns a JSON object indicating whether it is an architecture diagram, 
    the confidence level, and the reasoning behind the decision."""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            GATEKEEPER_PROMPT,
        ],
    )
    # The response from the Gemini API is expected to be a JSON string. We clean it up by removing any markdown formatting and 
    # then attempt to parse it as JSON. If parsing fails, we fall back to a simple heuristic based on the presence of the 
    # word "architecture" in the response text.
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

# This prompt instructs the model to analyze a whiteboard diagram and extract structured information about the architecture, 
# including nodes, edges, zones, and specific architectural critiques. The model is expected to return a JSON object that 
# adheres to a specific schema, which can then be used for further processing or visualization.
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
    """This function takes image bytes and their MIME type, sends them to the Gemini API along with a prompt asking to 
    extract architectural information, and returns a structured JSON object containing nodes, edges, zones, and feedback 
    about the architecture depicted in the image."""
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[
            types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            EXTRACTION_PROMPT,
        ],
    )
    # The response from the Gemini API is expected to be a JSON string. We clean it up by removing any markdown formatting and 
    # then attempt to parse it as JSON. If parsing fails, we raise an error indicating that the returned JSON was invalid.
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}")
    # We then perform some post-processing on the extracted data to ensure that all required fields are present and have 
    # default values if they were missing from the model's output. This includes setting default labels, descriptions, 
    # protocols, and ensuring that bidirectional edges are properly marked.
    for edge in data.get("edges", []):
        edge["label"] = edge.get("label") or ""
        edge["protocol"] = edge.get("protocol") or None
        if "bidirectional" not in edge:
            edge["bidirectional"] = False
    # We also ensure that all nodes have a label and description, and that their zone is set to None if it was not provided. 
    # This helps maintain consistency in the data structure and allows for easier processing downstream.
    for node in data.get("nodes", []):
        node["label"] = node.get("label") or ""
        node["description"] = node.get("description") or ""
        node["zone"] = node.get("zone") or None
    # Finally, we return the cleaned and structured data extracted from the image, which can then be used for visualization, 
    # analysis, or further processing in the application.
    return data

# This prompt is designed to guide the model in refactoring an existing system architecture based on specific feedback. 
# It emphasizes a philosophy of simplification and minimal changes, while still addressing the feedback provided. The 
# model is expected to return a JSON object that includes the new set of nodes and edges for the architecture, as well 
# as a list of specific improvements made in response to the feedback.
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

async def improve_architecture(nodes: list, edges: list, feedback: list[str]) -> dict:
    """This function takes the current nodes, edges, and feedback for an architecture diagram, 
    formats them into a prompt, and sends it to the Gemini API to receive an improved architecture
    diagram based on the feedback. It returns the new set of nodes, edges, feedback, and a list of 
    specific improvements made."""
    current_json = json.dumps({"nodes": nodes, "edges": edges}, indent=2)
    filled = IMPROVEMENT_PROMPT.format(
        feedback="\n".join(f"- {f}" for f in feedback),
        current_json=current_json,
    )
    # We send the filled prompt to the Gemini API and expect a JSON response that 
    # includes the new architecture and improvements.
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[filled],
    )
    # Similar to the previous functions, we clean up the response text and attempt to parse it as JSON. 
    # If parsing fails, we raise an error indicating that the returned JSON was invalid.
    raw = response.text.strip().removeprefix("```json").removesuffix("```").strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise ValueError(f"Gemini returned invalid JSON: {raw[:200]}")

# This prompt is designed to elicit a concise, expert-level answer to a specific question about the architecture.
ASK_PROMPT = """You are a senior software architect reviewing this system architecture:

{context}

Answer this question concisely in 2-3 sentences, like a staff engineer would in a code review:
{question}"""


async def ask_about_architecture(
    nodes: list, edges: list, zones: list, question: str
) -> str:
    """This function takes the current nodes, edges, zones, and a specific question about the architecture,"""
    context = json.dumps({"nodes": nodes, "edges": edges, "zones": zones}, indent=2)
    filled = ASK_PROMPT.format(context=context, question=question)
    
    # We send the filled prompt to the Gemini API and expect a concise answer 
    # to the question based on the provided architecture context.
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[filled],
    )
    # Finally, we return the response text from the Gemini API, which 
    # should contain the answer to the question about the architecture.
    return response.text.strip()

# This prompt is designed to elicit a high-level summary of the system 
# architecture, including its main components and overall pattern.
SUMMARY_PROMPT = """You are a senior software architect. Given this architecture data, write a single 2-3 sentence plain-English summary describing what this system does, its main components, and its overall pattern (e.g. microservices, monolith, event-driven).

Architecture:
{architecture_json}

Return ONLY the summary text. No bullet points, no markdown, no labels."""


async def generate_summary(nodes: list, edges: list, zones: list) -> str:
    architecture_json = json.dumps(
        {"nodes": nodes, "edges": edges, "zones": zones}, indent=2
    )
    """This function takes the current nodes, edges, and zones of the architecture, formats them into a 
    JSON string, and sends it to the Gemini API along with a prompt asking for a high-level summary of 
    the system. The response from the Gemini API is expected to be a concise summary of the architecture, 
    which is then returned as plain text."""
    filled = SUMMARY_PROMPT.format(architecture_json=architecture_json)
    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=[filled],
    )
    # Finally, we return the response text from the Gemini API, which should contain the summary of the architecture. 
    # We ensure that we strip any leading or trailing whitespace from the response before returning it.
    return response.text.strip()
