from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB, UserResponse
from utils.auth import get_admin_user
from datetime import datetime, timedelta
from typing import List

router = APIRouter()

@router.get("/dashboard")
async def get_admin_dashboard(admin_user: UserInDB = Depends(get_admin_user)):
    """Get admin dashboard statistics"""
    try:
        db = get_database()
        
        # Get user statistics
        total_users = await db.users.count_documents({})
        active_users = await db.users.count_documents({"is_active": True})
        kyc_pending = await db.users.count_documents({"kyc_status": "pending"})
        kyc_approved = await db.users.count_documents({"kyc_status": "approved"})
        
        # Get payment statistics
        total_deposits = await db.payments.aggregate([
            {"$match": {"amount": {"$gt": 0}, "status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        
        total_withdrawals = await db.payments.aggregate([
            {"$match": {"amount": {"$lt": 0}, "status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        
        # Get ticket statistics
        open_tickets = await db.tickets.count_documents({"status": "open"})
        closed_tickets = await db.tickets.count_documents({"status": "closed"})
        
        # Get document statistics
        pending_documents = await db.documents.count_documents({"status": "pending"})
        approved_documents = await db.documents.count_documents({"status": "approved"})
        
        return {
            "users": {
                "total": total_users,
                "active": active_users,
                "kyc_pending": kyc_pending,
                "kyc_approved": kyc_approved
            },
            "payments": {
                "total_deposits": total_deposits[0]["total"] if total_deposits else 0,
                "total_withdrawals": abs(total_withdrawals[0]["total"]) if total_withdrawals else 0,
                "net_flow": (total_deposits[0]["total"] if total_deposits else 0) + (total_withdrawals[0]["total"] if total_withdrawals else 0)
            },
            "tickets": {
                "open": open_tickets,
                "closed": closed_tickets,
                "total": open_tickets + closed_tickets
            },
            "documents": {
                "pending": pending_documents,
                "approved": approved_documents,
                "total": pending_documents + approved_documents
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching admin dashboard: {str(e)}"
        )

@router.get("/users", response_model=List[UserResponse])
async def get_all_users(admin_user: UserInDB = Depends(get_admin_user)):
    """Get all users (admin only)"""
    try:
        db = get_database()
        users = await db.users.find({}).to_list(1000)
        
        return [
            UserResponse(
                id=user["id"],
                name=user["name"],
                email=user["email"],
                phone=user.get("phone"),
                country=user.get("country"),
                city=user.get("city"),
                address=user.get("address"),
                balance=user.get("balance", 0),
                role=user.get("role", "user"),
                kyc_status=user.get("kyc_status", "pending"),
                is_active=user.get("is_active", True),
                created_at=user["created_at"],
                mt5_accounts=user.get("mt5_accounts", [])
            )
            for user in users
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching users: {str(e)}"
        )

@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Get user by ID (admin only)"""
    try:
        db = get_database()
        user = await db.users.find_one({"id": user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            phone=user.get("phone"),
            country=user.get("country"),
            city=user.get("city"),
            address=user.get("address"),
            balance=user.get("balance", 0),
            role=user.get("role", "user"),
            kyc_status=user.get("kyc_status", "pending"),
            is_active=user.get("is_active", True),
            created_at=user["created_at"],
            mt5_accounts=user.get("mt5_accounts", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching user: {str(e)}"
        )

@router.put("/users/{user_id}/kyc")
async def update_user_kyc_status(
    user_id: str,
    kyc_data: dict,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Update user KYC status (admin only)"""
    try:
        db = get_database()
        
        # Update user KYC status
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"kyc_status": kyc_data.get("status", "pending")}}
        )
        
        return {"message": "KYC status updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating KYC status: {str(e)}"
        )

@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Activate/deactivate user (admin only)"""
    try:
        db = get_database()
        
        # Get current user status
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Toggle activation status
        new_status = not user.get("is_active", True)
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"is_active": new_status}}
        )
        
        return {"message": f"User {'activated' if new_status else 'deactivated'} successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating user status: {str(e)}"
        )

@router.put("/users/{user_id}/balance")
async def update_user_balance(
    user_id: str,
    balance_data: dict,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Update user balance (admin only)"""
    try:
        db = get_database()
        
        # Update user balance
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"balance": balance_data.get("balance", 0)}}
        )
        
        return {"message": "Balance updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating balance: {str(e)}"
        )

@router.get("/payments/history")
async def get_all_payments(admin_user: UserInDB = Depends(get_admin_user)):
    """Get all payments (admin only)"""
    try:
        db = get_database()
        payments = await db.payments.find({}).sort("created_at", -1).to_list(1000)
        
        return [
            {
                "id": payment["id"],
                "user_id": payment["user_id"],
                "amount": payment["amount"],
                "currency": payment["currency"],
                "method": payment["method"],
                "status": payment["status"],
                "reference": payment.get("reference"),
                "created_at": payment["created_at"],
                "updated_at": payment["updated_at"]
            }
            for payment in payments
        ]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payments: {str(e)}"
        )

@router.put("/payments/{payment_id}/status")
async def update_payment_status(
    payment_id: str,
    status_data: dict,
    admin_user: UserInDB = Depends(get_admin_user)
):
    """Update payment status (admin only)"""
    try:
        db = get_database()
        
        # Update payment status
        await db.payments.update_one(
            {"id": payment_id},
            {"$set": {
                "status": status_data.get("status", "pending"),
                "updated_at": datetime.utcnow()
            }}
        )
        
        return {"message": "Payment status updated successfully"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating payment status: {str(e)}"
        )

@router.get("/analytics/monthly")
async def get_monthly_analytics(admin_user: UserInDB = Depends(get_admin_user)):
    """Get monthly analytics (admin only)"""
    try:
        db = get_database()
        
        # Get monthly user registrations
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        monthly_users = await db.users.aggregate([
            {"$match": {"created_at": {"$gte": start_date, "$lte": end_date}}},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]).to_list(12)
        
        # Get monthly payment volumes
        monthly_payments = await db.payments.aggregate([
            {"$match": {
                "created_at": {"$gte": start_date, "$lte": end_date},
                "status": "completed"
            }},
            {"$group": {
                "_id": {
                    "year": {"$year": "$created_at"},
                    "month": {"$month": "$created_at"}
                },
                "total_amount": {"$sum": "$amount"},
                "count": {"$sum": 1}
            }},
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]).to_list(12)
        
        return {
            "monthly_users": monthly_users,
            "monthly_payments": monthly_payments
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching analytics: {str(e)}"
        )