import httpx
import os
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from models.mt5 import MT5AccountInfo, MT5Position, MT5Order, MT5TradeRequest, MT5HistoryRequest, MT5ChartRequest
import json

class MT5Service:
    def __init__(self):
        self.base_url = os.getenv("MT5_API_BASE_URL", "http://173.208.156.141:6700")
        self.manager_id = os.getenv("MT5_MANAGER_ID", "backofficeApi")
        self.manager_password = os.getenv("MT5_MANAGER_PASSWORD", "Trade@2022")
        self.server_ip = os.getenv("MT5_SERVER_IP", "173.208.156.141")
        self.token = None
        self.logged_in = False

    async def get_token(self) -> Optional[str]:
        """Get authentication token from MT5 API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/token",
                    json={
                        "userName": self.manager_id,
                        "password": self.manager_password
                    }
                )
                if response.status_code == 200:
                    self.token = response.text.strip('"')
                    return self.token
                return None
        except Exception as e:
            print(f"Error getting token: {e}")
            return None

    async def login(self) -> bool:
        """Login to MT5 API"""
        try:
            if not self.token:
                await self.get_token()
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/login",
                    json={
                        "mngId": int(self.manager_id) if self.manager_id.isdigit() else 0,
                        "pwd": self.manager_password,
                        "srvIp": self.server_ip
                    }
                )
                self.logged_in = response.status_code == 200
                return self.logged_in
        except Exception as e:
            print(f"Error logging in: {e}")
            return False

    async def logout(self) -> bool:
        """Logout from MT5 API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(f"{self.base_url}/Home/logout")
                self.logged_in = False
                return response.status_code == 200
        except Exception as e:
            print(f"Error logging out: {e}")
            return False

    async def ensure_logged_in(self):
        """Ensure we're logged in to MT5 API"""
        if not self.logged_in:
            await self.login()

    async def get_account_info(self, login_id: int) -> Optional[MT5AccountInfo]:
        """Get account information"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/Home/getUserInfo/{login_id}")
                if response.status_code == 200:
                    data = response.json()
                    return MT5AccountInfo(**data) if data else None
                return None
        except Exception as e:
            print(f"Error getting account info: {e}")
            return None

    async def get_positions(self, login_id: int) -> List[MT5Position]:
        """Get open positions"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/Home/getPosition/{login_id}")
                if response.status_code == 200:
                    data = response.json()
                    return [MT5Position(**pos) for pos in data] if data else []
                return []
        except Exception as e:
            print(f"Error getting positions: {e}")
            return []

    async def get_orders(self, login_id: int) -> List[MT5Order]:
        """Get pending orders"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/Home/getPendingOrder/{login_id}")
                if response.status_code == 200:
                    data = response.json()
                    return [MT5Order(**order) for order in data] if data else []
                return []
        except Exception as e:
            print(f"Error getting orders: {e}")
            return []

    async def get_trade_history(self, login_id: int, start_date: str, end_date: str) -> List[Dict]:
        """Get trade history"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/tradehistory",
                    json={
                        "loginId": login_id,
                        "startDate": start_date,
                        "endDate": end_date
                    }
                )
                if response.status_code == 200:
                    data = response.json()
                    return data if data else []
                return []
        except Exception as e:
            print(f"Error getting trade history: {e}")
            return []

    async def create_account(self, account_data: Dict[str, Any]) -> Optional[Dict]:
        """Create new MT5 account"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/createAccount",
                    json=account_data
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error creating account: {e}")
            return None

    async def balance_operation(self, login_id: int, amount: float, txn_type: int, description: str, comment: str = "") -> bool:
        """Perform balance operation (deposit/withdraw)"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/balanceOP",
                    json={
                        "loginid": login_id,
                        "amount": amount,
                        "txnType": txn_type,
                        "description": description,
                        "comment": comment
                    }
                )
                return response.status_code == 200
        except Exception as e:
            print(f"Error performing balance operation: {e}")
            return False

    async def open_trade(self, trade_request: MT5TradeRequest) -> Optional[Dict]:
        """Open a new trade"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/sendOpenTrade",
                    json=trade_request.dict()
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error opening trade: {e}")
            return None

    async def close_trade(self, trade_request: MT5TradeRequest) -> Optional[Dict]:
        """Close a trade"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/sendCloseTrade",
                    json=trade_request.dict()
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error closing trade: {e}")
            return None

    async def get_chart_data(self, symbol: str, start_date: str, end_date: str) -> Optional[Dict]:
        """Get chart data"""
        try:
            await self.ensure_logged_in()
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/Home/getchart",
                    json={
                        "symbol": symbol,
                        "from": start_date,
                        "to": end_date
                    }
                )
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            print(f"Error getting chart data: {e}")
            return None

# Global instance
mt5_service = MT5Service()