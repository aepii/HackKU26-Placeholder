import motor.motor_asyncio
from beanie import init_beanie
import os
from dotenv import load_dotenv
from models import ArchitectureDoc

# Load environment variables from the .env file
load_dotenv()

async def init_db():
    """Initialize the MongoDB connection and Beanie ODM."""
    mongo_uri = os.getenv("MONGODB_URI")
    # Create an asynchronous MongoDB client
    client = motor.motor_asyncio.AsyncIOMotorClient(mongo_uri)
    # Initialize Beanie with the database and document models
    await init_beanie(database=client.hackathon_db, document_models=[ArchitectureDoc])