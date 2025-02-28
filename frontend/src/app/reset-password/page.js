"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const userId = searchParams.get("userId");
  const resetString = searchParams.get("resetString");

  useEffect(() => {
    if (!userId || !resetString) {
      setError("Invalid or expired reset link.");
    }
  }, [userId, resetString]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/user/resetPassword", {
        userId,
        resetString,
        newPassword,
      });

      if (response.data.status === "SUCCESS") {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred while resetting password.");
    }
    setIsLoading(false);
  };

  return (
    <section className="reset-password-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card login-page shadow mt-4 rounded border-0">
              <div className="card-body">
                <h4 className="text-center">Reset Password</h4>
                {error && <p className="text-danger text-center">{error}</p>}
                {message && <p className="text-success text-center">{message}</p>}
                {!error && !message && (
                  <form onSubmit={handleSubmit} className="login-form mt-4">
                    <div className="mb-3">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                      {isLoading ? "Resetting..." : "Reset Password"}
                    </button>
                  </form>
                )}
                <div className="text-center mt-3">
                  <Link href="/login">Back to Login</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
