import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const BankDetails = () => {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [swiftCode, setSwiftCode] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [message, setMessage] = useState("");
  const [savedDetails, setSavedDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBankDetails = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/user/bank-details`,
        { withCredentials: true }
      );
      setSavedDetails(
        Array.isArray(response.data) ? response.data : [response.data]
      );
    } catch (error) {
      setSavedDetails([]);
    }
  };

  useEffect(() => {
    fetchBankDetails();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      await axios.post(
        `${API_BASE_URL}/api/user/bank-details`,
        {
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          swift_code: swiftCode,
          routing_number: routingNumber,
        },
        { withCredentials: true }
      );
      setMessage("Bank details saved successfully!");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setSwiftCode("");
      setRoutingNumber("");
      fetchBankDetails();
    } catch (error) {
      setMessage("Failed to save bank details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded-lg border border-gray-800 mt-8">
      <h2 className="text-xl font-bold text-white mb-4">Bank Details</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="Bank Name"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        <input
          type="text"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Account Number"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        <input
          type="text"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="Account Name"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        <input
          type="text"
          value={swiftCode}
          onChange={(e) => setSwiftCode(e.target.value)}
          placeholder="SWIFT Code (optional)"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        <input
          type="text"
          value={routingNumber}
          onChange={(e) => setRoutingNumber(e.target.value)}
          placeholder="Routing Number (optional)"
          className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Bank Details"}
        </button>
        {message && (
          <div className="text-center text-sm text-white mt-2">{message}</div>
        )}
      </div>
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-2">
          Saved Bank Details
        </h3>
        {savedDetails.length === 0 ? (
          <div className="text-gray-400">No bank details saved yet.</div>
        ) : (
          <ul className="space-y-2">
            {savedDetails.map((detail, idx) => (
              <li
                key={idx}
                className="bg-gray-800 p-3 rounded-md border border-gray-700"
              >
                <div className="text-white font-semibold">
                  {detail.bank_name}
                </div>
                <div className="text-gray-300 text-sm">
                  Account: {detail.account_number} ({detail.account_name})
                </div>
                {detail.swift_code && (
                  <div className="text-gray-400 text-xs">
                    SWIFT: {detail.swift_code}
                  </div>
                )}
                {detail.routing_number && (
                  <div className="text-gray-400 text-xs">
                    Routing: {detail.routing_number}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
