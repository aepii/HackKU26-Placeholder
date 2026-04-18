from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from gemini_service import is_architecture_diagram, extract_architecture
from contextlib import asynccontextmanager
from database import init_db
from models import ArchitectureDoc
import os, shutil, uuid
from pydantic import BaseModel

# Directory to store uploaded images
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
# FastAPI lifespan function to initialize the database connection
async def lifespan(app: FastAPI):
    await init_db()
    yield

# Create FastAPI app with CORS middleware and static file serving for uploads
app = FastAPI(title="My API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount the uploads directory to serve uploaded images
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Endpoint to validate and extract architecture from an uploaded image
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
        # Save the uploaded image to the uploads directory with a unique filename
        ext = os.path.splitext(file.filename or "photo.jpg")[1] or ".jpg"
        saved_name = f"{uuid.uuid4().hex}{ext}"
        save_path = os.path.join(UPLOAD_DIR, saved_name)
        with open(save_path, "wb") as f:
            f.write(image_bytes)
            
        # Extract architecture information and save it to the database
        result = await extract_architecture(image_bytes, mime_type)
        doc = ArchitectureDoc(**result, image_filename=file.filename)
        await doc.insert()
        return {**result, "id": str(doc.id), "image_filename": saved_name}
    
    # Handle exceptions and return appropriate HTTP responses
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to retrieve the history of uploaded architecture diagrams and their extracted information
@app.get("/api/history")
async def get_history():
    docs = await ArchitectureDoc.find_all().to_list()
    return [
        {**d.model_dump(), "id": str(d.id)}
        for d in docs
    ]
 
 # Endpoint to delete a specific history item by its document ID, including the associated image file if it exists   
@app.delete("/api/history/{doc_id}")
async def delete_history_item(doc_id: str):
    from beanie import PydanticObjectId
    doc = await ArchitectureDoc.get(PydanticObjectId(doc_id))
    if not doc:
        raise HTTPException(status_code=404, detail="Not found")
    if doc.image_filename:
        path = os.path.join(UPLOAD_DIR, doc.image_filename)
        if os.path.exists(path):
            os.remove(path)
    await doc.delete()
    return {"ok": True}

# Data model for the request body of the improve architecture endpoint, containing the current nodes, edges, and feedback for an architecture diagram
class ImproveRequest(BaseModel):
    nodes: list
    edges: list
    feedback: list[str]

# Endpoint to improve an existing architecture diagram based on feedback, returning a new set of nodes and edges representing the improved architecture
@app.post("/api/improve-architecture")
async def improve_architecture_endpoint(body: ImproveRequest):
    try:
        from gemini_service import improve_architecture
        result = await improve_architecture(body.nodes, body.edges, body.feedback)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))