import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">My Accounts</h3>
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              No trading accounts found
            </div>
            <div className="text-gray-500 text-sm">
              You haven't opened any trading accounts yet.
              <br />
              Go to "Open Live Account" to create your first account.
            </div>
          </div>
        </div>
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
