"use client";

import React, { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import Webcam from "react-webcam";

const SigninPage: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const router = useRouter();

  // ✅ Check Active Session on Page Load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const sessionResponse = await axios.get("http://localhost:3000/user/session", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (sessionResponse.data.user) {
          console.log("✅ Session Active:", sessionResponse.data.user);
          router.push("/");
        }
      } catch (error) {
        console.error("❌ No Active Session:", error);
      }
    };

    checkSession();
  }, [router]);

  // 🔹 Handle Input Change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Convert Base64 Image to File
  const dataURLtoFile = (dataUrl: string, filename: string): File => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // 🔹 Capture Image from Webcam
  const capture = () => {
    const image = webcamRef.current?.getScreenshot();
    if (image) setImageSrc(image);
  };

  // 🔹 Handle Form Submission (Email & Password)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3000/user/signin",
        formData,
        { withCredentials: true }
      );

      if (response.data.status === "PENDING") {
        localStorage.setItem("userId", response.data.data.userId);
        router.push("/2fa");
      } else if (response.data.status === "SUCCESS") {
        localStorage.setItem("token", response.data.token);
        alert("✅ Login Successful!");
        router.push("/");
      } else {
        alert(response.data.message);
      }
    } catch (error: any) {
      console.error("❌ Login Error:", error.response?.data || error);
      alert("Login failed.");
    } finally {
      setLoading(false);
    }
  };
  // ✅ Face Login
const handleFaceLogin = async () => {
  if (!imageSrc) return alert("Please capture an image first!");

  const formData = new FormData();
  formData.append("image", dataURLtoFile(imageSrc, "face-login.jpg"));

  try {
    const response = await axios.post("http://localhost:3000/user/face-login", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true, // ✅ Ensures cookies are sent
    });

    console.log("✅ Face Login Response:", response.data);

    if (response.data.token) {
      console.log("✅ Storing token:", response.data.token);
      localStorage.setItem("token", response.data.token); // ✅ Store token

      alert("✅ Face Login Successful!");
      router.push("/");
    } else {
      alert(response.data.message);
    }
  } catch (error: any) {
    console.error("❌ Face Login Error:", error.response?.data || error);
    alert("Face Login Failed");
  }
};

  ////*************** */

  return (
    
    <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 dark:bg-dark sm:p-[60px]">
              <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Sign in to your account
              </h3>
              <p className="mb-11 text-center text-base font-medium text-body-color">
                Login to your account for a faster checkout.
              </p>

              {/* ✅ Sign In Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-8">
                  <label className="mb-3 block text-sm text-dark dark:text-dark">Your Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your Email"
                    required
                    className="border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                  />
                </div>

                <div className="mb-8">
                  <label className="mb-3 block text-sm text-dark dark:text-dark">Your Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your Password"
                    required
                    className="border-stroke dark:text-body-color-dark w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary"
                  />
                </div>

                <div className="mb-6">
                  <button
                    type="submit"
                    className="w-full rounded bg-primary px-9 py-4 text-base font-medium text-white hover:bg-primary/90"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </form>

              {/* ✅ Face Login */}
              <div className="text-center mt-6">
                <h6 className="text-muted mb-2">Or use Face Login</h6>
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  className="rounded-md border"
                />
                <button
                  className="mt-3 w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
                  onClick={capture}
                >
                  📸 Capture
                </button>
              </div>

              {imageSrc && (
                <div className="text-center mt-4">
                  <img src={imageSrc} alt="Captured Face" className="rounded-md border" width="100%" />
                  <button
                    className="mt-3 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                    onClick={handleFaceLogin}
                  >
                    🔓 Face Login
                  </button>
                </div>
              )}

              <p className="mt-4 text-center text-sm text-body-color">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
              {/* ✅ OAuth Sign-In */}
                <div className="flex flex-col gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => window.location.href = "http://localhost:3000/user/auth/google"}
                    className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded"
                  >
                    <img src="/icons/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Sign in with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => window.location.href = "http://localhost:3000/user/auth/facebook"}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
                  >
                    <img src="/icons/facebook.svg" alt="Facebook" className="w-5 h-5 mr-2" />
                    Sign in with Facebook
                  </button>
                </div>

            </div>
          </div>
        </div>
      </div>
      <nav className="bg-gray-800 p-4 flex justify-between">
      <Link href="/" className="text-white">Home</Link>
      <Link href="/3d-human" className="text-white">3D Human Viewer</Link> {/* ✅ Add New Link */}
    </nav>
    </section>
  );
};

export default SigninPage;
