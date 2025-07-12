import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

export const ChangeMT5Password = () => {
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE_URL}/api/accounts/change-password`, {
        current_password: passwords.current,
        new_password: passwords.new,
      });

      alert("Password changed successfully!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">
          Change MT5 Password
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
          <div>
            <label className="block text-white text-sm mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwords.current}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, current: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwords.new}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, new: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) =>
                setPasswords((prev) => ({ ...prev, confirm: e.target.value }))
              }
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? "Changing Password..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};
