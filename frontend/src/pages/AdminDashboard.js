// AdminDashboard.js
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
