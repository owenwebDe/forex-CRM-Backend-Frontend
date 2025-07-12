from fastapi import APIRouter, HTTPException, Depends, status
from database import get_database
from models.user import UserInDB
from services.mt5_service import mt5_service
from utils.auth import get_current_active_user
from utils.helpers import generate_demo_chart_data, get_date_range
from datetime import datetime, timedelta
import random

router = APIRouter()

@router.get("/equity-data")
async def get_equity_data(current_user: UserInDB = Depends(get_current_active_user)):
    """Get equity chart data"""
    try:
        # Generate sample equity data for the last 30 days
        days = 30
        end_date = datetime.now()
        dates = []
        equity_data = []
        balance_data = []
        
        base_balance = current_user.balance
        current_equity = base_balance
        
        for i in range(days, 0, -1):
            date = end_date - timedelta(days=i)
            dates.append(date.strftime("%m/%d"))
            
            # Generate realistic equity fluctuation
            daily_change = random.uniform(-0.02, 0.03)  # -2% to +3% daily change
            current_equity = max(0, current_equity * (1 + daily_change))
            
            equity_data.append(round(current_equity, 2))
            balance_data.append(round(base_balance, 2))
        
        return {
            "labels": dates,
            "equity_data": equity_data,
            "balance_data": balance_data
        }
        
    except Exception as e:
        # Return demo data on error
        return {
            "labels": ["01/01", "01/02", "01/03", "01/04", "01/05"],
            "equity_data": [1000, 1050, 1020, 1080, 1100],
            "balance_data": [1000, 1000, 1000, 1000, 1000]
        }

@router.get("/monthly-deposits")
async def get_monthly_deposits(current_user: UserInDB = Depends(get_current_active_user)):
    """Get monthly deposits chart data"""
    try:
        db = get_database()
        
        # Get deposits for the last 12 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        deposits = await db.payments.find({
            "user_id": current_user.id,
            "amount": {"$gt": 0},
            "status": "completed",
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(1000)
        
        # Group by month
        monthly_data = {}
        for deposit in deposits:
            month_key = deposit["created_at"].strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = 0
            monthly_data[month_key] += deposit["amount"]
        
        # Generate last 12 months labels
        labels = []
        deposit_data = []
        
        for i in range(11, -1, -1):
            date = end_date - timedelta(days=i*30)
            month_key = date.strftime("%Y-%m")
            month_label = date.strftime("%b %Y")
            
            labels.append(month_label)
            deposit_data.append(monthly_data.get(month_key, 0))
        
        return {
            "labels": labels,
            "deposit_data": deposit_data
        }
        
    except Exception as e:
        # Return demo data on error
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        demo_data = [random.randint(0, 2000) for _ in range(12)]
        return {
            "labels": months,
            "deposit_data": demo_data
        }

@router.get("/monthly-withdrawals")
async def get_monthly_withdrawals(current_user: UserInDB = Depends(get_current_active_user)):
    """Get monthly withdrawals chart data"""
    try:
        db = get_database()
        
        # Get withdrawals for the last 12 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        withdrawals = await db.payments.find({
            "user_id": current_user.id,
            "amount": {"$lt": 0},
            "status": "completed",
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(1000)
        
        # Group by month
        monthly_data = {}
        for withdrawal in withdrawals:
            month_key = withdrawal["created_at"].strftime("%Y-%m")
            if month_key not in monthly_data:
                monthly_data[month_key] = 0
            monthly_data[month_key] += abs(withdrawal["amount"])
        
        # Generate last 12 months labels
        labels = []
        withdrawal_data = []
        
        for i in range(11, -1, -1):
            date = end_date - timedelta(days=i*30)
            month_key = date.strftime("%Y-%m")
            month_label = date.strftime("%b %Y")
            
            labels.append(month_label)
            withdrawal_data.append(monthly_data.get(month_key, 0))
        
        return {
            "labels": labels,
            "withdrawal_data": withdrawal_data
        }
        
    except Exception as e:
        # Return demo data on error
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        demo_data = [random.randint(0, 1500) for _ in range(12)]
        return {
            "labels": months,
            "withdrawal_data": demo_data
        }

@router.get("/deposit-withdrawal-comparison")
async def get_deposit_withdrawal_comparison(current_user: UserInDB = Depends(get_current_active_user)):
    """Get deposit vs withdrawal comparison chart data"""
    try:
        db = get_database()
        
        # Get all transactions for the last 12 months
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        transactions = await db.payments.find({
            "user_id": current_user.id,
            "status": "completed",
            "created_at": {"$gte": start_date, "$lte": end_date}
        }).to_list(1000)
        
        # Group by month
        monthly_deposits = {}
        monthly_withdrawals = {}
        
        for transaction in transactions:
            month_key = transaction["created_at"].strftime("%Y-%m")
            
            if transaction["amount"] > 0:
                if month_key not in monthly_deposits:
                    monthly_deposits[month_key] = 0
                monthly_deposits[month_key] += transaction["amount"]
            else:
                if month_key not in monthly_withdrawals:
                    monthly_withdrawals[month_key] = 0
                monthly_withdrawals[month_key] += abs(transaction["amount"])
        
        # Generate last 12 months labels
        labels = []
        deposit_data = []
        withdrawal_data = []
        net_data = []
        
        for i in range(11, -1, -1):
            date = end_date - timedelta(days=i*30)
            month_key = date.strftime("%Y-%m")
            month_label = date.strftime("%b %Y")
            
            labels.append(month_label)
            deposits = monthly_deposits.get(month_key, 0)
            withdrawals = monthly_withdrawals.get(month_key, 0)
            net = deposits - withdrawals
            
            deposit_data.append(deposits)
            withdrawal_data.append(withdrawals)
            net_data.append(net)
        
        return {
            "labels": labels,
            "deposit_data": deposit_data,
            "withdrawal_data": withdrawal_data,
            "net_data": net_data
        }
        
    except Exception as e:
        # Return demo data on error
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        deposits = [random.randint(0, 2000) for _ in range(12)]
        withdrawals = [random.randint(0, 1500) for _ in range(12)]
        net = [d - w for d, w in zip(deposits, withdrawals)]
        
        return {
            "labels": months,
            "deposit_data": deposits,
            "withdrawal_data": withdrawals,
            "net_data": net
        }

@router.get("/trading-performance")
async def get_trading_performance(current_user: UserInDB = Depends(get_current_active_user)):
    """Get trading performance data"""
    try:
        # This would normally get data from MT5 API
        # For now, return demo data
        
        return {
            "total_trades": random.randint(50, 200),
            "winning_trades": random.randint(25, 100),
            "losing_trades": random.randint(25, 100),
            "win_rate": random.uniform(0.4, 0.7),
            "total_profit": random.uniform(-500, 2000),
            "average_profit": random.uniform(-10, 50),
            "best_trade": random.uniform(50, 500),
            "worst_trade": random.uniform(-500, -50)
        }
        
    except Exception as e:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "total_profit": 0,
            "average_profit": 0,
            "best_trade": 0,
            "worst_trade": 0
        }

@router.get("/symbol-performance/{symbol}")
async def get_symbol_performance(
    symbol: str,
    current_user: UserInDB = Depends(get_current_active_user)
):
    """Get performance data for a specific symbol"""
    try:
        # Get chart data from MT5 API
        start_date, end_date = get_date_range(30)
        chart_data = await mt5_service.get_chart_data(symbol, start_date, end_date)
        
        if chart_data:
            return chart_data
        else:
            # Return demo data
            return generate_demo_chart_data(symbol, 30)
            
    except Exception as e:
        return generate_demo_chart_data(symbol, 30)