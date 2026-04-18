from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import init_db
from models import Item

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="My API",lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.get("/api/ping")
async def ping():
    return {"message": "pong"}

@app.get("/api/items", response_model=list[Item])
async def get_items():
    return await Item.find_all().to_list()

@app.post("/api/items", response_model=Item)
async def create_item(item: Item):
    await item.insert()
    return item