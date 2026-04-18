from fastapi import APIRouter, UploadFile, File, HTTPException
from models import ArchitectureDoc
from services import (
    is_architecture_diagram,
    extract_architecture,
    generate_share_token,
    current_utc_timestamp,
)
from services.gemini_service import improve_architecture
from pydantic import BaseModel
from beanie import PydanticObjectId
import os
import uuid

UPLOAD_DIR = "uploads"

router = APIRouter(prefix="/api", tags=["architecture"])


@router.post("/validate-architecture")
async def validate_architecture(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        mime_type = file.content_type or "image/jpeg"

        if not await is_architecture_diagram(image_bytes, mime_type):
            raise HTTPException(
                status_code=400,
                detail="Image does not appear to be an architecture diagram.",
            )

        ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
        saved_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(UPLOAD_DIR, saved_name)
        with open(save_path, "wb") as f:
            f.write(image_bytes)

        result = await extract_architecture(image_bytes, mime_type)

        doc = ArchitectureDoc(
            **result,
            image_filename=saved_name,
            share_token=generate_share_token(),
            created_at=current_utc_timestamp(),
        )
        await doc.insert()

        return {
            **result,
            "id": str(doc.id),
            "image_filename": saved_name,
            "share_token": doc.share_token,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history():
    docs = await ArchitectureDoc.find_all().to_list()
    return [{**d.model_dump(), "id": str(d.id)} for d in docs]


@router.delete("/history/{doc_id}")
async def delete_history_item(doc_id: str):
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
    nodes: list
    edges: list
    feedback: list[str]


@router.post("/improve-architecture")
async def improve_architecture_endpoint(body: ImproveRequest):
    try:
        result = await improve_architecture(body.nodes, body.edges, body.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
