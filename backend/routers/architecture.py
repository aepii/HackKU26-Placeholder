from fastapi import APIRouter, UploadFile, File, HTTPException
from models import ArchitectureDoc
from services import (
    is_architecture_diagram,
    extract_architecture,
    generate_share_token,
    current_utc_timestamp,
)

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

        result = await extract_architecture(image_bytes, mime_type)

        doc = ArchitectureDoc(
            **result,
            image_filename=file.filename,
            share_token=generate_share_token(),
            created_at=current_utc_timestamp(),
        )
        await doc.insert()

        return {**result, "share_token": doc.share_token}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history")
async def get_history():
    docs = await ArchitectureDoc.find_all().to_list()
    return [d.model_dump() for d in docs]
