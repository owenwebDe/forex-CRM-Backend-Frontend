from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class DocumentUpload(BaseModel):
    document_type: str = Field(..., description="Type of document: id, passport, utility_bill, bank_statement")
    file_data: str = Field(..., description="Base64 encoded file data")
    file_name: str
    mime_type: str

class DocumentResponse(BaseModel):
    id: str
    user_id: str
    document_type: str
    file_name: str
    mime_type: str
    status: str = "pending"
    uploaded_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

class DocumentInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    document_type: str
    file_name: str
    mime_type: str
    file_data: str
    status: str = "pending"
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    reviewed_at: Optional[datetime] = None
    reviewer_notes: Optional[str] = None

class BankDetailsCreate(BaseModel):
    bank_name: str
    account_name: str
    account_number: str
    routing_number: Optional[str] = None
    swift_code: Optional[str] = None
    iban: Optional[str] = None
    bank_address: Optional[str] = None
    account_type: Optional[str] = "checking"

class BankDetailsResponse(BaseModel):
    id: str
    user_id: str
    bank_name: str
    account_name: str
    account_number: str
    routing_number: Optional[str] = None
    swift_code: Optional[str] = None
    iban: Optional[str] = None
    bank_address: Optional[str] = None
    account_type: str
    verified: bool = False
    created_at: datetime