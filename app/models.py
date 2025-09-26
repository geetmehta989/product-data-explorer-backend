from typing import List, Literal, Dict, Any
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, description="User natural language question")


class AskResponse(BaseModel):
    sql: str
    columns: List[str]
    data: List[Dict[str, Any]]
    explanation: str
    chart: Literal["bar", "line", "pie", "scatter", "table"]
