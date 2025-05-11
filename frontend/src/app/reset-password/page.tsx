"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const ResetPassword: React.FC = () => {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const resetString = searchParams.get("resetString");

  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!userId || !resetString) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/user/resetPassword", {
        userId,
        resetString,
        newPassword,
      });

      if (response.data.status === "SUCCESS") {
        setMessage("✅ Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(response.data.message);
      }
    } catch (err: any) {
      setError("❌ An error occurred while resetting the password.");
    }
  };

  return (
    <>
      {/* Styled Reset Password Section with white background */}
      <section className="relative z-10 flex items-center justify-center min-h-screen bg-white text-black">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
            
          

            {/* Title */}
            <h3 className="mb-2 text-center text-2xl font-bold text-dark">
              Reset Your Password
            </h3>
            <p className="text-center text-sm text-gray-600 mb-6">
              Enter your new password to reset your account.
            </p>

            {/* Reset Password Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="mt-2 w-full px-4 py-3 border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white text-black border-gray-300"
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="mt-2 w-full px-4 py-3 border rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white text-black border-gray-300"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-md font-medium shadow-md transition-all"
                >
                  Reset Password
                </button>
              </div>
            </form>

            {/* Success & Error Messages */}
            <div className="text-center mt-4">
              {message && <p className="text-green-500">{message}</p>}
              {error && <p className="text-red-500">{error}</p>}
            </div>

            {/* Back to Login */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Remember your password?{" "}
                <Link href="/login" className="text-primary hover:underline">
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

export default ResetPassword;