import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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

      // Show detailed success message
      if (response.data.mt5) {
        alert(
          `Live account application submitted successfully!\n\nMT5 Account Info:\n- Application ID: ${
            response.data.application_id
          }\n- MT5 Response: ${JSON.stringify(response.data.mt5, null, 2)}`
        );
      } else if (response.data.mt5_error) {
        alert(
          `Account application submitted, but MT5 API failed:\n\nError: ${response.data.mt5_error}\n\nYour application is saved and will be processed manually.`
        );
      } else {
        alert("Live account application submitted successfully!");
      }

      // Reset form
      setAccountType("standard");
      setLeverage("1:100");
      setCurrency("USD");
    } catch (error) {
      console.error("Failed to submit application:", error);
      if (error.response?.data?.detail) {
        alert(`Failed to submit application: ${error.response.data.detail}`);
      } else {
        alert("Failed to submit application. Please try again.");
      }
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
