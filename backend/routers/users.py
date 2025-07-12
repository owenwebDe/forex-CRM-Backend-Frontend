from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB, UserUpdate, UserResponse
from utils.auth import get_current_active_user

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(current_user: UserInDB = Depends(get_current_active_user)):
    """Get user profile"""
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        phone=current_user.phone,
        country=current_user.country,
        city=current_user.city,
        address=current_user.address,
        balance=current_user.balance,
        role=current_user.role,
        kyc_status=current_user.kyc_status,
        is_active=current_user.is_active,
        created_at=current_user.created_at,
        mt5_accounts=current_user.mt5_accounts
    )

@router.put("/profile")
async def update_user_profile(
    user_update: UserUpdate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update user profile"""
    try:
        db = get_database()
        
        # Prepare update data
        update_data = {}
        if user_update.name is not None:
            update_data["name"] = user_update.name
        if user_update.phone is not None:
            update_data["phone"] = user_update.phone
        if user_update.country is not None:
            update_data["country"] = user_update.country
        if user_update.city is not None:
            update_data["city"] = user_update.city
        if user_update.address is not None:
            update_data["address"] = user_update.address
        
        if update_data:
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": update_data}
            )
        
        # Get updated user
        updated_user_doc = await db.users.find_one({"id": current_user.id})
        updated_user = UserInDB(**updated_user_doc)
        
        return UserResponse(
            id=updated_user.id,
            name=updated_user.name,
            email=updated_user.email,
            phone=updated_user.phone,
            country=updated_user.country,
            city=updated_user.city,
            address=updated_user.address,
            balance=updated_user.balance,
            role=updated_user.role,
            kyc_status=updated_user.kyc_status,
            is_active=updated_user.is_active,
            created_at=updated_user.created_at,
            mt5_accounts=updated_user.mt5_accounts
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.get("/balance")
async def get_user_balance(current_user: UserInDB = Depends(get_current_active_user)):
    """Get user balance"""
    return {"balance": current_user.balance, "currency": "USD"}

@router.post("/balance/update")
async def update_user_balance(
    amount: float,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Update user balance (admin function)"""
    try:
        db = get_database()
        new_balance = current_user.balance + amount
        
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"balance": new_balance}}
        )
        
        return {"message": "Balance updated successfully", "new_balance": new_balance}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating balance: {str(e)}"
        )