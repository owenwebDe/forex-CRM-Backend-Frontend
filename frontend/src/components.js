import React, { createContext, useContext, useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  BarElement,
  BarController,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("access_token"));

  // Set up axios interceptor for auth
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/profile`);
      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email,
        password,
      });

      const { access_token, user: userData } = response.data;

      localStorage.setItem("access_token", access_token);
      setToken(access_token);
      setUser(userData);

      // Connect to MT5 with demo credentials (will be replaced with user's real account)
      await connectToMT5();

      return { success: true };
    } catch (error) {
      console.error("Login failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        userData
      );

      const { access_token, user: newUser } = response.data;

      localStorage.setItem("access_token", access_token);
      setToken(access_token);
      setUser(newUser);

      // Connect to MT5 with demo credentials
      await connectToMT5();

      return { success: true };
    } catch (error) {
      console.error("Signup failed:", error);
      return {
        success: false,
        error: error.response?.data?.detail || "Registration failed",
      };
    }
  };

  const connectToMT5 = async () => {
    try {
      console.log("Attempting to connect to MT5...");
      const response = await axios.post(`${API_BASE_URL}/api/mt5/connect`, {
        user: "backofficeApi",
        password: "Trade@2022",
        host: "173.208.156.141",
        port: 443,
      });
      console.log("MT5 connection successful:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "MT5 connection failed:",
        error.response?.data || error.message
      );
      // Don't throw error here, just log it
      return null;
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/mt5/disconnect`);
    } catch (error) {
      console.error("MT5 disconnect failed:", error);
    }

    localStorage.removeItem("access_token");
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Background Component
export const BackgroundOverlay = () => (
  <div className="fixed inset-0 z-0">
    <div className="absolute inset-0 bg-black"></div>
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-teal-900/20"></div>
    <div
      className="absolute inset-0 opacity-60"
      style={{
        backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="cityGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:%23003366;stop-opacity:1" /><stop offset="50%" style="stop-color:%23006699;stop-opacity:1" /><stop offset="100%" style="stop-color:%23009999;stop-opacity:1" /></linearGradient></defs><rect width="1200" height="800" fill="url(%23cityGrad)"/><g opacity="0.8"><rect x="800" y="200" width="60" height="400" fill="%23ffffff" opacity="0.1"/><rect x="870" y="150" width="80" height="450" fill="%23ffffff" opacity="0.15"/><rect x="960" y="180" width="70" height="420" fill="%23ffffff" opacity="0.1"/><rect x="1040" y="120" width="90" height="480" fill="%23ffffff" opacity="0.2"/><rect x="1140" y="160" width="60" height="440" fill="%23ffffff" opacity="0.1"/><circle cx="900" cy="300" r="80" fill="%23ff6b6b" opacity="0.6"/><circle cx="900" cy="300" r="40" fill="%23ffffff" opacity="0.8"/><path d="M700 400 Q900 200 1100 400" stroke="%2300ffff" stroke-width="2" fill="none" opacity="0.6"/><path d="M750 450 Q950 250 1150 450" stroke="%2300ffff" stroke-width="2" fill="none" opacity="0.4"/><path d="M800 500 Q1000 300 1200 500" stroke="%2300ffff" stroke-width="2" fill="none" opacity="0.3"/></g></svg>')`,
        backgroundSize: "cover",
        backgroundPosition: "center right",
        backgroundRepeat: "no-repeat",
      }}
    ></div>
  </div>
);

// Logo Component
export const CribLogo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-sm flex items-center justify-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-black"
      >
        <path d="M3 21L21 3" />
        <path d="M21 3L21 10" />
        <path d="M21 3L14 3" />
        <path d="M3 21L10 21" />
        <path d="M3 21L3 14" />
      </svg>
    </div>
    <span className="text-white text-2xl font-bold">CRIB</span>
    <span className="text-gray-400 text-sm">MARKETS</span>
  </div>
);

