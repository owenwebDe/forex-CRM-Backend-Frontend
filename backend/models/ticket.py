from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class TicketCreate(BaseModel):
    subject: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    category: str = Field(..., description="Category: technical, billing, trading, general")
    priority: str = Field(default="medium", description="Priority: low, medium, high, urgent")
    attachments: Optional[List[str]] = None

class TicketResponse(BaseModel):
    id: str
    user_id: str
    subject: str
    description: str
    category: str
    priority: str
    status: str
    created_at: datetime
    updated_at: datetime
    closed_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    messages: List[dict] = []

class TicketMessage(BaseModel):
    message: str = Field(..., min_length=1)
    attachments: Optional[List[str]] = None

class TicketInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    subject: str
    description: str
    category: str
    priority: str = "medium"
    status: str = "open"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    assigned_to: Optional[str] = None
    messages: List[dict] = []
    attachments: Optional[List[str]] = None