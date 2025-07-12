# CRIB Markets Trading Platform

A comprehensive full-stack trading platform built with React frontend and FastAPI backend, integrated with MT5 (MetaTrader 5) for professional forex trading.

## 🚀 Features

### Frontend (React)
- **Modern UI/UX** with Tailwind CSS
- **Real-time Trading Dashboard** with live charts
- **Account Management** with KYC verification
- **Payment Processing** (Stripe, Bank Transfer, Card)
- **Document Upload** for compliance
- **Support Ticket System**
- **Admin Dashboard** for management
- **MT5 Integration** for trading operations
- **Responsive Design** for all devices

### Backend (FastAPI)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with secure token management
- **MongoDB Integration** for data persistence
- **MT5 API Proxy** for trading operations
- **Payment Gateway Integration** (Stripe)
- **Document Management** with base64 storage
- **Real-time Data Processing**
- **Admin Panel** with full management capabilities

### MT5 Integration
- **Live Trading** with real MT5 servers
- **Position Management** (open, close, modify)
- **Order Management** (pending orders, cancellations)
- **Account Information** (balance, equity, margin)
- **Trade History** and reporting
- **Chart Data** integration

## 🛠 Technology Stack

### Frontend
- React 19.0.0
- React Router 7.5.1
- Tailwind CSS 3.4.17
- Chart.js 4.5.0
- Axios 1.8.4
- PostCSS & Autoprefixer

### Backend
- FastAPI 0.104.1
- Python 3.8+
- MongoDB with Motor (async)
- PyJWT for authentication
- Stripe for payments
- HTTPX for HTTP client
- Uvicorn for ASGI server

### Database
- MongoDB (document-based)
- Collections: users, payments, documents, tickets, bank_details

## 📋 Prerequisites

- Node.js (v16 or higher)
- Python 3.8+
- MongoDB (local or cloud)
- Yarn package manager
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd crib-markets-platform
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create `.env` file in the backend directory:
```env
# Database Configuration
MONGO_URL=mongodb://localhost:27017/crib_markets

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# MT5 API Configuration
MT5_API_BASE_URL=http://173.208.156.141:6700
MT5_MANAGER_ID=backofficeApi
MT5_MANAGER_PASSWORD=Trade@2022
MT5_SERVER_IP=173.208.156.141
MT5_SERVER_PORT=443

# Payment Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Email Configuration (Optional)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Environment
ENVIRONMENT=development
DEBUG=True

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
yarn install
```

#### Environment Configuration
Create `.env` file in the frontend directory:
```env
# Backend API Configuration
REACT_APP_BACKEND_URL=http://localhost:8001

# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Environment
REACT_APP_ENVIRONMENT=development
```

### 4. Database Setup

#### MongoDB Local Installation
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
Download from https://www.mongodb.com/try/download/community
```

#### Start MongoDB
```bash
# Linux/macOS
sudo systemctl start mongod
# or
mongod

# Windows
net start MongoDB
```

## 🚀 Running the Application

### Development Mode

#### 1. Start Backend Server
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### 2. Start Frontend Server
```bash
cd frontend
yarn start
```

#### 3. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

### Production Mode

#### 1. Backend Production
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4
```

#### 2. Frontend Production
```bash
cd frontend
yarn build
# Serve the build folder with your preferred web server
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### MT5 Trading
- `POST /api/mt5/connect` - Connect to MT5 server
- `POST /api/mt5/disconnect` - Disconnect from MT5
- `GET /api/mt5/account` - Get account information
- `GET /api/mt5/positions` - Get open positions
- `GET /api/mt5/orders` - Get pending orders
- `GET /api/mt5/history` - Get trade history
- `POST /api/mt5/account/create` - Create MT5 account
- `POST /api/mt5/trade/open` - Open new trade
- `POST /api/mt5/trade/close` - Close trade

### Payments
- `POST /api/payments/create` - Create payment
- `GET /api/payments/history` - Get payment history
- `POST /api/payments/withdraw` - Create withdrawal
- `GET /api/payments/verify/{payment_id}` - Verify payment

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/balance` - Get user balance

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/list` - List user documents
- `GET /api/documents/{document_id}` - Get document
- `POST /api/documents/bank-details` - Add bank details
- `GET /api/documents/bank-details` - Get bank details

### Support Tickets
- `POST /api/tickets/create` - Create support ticket
- `GET /api/tickets/list` - List user tickets
- `GET /api/tickets/{ticket_id}` - Get ticket details
- `POST /api/tickets/{ticket_id}/message` - Add message to ticket

### Charts & Analytics
- `GET /api/charts/equity-data` - Get equity chart data
- `GET /api/charts/monthly-deposits` - Get monthly deposits
- `GET /api/charts/monthly-withdrawals` - Get monthly withdrawals
- `GET /api/charts/deposit-withdrawal-comparison` - Get comparison data

### Admin (Admin Only)
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/{user_id}` - Get user by ID
- `PUT /api/admin/users/{user_id}/kyc` - Update user KYC
- `GET /api/admin/payments/history` - Get all payments

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation with Pydantic
- SQL injection protection (MongoDB)
- XSS protection
- Rate limiting (recommended for production)

