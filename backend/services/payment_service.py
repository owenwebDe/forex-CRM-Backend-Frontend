import os
import stripe
import uuid
from typing import Optional, Dict, Any
from datetime import datetime
from models.payment import PaymentCreate, PaymentInDB, PaymentResponse

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

class PaymentService:
    def __init__(self):
        self.stripe_publishable_key = os.getenv("STRIPE_PUBLISHABLE_KEY")

    async def create_stripe_payment(self, amount: float, currency: str = "USD", user_id: str = None) -> Dict[str, Any]:
        """Create Stripe payment session"""
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': currency.lower(),
                        'product_data': {
                            'name': 'Account Deposit',
                        },
                        'unit_amount': int(amount * 100),  # Convert to cents
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?payment=success",
                cancel_url=f"{os.getenv('FRONTEND_URL', 'http://localhost:3000')}/dashboard?payment=cancelled",
                metadata={
                    'user_id': user_id,
                    'amount': str(amount),
                    'currency': currency
                }
            )
            return {
                'session_id': session.id,
                'checkout_url': session.url,
                'status': 'created'
            }
        except Exception as e:
            print(f"Stripe payment error: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }

    async def create_card_payment(self, amount: float, currency: str = "USD", user_id: str = None) -> Dict[str, Any]:
        """Create card payment (simplified for demo)"""
        try:
            # This is a simplified implementation
            # In production, you would integrate with actual payment processors
            reference = f"CARD_{uuid.uuid4().hex[:8].upper()}"
            
            return {
                'reference': reference,
                'amount': amount,
                'currency': currency,
                'status': 'pending',
                'payment_method': 'card',
                'message': 'Card payment created successfully. Please wait for processing.'
            }
        except Exception as e:
            print(f"Card payment error: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }

    async def create_bank_transfer(self, amount: float, currency: str = "USD", user_id: str = None) -> Dict[str, Any]:
        """Create bank transfer payment"""
        try:
            reference = f"BANK_{uuid.uuid4().hex[:8].upper()}"
            
            # Bank details (these would come from your actual bank)
            bank_details = {
                'bank_name': 'CRIB Markets Bank',
                'account_name': 'CRIB Markets Ltd',
                'account_number': '1234567890',
                'swift_code': 'CRIBXXX',
                'routing_number': '123456789',
                'reference': reference,
                'amount': amount,
                'currency': currency
            }
            
            return {
                'reference': reference,
                'bank_details': bank_details,
                'status': 'pending',
                'payment_method': 'bank_transfer',
                'message': 'Bank transfer details generated. Please make the transfer with the provided reference.'
            }
        except Exception as e:
            print(f"Bank transfer error: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }

    async def verify_payment(self, payment_id: str, method: str) -> Dict[str, Any]:
        """Verify payment status"""
        try:
            if method == "stripe":
                session = stripe.checkout.Session.retrieve(payment_id)
                return {
                    'status': session.payment_status,
                    'amount': session.amount_total / 100,
                    'currency': session.currency.upper(),
                    'payment_intent': session.payment_intent
                }
            else:
                # For other methods, check database status
                return {
                    'status': 'pending',
                    'message': 'Payment verification pending'
                }
        except Exception as e:
            print(f"Payment verification error: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }

    async def process_withdrawal(self, amount: float, method: str, bank_details: Dict[str, Any] = None) -> Dict[str, Any]:
        """Process withdrawal request"""
        try:
            reference = f"WITHDRAW_{uuid.uuid4().hex[:8].upper()}"
            
            # In production, this would integrate with actual payment processors
            return {
                'reference': reference,
                'amount': amount,
                'method': method,
                'bank_details': bank_details,
                'status': 'pending',
                'message': 'Withdrawal request created. Processing time: 1-3 business days.'
            }
        except Exception as e:
            print(f"Withdrawal error: {e}")
            return {
                'error': str(e),
                'status': 'failed'
            }

# Global instance
payment_service = PaymentService()