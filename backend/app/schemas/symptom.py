from typing import List, Literal
from pydantic import BaseModel


class SymptomCheckRequest(BaseModel):
    symptoms: List[str]


class ConditionOut(BaseModel):
    name: str
    probability: Literal["High", "Moderate", "Low"]
    description: str
    urgency: Literal["routine", "soon", "urgent"]


class SymptomCheckResponse(BaseModel):
    conditions: List[ConditionOut]
    specialists: List[str]
    emergency: bool