import React, { useState } from "react";
// WalletHistory.js
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
