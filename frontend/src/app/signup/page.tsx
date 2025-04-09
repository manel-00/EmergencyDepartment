"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Metadata } from "next";



// ✅ Define form data type
interface FormDataState {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  image: File | null;
}

// ✅ API Response Type
interface ApiResponse {
  status: string;
  message: string;
  userId?: string;
}

const SignupPage: React.FC = () => {
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    lastname: "",
    email: "",
    password: "",
    role: "patient",
    image: null,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  // ✅ Handle Input Change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle Image Selection
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, image: file });
  };

  // ✅ Face Enrollment Function
  const enrollFace = async (userId: string): Promise<string | null> => {
    if (!formData.image) return null;

    const faceFormData = new FormData();
    faceFormData.append("image", formData.image);
    faceFormData.append("email", formData.email);

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:3000/user/enroll-face",
        faceFormData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      console.log("✅ Face Enrolled Successfully:", response.data);
      alert("✅ Face Enrolled Successfully!");

      return response.data.userId || null;
    } catch (error) {
      console.error("❌ Face Enrollment Failed:", error);
      alert("❌ Face Enrollment Failed!");
      return null;
    }
  };

  // ✅ Handle Signup Form Submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const userForm = new FormData();
    userForm.append("name", formData.name);
    userForm.append("lastname", formData.lastname);
    userForm.append("email", formData.email);
    userForm.append("password", formData.password);
    userForm.append("role", formData.role);
    userForm.append("creationDate", new Date().toISOString());
    if (formData.image) {
      userForm.append("image", formData.image);
    }

    try {
      const response = await axios.post<ApiResponse>(
        "http://localhost:3000/user/signup",
        userForm,
        { headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true
      });

      console.log("✅ Signup Response:", response.data);

      if (response.data.status === "PENDING") {
        alert("Check your email for verification!");

        const faceToken = await enrollFace(response.data.userId!);
        if (faceToken) {
          alert("✅ Face successfully enrolled!");
        }

        router.push("/signin");
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error("❌ Signup Error:", error);
      alert("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden pb-16 pt-36 md:pb-20 lg:pb-28 lg:pt-[180px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three mx-auto max-w-[500px] rounded bg-white px-6 py-10 white:bg-white sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black dark:text-white sm:text-3xl">
                  Create your account
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  It’s totally free and super easy
                </p>

                <form onSubmit={handleSubmit}>
                  {/* First Name */}
                  <div className="mb-8">
                    <label className="mb-3 block text-sm text-dark dark:text-dark">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your first name"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="mb-8">
                    <label className="mb-3 block text-sm text-dark dark:text-dark">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      placeholder="Enter your last name"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-8">
                    <label className="mb-3 block text-sm text-dark dark:text-dark">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-8">
                    <label className="mb-3 block text-sm text-dark dark:text-dark">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  {/* Profile Image */}
                  <div className="mb-8">
                    <label className="mb-3 block text-sm text-dark dark:text-dark">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleImageChange}
                      className="border-stroke dark:text-body-color-dark dark:shadow-two w-full rounded-sm border bg-[#f8f8f8] px-6 py-3 text-base text-body-color outline-none transition-all duration-300 focus:border-primary dark:border-transparent dark:bg-[#2C303B] dark:focus:border-primary dark:focus:shadow-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="mb-6">
                    <button
                      type="submit"
                      className="w-full rounded bg-primary px-9 py-4 text-base font-medium text-dark"
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Sign Up"}
                    </button>
                  </div>
                </form>

                {/* Sign-in Link */}
                <p className="text-center text-base font-medium text-body-color">
                  Already using Startup?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};


export default SignupPage;
