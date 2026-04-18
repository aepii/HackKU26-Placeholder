from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from gemini_service import is_architecture_diagram, extract_architecture
from contextlib import asynccontextmanager
from database import init_db
from models import ArchitectureDoc


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="My API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


@app.post("/api/validate-architecture")
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
        doc = ArchitectureDoc(**result, image_filename=file.filename)
        await doc.insert()
        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/history")
async def get_history():
    docs = await ArchitectureDoc.find_all().to_list()
    return [d.model_dump() for d in docs]
