from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union

class ExplainRequest(BaseModel):
    query: str = Field(..., description="The SQL query to explain")

class PlanNode(BaseModel):
    node_type: str
    relation: Optional[str] = None
    cost: float
    estimated_rows: float
    actual_rows: Optional[float] = None
    actual_time: Optional[float] = None
    loops: Optional[int] = None
    buffers: Optional[Dict[str, Any]] = None
    children: List['PlanNode'] = []

class Finding(BaseModel):
    severity: str
    node_type: str
    relation: Optional[str] = None
    explanation: str
    suggestion: str

class ExplainResponse(BaseModel):
    plan: PlanNode
    raw_plan: Dict[str, Any]
    execution_time: Optional[float] = None
    findings: List[Finding] = []

class IndexSuggestion(BaseModel):
    statement: str
    reasoning: str
    rank: int

class SuggestIndexesResponse(BaseModel):
    suggestions: List[IndexSuggestion]

class SlowQueryItem(BaseModel):
    query: str = Field(..., description="The normalized SQL query string")
    calls: int = Field(..., description="Number of times executed")
    total_time: float = Field(..., description="Total execution time in milliseconds")
    mean_time: float = Field(..., description="Mean execution time in milliseconds")
    max_time: float = Field(..., description="Maximum execution time in milliseconds")
    rows: int = Field(..., description="Total number of rows retrieved or affected")

class SlowQueriesResponse(BaseModel):
    queries: List[SlowQueryItem]

class ResetStatsResponse(BaseModel):
    status: str
    message: str

class ApplyIndexRequest(BaseModel):
    statement: str
    index_name: str
    query: str

class ApplyIndexResponse(BaseModel):
    execution_time: float
    plan: PlanNode
    raw_plan: Dict[str, Any]

class DropIndexRequest(BaseModel):
    index_name: str

class AnalyzePlanRequest(BaseModel):
    raw_plan: Union[Dict[str, Any], List[Dict[str, Any]]]
