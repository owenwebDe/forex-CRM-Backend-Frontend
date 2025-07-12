from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer
from database import get_database
from models.user import UserCreate, UserLogin, UserResponse, UserInDB
from services.auth_service import auth_service
from utils.auth import get_current_active_user
from datetime import timedelta

router = APIRouter()

@router.post("/register", response_model=dict)
async def register(user_data: UserCreate):
    """Register a new user"""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user_in_db = UserInDB(
        name=user_data.name,
        email=user_data.email,
        hashed_password=auth_service.get_password_hash(user_data.password),
        phone=user_data.phone,
        country=user_data.country,
        city=user_data.city,
        address=user_data.address
    )
    
    # Save to database
    await db.users.insert_one(user_in_db.dict())
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": user_in_db.id}
    )
    
    # Return user data without password
    user_response = UserResponse(
        id=user_in_db.id,
        name=user_in_db.name,
        email=user_in_db.email,
        phone=user_in_db.phone,
        country=user_in_db.country,
        city=user_in_db.city,
        address=user_in_db.address,
        balance=user_in_db.balance,
        role=user_in_db.role,
        kyc_status=user_in_db.kyc_status,
        is_active=user_in_db.is_active,
        created_at=user_in_db.created_at,
        mt5_accounts=user_in_db.mt5_accounts
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response.dict()
    }

@router.post("/login", response_model=dict)
async def login(user_credentials: UserLogin):
    """Login user"""
    db = get_database()
    
    # Find user
    user_doc = await db.users.find_one({"email": user_credentials.email})
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = UserInDB(**user_doc)
    
    # Authenticate user
    if not auth_service.authenticate_user(user, user_credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = auth_service.create_access_token(
        data={"sub": user.id}
    )
    
    # Return user data without password
    user_response = UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        country=user.country,
        city=user.city,
        address=user.address,
        balance=user.balance,
        role=user.role,
        kyc_status=user.kyc_status,
        is_active=user.is_active,
        created_at=user.created_at,
        mt5_accounts=user.mt5_accounts
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_response.dict()
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: UserInDB = Depends(get_current_active_user)):
    """Get current user information"""
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

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}