// ReferralDashboard.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../components";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

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
