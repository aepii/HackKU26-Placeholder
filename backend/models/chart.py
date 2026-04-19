from beanie import Document, Indexed
from pydantic import BaseModel, field_validator
from typing import Optional, Annotated


class NodeSchema(BaseModel):
    id: str
    type: str
    label: str = ""
    description: str = ""
    zone: Optional[str] = None

    @field_validator("label", "description", mode="before")
    @classmethod
    def coerce_str(cls, v):
        return v or ""

    @field_validator("zone", mode="before")
    @classmethod
    def coerce_zone(cls, v):
        return None if (v is None or v == "null" or v == "") else v


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

    @field_validator("protocol", mode="before")
    @classmethod
    def coerce_protocol(cls, v):
        return None if (v is None or v == "null" or v == "") else v


class ZoneSchema(BaseModel):
    id: str
    label: str = ""
    color: str = "slate"


class ArchitectureDoc(Document):
    nodes: list[NodeSchema]
    edges: list[EdgeSchema]
    zones: list[ZoneSchema] = []
    feedback: list[str]
    summary: Optional[str] = None
    image_filename: Optional[str] = None
    image_url: Optional[str] = None
    image_hash: Optional[str] = None
    share_token: Optional[str] = None
    created_at: Optional[str] = None

    class Settings:
        name = "architectures"
        indexes = [
            "share_token",
            "created_at",
            "image_hash",
        ]
