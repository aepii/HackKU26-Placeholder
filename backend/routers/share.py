from fastapi import APIRouter, HTTPException
from models import ArchitectureDoc

router = APIRouter(prefix="/api", tags=["share"])


@router.get("/share/{token}")
async def get_shared_architecture(token: str):
    """ Get a shared architecture document by its token."""
    doc = await ArchitectureDoc.find_one(ArchitectureDoc.share_token == token)
    # If the document is not found or expired, return a 404 error.
    if not doc:
        raise HTTPException(
            status_code=404, detail="Share link not found or expired.")
        # If the document is found, return its data as a dictionary, including the id as a string.
    return {**doc.model_dump(), "id": str(doc.id)}
