import motor.motor_asyncio
from beanie import init_beanie
import os
from dotenv import load_dotenv
from models import Item

load_dotenv()

async def init_db():
    mongo_uri = os.getenv("MONGODB_URI")
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)

    await init_beanie(database=client.hackathon_db, document_models=[Item])