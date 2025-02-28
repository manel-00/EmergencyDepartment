"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiHome, SlSocialGoogle } from '../assets/icons/vander';
import { FaSquareFacebook } from 'react-icons/fa6';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("📤 Envoi de :", email, password);

    try {
        const response = await axios.post('http://localhost:3000/user/signin', { email, password });
        console.log("✅ Réponse reçue :", response.data);

        if (response.data.status === "PENDING") {
            localStorage.setItem("userId", response.data.data.userId); // Stocker userId

            router.push('/2fa'); 
        } else {
            alert(response.data.message);
        }
    } catch (error) {
        console.error("❌ Erreur lors de la connexion:", error.response?.data || error);
        alert("Erreur lors de la connexion");
    }
};


  return (
    <>
      <div className="back-to-home rounded d-none d-sm-block">
        <Link href="/" className="btn btn-icon btn-primary">
          <FiHome className="icons" />
        </Link>
      </div>

      <section className="bg-home d-flex bg-light align-items-center" style={{ backgroundImage: `url('/images/bg/bg-lines-one.png')`, backgroundPosition: 'center' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-8">
              <Image src='/images/logo-dark.png' width={115} height={22} className="mx-auto d-block" alt="" />
              <div className="card login-page shadow mt-4 rounded border-0">
                <div className="card-body">
                  <div className="text-end mb-3">
                    <Link href="/" className="btn btn-icon btn-primary">
                      <FiHome className="icons" />
                    </Link>
                  </div>
                  <h4 className="text-center">Sign In</h4>
                  <form onSubmit={handleSubmit} className="login-form mt-4">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">Your Email <span className="text-danger">*</span></label>
                          <input type="email" className="form-control" placeholder="Email" name="email" required="" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="mb-3">
                          <label className="form-label">Password <span className="text-danger">*</span></label>
                          <input type="password" className="form-control" placeholder="Password" required="" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                      </div>

                      <div className="col-lg-12">
                        <div className="d-flex justify-content-between">
                          <div className="mb-3">
                            <div className="form-check">
                              <input className="form-check-input align-middle" type="checkbox" value="" id="remember-check" />
                              <label className="form-check-label" htmlFor="remember-check">Remember me</label>
                            </div>
                          </div>
                          <Link href="/forgot-password" className="text-dark h6 mb-0">Forgot password ?</Link>
                        </div>
                      </div>
                      <div className="col-lg-12 mb-0">
                        <div className="d-grid">
                          <button type="submit" className="btn btn-primary">Sign in</button>
                        </div>
                      </div>

                      <div className="col-lg-12 mt-3 text-center">
                        <h6 className="text-muted">Or</h6>
                      </div>
                      <div className="col-6 mt-3">
                        <div className="d-grid">
                          <a href="http://localhost:3000/user/auth/facebook" className="btn btn-soft-primary">
                            <FaSquareFacebook className="mb-0" /> Facebook
                          </a>
                        </div>
                      </div>

                      <div className="col-6 mt-3">
                        <div className="d-grid">
                          <a href="http://localhost:3000/user/auth/google" className="btn btn-soft-primary">
                            <SlSocialGoogle className="mb-0" /> Google
                          </a>
                        </div>
                      </div>


                      <div className="col-12 text-center">
                        <p className="mb-0 mt-3"><small className="text-dark me-2">Dont have an account ?</small> <Link href="/signup" className="text-dark fw-bold">Sign Up</Link></p>
                      </div>
                    </div>
                  </form>
                     {/* 🔹 Lien Forgot Password */}
                 <p className="text-center mt-3">
                  <Link href="/forgot-password" className="text-primary">
                    Forgot Password?
                  </Link>
                </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}