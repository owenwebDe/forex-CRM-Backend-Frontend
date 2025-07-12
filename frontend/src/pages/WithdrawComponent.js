import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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
