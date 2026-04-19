from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from models import ArchitectureDoc
from services import (
    is_architecture_diagram,
    extract_architecture,
    generate_share_token,
    current_utc_timestamp,
    generate_summary,
    ask_about_architecture,
    upload_image,
)
from services.gemini_service import improve_architecture
from pydantic import BaseModel
from beanie import PydanticObjectId
import os
import uuid
import hashlib

UPLOAD_DIR = "uploads"
router = APIRouter(prefix="/api", tags=["architecture"])


@router.post("/validate-architecture")
async def validate_architecture(file: UploadFile = File(...)):
    """Endpoint to validate and extract architecture diagram information from an uploaded image."""
    try:
        # Read the uploaded file into memory
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

        # Check for duplicates using image hash
        image_hash = hashlib.sha256(image_bytes).hexdigest()
        existing = await ArchitectureDoc.find_one(
            ArchitectureDoc.image_hash == image_hash
        )
        if existing:
            return {
                **existing.model_dump(),
                "id": str(existing.id),
                "duplicate": True,
            }

        # First gate: Is this an architecture diagram?
        gate = await is_architecture_diagram(image_bytes, mime_type)
        if not gate.get("is_architecture", False):
            raise HTTPException(
                status_code=400,
                detail=gate.get(
                    "reason", "Image does not appear to be an architecture diagram."
                ),
            )
        
        # Save the image and get a URL
        ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
        saved_name = f"{uuid.uuid4().hex}{ext}"
        image_url = await upload_image(image_bytes, saved_name)

        # Second gate: Extract architecture information
        result = await extract_architecture(image_bytes, mime_type)
        summary = await generate_summary(
            result.get("nodes", []),
            result.get("edges", []),
            result.get("zones", []),
        )

        # Save the result in the database
        doc = ArchitectureDoc(
            **result,
            summary=summary,
            image_filename=saved_name,
            image_url=image_url,
            image_hash=image_hash,
            share_token=generate_share_token(),
            created_at=current_utc_timestamp(),
        )
        await doc.insert()

        # Return the result along with metadata
        return {
            **result,
            "id": str(doc.id),
            "image_filename": saved_name,
            "image_url": image_url,
            "share_token": doc.share_token,
            "summary": summary,
            "confidence": gate.get("confidence", 1.0),
            "confidence_reason": gate.get("reason", ""),
            "duplicate": False,
        }

    # Handle known HTTP exceptions gracefully
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history():
    """Endpoint to retrieve the history of uploaded architecture diagrams."""
    docs = await ArchitectureDoc.find_all().to_list()
    return [{**d.model_dump(), "id": str(d.id)} for d in docs]


@router.get("/history/search")
async def search_history(q: str):
    """Endpoint to search the history of architecture diagrams using MongoDB Atlas Search."""
    if not q.strip():
        return []
    # Use MongoDB Atlas Search for efficient full-text search across all fields
    pipeline = [
        {
            # Use the $search stage to perform a full-text search with fuzzy matching across all fields
            "$search": {
                "index": "default",
                "text": {
                    "query": q,
                    "path": {"wildcard": "*"},
                    "fuzzy": {"maxEdits": 1},
                },
            }
        },
        # Limit results to top 10 matches for performance
        {"$limit": 10},
        {
            # Add the search score and convert _id to string for easier frontend handling
            "$addFields": {
                "id": {"$toString": "$_id"},
                "score": {"$meta": "searchScore"},
            }
        },
        # Optionally, you can sort by relevance score if needed
        {"$unset": "_id"},
    ]
    # Execute the aggregation pipeline and return results
    collection = ArchitectureDoc.get_motor_collection()
    results = await collection.aggregate(pipeline).to_list(10)
    return results


@router.get("/stats")
async def get_stats():
    """Endpoint to retrieve statistics about the uploaded architecture diagrams."""
    collection = ArchitectureDoc.get_motor_collection()
    # Complex aggregation pipeline to compute various statistics in a single query
    pipeline = [
        {
            # Normalize missing arrays so $size never sees a missing field
            "$addFields": {
                "nodes": {"$ifNull": ["$nodes", []]},
                "edges": {"$ifNull": ["$edges", []]},
                "zones": {"$ifNull": ["$zones", []]},
            }
        },
        {
            # Use $facet to compute multiple independent aggregations in one pass over the data
            "$facet": {
                "total_scans": [{"$count": "count"}],
                "node_type_distribution": [
                    {"$unwind": "$nodes"},
                    {"$group": {"_id": "$nodes.type", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                ],
                # Analyze edge protocol usage, ignoring edges without a protocol
                "protocol_usage": [
                    {"$unwind": "$edges"},
                    {"$match": {"edges.protocol": {"$ne": None}}},
                    {"$group": {"_id": "$edges.protocol", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                ],
                # Compute average complexity metrics by counting nodes, edges, and zones per document
                "avg_complexity": [
                    {
                        "$project": {
                            "nodeCount": {"$size": "$nodes"},
                            "edgeCount": {"$size": "$edges"},
                            "zoneCount": {"$size": "$zones"},
                        }
                    },
                    {
                        # Group all documents together to compute overall averages across the dataset
                        "$group": {
                            "_id": None,
                            "avgNodes": {"$avg": "$nodeCount"},
                            "avgEdges": {"$avg": "$edgeCount"},
                            "avgZones": {"$avg": "$zoneCount"},
                        }
                    },
                ],
                # Analyze scan frequency over time by grouping documents by their creation date (day-level granularity)
                "scans_over_time": [
                    {"$match": {"created_at": {"$ne": None}}},
                    {
                        "$group": {
                            "_id": {"$substr": ["$created_at", 0, 10]},
                            "count": {"$sum": 1},
                        }
                    },
                    # Sort by date ascending to show trends over time
                    {"$sort": {"_id": 1}},
                    {"$limit": 30},
                ],
            }
        },
    ]
    # Execute the aggregation pipeline and return the computed statistics
    result = await collection.aggregate(pipeline).to_list(1)
    return result[0] if result else {}


@router.delete("/history/{doc_id}")
async def delete_history_item(doc_id: str):
    """Endpoint to delete a specific architecture document from history, including its associated image file."""

    # Validate the document ID and attempt to retrieve the corresponding document from the database
    doc = await ArchitectureDoc.get(PydanticObjectId(doc_id))
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if doc.image_filename:
        path = os.path.join(UPLOAD_DIR, doc.image_filename)
        if os.path.exists(path):
            os.remove(path)
    await doc.delete()
    return {"ok": True}


class ImproveRequest(BaseModel):
    """Request model for improving architecture based on feedback."""
    nodes: list
    edges: list
    feedback: list[str]


@router.post("/improve-architecture")
async def improve_architecture_endpoint(body: ImproveRequest):
    """Endpoint to improve the architecture diagram based on user feedback."""
    try:
        result = await improve_architecture(body.nodes, body.edges, body.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AskRequest(BaseModel):
    """Request model for asking questions about the architecture."""
    nodes: list
    edges: list
    zones: list = []
    question: str


@router.post("/ask")
async def ask_architecture(body: AskRequest):
    """Endpoint to ask questions about the architecture diagram and receive answers based on its structure."""
    try:
        answer = await ask_about_architecture(
            body.nodes, body.edges, body.zones, body.question
        )
        return {"answer": answer}
    # Handle known HTTP exceptions 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
