from beanie import Document
from pydantic import Field
from typing import Optional

# Example model for an item
class Item(Document):
    name: str
    description: Optional[str] = None
    price: float

    class Settings:
        name = "items"


class User(Document):
    username: str
    email: str
    password_hash: str

    class Settings:
        name = "users"