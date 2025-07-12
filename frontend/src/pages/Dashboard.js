import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  useAuth,
  DashboardHeader,
  AccountStats,
  PositionsTable,
  OrdersTable,
  HistoryTable,
  EquityChart,
  MonthlyDepositsChart,
  MonthlyWithdrawalsChart,
  DepositWithdrawalComparisonChart,
  DepositModal,
} from "../components";

// Import all page components
import { DocumentUpload } from "./DocumentUpload";
import { BankDetails } from "./BankDetails";
import { OpenLiveAccount } from "./OpenLiveAccount";
import { AccountList } from "./AccountList";
import { ChangeMT5Password } from "./ChangeMT5Password";
import { WithdrawComponent } from "./WithdrawComponent";
import { InternalTransfer } from "./InternalTransfer";
import { DepositReport } from "./DepositReport";
import { WalletHistory } from "./WalletHistory";
import { RewardComponent } from "./RewardComponent";
import { NewsComponent } from "./NewsComponent";
import { MyTickets } from "./MyTickets";
import { NewTicket } from "./NewTicket";
import { ReferralDashboard } from "./ReferralDashboard";
import { AdminDashboard } from "./AdminDashboard";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const Dashboard = () => {
  const { user, logout, token } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [
        accountResponse,
        positionsResponse,
        ordersResponse,
        historyResponse,
      ] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/mt5/account`),
        axios.get(`${API_BASE_URL}/api/mt5/positions`),
        axios.get(`${API_BASE_URL}/api/mt5/orders`),
        axios.get(`${API_BASE_URL}/api/mt5/history`),
      ]);

      setAccountData(accountResponse.data);
      setPositions(positionsResponse.data);
      setOrders(ordersResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (amount, method, paymentDetails = null) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/payments/create`,
        {
          amount,
          method,
          currency: "USD",
          payment_details: paymentDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (method === "paystack") {
        window.location.href =
          response.data.payment_data.data.authorization_url;
      } else if (method === "stripe") {
        // Handle Stripe payment
        const stripe = await loadStripe(
          process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
        );
        const { error } = await stripe.redirectToCheckout({
          sessionId: response.data.payment_data.session_id,
        });
        if (error) {
          console.error("Stripe error:", error);
        }
      } else if (method === "card") {
        // Show success message for card payment
        alert(
          `Card payment submitted successfully!\nReference: ${response.data.payment_data.reference}\nStatus: ${response.data.payment_data.status}\n\nPlease wait for processing confirmation.`
        );
        setShowDepositModal(false);
        fetchData();
      } else if (method === "bank_transfer") {
        // Show bank transfer details
        const bankDetails = response.data.payment_data.bank_details;
        const message = `Bank Transfer Details:\n\nBank: ${bankDetails.bank_name}\nAccount Name: ${bankDetails.account_name}\nAccount Number: ${bankDetails.account_number}\nSwift Code: ${bankDetails.swift_code}\nReference: ${bankDetails.reference}\n\nPlease transfer $${amount} and include the reference number.`;
        alert(message);
        setShowDepositModal(false);
        fetchData();
      } else {
        alert("Payment method not implemented yet");
      }
    } catch (error) {
      console.error("Deposit failed:", error);
      alert("Deposit failed. Please try again.");
    }
  };

  const renderContent = () => {
    if (loading && activeTab === "dashboard") {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading...</div>
        </div>
      );
    }

    switch (activeTab) {
      // Dashboard
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                MT5 Account Management
              </h2>
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
              >
                Fund Account
              </button>
            </div>

            <AccountStats user={user} accountData={accountData} />

            {/* Real-time Equity Chart */}
            <EquityChart user={user} accountData={accountData} />

            {/* Monthly Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MonthlyDepositsChart />
              <MonthlyWithdrawalsChart />
            </div>

            {/* Deposit/Withdrawal Comparison Chart */}
            <DepositWithdrawalComparisonChart />

            <div className="space-y-6">
              <PositionsTable positions={positions} />
              <OrdersTable orders={orders} />
            </div>
          </div>
        );

      // Compliance
      case "document-upload":
        return <DocumentUpload />;
      case "bank-details":
        return <BankDetails />;

      // My Account
      case "open-live-account":
        return <OpenLiveAccount />;
      case "account-list":
        return <AccountList />;
      case "change-mt5-password":
        return <ChangeMT5Password />;

      // My Fund
      case "deposit":
        return (
          <div>
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
            >
              Make Deposit
            </button>
          </div>
        );
      case "withdraw":
        return <WithdrawComponent />;
      case "internal-transfer":
        return <InternalTransfer />;
      case "external-transfer":
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              External Transfer
            </h3>
            <p className="text-gray-300">
              External transfer functionality coming soon...
            </p>
          </div>
        );

      // My Report
      case "deposit-report":
        return <DepositReport />;
      case "withdraw-report":
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Withdrawal Report
            </h3>
            <p className="text-gray-300">
              Withdrawal report functionality coming soon...
            </p>
          </div>
        );
      case "internal-transfer-report":
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Internal Transfer Report
            </h3>
            <p className="text-gray-300">
              Internal transfer report functionality coming soon...
            </p>
          </div>
        );
      case "deal-report":
        return <HistoryTable history={history} />;

      // My Wallet
      case "wallet-history":
        return <WalletHistory />;
      case "mt5-to-wallet":
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              MT5 to Wallet Transfer
            </h3>
            <p className="text-gray-300">
              MT5 to wallet transfer functionality coming soon...
            </p>
          </div>
        );
      case "wallet-to-mt5":
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Wallet to MT5 Transfer
            </h3>
            <p className="text-gray-300">
              Wallet to MT5 transfer functionality coming soon...
            </p>
          </div>
        );

      // Other pages
      case "reward":
        return <RewardComponent />;
      case "news":
        return <NewsComponent />;
      case "my-tickets":
        return <MyTickets />;
      case "new-ticket":
        return <NewTicket />;

      // Legacy routes
      case "referrals":
        return <ReferralDashboard />;
      case "history":
        return <HistoryTable history={history} />;
      case "admin":
        return <AdminDashboard />;

      default:
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Coming Soon
            </h3>
            <p className="text-gray-300">
              This feature is under development...
            </p>
          </div>
        );
    }
  };

  return (
    <DashboardHeader
      user={user}
      onLogout={logout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>

      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />
    </DashboardHeader>
  );
};
