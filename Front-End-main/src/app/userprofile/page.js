"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";  

const UserProfile = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          alert("please login in order to access this page.");
          router.push("/login");
          return;
        }

        const response = await axios.get("http://localhost:3000/user/userprofile", {
          headers: {
            "Authorization": `Bearer ${token}`
          },
        });

        console.log("User data received:", response.data);  // Debugging

        setUserData(response.data);  // Set user details from DB

        // Check role and redirect if necessary
        if (response.data.role === "admin") {
          window.location.href = "http://localhost:3002"; // Redirect admin to admin app
        }


      } catch (err) {
        console.error("Error fetching profile:", err);

        setError(err.response?.data?.message || "Error fetching profile");

        if (err.response?.status === 401) {
          alert("Unauthorized! Please login again.");
          router.push("/login");
        }
      }
    };

    fetchUserProfile();
  }, [router]);

  if (error) return <div>{error}</div>;
  if (!userData) return <div>Loading...</div>;



  const handleLogout = () => {
    localStorage.removeItem("authToken"); // Remove the token from localStorage
    alert("You have been logged out.");
    router.push("/"); // Redirect to login page
  };
  return (
    <div>
       <button onClick={handleLogout} >
  Logout
</button>
      <h1>User Profile</h1>
      <p>Name: {userData?.name}</p>
      <p>lastname: {userData?.lastname}</p>
      <p>User ID: {userData?.userId}</p>
      <p>Email: {userData?.email}</p>
      <p>role: {userData?.role}</p>
      <p>creation date: {userData?.creationDate}</p>

      <p>image: {userData?.image}</p>

    </div>
  );
};

export default UserProfile;
