import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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
