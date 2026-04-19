from beanie import Document, Indexed
from pydantic import BaseModel, field_validator
from typing import Optional, Annotated


class NodeSchema(BaseModel):
    """Represents a node in the architecture diagram."""
    id: str
    type: str
<<<<<<< HEAD
    label: str = ""
    description: str = ""
    zone: Optional[str] = None
    annotation: Optional[str] = None

    @field_validator("label", "description", mode="before")
    @classmethod
    def coerce_str(cls, v):
        return v or ""

    @field_validator("zone", mode="before")
    @classmethod
    def coerce_zone(cls, v):
        return None if (v is None or v == "null" or v == "") else v

    @field_validator("annotation", mode="before")
    @classmethod
    def coerce_annotation(cls, v):
        return v or None
=======
    label: str
    description: str
    
>>>>>>> ac53590c80b066d7d46d8c5416702cf6ba784b7f


class EdgeSchema(BaseModel):
    """Represents an edge/connection between nodes in the architecture diagram."""
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
    """Represents a zone in the architecture diagram."""
    id: str
    label: str = ""
    color: str = "slate"


class ArchitectureDoc(Document):
    """Represents an architecture diagram document stored in MongoDB."""
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
        """Beanie document settings."""
        name = "architectures"
        indexes = [
            "share_token",
            "created_at",
            "image_hash",
        ]
