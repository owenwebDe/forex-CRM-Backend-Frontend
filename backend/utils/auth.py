from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from database import get_database
from services.auth_service import auth_service
from models.user import UserInDB
from typing import Optional

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserInDB:
    """Get current authenticated user"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = auth_service.verify_token(credentials.credentials)
        if payload is None:
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
    
    # Get user from database
    db = get_database()
    user_doc = await db.users.find_one({"id": user_id})
    
    if user_doc is None:
        raise credentials_exception
    
    return UserInDB(**user_doc)

async def get_current_active_user(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

async def get_admin_user(current_user: UserInDB = Depends(get_current_active_user)) -> UserInDB:
    """Get admin user"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def get_user_by_id(user_id: str) -> Optional[UserInDB]:
    """Get user by ID"""
    db = get_database()
    user_doc = await db.users.find_one({"id": user_id})
    return UserInDB(**user_doc) if user_doc else None

async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Get user by email"""
    db = get_database()
    user_doc = await db.users.find_one({"email": email})
    return UserInDB(**user_doc) if user_doc else None