#!/usr/bin/env python3
"""
CRIB Markets Backend API Testing Suite
Tests all backend endpoints comprehensively
"""

import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://c5cbed4f-9a20-49d3-82a5-bee66f58993f.preview.emergentagent.com"
API_BASE = f"{BASE_URL}/api"

# Test data
TEST_USER_DATA = {
    "name": "John Trader",
    "email": "john.trader@example.com",
    "password": "SecurePass123!",
    "phone": "+1234567890",
    "country": "United States",
    "city": "New York",
    "address": "123 Wall Street"
}

TEST_ADMIN_DATA = {
    "name": "Admin User",
    "email": "admin@cribmarkets.com",
    "password": "AdminPass123!",
    "phone": "+1987654321",
    "country": "United States",
    "city": "New York",
    "address": "456 Admin Street"
}

class APITester:
    def __init__(self):
        self.session = requests.Session()
        self.user_token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, token: str = None) -> requests.Response:
        """Make HTTP request with proper headers"""
        url = f"{API_BASE}{endpoint}" if endpoint.startswith("/") else f"{API_BASE}/{endpoint}"
        
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
        if token:
            request_headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def test_health_check(self):
        """Test health check endpoint"""
        response = self.make_request("GET", "/health")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Health Check", True, f"Status: {data.get('status')}", data)
        else:
            self.log_test("Health Check", False, f"Status code: {response.status_code if response else 'No response'}")

    def test_root_endpoint(self):
        """Test root endpoint"""
        response = self.make_request("GET", "/")
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Root Endpoint", True, f"Message: {data.get('message')}", data)
        else:
            self.log_test("Root Endpoint", False, f"Status code: {response.status_code if response else 'No response'}")

    def test_user_registration(self):
        """Test user registration"""
        response = self.make_request("POST", "/auth/register", TEST_USER_DATA)
        if response and response.status_code == 200:
            data = response.json()
            self.user_token = data.get("access_token")
            self.user_id = data.get("user", {}).get("id")
            self.log_test("User Registration", True, f"User ID: {self.user_id}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_admin_registration(self):
        """Test admin registration (will be regular user, then we'll test admin endpoints)"""
        admin_data = TEST_ADMIN_DATA.copy()
        admin_data["email"] = "admin.test@cribmarkets.com"  # Different email
        response = self.make_request("POST", "/auth/register", admin_data)
        if response and response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("access_token")
            self.admin_id = data.get("user", {}).get("id")
            self.log_test("Admin Registration", True, f"Admin ID: {self.admin_id}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Admin Registration", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_user_login(self):
        """Test user login"""
        login_data = {
            "email": TEST_USER_DATA["email"],
            "password": TEST_USER_DATA["password"]
        }
        response = self.make_request("POST", "/auth/login", login_data)
        if response and response.status_code == 200:
            data = response.json()
            self.user_token = data.get("access_token")
            self.log_test("User Login", True, "Login successful", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_get_current_user(self):
        """Test get current user endpoint"""
        if not self.user_token:
            self.log_test("Get Current User", False, "No user token available")
            return
            
        response = self.make_request("GET", "/auth/me", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get Current User", True, f"User: {data.get('name')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_user_profile(self):
        """Test user profile endpoint"""
        if not self.user_token:
            self.log_test("User Profile", False, "No user token available")
            return
            
        response = self.make_request("GET", "/user/profile", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("User Profile", True, f"Profile for: {data.get('name')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("User Profile", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_mt5_connect(self):
        """Test MT5 connection"""
        if not self.user_token:
            self.log_test("MT5 Connect", False, "No user token available")
            return
            
        mt5_data = {
            "user": "demo_user",
            "password": "demo_pass",
            "host": "173.208.156.141",
            "port": 443
        }
        response = self.make_request("POST", "/mt5/connect", mt5_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("MT5 Connect", True, f"Status: {data.get('status')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("MT5 Connect", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_mt5_account_info(self):
        """Test MT5 account info"""
        if not self.user_token:
            self.log_test("MT5 Account Info", False, "No user token available")
            return
            
        response = self.make_request("GET", "/mt5/account", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("MT5 Account Info", True, f"Balance: {data.get('balance')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("MT5 Account Info", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_mt5_positions(self):
        """Test MT5 positions"""
        if not self.user_token:
            self.log_test("MT5 Positions", False, "No user token available")
            return
            
        response = self.make_request("GET", "/mt5/positions", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("MT5 Positions", True, f"Positions count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("MT5 Positions", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_mt5_orders(self):
        """Test MT5 orders"""
        if not self.user_token:
            self.log_test("MT5 Orders", False, "No user token available")
            return
            
        response = self.make_request("GET", "/mt5/orders", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("MT5 Orders", True, f"Orders count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("MT5 Orders", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_mt5_history(self):
        """Test MT5 trade history"""
        if not self.user_token:
            self.log_test("MT5 History", False, "No user token available")
            return
            
        response = self.make_request("GET", "/mt5/history", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("MT5 History", True, f"History count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("MT5 History", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_payment_creation(self):
        """Test payment creation"""
        if not self.user_token:
            self.log_test("Payment Creation", False, "No user token available")
            return
            
        payment_data = {
            "amount": 100.0,
            "method": "stripe",
            "currency": "USD"
        }
        response = self.make_request("POST", "/payments/create", payment_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Payment Creation", True, f"Payment ID: {data.get('payment_id')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Payment Creation", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_payment_history(self):
        """Test payment history"""
        if not self.user_token:
            self.log_test("Payment History", False, "No user token available")
            return
            
        response = self.make_request("GET", "/payments/history", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Payment History", True, f"Payments count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Payment History", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_withdrawal_request(self):
        """Test withdrawal request"""
        if not self.user_token:
            self.log_test("Withdrawal Request", False, "No user token available")
            return
            
        withdrawal_data = {
            "amount": 50.0,
            "method": "bank_transfer",
            "bank_details": {
                "account_name": "John Trader",
                "account_number": "1234567890",
                "bank_name": "Test Bank"
            }
        }
        response = self.make_request("POST", "/payments/withdraw", withdrawal_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Withdrawal Request", True, f"Withdrawal ID: {data.get('withdrawal_id')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Withdrawal Request", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_charts_equity_data(self):
        """Test equity data endpoint"""
        if not self.user_token:
            self.log_test("Charts Equity Data", False, "No user token available")
            return
            
        response = self.make_request("GET", "/charts/equity-data", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Charts Equity Data", True, f"Data points: {len(data.get('labels', []))}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Charts Equity Data", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_charts_monthly_deposits(self):
        """Test monthly deposits chart data"""
        if not self.user_token:
            self.log_test("Charts Monthly Deposits", False, "No user token available")
            return
            
        response = self.make_request("GET", "/charts/monthly-deposits", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Charts Monthly Deposits", True, f"Months: {len(data.get('labels', []))}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Charts Monthly Deposits", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_charts_monthly_withdrawals(self):
        """Test monthly withdrawals chart data"""
        if not self.user_token:
            self.log_test("Charts Monthly Withdrawals", False, "No user token available")
            return
            
        response = self.make_request("GET", "/charts/monthly-withdrawals", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Charts Monthly Withdrawals", True, f"Months: {len(data.get('labels', []))}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Charts Monthly Withdrawals", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_document_upload(self):
        """Test document upload"""
        if not self.user_token:
            self.log_test("Document Upload", False, "No user token available")
            return
            
        document_data = {
            "document_type": "passport",
            "file_name": "passport.jpg",
            "mime_type": "image/jpeg",
            "file_data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/8A"
        }
        response = self.make_request("POST", "/documents/upload", document_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Document Upload", True, f"Document ID: {data.get('id')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Document Upload", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_document_list(self):
        """Test document listing"""
        if not self.user_token:
            self.log_test("Document List", False, "No user token available")
            return
            
        response = self.make_request("GET", "/documents/list", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Document List", True, f"Documents count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Document List", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_bank_details(self):
        """Test bank details creation"""
        if not self.user_token:
            self.log_test("Bank Details", False, "No user token available")
            return
            
        bank_data = {
            "bank_name": "Test Bank",
            "account_name": "John Trader",
            "account_number": "1234567890",
            "routing_number": "021000021",
            "swift_code": "TESTUS33",
            "iban": "US12345678901234567890",
            "bank_address": "123 Bank Street, New York, NY",
            "account_type": "checking"
        }
        response = self.make_request("POST", "/documents/bank-details", bank_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Bank Details", True, f"Bank: {data.get('bank_name')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Bank Details", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_ticket_creation(self):
        """Test support ticket creation"""
        if not self.user_token:
            self.log_test("Ticket Creation", False, "No user token available")
            return
            
        ticket_data = {
            "subject": "Test Support Ticket",
            "description": "This is a test support ticket for API testing",
            "category": "technical",
            "priority": "medium"
        }
        response = self.make_request("POST", "/tickets/create", ticket_data, token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Ticket Creation", True, f"Ticket ID: {data.get('id')}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Ticket Creation", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_ticket_list(self):
        """Test ticket listing"""
        if not self.user_token:
            self.log_test("Ticket List", False, "No user token available")
            return
            
        response = self.make_request("GET", "/tickets/list", token=self.user_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Ticket List", True, f"Tickets count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            self.log_test("Ticket List", False, f"Status: {response.status_code if response else 'No response'}", error_data)

    def test_admin_dashboard(self):
        """Test admin dashboard (may fail if user is not admin)"""
        if not self.admin_token:
            self.log_test("Admin Dashboard", False, "No admin token available")
            return
            
        response = self.make_request("GET", "/admin/dashboard", token=self.admin_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Admin Dashboard", True, f"Users: {data.get('users', {}).get('total', 0)}", data)
        else:
            error_data = response.json() if response else {}
            # This might fail if user doesn't have admin privileges, which is expected
            self.log_test("Admin Dashboard", False, f"Status: {response.status_code if response else 'No response'} (Expected if user is not admin)", error_data)

    def test_admin_users(self):
        """Test admin users listing (may fail if user is not admin)"""
        if not self.admin_token:
            self.log_test("Admin Users", False, "No admin token available")
            return
            
        response = self.make_request("GET", "/admin/users", token=self.admin_token)
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Admin Users", True, f"Users count: {len(data)}", data)
        else:
            error_data = response.json() if response else {}
            # This might fail if user doesn't have admin privileges, which is expected
            self.log_test("Admin Users", False, f"Status: {response.status_code if response else 'No response'} (Expected if user is not admin)", error_data)

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting CRIB Markets Backend API Tests")
        print("=" * 60)
        
        # Basic health checks
        self.test_health_check()
        self.test_root_endpoint()
        
        # Authentication tests
        self.test_user_registration()
        self.test_admin_registration()
        self.test_user_login()
        self.test_get_current_user()
        self.test_user_profile()
        
        # MT5 trading tests
        self.test_mt5_connect()
        self.test_mt5_account_info()
        self.test_mt5_positions()
        self.test_mt5_orders()
        self.test_mt5_history()
        
        # Payment tests
        self.test_payment_creation()
        self.test_payment_history()
        self.test_withdrawal_request()
        
        # Charts & analytics tests
        self.test_charts_equity_data()
        self.test_charts_monthly_deposits()
        self.test_charts_monthly_withdrawals()
        
        # Document management tests
        self.test_document_upload()
        self.test_document_list()
        self.test_bank_details()
        
        # Support system tests
        self.test_ticket_creation()
        self.test_ticket_list()
        
        # Admin tests (may fail if not admin)
        self.test_admin_dashboard()
        self.test_admin_users()
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['details']}")
        
        print("\n✅ PASSED TESTS:")
        for result in self.test_results:
            if result["success"]:
                print(f"  - {result['test']}")
        
        # Save detailed results to file
        with open("/app/backend_test_results.json", "w") as f:
            json.dump(self.test_results, f, indent=2, default=str)
        
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")

if __name__ == "__main__":
    tester = APITester()
    tester.run_all_tests()