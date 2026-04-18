from beanie import Document
from pydantic import BaseModel
from typing import Optional


class NodeSchema(BaseModel):
    id: str
    type: str
    label: str
    description: str


class EdgeSchema(BaseModel):
    source: str
    target: str
    label: str


class ArchitectureDoc(Document):
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    feedback: list[str]
    image_filename: Optional[str] = None

    class Settings:
        name = "architectures"
