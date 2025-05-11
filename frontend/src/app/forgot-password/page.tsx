"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");

  // ✅ Handle Forgot Password Request
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/user/requestPasswordReset", {
        email,
        redirectUrl: "http://localhost:3001/reset-password/",
      });

      if (response.data.status === "PENDING") {
        setMessage("✅ A password reset link has been sent to your email.");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("❌ An error occurred while requesting a password reset.");
    }
  };

  return (
    <>
      {/* ✅ Styled Forgot Password Section */}
      <section className="relative z-10 flex items-center justify-center min-h-screen bg-gray-100 dark:bg-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white dark:bg-[#1E1E2E] rounded-lg shadow-md p-8">
            
            

            {/* 🔹 Title */}
            <h3 className="mb-2 text-center text-2xl font-bold text-dark dark:text-white">
              Recover Your Account
            </h3>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter your email address to receive a password reset link.
            </p>

            {/* ✅ Forgot Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="mt-2 w-full px-4 py-3 border rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-[#2C303B] dark:border-gray-700 dark:text-white"
                  placeholder="Enter Your Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* ✅ Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium shadow-md transition-all"
                >
                  Send Reset Link
                </button>
              </div>
            </form>

            {/* 🔹 Success & Error Messages */}
            <div className="text-center mt-4">
              {message && <p className="text-green-500">{message}</p>}
              {error && <p className="text-red-500">{error}</p>}
            </div>

            {/* 🔹 Back to Login */}
            <div className="text-center mt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Remember your password?{" "}
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;

