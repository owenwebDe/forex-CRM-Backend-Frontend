// RewardComponent.js
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
