from pydantic import BaseModel


class ImproveRequest(BaseModel):
    nodes: list
    edges: list
    feedback: list[str]


class AskRequest(BaseModel):
    nodes: list
    edges: list
    zones: list = []
    question: str
