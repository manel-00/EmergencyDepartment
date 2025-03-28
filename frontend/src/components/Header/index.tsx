"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";
import axios from "axios";

const Header = () => {
  
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // Handle Sticky Navbar on Scroll
  useEffect(() => {
    const handleStickyNavbar = () => {
      setSticky(window.scrollY >= 80);
    };
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  const fetchUserSession = async () => {
    try {
      console.log("🔄 Fetching user session...");
  
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3000/user/session", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
      });
  
      console.log("✅ Session Response:", response.data);
  
      if (response.data.status === "SUCCESS" && response.data.user) {
        console.log("✅ User session found:", response.data.user);
        setUser(response.data.user);
      } else {
        console.log("⚠️ No active user session.");
      }
    } catch (error) {
      console.error("❌ Failed to fetch session:", error);
    }
  };
  

  
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:3000/user/session", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          withCredentials: true,
        });
  
        const user = response.data.user;
        if (user?.role === "admin") {
          alert("⛔ Accès interdit pour les administrateurs sur cette interface.");
          window.location.href = "http://localhost:3002";
        }
      } catch (err) {
        console.error("⛔ Accès refusé ou erreur session :", err);
      }
    };
  
    checkAccess();
  }, []);
  

  useEffect(() => {
    fetchUserSession();
  
    // 👂 Ajouter un écouteur pour forcer le rechargement du user
    const handleRefresh = () => {
      fetchUserSession();
    };
  
    window.addEventListener("refresh-user", handleRefresh);
  
    return () => {
      window.removeEventListener("refresh-user", handleRefresh);
    };
  }, []);
  

  // Listen for changes when profile is updated
  useEffect(() => {
    const handleStorageChange = () => {
      fetchUserSession(); // Refetch user data when profile updates
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await axios.get("http://localhost:3000/user/logout", { withCredentials: true });
      localStorage.removeItem("token");
      setUser(null);
      router.push("/signin");
    } catch (error) {
      console.error("❌ Logout Failed:", error);
    }
  };
  

  // Handle Profile Image Click (Redirect to Edit Profile)
  const handleProfileClick = () => {
    router.push("/edit-profile");
  };

  const usePathName = usePathname();

  return (
    <header
      className={`header left-0 top-0 z-40 flex w-full items-center ${
        sticky
          ? "dark:bg-gray-dark dark:shadow-sticky-dark fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition"
          : "absolute bg-transparent"
      }`}
    >
      <div className="container">
        <div className="relative -mx-4 flex items-center justify-between">
          {/* Logo Section */}
          <div className="w-60 max-w-full px-4 xl:mr-12">
            <Link href="/" className={`header-logo block w-full ${sticky ? "py-5 lg:py-2" : "py-8"} `}>
              <Image src="/images/logo/logo-2.svg" alt="logo" width={140} height={30} className="w-full dark:hidden" />
              <Image src="/images/logo/logo.svg" alt="logo" width={140} height={30} className="hidden w-full dark:block" />
            </Link>
          </div>

          {/* Navbar Section */}
          <div className="flex w-full items-center justify-between px-4">
            <nav
              id="navbarCollapse"
              className={`navbar absolute right-0 z-30 w-[250px] rounded border-[.5px] border-body-color/50 bg-white px-6 py-4 duration-300 dark:border-body-color/20 dark:bg-dark lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                navbarOpen ? "visibility top-full opacity-100" : "invisible top-[120%] opacity-0"
              }`}
            >
              <ul className="block lg:flex lg:space-x-12">
                {menuData.map((menuItem, index) => (
                  <li key={index} className="group relative">
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path}
                        className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                          usePathName === menuItem.path
                            ? "text-primary dark:text-white"
                            : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                        }`}
                      >
                        {menuItem.title}
                      </Link>
                    ) : (
                      <p className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6">
                        {menuItem.title}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Profile & Logout Section */}
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  {/* ✅ Profile Avatar (Click to Edit Profile) */}
                  <div className="relative cursor-pointer" onClick={handleProfileClick}>
                    <Image
                      src={user.image ? `/images/${user.image}` : "/images/default-avatar.png"} // ✅ Uses default avatar if none provided
                      alt="Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>

                  {/* ✅ Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/signin" className="text-white hover:underline">
                    Sign In
                  </Link>
                  <Link href="/signup" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Sign Up
                  </Link>
                </>
              )}

              {/* Theme Toggler */}
              <ThemeToggler />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
