import cloudinary
import cloudinary.uploader
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Cloudinary with credentials from environment variables
cloudinary.config(
    cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
    api_key=os.getenv("CLOUDINARY_API_KEY"),
    api_secret=os.getenv("CLOUDINARY_API_SECRET"),
    secure=True,
)


async def upload_image(image_bytes: bytes, filename: str) -> str:
    """Upload image bytes to Cloudinary, return secure URL."""
    result = cloudinary.uploader.upload(
        image_bytes,
        public_id=filename,
        folder="archlens",
        resource_type="image",
        overwrite=False,
        transformation=[
            {"width": 1200, "crop": "limit"},
            {"quality": "auto"},
        ],
    )
    return result["secure_url"]
