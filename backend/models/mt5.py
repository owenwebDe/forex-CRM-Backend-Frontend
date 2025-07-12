from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MT5LoginRequest(BaseModel):
    user: str
    password: str
    host: str
    port: int

class MT5AccountInfo(BaseModel):
    login: Optional[int] = None
    balance: float = 0.0
    equity: float = 0.0
    margin: float = 0.0
    free_margin: float = 0.0
    profit: float = 0.0
    credit: float = 0.0
    leverage: Optional[int] = None
    name: Optional[str] = None
    server: Optional[str] = None
    currency: Optional[str] = "USD"

class MT5Position(BaseModel):
    id: Optional[int] = None
    dealId: Optional[int] = None
    loginid: Optional[int] = None
    positionid: Optional[int] = None
    symbol: str
    lotsize: float = 0.0
    type: str
    opentime: Optional[int] = None
    price: float = 0.0
    entry: Optional[str] = None
    commission: float = 0.0
    reason: Optional[str] = None
    swap: float = 0.0
    comment: Optional[str] = None
    orderId: Optional[int] = None
    profit: float = 0.0
    currentPrice: float = 0.0
    sl: float = 0.0
    tp: float = 0.0
    groupname: Optional[str] = None
    marginRate: float = 0.0

class MT5Order(BaseModel):
    ticket: Optional[int] = None
    symbol: str
    type: str
    volume: float
    price: float
    sl: float = 0.0
    tp: float = 0.0
    comment: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None

class MT5TradeRequest(BaseModel):
    loginid: int
    positionId: Optional[int] = None
    positionById: Optional[int] = None
    symbol: str
    volume: float
    price: float
    type: str
    tp: float = 0.0
    sl: float = 0.0
    comment: Optional[str] = None

class MT5HistoryRequest(BaseModel):
    loginId: int
    startDate: str
    endDate: str

class MT5ChartRequest(BaseModel):
    symbol: str
    start_date: str
    end_date: str

class MT5AccountCreate(BaseModel):
    name: str
    email: str
    phone: str
    country: str
    city: str
    address: str
    balance: float = 0.0
    leverage: int = 100
    groupName: str = "demo"
    platform: int = 5
    server: str = "Demo"