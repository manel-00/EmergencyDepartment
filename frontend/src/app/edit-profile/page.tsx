"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function EditProfile() {
  const [user, setUser] = useState({ name: "", email: "", image: "" });
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔄 Fetching user session...");
    
        const token = localStorage.getItem("token");
     
    
        const response = await axios.get("http://localhost:3000/user/session", {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true, // ✅ Ensures cookies are sent for session-based authentication
        });
    
        console.log("✅ User session data:", response.data);
    
        if (response.data.status === "SUCCESS") {
          setUser(response.data.user);
        } else {
          console.log("⚠️ No active session.");
          router.push("/signin");
        }
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        router.push("/signin");
      }
    };
    
    // ✅ Refresh user state after profile update
    

    fetchUser();
  }, []);

  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImage(e.target.files[0]);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("name", user.name);
    formData.append("email", user.email);
    if (newImage) formData.append("image", newImage);

    try {
      const response = await axios.put("http://localhost:3000/user/edit-profile", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.status === "SUCCESS") {
        alert("✅ Profile updated successfully!");
        window.dispatchEvent(new Event("storage")); // Notify Header to refresh
        router.push("/");
      } else {
        alert("❌ Failed to update profile.");
      }
    } catch (error) {
      console.error("❌ Update failed:", error);
      alert("❌ Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-24 p-6 bg-gray-800 text-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4">
          <Image
             src={user.image ? `/images/${user.image}` : "/images/default-avatar.png"} // ✅ Uses default avatar if none provided
            alt="Profile"
            width={100}
            height={100}
            className="rounded-full border-4 border-white shadow-lg"
          />
          <input
            type="file"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded cursor-pointer focus:outline-none"
          />
        </div>

        {/* Name Field */}
        <div>
          <label className="block mb-1 text-gray-300">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-1 text-gray-300">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            disabled // Prevent users from changing email
          />
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-all"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
<<<<<<< HEAD
=======
         {/* New Button to Document Page */}
         <button
          type="button"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-all mt-2"
          onClick={() => router.push("/document")}
        >
          Document Page
        </button>
>>>>>>> ea63163a2550d76ea45bb77ba21cb1884c75c017
      </form>
    </div>
  );
}
