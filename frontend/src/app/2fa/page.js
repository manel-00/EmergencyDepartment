"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TwoFactorAuth() {
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      console.error("❌ Aucun userId trouvé !");
      alert("Session expirée, veuillez vous reconnecter.");
      router.push("/login");
    }
  }, []);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    console.log("📤 Envoi de l'OTP :", { userId, otp });

    if (!userId || !otp) {
      alert("Veuillez entrer l'OTP !");
      return;
    }

    try {
      const response = await axios.post("http://localhost:3000/user/verifyOTP", { userId, otp }, { headers: { "Content-Type": "application/json" } });
      console.log("✅ Réponse reçue :", response.data);

      if (response.data.status === "SUCCESS") {
        alert("Authentification réussie !");
        localStorage.removeItem("userId"); // Nettoyer après validation
        router.push("/");
      } else {
        alert(response.data.message || "OTP incorrect !");
      }
    } catch (error) {
      console.error("❌ Erreur lors de la validation du 2FA:", error.response?.data || error);
      alert("Erreur lors de la validation.");
    }
  };

  return (
    <section className="otp-section">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card otp-page shadow mt-4 rounded border-0">
              <div className="card-body">
                <h4 className="text-center">Enter OTP</h4>
                <form onSubmit={handleVerifyOTP} className="otp-form mt-4">
                  <div className="mb-3">
                    <label className="form-label">OTP Code</label>
                    <input type="text" className="form-control" placeholder="Enter OTP" required value={otp} onChange={(e) => setOtp(e.target.value)} />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">Verify OTP</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
