"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const TwoFactorAuth: React.FC = () => {
  const [otp, setOtp] = useState<string>("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // ✅ Retrieve userId from localStorage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
  
    // ✅ Store token


    if (storedUserId) {
      console.log("✅ Found userId:", storedUserId);
      setUserId(storedUserId);
    } else {
      console.error("❌ No userId found. Redirecting to Sign In...");
      alert("Session expired, please log in again.");
      router.push("/signin");
    }
  }, [router]);

  // ✅ Handle OTP verification
  const handleVerifyOTP = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userId) {
      alert("❌ Error: User session expired. Please sign in again.");
      router.push("/signin");
      return;
    }

    if (!otp.trim()) {
      alert("❌ Please enter the OTP!");
      return;
    }

    setLoading(true);
    console.log("📤 Sending OTP:", { userId, otp });

    try {
      const response = await axios.post(
        "http://localhost:3000/user/verifyOTP",
        { userId, otp },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // ✅ Ensures session cookies are stored
        }
      );

      console.log("✅ OTP Verification Response:", response.data);

      if (response.data.status === "SUCCESS") {
        const role = response.data.user.role;
        // localStorage.setItem("token", response.data.token);
        window.dispatchEvent(new Event("refresh-user")); // ✅ Store token

      
        if (role === "admin") {
          // 🔁 Rediriger vers le backoffice (3002)
          window.location.href = "http://localhost:3002/";
        } else {
          // 🔁 Rediriger vers le frontend
          router.push("/");
        }
      }
      else {
        alert(response.data.message || "❌ Incorrect OTP!");
      }
    } catch (error) {
      console.error("❌ Error verifying OTP:", error.response?.data || error);
      alert("❌ OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Resend OTP (calls backend)
  const handleResendOTP = async () => {
    if (!userId) {
      alert("❌ Error: User session expired. Please sign in again.");
      router.push("/signin");
      return;
    }

    console.log("📤 Requesting new OTP for userId:", userId);
    alert("ℹ️ Sending new OTP, please wait...");

    try {
      const response = await axios.post(
        "http://localhost:3000/user/resendOTP",
        { userId },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.data.status === "SUCCESS") {
        alert("✅ New OTP has been sent to your email!");
      } else {
        alert(response.data.message || "❌ Failed to resend OTP.");
      }
    } catch (error) {
      console.error("❌ Error resending OTP:", error.response?.data || error);
      alert("❌ Failed to resend OTP. Please try again.");
    }
  };

  return (
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Enter OTP Code
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                Please enter the OTP sent to your email.
              </p>

              {/* ✅ OTP Form */}
              <form onSubmit={handleVerifyOTP} className="otp-form mt-4">
                <div className="mb-8">
                  <label className="mb-3 block text-sm text-dark dark:text-white">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    required
                    className="border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                  />
                </div>

                {/* ✅ Submit Button */}
                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full rounded bg-primary px-9 py-4 text-base font-medium text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </button>
                </div>
              </form>

              {/* ✅ Resend OTP */}
              <p className="text-center text-base font-medium text-body-color">
                Didn’t receive an OTP?{" "}
                <button
                  onClick={handleResendOTP}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  Resend OTP
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoFactorAuth;
