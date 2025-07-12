// DepositReport.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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
