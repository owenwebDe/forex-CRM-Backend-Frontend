from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class PaymentCreate(BaseModel):
    amount: float = Field(..., gt=0)
    method: str = Field(..., description="Payment method: stripe, paystack, bank_transfer, card")
    currency: str = "USD"
    payment_details: Optional[Dict[str, Any]] = None

class PaymentResponse(BaseModel):
    id: str
    user_id: str
    amount: float
    currency: str
    method: str
    status: str
    reference: Optional[str] = None
    payment_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

class PaymentInDB(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    amount: float
    currency: str = "USD"
    method: str
    status: str = "pending"
    reference: Optional[str] = None
    payment_data: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    mt5_transaction_id: Optional[str] = None

class WithdrawRequest(BaseModel):
    amount: float = Field(..., gt=0)
    method: str = Field(..., description="Withdrawal method: bank_transfer, card")
    bank_details: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None

class BalanceOperation(BaseModel):
    loginid: int
    amount: float
    txnType: int = Field(..., description="0: Deposit, 1: Withdraw, 2: Credit, 3: Debit")
    description: str
    comment: Optional[str] = None