## 📱 User Flow

1. **Registration/Login** - User creates account or logs in
2. **KYC Verification** - Upload documents for verification
3. **Account Setup** - Add bank details and create MT5 account
4. **Fund Account** - Make deposits via Stripe or bank transfer
5. **Trading** - Execute trades through MT5 integration
6. **Monitoring** - View real-time charts and account performance
7. **Support** - Create tickets for assistance
8. **Withdrawal** - Request withdrawals to bank account

## 🎯 Default User Credentials

For testing purposes, you can create users through the registration endpoint or use the admin panel.

### Creating Admin User
```python
# Run this in your Python environment after starting the backend
import requests

admin_data = {
    "name": "Admin User",
    "email": "admin@cribmarkets.com",
    "password": "AdminPass123!",
    "role": "admin"
}

# Register admin user
response = requests.post("http://localhost:8001/api/auth/register", json=admin_data)
```

## 🚨 Environment Variables

### Required Environment Variables

#### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017/crib_markets
SECRET_KEY=your-secret-key-change-in-production
MT5_API_BASE_URL=http://173.208.156.141:6700
MT5_MANAGER_ID=backofficeApi
MT5_MANAGER_PASSWORD=Trade@2022
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

### Optional Environment Variables

#### Backend
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ENVIRONMENT=development
DEBUG=True
FRONTEND_URL=http://localhost:3000
```

## 📝 Development Guide

### Adding New Features

1. **Backend**: Add new endpoints in `routers/` directory
2. **Frontend**: Add new components in `src/` directory
3. **Database**: Define new models in `models/` directory
4. **Services**: Add business logic in `services/` directory

### Testing

```bash
# Backend testing
cd backend
pytest

# Frontend testing
cd frontend
yarn test
```

### Database Migrations

MongoDB doesn't require migrations, but you can add indexes for performance:

```python
# Add indexes for better performance
await db.users.create_index("email")
await db.payments.create_index([("user_id", 1), ("created_at", -1)])
await db.tickets.create_index([("user_id", 1), ("status", 1)])
```

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity

2. **MT5 API Connection Error**
   - Check MT5 API server availability
   - Verify credentials in `.env`
   - Check network connectivity to MT5 server

3. **Frontend API Errors**
   - Ensure backend is running on port 8001
   - Check CORS settings
   - Verify API endpoints

4. **Payment Processing Issues**
   - Check Stripe API keys
   - Verify webhook endpoints
   - Check payment gateway settings

### Logs

```bash
# Backend logs
tail -f backend/logs/app.log

# Frontend logs
# Check browser console for errors
```

## 📦 Deployment

### Docker Deployment (Recommended)

```dockerfile
# Backend Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]

# Frontend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
CMD ["yarn", "start"]
```

### Cloud Deployment

1. **Backend**: Deploy to AWS Lambda, Google Cloud Run, or similar
2. **Frontend**: Deploy to Vercel, Netlify, or AWS S3 + CloudFront
3. **Database**: Use MongoDB Atlas for cloud database
4. **CDN**: Use CloudFront or similar for static assets

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, email support@cribmarkets.com or create an issue in the repository.

## 🙏 Acknowledgments

- MetaTrader 5 for trading platform integration
- Stripe for payment processing
- MongoDB for database solutions
- FastAPI for high-performance API framework
- React for modern frontend development