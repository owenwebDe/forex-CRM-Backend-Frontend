from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from database import get_database
from models.user import UserInDB
from models.mt5 import MT5LoginRequest, MT5AccountInfo, MT5Position, MT5Order, MT5TradeRequest, MT5HistoryRequest, MT5AccountCreate
from services.mt5_service import mt5_service
from utils.auth import get_current_active_user
from datetime import datetime, timedelta

router = APIRouter()

@router.post("/connect")
async def connect_mt5(
    login_request: MT5LoginRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Connect to MT5 server"""
    try:
        # Login to MT5 API
        success = await mt5_service.login()
        if success:
            return {"message": "Connected to MT5 successfully", "status": "connected"}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to connect to MT5 server"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MT5 connection error: {str(e)}"
        )

@router.post("/disconnect")
async def disconnect_mt5(current_user: UserInDB = Depends(get_current_active_user)):
    """Disconnect from MT5 server"""
    try:
        await mt5_service.logout()
        return {"message": "Disconnected from MT5 successfully", "status": "disconnected"}
    except Exception as e:
        return {"message": "MT5 disconnect completed", "status": "disconnected"}

@router.get("/account")
async def get_account_info(current_user: UserInDB = Depends(get_current_active_user)):
    """Get MT5 account information"""
    try:
        # For demo purposes, return mock data if no MT5 account exists
        if not current_user.mt5_accounts:
            return {
                "login": 12345,
                "balance": current_user.balance,
                "equity": current_user.balance,
                "margin": 0.0,
                "free_margin": current_user.balance,
                "profit": 0.0,
                "credit": 0.0,
                "leverage": 100,
                "name": current_user.name,
                "server": "Demo",
                "currency": "USD"
            }
        
        # Get account info from MT5 API
        login_id = current_user.mt5_accounts[0].get("login", 12345)
        account_info = await mt5_service.get_account_info(login_id)
        
        if account_info:
            return account_info.dict()
        else:
            # Return mock data
            return {
                "login": login_id,
                "balance": current_user.balance,
                "equity": current_user.balance,
                "margin": 0.0,
                "free_margin": current_user.balance,
                "profit": 0.0,
                "credit": 0.0,
                "leverage": 100,
                "name": current_user.name,
                "server": "Demo",
                "currency": "USD"
            }
    except Exception as e:
        # Return mock data on error
        return {
            "login": 12345,
            "balance": current_user.balance,
            "equity": current_user.balance,
            "margin": 0.0,
            "free_margin": current_user.balance,
            "profit": 0.0,
            "credit": 0.0,
            "leverage": 100,
            "name": current_user.name,
            "server": "Demo",
            "currency": "USD"
        }

@router.get("/positions")
async def get_positions(current_user: UserInDB = Depends(get_current_active_user)):
    """Get open positions"""
    try:
        if not current_user.mt5_accounts:
            return []
        
        login_id = current_user.mt5_accounts[0].get("login", 12345)
        positions = await mt5_service.get_positions(login_id)
        
        return [pos.dict() for pos in positions]
    except Exception as e:
        return []

@router.get("/orders")
async def get_orders(current_user: UserInDB = Depends(get_current_active_user)):
    """Get pending orders"""
    try:
        if not current_user.mt5_accounts:
            return []
        
        login_id = current_user.mt5_accounts[0].get("login", 12345)
        orders = await mt5_service.get_orders(login_id)
        
        return [order.dict() for order in orders]
    except Exception as e:
        return []

@router.get("/history")
async def get_history(current_user: UserInDB = Depends(get_current_active_user)):
    """Get trade history"""
    try:
        if not current_user.mt5_accounts:
            return []
        
        login_id = current_user.mt5_accounts[0].get("login", 12345)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=30)
        
        history = await mt5_service.get_trade_history(
            login_id,
            start_date.strftime("%Y-%m-%d"),
            end_date.strftime("%Y-%m-%d")
        )
        
        return history
    except Exception as e:
        return []

@router.post("/account/create")
async def create_mt5_account(
    account_data: MT5AccountCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create new MT5 account"""
    try:
        # Prepare account data for MT5 API
        mt5_account_data = {
            "id": 0,
            "accountid": 0,
            "type": 0,
            "platform": account_data.platform,
            "server": account_data.server,
            "groupName": account_data.groupName,
            "name": account_data.name,
            "email": account_data.email,
            "phone": account_data.phone,
            "country": current_user.country or "",
            "city": current_user.city or "",
            "address": current_user.address or "",
            "balance": account_data.balance,
            "mPassword": "DefaultPass123!",
            "iPassword": "DefaultPass123!",
            "leverage": account_data.leverage
        }
        
        # Create account in MT5
        result = await mt5_service.create_account(mt5_account_data)
        
        if result:
            # Update user's MT5 accounts
            db = get_database()
            new_account = {
                "login": result.get("login", 12345),
                "server": account_data.server,
                "group": account_data.groupName,
                "leverage": account_data.leverage,
                "created_at": datetime.utcnow().isoformat()
            }
            
            await db.users.update_one(
                {"id": current_user.id},
                {"$push": {"mt5_accounts": new_account}}
            )
            
            return {"message": "MT5 account created successfully", "account": new_account}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create MT5 account"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating MT5 account: {str(e)}"
        )

@router.post("/trade/open")
async def open_trade(
    trade_request: MT5TradeRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Open a new trade"""
    try:
        if not current_user.mt5_accounts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No MT5 account found"
            )
        
        result = await mt5_service.open_trade(trade_request)
        
        if result:
            return {"message": "Trade opened successfully", "trade": result}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to open trade"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error opening trade: {str(e)}"
        )

@router.post("/trade/close")
async def close_trade(
    trade_request: MT5TradeRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Close a trade"""
    try:
        if not current_user.mt5_accounts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No MT5 account found"
            )
        
        result = await mt5_service.close_trade(trade_request)
        
        if result:
            return {"message": "Trade closed successfully", "trade": result}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to close trade"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error closing trade: {str(e)}"
        )

@router.post("/balance")
async def update_balance(
    operation: dict,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update account balance"""
    try:
        if not current_user.mt5_accounts:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No MT5 account found"
            )
        
        login_id = current_user.mt5_accounts[0].get("login", 12345)
        
        success = await mt5_service.balance_operation(
            login_id=login_id,
            amount=operation.get("amount", 0),
            txn_type=operation.get("txn_type", 0),
            description=operation.get("description", "Balance update"),
            comment=operation.get("comment", "")
        )
        
        if success:
            # Update user balance in database
            db = get_database()
            new_balance = current_user.balance + operation.get("amount", 0)
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {"balance": new_balance}}
            )
            
            return {"message": "Balance updated successfully", "new_balance": new_balance}
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update balance"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating balance: {str(e)}"
        )