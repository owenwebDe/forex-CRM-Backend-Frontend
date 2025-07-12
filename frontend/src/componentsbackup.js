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
const BackgroundOverlay = () => (
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
const CribLogo = () => (
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

// Login Page Component
export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundOverlay />

      <div className="relative z-10 min-h-screen flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <CribLogo />
            </div>

            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">Sign In</h1>
              <div className="text-gray-400">
                No Account?{" "}
                <a
                  href="/signup"
                  className="text-orange-400 hover:text-orange-300"
                >
                  Sign Up
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <a
                  href="#"
                  className="text-orange-400 hover:text-orange-300 text-sm"
                >
                  Forgot your password?
                </a>
              </div>

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Get Started</h2>
              <p className="text-xl text-gray-300">
                Create an account to experience our powerful trading platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sign Up Page Component
export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    country: "United States",
    phone: "",
    countryCode: "+1-US",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();

  // Get referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const countries = [
    { name: "United States", code: "+1-US" },
    { name: "Canada", code: "+1-CA" },
    { name: "United Kingdom", code: "+44" },
    { name: "Australia", code: "+61" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Spain", code: "+34" },
    { name: "Italy", code: "+39" },
    { name: "Netherlands", code: "+31" },
    { name: "Sweden", code: "+46" },
    { name: "Norway", code: "+47" },
    { name: "Denmark", code: "+45" },
    { name: "Afghanistan", code: "+93" },
    { name: "Albania", code: "+355" },
    { name: "Algeria", code: "+213" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const signupData = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      country: formData.country,
      phone: formData.phone,
      country_code: formData.countryCode,
      referral_code: formData.referralCode || null,
    };

    const result = await signup(signupData);

    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundOverlay />

      <div className="relative z-10 min-h-screen flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <CribLogo />
            </div>

            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">Sign Up</h1>
              <div className="text-gray-400">
                Already have an Account?{" "}
                <a
                  href="/login"
                  className="text-orange-400 hover:text-orange-300"
                >
                  Sign In
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="abc@mail.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your Password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Confirm your Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter Password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-400"
                  required
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Phone</label>
                <div className="flex space-x-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="w-20 px-2 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-400"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              {formData.referralCode && (
                <div>
                  <label className="block text-white text-sm mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    placeholder="Referral Code"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  />
                </div>
              )}

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Get Started</h2>
              <p className="text-xl text-gray-300">
                Create an account to experience our powerful trading platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Header Component with Comprehensive Sidebar (Fixed)
const DashboardHeader = ({
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

// Account Stats Component
const AccountStats = ({ user, accountData }) => {
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

// Positions Table Component
const PositionsTable = ({ positions }) => (
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

// Orders Table Component
const OrdersTable = ({ orders }) => (
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

// History Table Component
const HistoryTable = ({ history }) => (
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

// Real-time Chart Component with MT5 Data
const EquityChart = ({ user, accountData }) => {
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

// Monthly Deposits Chart Component
const MonthlyDepositsChart = () => {
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

// Monthly Withdrawals Chart Component
const MonthlyWithdrawalsChart = () => {
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

// Combined Deposit/Withdrawal Comparison Chart
const DepositWithdrawalComparisonChart = () => {
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
              return `${label}: ${value >= 0 ? "+" : ""}$${value.toFixed(2)}`;
            }
            return `${label}: $${value.toFixed(2)}`;
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

// Deposit Modal Component
export const DepositModal = ({ isOpen, onClose, onDeposit }) => {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("paystack");
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });
  const [showCardForm, setShowCardForm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let paymentDetails = null;

      if (method === "card") {
        paymentDetails = {
          cardNumber: cardDetails.cardNumber.replace(/\s/g, ""),
          expiryDate: cardDetails.expiryDate,
          cvv: cardDetails.cvv,
          cardholderName: cardDetails.cardholderName,
        };
      }

      await onDeposit(parseFloat(amount), method, paymentDetails);
      setAmount("");
      setCardDetails({
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
      });
      onClose();
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMethodChange = (newMethod) => {
    setMethod(newMethod);
    setShowCardForm(newMethod === "card");
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4);
    }
    return v;
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
              Payment Method
            </label>
            <select
              value={method}
              onChange={(e) => handleMethodChange(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-400"
            >
              <option value="paystack">Paystack</option>
              <option value="stripe">Stripe</option>
              <option value="card">Credit/Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

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

          {/* Card Details Form */}
          {showCardForm && (
            <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <h3 className="text-white font-semibold">Card Details</h3>

              <div>
                <label className="block text-white text-sm mb-2">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardDetails.cardNumber}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cardNumber: formatCardNumber(e.target.value),
                    }))
                  }
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white text-sm mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardDetails.expiryDate}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        expiryDate: formatExpiryDate(e.target.value),
                      }))
                    }
                    placeholder="MM/YY"
                    maxLength="5"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">CVV</label>
                  <input
                    type="text"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails((prev) => ({
                        ...prev,
                        cvv: e.target.value.replace(/\D/g, "").substring(0, 4),
                      }))
                    }
                    placeholder="123"
                    maxLength="4"
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardDetails.cardholderName}
                  onChange={(e) =>
                    setCardDetails((prev) => ({
                      ...prev,
                      cardholderName: e.target.value,
                    }))
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>
            </div>
          )}

          {/* Bank Transfer Instructions */}
          {method === "bank_transfer" && (
            <div className="p-4 bg-blue-900 border border-blue-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">
                Bank Transfer Instructions
              </h3>
              <div className="text-blue-200 text-sm space-y-1">
                <p>After submitting, you'll receive bank account details.</p>
                <p>Please include the reference number in your transfer.</p>
                <p>Funds will be credited within 1-3 business days.</p>
              </div>
            </div>
          )}

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
              {loading ? "Processing..." : "Deposit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Document Upload Component
export const DocumentUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchUploadedDocuments();
  }, []);

  const fetchUploadedDocuments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/kyc/documents`);
      setUploadedDocs(response.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleFileUpload = async (file, documentType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);
    formData.append("document_number", "AUTO-" + Date.now());

    try {
      setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const response = await axios.post(
        `${API_BASE_URL}/api/kyc/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress((prev) => ({ ...prev, [file.name]: progress }));
          },
        }
      );

      alert("Document uploaded successfully!");
      fetchUploadedDocuments();
      setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Document Upload
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            "passport",
            "drivers_license",
            "national_id",
            "utility_bill",
            "bank_statement",
          ].map((docType) => (
            <div key={docType} className="bg-gray-800 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 capitalize">
                {docType.replace("_", " ")}
              </h4>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    handleFileUpload(e.target.files[0], docType);
                  }
                }}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Uploaded Documents
        </h3>
        <div className="space-y-3">
          {uploadedDocs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between bg-gray-800 p-4 rounded-lg"
            >
              <div>
                <span className="text-white font-medium">
                  {doc.document_type}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  {doc.uploaded_at}
                </span>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  doc.status === "approved"
                    ? "bg-green-800 text-green-200"
                    : doc.status === "rejected"
                    ? "bg-red-800 text-red-200"
                    : "bg-yellow-800 text-yellow-200"
                }`}
              >
                {doc.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Bank Details Component
export const BankDetails = () => {
  const [bankDetails, setBankDetails] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
    swift_code: "",
    routing_number: "",
  });
  const [savedDetails, setSavedDetails] = useState([]);

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/bank-details`);
      setSavedDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch bank details:", error);
    }
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/user/bank-details`, bankDetails);
      alert("Bank details saved successfully!");
      fetchBankDetails();
      setBankDetails({
        bank_name: "",
        account_number: "",
        account_name: "",
        swift_code: "",
        routing_number: "",
      });
    } catch (error) {
      console.error("Failed to save bank details:", error);
      alert("Failed to save bank details.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Add Bank Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white text-sm mb-2">Bank Name</label>
            <input
              type="text"
              value={bankDetails.bank_name}
              onChange={(e) =>
                setBankDetails((prev) => ({
                  ...prev,
                  bank_name: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Enter bank name"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={bankDetails.account_number}
              onChange={(e) =>
                setBankDetails((prev) => ({
                  ...prev,
                  account_number: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Enter account number"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={bankDetails.account_name}
              onChange={(e) =>
                setBankDetails((prev) => ({
                  ...prev,
                  account_name: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Enter account name"
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">SWIFT Code</label>
            <input
              type="text"
              value={bankDetails.swift_code}
              onChange={(e) =>
                setBankDetails((prev) => ({
                  ...prev,
                  swift_code: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Enter SWIFT code"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
        >
          Save Bank Details
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Saved Bank Details
        </h3>
        <div className="space-y-3">
          {savedDetails.map((detail) => (
            <div key={detail.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Bank Name:</span>
                  <span className="text-white ml-2">{detail.bank_name}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Account:</span>
                  <span className="text-white ml-2">
                    ****{detail.account_number.slice(-4)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Open Live Account Component
export const OpenLiveAccount = () => {
  const [accountType, setAccountType] = useState("standard");
  const [leverage, setLeverage] = useState("1:100");
  const [currency, setCurrency] = useState("USD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/accounts/open-live`,
        {
          account_type: accountType,
          leverage,
          currency,
        }
      );

      alert("Live account application submitted successfully!");
    } catch (error) {
      console.error("Failed to submit application:", error);
      alert("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Open Live Account
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">
              Account Type
            </label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="standard">Standard Account</option>
              <option value="premium">Premium Account</option>
              <option value="vip">VIP Account</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="1:50">1:50</option>
              <option value="1:100">1:100</option>
              <option value="1:200">1:200</option>
              <option value="1:500">1:500</option>
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Base Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Open Live Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Account List Component
export const AccountList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/accounts/list`);
      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">My Accounts</h3>

        <div className="space-y-4">
          {accounts.map((account) => (
            <div key={account.id} className="bg-gray-800 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-white font-semibold text-lg">
                    {account.login}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {account.type} Account
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm ${
                    account.status === "active"
                      ? "bg-green-800 text-green-200"
                      : account.status === "suspended"
                      ? "bg-red-800 text-red-200"
                      : "bg-yellow-800 text-yellow-200"
                  }`}
                >
                  {account.status}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-gray-400 text-sm">Balance:</span>
                  <div className="text-white font-semibold">
                    ${account.balance?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Equity:</span>
                  <div className="text-green-400 font-semibold">
                    ${account.equity?.toFixed(2) || "0.00"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Leverage:</span>
                  <div className="text-white font-semibold">
                    {account.leverage}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 text-sm">Currency:</span>
                  <div className="text-white font-semibold">
                    {account.currency}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Connect
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Change MT5 Password Component
export const ChangeMT5Password = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/accounts/change-password`, {
        current_password: passwords.current,
        new_password: passwords.new,
      });

      alert("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Change MT5 Password
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div>
            <label className="block text-white text-sm mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, current: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, new: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};
// KYC Verification Component (Updated)
export const KYCVerification = () => {
  return <DocumentUpload />;
};

// Internal Transfer Component
export const InternalTransfer = () => {
  const [transferData, setTransferData] = useState({
    from_account: "",
    to_account: "",
    amount: "",
    description: "",
  });
  const [accounts, setAccounts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/accounts/list`);
      setAccounts(response.data);
    } catch (error) {
      console.error("Failed to fetch accounts:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/transfers/internal`, transferData);
      alert("Internal transfer completed successfully!");
      setTransferData({
        from_account: "",
        to_account: "",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Transfer failed:", error);
      alert("Transfer failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Internal Transfer
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">
              From Account
            </label>
            <select
              value={transferData.from_account}
              onChange={(e) =>
                setTransferData((prev) => ({
                  ...prev,
                  from_account: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.login} - ${account.balance?.toFixed(2) || "0.00"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">To Account</label>
            <select
              value={transferData.to_account}
              onChange={(e) =>
                setTransferData((prev) => ({
                  ...prev,
                  to_account: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            >
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.login} - ${account.balance?.toFixed(2) || "0.00"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={transferData.amount}
              onChange={(e) =>
                setTransferData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              min="1"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Description (Optional)
            </label>
            <textarea
              value={transferData.description}
              onChange={(e) =>
                setTransferData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              rows="3"
              placeholder="Transfer description..."
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Processing Transfer..." : "Transfer Funds"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Deposit Report Component
export const DepositReport = () => {
  const [deposits, setDeposits] = useState([]);
  const [dateRange, setDateRange] = useState({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(true);
  const [totalDeposits, setTotalDeposits] = useState(0);

  useEffect(() => {
    fetchDeposits();
  }, []);

  const fetchDeposits = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/deposits/history`, {
        params: dateRange.start && dateRange.end ? dateRange : {},
      });
      setDeposits(response.data);

      const total = response.data.reduce(
        (sum, deposit) => sum + deposit.amount,
        0
      );
      setTotalDeposits(total);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    setLoading(true);
    fetchDeposits();
  };

  const exportDeposits = () => {
    const csvContent = [
      ["Date", "Amount", "Method", "Status", "Transaction ID"],
      ...deposits.map((deposit) => [
        new Date(deposit.created_at).toLocaleDateString(),
        deposit.amount,
        deposit.method,
        deposit.status,
        deposit.transaction_id,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `deposits_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Deposit Report</h3>
          <button
            onClick={exportDeposits}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
          >
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-white text-sm mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>
          <div>
            <label className="block text-white text-sm mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateFilter}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Filter
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="text-gray-400 text-sm mb-2">Total Deposits</div>
          <div className="text-2xl font-bold text-green-400">
            ${totalDeposits.toFixed(2)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="text-left p-3 text-gray-300 text-sm">Date</th>
                <th className="text-left p-3 text-gray-300 text-sm">Amount</th>
                <th className="text-left p-3 text-gray-300 text-sm">Method</th>
                <th className="text-left p-3 text-gray-300 text-sm">Status</th>
                <th className="text-left p-3 text-gray-300 text-sm">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    Loading deposits...
                  </td>
                </tr>
              ) : deposits.length > 0 ? (
                deposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b border-gray-800">
                    <td className="p-3 text-gray-300">
                      {new Date(deposit.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-white font-semibold">
                      ${deposit.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-gray-300 capitalize">
                      {deposit.method}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          deposit.status === "completed"
                            ? "bg-green-800 text-green-200"
                            : deposit.status === "failed"
                            ? "bg-red-800 text-red-200"
                            : "bg-yellow-800 text-yellow-200"
                        }`}
                      >
                        {deposit.status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-300 font-mono text-sm">
                      {deposit.transaction_id}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">
                    No deposits found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Wallet History Component
export const WalletHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchWalletHistory();
  }, [filter]);

  const fetchWalletHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/wallet/history`, {
        params: { type: filter !== "all" ? filter : undefined },
      });
      setTransactions(response.data);
    } catch (error) {
      console.error("Failed to fetch wallet history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "deposit":
        return "💰";
      case "withdrawal":
        return "💸";
      case "transfer_in":
        return "⬇️";
      case "transfer_out":
        return "⬆️";
      case "bonus":
        return "🎁";
      default:
        return "📋";
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case "deposit":
      case "transfer_in":
      case "bonus":
        return "text-green-400";
      case "withdrawal":
      case "transfer_out":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Wallet History</h3>
          <div className="flex space-x-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="all">All Transactions</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="transfer_in">Transfers In</option>
              <option value="transfer_out">Transfers Out</option>
              <option value="bonus">Bonuses</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-white text-lg">
                Loading wallet history...
              </div>
            </div>
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">
                      {getTransactionIcon(transaction.type)}
                    </span>
                    <div>
                      <div className="text-white font-semibold capitalize">
                        {transaction.type.replace("_", " ")}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {new Date(transaction.created_at).toLocaleString()}
                      </div>
                      {transaction.description && (
                        <div className="text-gray-400 text-sm mt-1">
                          {transaction.description}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${getTransactionColor(
                        transaction.type
                      )}`}
                    >
                      {transaction.type === "withdrawal" ||
                      transaction.type === "transfer_out"
                        ? "-"
                        : "+"}
                      ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Balance: ${transaction.balance_after.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400">No transactions found</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Withdraw Component
export const WithdrawComponent = () => {
  const [withdrawData, setWithdrawData] = useState({
    amount: "",
    method: "bank",
    bank_id: "",
    wallet_address: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/withdrawals/create`, withdrawData);
      alert("Withdrawal request submitted successfully!");
      setWithdrawData({
        amount: "",
        method: "bank",
        bank_id: "",
        wallet_address: "",
      });
    } catch (error) {
      console.error("Withdrawal failed:", error);
      alert("Withdrawal failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Withdraw Funds
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">
              Amount (USD)
            </label>
            <input
              type="number"
              value={withdrawData.amount}
              onChange={(e) =>
                setWithdrawData((prev) => ({ ...prev, amount: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              min="10"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Withdrawal Method
            </label>
            <select
              value={withdrawData.method}
              onChange={(e) =>
                setWithdrawData((prev) => ({ ...prev, method: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
            >
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Cryptocurrency</option>
              <option value="wallet">E-Wallet</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Submit Withdrawal"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Reward Component
export const RewardComponent = () => {
  const [rewards, setRewards] = useState([]);
  const [availableRewards, setAvailableRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const [availableResponse, claimedResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/rewards/available`),
        axios.get(`${API_BASE_URL}/api/rewards/claimed`),
      ]);

      setAvailableRewards(availableResponse.data);
      setRewards(claimedResponse.data);
    } catch (error) {
      console.error("Failed to fetch rewards:", error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (rewardId) => {
    try {
      await axios.post(`${API_BASE_URL}/api/rewards/claim/${rewardId}`);
      alert("Reward claimed successfully!");
      fetchRewards();
    } catch (error) {
      console.error("Failed to claim reward:", error);
      alert("Failed to claim reward. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Rewards</h3>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab("available")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "available"
                ? "bg-orange-400 text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Available Rewards
          </button>
          <button
            onClick={() => setActiveTab("claimed")}
            className={`px-4 py-2 rounded-md ${
              activeTab === "claimed"
                ? "bg-orange-400 text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Claimed Rewards
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading rewards...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeTab === "available" ? (
              availableRewards.length > 0 ? (
                availableRewards.map((reward) => (
                  <div key={reward.id} className="bg-gray-800 rounded-lg p-4">
                    <div className="text-center mb-4">
                      <div className="text-4xl mb-2">{reward.icon || "🎁"}</div>
                      <h4 className="text-white font-semibold">
                        {reward.title}
                      </h4>
                      <p className="text-gray-400 text-sm mt-1">
                        {reward.description}
                      </p>
                    </div>
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-green-400">
                        ${reward.amount}
                      </div>
                      <div className="text-gray-400 text-sm">Reward Value</div>
                    </div>
                    <button
                      onClick={() => claimReward(reward.id)}
                      className="w-full py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
                    >
                      Claim Reward
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-400">No available rewards</div>
                </div>
              )
            ) : rewards.length > 0 ? (
              rewards.map((reward) => (
                <div key={reward.id} className="bg-gray-800 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{reward.icon || "🎁"}</div>
                    <h4 className="text-white font-semibold">{reward.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">
                      {reward.description}
                    </p>
                  </div>
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-green-400">
                      ${reward.amount}
                    </div>
                    <div className="text-gray-400 text-sm">
                      Claimed on{" "}
                      {new Date(reward.claimed_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="px-3 py-1 bg-green-800 text-green-200 rounded-full text-sm">
                      ✓ Claimed
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-400">No claimed rewards</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// News Component
export const NewsComponent = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/news/latest`);
      setNews(response.data);
    } catch (error) {
      console.error("Failed to fetch news:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getNewsIcon = (category) => {
    switch (category) {
      case "market":
        return "📈";
      case "company":
        return "🏢";
      case "update":
        return "🔄";
      case "announcement":
        return "📢";
      default:
        return "📰";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Latest News</h3>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading news...</div>
          </div>
        ) : news.length > 0 ? (
          <div className="space-y-4">
            {news.map((article) => (
              <div
                key={article.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedNews(article)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-2xl">
                    {getNewsIcon(article.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-white font-semibold text-lg mb-1">
                          {article.title}
                        </h4>
                        <p className="text-gray-400 text-sm mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(article.published_at)}</span>
                          <span className="capitalize">{article.category}</span>
                        </div>
                      </div>
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded-lg ml-4"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No news available</div>
          </div>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  {selectedNews.title}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>{formatDate(selectedNews.published_at)}</span>
                  <span className="capitalize">{selectedNews.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNews(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {selectedNews.image && (
              <img
                src={selectedNews.image}
                alt={selectedNews.title}
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
            )}

            <div className="text-gray-300 leading-relaxed">
              {selectedNews.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// My Tickets Component
export const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/support/tickets`);
      setTickets(response.data);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open":
        return "bg-blue-800 text-blue-200";
      case "in_progress":
        return "bg-yellow-800 text-yellow-200";
      case "resolved":
        return "bg-green-800 text-green-200";
      case "closed":
        return "bg-gray-800 text-gray-200";
      default:
        return "bg-gray-800 text-gray-200";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-green-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">
            My Support Tickets
          </h3>
          <button
            onClick={() => (window.location.hash = "#new-ticket")}
            className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
          >
            Create New Ticket
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-white text-lg">Loading tickets...</div>
          </div>
        ) : tickets.length > 0 ? (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <span className="text-gray-400 text-sm">
                        #{ticket.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          ticket.status
                        )}`}
                      >
                        {ticket.status.replace("_", " ")}
                      </span>
                      <span
                        className={`text-sm ${getPriorityColor(
                          ticket.priority
                        )}`}
                      >
                        {ticket.priority} priority
                      </span>
                    </div>
                    <h4 className="text-white font-semibold text-lg mb-1">
                      {ticket.subject}
                    </h4>
                    <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Created:{" "}
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        Updated:{" "}
                        {new Date(ticket.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-400 text-sm">Category</div>
                    <div className="text-white font-medium">
                      {ticket.category}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400">No support tickets found</div>
          </div>
        )}
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-gray-800">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  #{selectedTicket.id} - {selectedTicket.subject}
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                      selectedTicket.status
                    )}`}
                  >
                    {selectedTicket.status.replace("_", " ")}
                  </span>
                  <span
                    className={`${getPriorityColor(selectedTicket.priority)}`}
                  >
                    {selectedTicket.priority} priority
                  </span>
                  <span>{selectedTicket.category}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="text-gray-300 leading-relaxed mb-6">
              <h3 className="text-white font-semibold mb-2">Description:</h3>
              <p>{selectedTicket.description}</p>
            </div>

            {selectedTicket.responses &&
              selectedTicket.responses.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Responses:</h3>
                  {selectedTicket.responses.map((response, index) => (
                    <div key={index} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-white">
                          {response.is_staff ? "Support Team" : "You"}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(response.created_at).toLocaleString()}
                        </div>
                      </div>
                      <p className="text-gray-300">{response.message}</p>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

// New Ticket Component
export const NewTicket = () => {
  const [ticketData, setTicketData] = useState({
    subject: "",
    category: "general",
    priority: "medium",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: "general", label: "General Inquiry" },
    { value: "technical", label: "Technical Support" },
    { value: "account", label: "Account Issues" },
    { value: "trading", label: "Trading Problems" },
    { value: "deposits", label: "Deposits & Withdrawals" },
    { value: "kyc", label: "KYC Verification" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/support/tickets`, ticketData);
      alert("Support ticket created successfully!");
      setTicketData({
        subject: "",
        category: "general",
        priority: "medium",
        description: "",
      });
    } catch (error) {
      console.error("Failed to create ticket:", error);
      alert("Failed to create ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Create New Support Ticket
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm mb-2">Subject</label>
            <input
              type="text"
              value={ticketData.subject}
              onChange={(e) =>
                setTicketData((prev) => ({ ...prev, subject: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2">Category</label>
              <select
                value={ticketData.category}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white text-sm mb-2">Priority</label>
              <select
                value={ticketData.priority}
                onChange={(e) =>
                  setTicketData((prev) => ({
                    ...prev,
                    priority: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-white text-sm mb-2">Description</label>
            <textarea
              value={ticketData.description}
              onChange={(e) =>
                setTicketData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              rows="6"
              placeholder="Provide detailed information about your issue..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Creating Ticket..." : "Create Support Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
};

// Referral Dashboard Component
export const ReferralDashboard = () => {
  const { user } = useAuth();
  const [referralStats, setReferralStats] = useState({
    total_referrals: 0,
    total_earned: 0,
    this_month: 0,
    monthly_earned: 0,
    referral_link: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/referrals/stats`);
      setReferralStats(response.data);
    } catch (error) {
      console.error("Failed to fetch referral stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralStats.referral_link);
    alert("Referral link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading referral stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Total Referrals</div>
          <div className="text-2xl font-bold text-white">
            {referralStats.total_referrals}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Total Earned</div>
          <div className="text-2xl font-bold text-green-400">
            ${referralStats.total_earned.toFixed(2)}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">This Month</div>
          <div className="text-2xl font-bold text-blue-400">
            {referralStats.this_month}
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Monthly Earned</div>
          <div className="text-2xl font-bold text-yellow-400">
            ${referralStats.monthly_earned.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Your Referral Link
        </h3>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={referralStats.referral_link}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
          />
          <button
            onClick={copyReferralLink}
            className="px-6 py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
          >
            Copy Link
          </button>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">How it Works</h3>
        <div className="space-y-4 text-gray-300">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
              1
            </div>
            <div>
              <div className="font-medium text-white">
                Share your referral link
              </div>
              <div className="text-sm">
                Send your unique referral link to friends and family
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
              2
            </div>
            <div>
              <div className="font-medium text-white">
                They sign up and deposit
              </div>
              <div className="text-sm">
                When they create an account and make their first deposit
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-black font-bold text-sm">
              3
            </div>
            <div>
              <div className="font-medium text-white">You earn rewards</div>
              <div className="text-sm">
                Get $50 bonus for each successful referral
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Dashboard Component
export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsResponse, usersResponse, kycResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/stats`),
        axios.get(`${API_BASE_URL}/api/admin/users?limit=20`),
        axios.get(`${API_BASE_URL}/api/admin/kyc/pending`),
      ]);

      setStats(statsResponse.data);
      setUsers(usersResponse.data);
      setPendingKYC(kycResponse.data);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpdate = async (userId, updateData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}`, updateData);
      fetchAdminData(); // Refresh data
      alert("User updated successfully");
    } catch (error) {
      alert("Failed to update user");
    }
  };

  const handleKYCVerification = async (userId, status, notes = "") => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/kyc/verify`, {
        user_id: userId,
        status,
        notes,
      });
      fetchAdminData(); // Refresh data
      alert(`KYC ${status} successfully`);
    } catch (error) {
      alert("Failed to update KYC status");
    }
  };

  const exportUsers = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/export/users`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Failed to export users");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Admin Navigation */}
      <div className="flex space-x-4 border-b border-gray-700 pb-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "overview"
              ? "bg-orange-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "users"
              ? "bg-orange-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab("kyc")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "kyc"
              ? "bg-orange-400 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          KYC Review
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Total Users</div>
              <div className="text-2xl font-bold text-white">
                {stats.total_users}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Active Users</div>
              <div className="text-2xl font-bold text-green-400">
                {stats.active_users}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Total Deposits</div>
              <div className="text-2xl font-bold text-blue-400">
                ${stats.total_deposits.toFixed(2)}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Pending KYC</div>
              <div className="text-2xl font-bold text-yellow-400">
                {stats.pending_kyc}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Monthly Signups</div>
              <div className="text-2xl font-bold text-white">
                {stats.monthly_signups}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
              <div className="text-gray-400 text-sm mb-2">Monthly Deposits</div>
              <div className="text-2xl font-bold text-green-400">
                ${stats.monthly_deposits.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white">
              User Management
            </h3>
            <button
              onClick={exportUsers}
              className="px-4 py-2 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300"
            >
              Export CSV
            </button>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Name
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Email
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Balance
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      KYC Status
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Status
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-800">
                      <td className="p-3 text-white">{user.name}</td>
                      <td className="p-3 text-gray-300">{user.email}</td>
                      <td className="p-3 text-gray-300">
                        ${user.balance.toFixed(2)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm ${
                            user.kyc_status === "approved"
                              ? "text-green-400"
                              : user.kyc_status === "rejected"
                              ? "text-red-400"
                              : "text-yellow-400"
                          }`}
                        >
                          {user.kyc_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`text-sm ${
                            user.is_active ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {user.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleUserUpdate(user.id, {
                                is_active: !user.is_active,
                              })
                            }
                            className={`px-2 py-1 text-xs rounded ${
                              user.is_active
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            } text-white`}
                          >
                            {user.is_active ? "Suspend" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* KYC Tab */}
      {activeTab === "kyc" && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white">
            KYC Document Review
          </h3>

          <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      User
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Document Type
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Document Number
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Uploaded
                    </th>
                    <th className="text-left p-3 text-gray-300 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pendingKYC.map((doc) => (
                    <tr key={doc.id} className="border-b border-gray-800">
                      <td className="p-3 text-white">
                        {doc.user.name} ({doc.user.email})
                      </td>
                      <td className="p-3 text-gray-300">{doc.document_type}</td>
                      <td className="p-3 text-gray-300">
                        {doc.document_number}
                      </td>
                      <td className="p-3 text-gray-300">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              handleKYCVerification(doc.user_id, "approved")
                            }
                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt("Rejection reason:");
                              if (notes)
                                handleKYCVerification(
                                  doc.user_id,
                                  "rejected",
                                  notes
                                );
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Dashboard Component with Enhanced Navigation
export const Dashboard = () => {
  const { user, logout } = useAuth();
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
      case "kyc":
        return <KYCVerification />;
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
