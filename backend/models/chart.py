from beanie import Document
from pydantic import BaseModel, field_validator
from typing import Optional


class NodeSchema(BaseModel):
    id: str
    type: str
    label: str
    description: str
    zone: Optional[str] = None


class EdgeSchema(BaseModel):
    source: str
    target: str
    label: str = ""
    protocol: Optional[str] = None
    bidirectional: Optional[bool] = False

    @field_validator("label", mode="before")
    @classmethod
    def coerce_label(cls, v):
        return v or ""


class ZoneSchema(BaseModel):
    id: str
    label: str
    color: str


class ArchitectureDoc(Document):
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    zones: list[ZoneSchema] = []
    feedback: list[str]
    image_filename: Optional[str] = None
    share_token: Optional[str] = None
    created_at: Optional[str] = None

    class Settings:
        name = "architectures"

