import React, { useState, useEffect } from "react";
import { useAuth, BackgroundOverlay, CribLogo } from "../components";

export const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    country: "United States",
    phone: "",
    countryCode: "+1-US",
    referralCode: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { signup } = useAuth();

  // Get referral code from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode }));
    }
  }, []);

  const countries = [
    { name: "United States", code: "+1-US" },
    { name: "Canada", code: "+1-CA" },
    { name: "United Kingdom", code: "+44" },
    { name: "Australia", code: "+61" },
    { name: "Germany", code: "+49" },
    { name: "France", code: "+33" },
    { name: "Spain", code: "+34" },
    { name: "Italy", code: "+39" },
    { name: "Netherlands", code: "+31" },
    { name: "Sweden", code: "+46" },
    { name: "Norway", code: "+47" },
    { name: "Denmark", code: "+45" },
    { name: "Afghanistan", code: "+93" },
    { name: "Albania", code: "+355" },
    { name: "Algeria", code: "+213" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const signupData = {
      email: formData.email,
      name: formData.name,
      password: formData.password,
      country: formData.country,
      phone: formData.phone,
      country_code: formData.countryCode,
      referral_code: formData.referralCode || null,
    };

    const result = await signup(signupData);

    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundOverlay />

      <div className="relative z-10 min-h-screen flex">
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <CribLogo />
            </div>

            <div className="mb-8">
              <h1 className="text-white text-3xl font-bold mb-2">Sign Up</h1>
              <div className="text-gray-400">
                Already have an Account?{" "}
                <a
                  href="/login"
                  className="text-orange-400 hover:text-orange-300"
                >
                  Sign In
                </a>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="abc@mail.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  required
                />
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Enter your Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your Password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">
                  Confirm your Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Re-enter Password"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-400"
                  required
                >
                  {countries.map((country) => (
                    <option key={country.name} value={country.name}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm mb-2">Phone</label>
                <div className="flex space-x-2">
                  <select
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    className="w-20 px-2 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:border-orange-400"
                  >
                    {countries.map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                    required
                  />
                </div>
              </div>

              {formData.referralCode && (
                <div>
                  <label className="block text-white text-sm mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleInputChange}
                    placeholder="Referral Code"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                  />
                </div>
              )}

              {error && <div className="text-red-400 text-sm">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-orange-400 to-yellow-500 text-black font-semibold rounded-md hover:from-orange-500 hover:to-yellow-600 transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Get Started</h2>
              <p className="text-xl text-gray-300">
                Create an account to experience our powerful trading platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