// Dashboard Header Component with Comprehensive Sidebar
export const DashboardHeader = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  children,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      path: "dashboard",
    },
    {
      id: "compliance",
      label: "Compliance",
      icon: "📋",
      submenu: [
        {
          id: "document-upload",
          label: "Document Upload",
          path: "document-upload",
        },
        { id: "bank-details", label: "Bank Details", path: "bank-details" },
      ],
    },
    {
      id: "my-account",
      label: "My Account",
      icon: "👤",
      submenu: [
        {
          id: "open-live-account",
          label: "Open Live Account",
          path: "open-live-account",
        },
        { id: "account-list", label: "Account List", path: "account-list" },
        {
          id: "change-mt5-password",
          label: "Change MT5 Password",
          path: "change-mt5-password",
        },
      ],
    },
    {
      id: "my-fund",
      label: "My Fund",
      icon: "💰",
      submenu: [
        { id: "deposit", label: "Deposit", path: "deposit" },
        { id: "withdraw", label: "Withdraw", path: "withdraw" },
        {
          id: "internal-transfer",
          label: "Internal Transfer",
          path: "internal-transfer",
        },
        {
          id: "external-transfer",
          label: "External Transfer",
          path: "external-transfer",
        },
      ],
    },
    {
      id: "my-report",
      label: "My Report",
      icon: "📈",
      submenu: [
        {
          id: "deposit-report",
          label: "Deposit Report",
          path: "deposit-report",
        },
        {
          id: "withdraw-report",
          label: "Withdraw Report",
          path: "withdraw-report",
        },
        {
          id: "internal-transfer-report",
          label: "Internal Transfer Report",
          path: "internal-transfer-report",
        },
        { id: "deal-report", label: "Deal Report", path: "deal-report" },
      ],
    },
    {
      id: "my-wallet",
      label: "My Wallet",
      icon: "👛",
      submenu: [
        {
          id: "wallet-history",
          label: "Wallet History",
          path: "wallet-history",
        },
        { id: "mt5-to-wallet", label: "MT5 to Wallet", path: "mt5-to-wallet" },
        { id: "wallet-to-mt5", label: "Wallet to MT5", path: "wallet-to-mt5" },
      ],
    },
    {
      id: "reward",
      label: "Reward",
      icon: "🎁",
      path: "reward",
    },
    {
      id: "news",
      label: "News",
      icon: "📰",
      path: "news",
    },
    {
      id: "help-desk",
      label: "Help Desk",
      icon: "🎧",
      submenu: [
        { id: "my-tickets", label: "My Tickets", path: "my-tickets" },
        { id: "new-ticket", label: "New Ticket", path: "new-ticket" },
      ],
    },
  ];

  const toggleSubmenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleMenuClick = (path) => {
    setActiveTab(path);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-black">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-800">
          <CribLogo />
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <nav className="mt-4 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {menuItems.map((item) => (
            <div key={item.id}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleSubmenu(item.id)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </div>
                    <span
                      className={`transform transition-transform ${
                        expandedMenu === item.id ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  </button>
                  {expandedMenu === item.id && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <button
                          key={subItem.id}
                          onClick={() => handleMenuClick(subItem.path)}
                          className={`w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${
                            activeTab === subItem.path
                              ? "bg-orange-400 text-black"
                              : ""
                          }`}
                        >
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleMenuClick(item.path)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors ${
                    activeTab === item.path ? "bg-orange-400 text-black" : ""
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-gray-800 border-b border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-400 hover:text-white mr-4"
              >
                ☰
              </button>
              <h1 className="text-xl font-semibold text-white">
                MT5 Account Management
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-white">
                <span className="text-sm text-gray-400">Welcome, </span>
                <span className="font-medium">{user.name}</span>
                {user.kyc_status === "approved" && (
                  <span className="ml-2 text-green-400">✓ Verified</span>
                )}
              </div>
              <button
                onClick={onLogout}
                className="text-gray-400 hover:text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-black">{children}</div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Shared Components
export const AccountStats = ({ user, accountData }) => {
  const stats = accountData || {
    balance: user?.balance || 0,
    equity: user?.balance || 0,
    margin: 0,
    free_margin: user?.balance || 0,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Balance</div>
        <div className="text-2xl font-bold text-white">
          ${stats.balance?.toFixed(2) || "0.00"}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Equity</div>
        <div className="text-2xl font-bold text-green-400">
          ${stats.equity?.toFixed(2) || "0.00"}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Margin</div>
        <div className="text-2xl font-bold text-yellow-400">
          ${stats.margin?.toFixed(2) || "0.00"}
        </div>
      </div>
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="text-gray-400 text-sm mb-2">Free Margin</div>
        <div className="text-2xl font-bold text-blue-400">
          ${stats.free_margin?.toFixed(2) || "0.00"}
        </div>
      </div>
    </div>
  );
};

export const PositionsTable = ({ positions }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-lg font-semibold text-white">Open Positions</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="text-left p-3 text-gray-300 text-sm">Symbol</th>
            <th className="text-left p-3 text-gray-300 text-sm">Type</th>
            <th className="text-left p-3 text-gray-300 text-sm">Volume</th>
            <th className="text-left p-3 text-gray-300 text-sm">Open Price</th>
            <th className="text-left p-3 text-gray-300 text-sm">
              Current Price
            </th>
            <th className="text-left p-3 text-gray-300 text-sm">Profit</th>
            <th className="text-left p-3 text-gray-300 text-sm">Pips</th>
          </tr>
        </thead>
        <tbody>
          {positions && positions.length > 0 ? (
            positions.map((position, index) => (
              <tr
                key={position.ticket || index}
                className="border-b border-gray-800"
              >
                <td className="p-3 text-white font-medium">
                  {position.symbol}
                </td>
                <td
                  className={`p-3 font-medium ${
                    position.type === "Buy" || position.type === "BUY"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {position.type}
                </td>
                <td className="p-3 text-gray-300">{position.volume}</td>
                <td className="p-3 text-gray-300">
                  {position.open_price || position.openPrice}
                </td>
                <td className="p-3 text-gray-300">
                  {position.current_price || position.currentPrice}
                </td>
                <td
                  className={`p-3 font-medium ${
                    position.profit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${position.profit?.toFixed(2) || "0.00"}
                </td>
                <td
                  className={`p-3 font-medium ${
                    position.profit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {position.pips || Math.round(position.profit / 10)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-8 text-center text-gray-400">
                No open positions
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const OrdersTable = ({ orders }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-lg font-semibold text-white">Pending Orders</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="text-left p-3 text-gray-300 text-sm">Symbol</th>
            <th className="text-left p-3 text-gray-300 text-sm">Type</th>
            <th className="text-left p-3 text-gray-300 text-sm">Volume</th>
            <th className="text-left p-3 text-gray-300 text-sm">Price</th>
            <th className="text-left p-3 text-gray-300 text-sm">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders && orders.length > 0 ? (
            orders.map((order, index) => (
              <tr
                key={order.ticket || index}
                className="border-b border-gray-800"
              >
                <td className="p-3 text-white font-medium">{order.symbol}</td>
                <td
                  className={`p-3 font-medium ${
                    order.type?.includes("Buy") || order.type?.includes("BUY")
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {order.type}
                </td>
                <td className="p-3 text-gray-300">{order.volume}</td>
                <td className="p-3 text-gray-300">{order.price}</td>
                <td className="p-3 text-yellow-400">
                  {order.state || order.status || "Pending"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="p-8 text-center text-gray-400">
                No pending orders
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export const HistoryTable = ({ history }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
    <div className="p-4 border-b border-gray-800">
      <h3 className="text-lg font-semibold text-white">Trade History</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-800">
          <tr>
            <th className="text-left p-3 text-gray-300 text-sm">Date</th>
            <th className="text-left p-3 text-gray-300 text-sm">Symbol</th>
            <th className="text-left p-3 text-gray-300 text-sm">Type</th>
            <th className="text-left p-3 text-gray-300 text-sm">Volume</th>
            <th className="text-left p-3 text-gray-300 text-sm">Open Price</th>
            <th className="text-left p-3 text-gray-300 text-sm">Close Price</th>
            <th className="text-left p-3 text-gray-300 text-sm">Profit</th>
          </tr>
        </thead>
        <tbody>
          {history && history.length > 0 ? (
            history.map((trade, index) => (
              <tr
                key={trade.ticket || index}
                className="border-b border-gray-800"
              >
                <td className="p-3 text-gray-300">
                  {trade.close_time || trade.date}
                </td>
                <td className="p-3 text-white font-medium">{trade.symbol}</td>
                <td
                  className={`p-3 font-medium ${
                    trade.type === "Buy" || trade.type === "BUY"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {trade.type}
                </td>
                <td className="p-3 text-gray-300">{trade.volume}</td>
                <td className="p-3 text-gray-300">
                  {trade.open_price || trade.openPrice}
                </td>
                <td className="p-3 text-gray-300">
                  {trade.close_price || trade.closePrice}
                </td>
                <td
                  className={`p-3 font-medium ${
                    trade.profit >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  ${trade.profit?.toFixed(2) || "0.00"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="p-8 text-center text-gray-400">
                No trade history
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

// Chart Components
export const EquityChart = ({ user, accountData }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquityData();
    // Refresh data every 30 seconds
    const interval = setInterval(fetchEquityData, 30000);
    return () => clearInterval(interval);
  }, [accountData, user]);

  const fetchEquityData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/charts/equity-data`
      );
      const data = response.data;

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Account Equity",
            data: data.equity_data,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 4,
          },
          {
            label: "Account Balance",
            data: data.balance_data,
            borderColor: "rgb(34, 197, 94)",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointBackgroundColor: "rgb(34, 197, 94)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 3,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch equity data:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Real-Time Account Performance (Last 30 Days)",
        color: "white",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return context.dataset.label + ": $" + context.parsed.y.toFixed(2);
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          font: {
            size: 11,
          },
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading real-time chart data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">
          Real-Time Account Performance
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live Data</span>
        </div>
      </div>
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const MonthlyDepositsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepositData();
  }, []);

  const fetchDepositData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/charts/monthly-deposits`
      );
      const data = response.data;

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Monthly Deposits",
            data: data.deposit_data,
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch deposit data:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Deposits (Last 12 Months)",
        color: "white",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return "Deposits: $" + context.parsed.y.toFixed(2);
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading deposit chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const MonthlyWithdrawalsChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/charts/monthly-withdrawals`
      );
      const data = response.data;

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Monthly Withdrawals",
            data: data.withdrawal_data,
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 2,
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch withdrawal data:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Withdrawals (Last 12 Months)",
        color: "white",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return "Withdrawals: $" + context.parsed.y.toFixed(2);
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading withdrawal chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export const DepositWithdrawalComparisonChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComparisonData();
  }, []);

  const fetchComparisonData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/charts/deposit-withdrawal-comparison`
      );
      const data = response.data;

      setChartData({
        labels: data.labels,
        datasets: [
          {
            label: "Deposits",
            data: data.deposit_data,
            backgroundColor: "rgba(34, 197, 94, 0.8)",
            borderColor: "rgb(34, 197, 94)",
            borderWidth: 2,
            type: "bar",
          },
          {
            label: "Withdrawals",
            data: data.withdrawal_data,
            backgroundColor: "rgba(239, 68, 68, 0.8)",
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 2,
            type: "bar",
          },
          {
            label: "Net Flow",
            data: data.net_data,
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            type: "line",
            pointBackgroundColor: "rgb(59, 130, 246)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointRadius: 5,
          },
        ],
      });
    } catch (error) {
      console.error("Failed to fetch comparison data:", error);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      title: {
        display: true,
        text: "Monthly Deposits vs Withdrawals Comparison",
        color: "white",
        font: {
          size: 16,
          weight: "bold",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "white",
        bodyColor: "white",
        borderColor: "rgba(255, 255, 255, 0.2)",
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            const label = context.dataset.label;
            const value = context.parsed.y;
            if (label === "Net Flow") {
              return `${label}: ${value >= 0 ? "+" : ""}${value.toFixed(2)}`;
            }
            return `${label}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
      y: {
        ticks: {
          color: "rgba(255, 255, 255, 0.7)",
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
    interaction: {
      intersect: false,
      mode: "index",
    },
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading comparison chart...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
      <div className="h-80">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

// Modal Component
export const DepositModal = ({ isOpen, onClose, onDeposit }) => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onDeposit(parseFloat(amount), "stripe");
      setAmount("");
      onClose();
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-900 rounded-lg p-8 w-full max-w-md border border-gray-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Deposit Funds</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="10"
              step="0.01"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
              required
            />
            <div className="text-sm text-gray-400 mt-1">
              Minimum deposit: $10
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Deposit with Card"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
