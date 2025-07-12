import base64
import os
from typing import Optional
from datetime import datetime, timedelta
import random
import string

def generate_random_string(length: int = 8) -> str:
    """Generate random string"""
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def save_base64_file(base64_data: str, filename: str, upload_dir: str = "uploads") -> str:
    """Save base64 encoded file"""
    try:
        # Create upload directory if it doesn't exist
        os.makedirs(upload_dir, exist_ok=True)
        
        # Decode base64 data
        file_data = base64.b64decode(base64_data)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = os.path.join(upload_dir, unique_filename)
        
        # Save file
        with open(file_path, 'wb') as f:
            f.write(file_data)
        
        return file_path
    except Exception as e:
        print(f"Error saving file: {e}")
        return None

def get_file_as_base64(file_path: str) -> Optional[str]:
    """Get file as base64 encoded string"""
    try:
        with open(file_path, 'rb') as f:
            file_data = f.read()
        return base64.b64encode(file_data).decode('utf-8')
    except Exception as e:
        print(f"Error reading file: {e}")
        return None

def validate_email(email: str) -> bool:
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_datetime(dt: datetime) -> str:
    """Format datetime for display"""
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def get_date_range(days: int = 30) -> tuple:
    """Get date range for the last N days"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)
    return start_date.strftime("%Y-%m-%d"), end_date.strftime("%Y-%m-%d")

def calculate_profit_loss(positions: list) -> dict:
    """Calculate profit/loss statistics"""
    if not positions:
        return {"total_profit": 0, "total_loss": 0, "net_profit": 0, "winning_trades": 0, "losing_trades": 0}
    
    total_profit = sum(pos.get("profit", 0) for pos in positions if pos.get("profit", 0) > 0)
    total_loss = sum(pos.get("profit", 0) for pos in positions if pos.get("profit", 0) < 0)
    net_profit = total_profit + total_loss
    winning_trades = len([pos for pos in positions if pos.get("profit", 0) > 0])
    losing_trades = len([pos for pos in positions if pos.get("profit", 0) < 0])
    
    return {
        "total_profit": total_profit,
        "total_loss": abs(total_loss),
        "net_profit": net_profit,
        "winning_trades": winning_trades,
        "losing_trades": losing_trades
    }

def generate_demo_chart_data(symbol: str, days: int = 30) -> dict:
    """Generate demo chart data for testing"""
    import numpy as np
    
    # Generate sample data
    dates = [(datetime.now() - timedelta(days=i)).strftime("%Y-%m-%d") for i in range(days, 0, -1)]
    
    # Generate random price movement
    base_price = 1.0 + random.uniform(-0.5, 0.5)
    prices = [base_price]
    
    for _ in range(days - 1):
        change = random.uniform(-0.05, 0.05)
        new_price = max(0.1, prices[-1] * (1 + change))
        prices.append(new_price)
    
    return {
        "symbol": symbol,
        "dates": dates,
        "prices": prices,
        "volume": [random.randint(100, 1000) for _ in range(days)]
    }