from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB
from models.payment import PaymentCreate, PaymentResponse, PaymentInDB, WithdrawRequest
from services.payment_service import payment_service
from services.mt5_service import mt5_service
from utils.auth import get_current_active_user
from datetime import datetime

router = APIRouter()

@router.post("/create", response_model=dict)
async def create_payment(
    payment_data: PaymentCreate,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create a new payment"""
    try:
        db = get_database()
        
        # Create payment record
        payment_record = PaymentInDB(
            user_id=current_user.id,
            amount=payment_data.amount,
            currency=payment_data.currency,
            method=payment_data.method,
            status="pending"
        )
        
        # Process payment based on method
        if payment_data.method == "stripe":
            payment_result = await payment_service.create_stripe_payment(
                amount=payment_data.amount,
                currency=payment_data.currency,
                user_id=current_user.id
            )
            payment_record.payment_data = payment_result
            payment_record.reference = payment_result.get("session_id")
            
        elif payment_data.method == "card":
            payment_result = await payment_service.create_card_payment(
                amount=payment_data.amount,
                currency=payment_data.currency,
                user_id=current_user.id
            )
            payment_record.payment_data = payment_result
            payment_record.reference = payment_result.get("reference")
            
        elif payment_data.method == "bank_transfer":
            payment_result = await payment_service.create_bank_transfer(
                amount=payment_data.amount,
                currency=payment_data.currency,
                user_id=current_user.id
            )
            payment_record.payment_data = payment_result
            payment_record.reference = payment_result.get("reference")
            
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported payment method"
            )
        
        # Save payment record
        await db.payments.insert_one(payment_record.dict())
        
        return {
            "payment_id": payment_record.id,
            "status": payment_record.status,
            "payment_data": payment_record.payment_data,
            "reference": payment_record.reference
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating payment: {str(e)}"
        )

@router.post("/webhook/stripe")
async def stripe_webhook(request: dict):
    """Handle Stripe webhooks"""
    try:
        # This is a simplified webhook handler
        # In production, you should verify the webhook signature
        
        if request.get("type") == "checkout.session.completed":
            session = request.get("data", {}).get("object", {})
            session_id = session.get("id")
            
            # Find payment record
            db = get_database()
            payment_doc = await db.payments.find_one({"reference": session_id})
            
            if payment_doc:
                # Update payment status
                await db.payments.update_one(
                    {"reference": session_id},
                    {"$set": {"status": "completed", "updated_at": datetime.utcnow()}}
                )
                
                # Update user balance
                user_doc = await db.users.find_one({"id": payment_doc["user_id"]})
                if user_doc:
                    new_balance = user_doc["balance"] + payment_doc["amount"]
                    await db.users.update_one(
                        {"id": payment_doc["user_id"]},
                        {"$set": {"balance": new_balance}}
                    )
                    
                    # Update MT5 account balance
                    if user_doc.get("mt5_accounts"):
                        login_id = user_doc["mt5_accounts"][0].get("login")
                        if login_id:
                            await mt5_service.balance_operation(
                                login_id=login_id,
                                amount=payment_doc["amount"],
                                txn_type=0,  # Deposit
                                description="Stripe payment deposit",
                                comment=f"Payment ID: {payment_doc['id']}"
                            )
        
        return {"status": "success"}
        
    except Exception as e:
        print(f"Stripe webhook error: {e}")
        return {"status": "error", "message": str(e)}

@router.get("/history")
async def get_payment_history(current_user: UserInDB = Depends(get_current_active_user)):
    """Get payment history"""
    try:
        db = get_database()
        payments = await db.payments.find({"user_id": current_user.id}).sort("created_at", -1).to_list(100)
        
        return [
            {
                "id": payment["id"],
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
            detail=f"Error fetching payment history: {str(e)}"
        )

@router.post("/withdraw")
async def create_withdrawal(
    withdraw_request: WithdrawRequest,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Create withdrawal request"""
    try:
        # Check if user has sufficient balance
        if current_user.balance < withdraw_request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insufficient balance"
            )
        
        db = get_database()
        
        # Create withdrawal record
        withdrawal_record = PaymentInDB(
            user_id=current_user.id,
            amount=-withdraw_request.amount,  # Negative for withdrawal
            currency="USD",
            method=withdraw_request.method,
            status="pending"
        )
        
        # Process withdrawal
        payment_result = await payment_service.process_withdrawal(
            amount=withdraw_request.amount,
            method=withdraw_request.method,
            bank_details=withdraw_request.bank_details
        )
        
        withdrawal_record.payment_data = payment_result
        withdrawal_record.reference = payment_result.get("reference")
        
        # Save withdrawal record
        await db.payments.insert_one(withdrawal_record.dict())
        
        # Update user balance (deduct amount)
        new_balance = current_user.balance - withdraw_request.amount
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"balance": new_balance}}
        )
        
        return {
            "withdrawal_id": withdrawal_record.id,
            "status": withdrawal_record.status,
            "reference": withdrawal_record.reference,
            "message": "Withdrawal request created successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating withdrawal: {str(e)}"
        )

@router.get("/verify/{payment_id}")
async def verify_payment(
    payment_id: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Verify payment status"""
    try:
        db = get_database()
        payment_doc = await db.payments.find_one({"id": payment_id, "user_id": current_user.id})
        
        if not payment_doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment not found"
            )
        
        # Check payment status from payment provider
        if payment_doc["method"] == "stripe" and payment_doc.get("reference"):
            payment_result = await payment_service.verify_payment(
                payment_doc["reference"],
                payment_doc["method"]
            )
            
            # Update payment status if changed
            if payment_result.get("status") != payment_doc["status"]:
                await db.payments.update_one(
                    {"id": payment_id},
                    {"$set": {"status": payment_result["status"], "updated_at": datetime.utcnow()}}
                )
        
        return {
            "payment_id": payment_doc["id"],
            "status": payment_doc["status"],
            "amount": payment_doc["amount"],
            "method": payment_doc["method"],
            "reference": payment_doc.get("reference")
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error verifying payment: {str(e)}"
        )