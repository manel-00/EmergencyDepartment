"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { FiHome } from "../assets/icons/vander";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/user/requestPasswordReset", {
        email,
        redirectUrl: "http://localhost:3001/reset-password/",
      });

      if (response.data.status === "PENDING") {
        setMessage("A password reset link has been sent to your email.");
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError("An error occurred while requesting a password reset.");
    }
  };

  return (
    <>
      <div className="back-to-home rounded d-none d-sm-block">
        <Link href="/" className="btn btn-icon btn-primary">
          <FiHome className="icons" />
        </Link>
      </div>

      <section className="bg-home d-flex bg-light align-items-center" style={{ backgroundImage: `url('/images/bg/bg-lines-one.png')`, backgroundPosition: "center" }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8">
              <Image src="/images/logo-dark.png" width={115} height={22} className="mx-auto d-block" alt="Logo" />
              <div className="card login-page shadow mt-4 rounded border-0">
                <div className="card-body">
                  <h4 className="text-center">Recover Account</h4>
                  <form className="login-form mt-4" onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <p className="text-muted">Please enter your email address. You will receive a link to create a new password via email.</p>
                        <div className="mb-3">
                          <label className="form-label">
                            Email address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            placeholder="Enter Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="col-lg-12">
                        <div className="d-grid">
                          <button type="submit" className="btn btn-primary">
                            Send
                          </button>
                        </div>
                      </div>
                      <div className="mx-auto text-center mt-3">
                        {message && <p className="text-success">{message}</p>}
                        {error && <p className="text-danger">{error}</p>}
                      </div>
                      <div className="mx-auto">
                        <p className="mb-0 mt-3">
                          <small className="text-dark me-2">Remember your password ?</small>{" "}
                          <Link href="/login" className="text-dark h6 mb-0">
                            Sign in
                          </Link>
                        </p>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
