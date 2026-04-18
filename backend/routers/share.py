from fastapi import APIRouter, HTTPException
from models import ArchitectureDoc

router = APIRouter(prefix="/api", tags=["share"])


@router.get("/share/{token}")
async def get_shared_architecture(token: str):
    doc = await ArchitectureDoc.find_one(ArchitectureDoc.share_token == token)
    if not doc:
        raise HTTPException(
            status_code=404, detail="Share link not found or expired.")
    return {**doc.model_dump(), "id": str(doc.id)}
