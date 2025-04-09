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
  const usePathName = usePathname();

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
    if (typeof window === 'undefined') return;
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        return;
      }

      const response = await axios.get("http://localhost:3000/user/session", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      if (response.data.status === "SUCCESS" && response.data.user) {
        setUser(response.data.user);
      } else {
        localStorage.removeItem("token");
        setUser(null);
      }
    } catch (error) {
      console.error("❌ Failed to fetch session:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUserSession();
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      router.push("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleProfileClick = () => {
    router.push("/edit-profile");
  };

  return (
    <>
      <header
        className={`left-0 top-0 z-40 flex w-full items-center bg-transparent ${
          sticky
            ? "!bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm dark:!bg-dark dark:shadow-sticky-dark"
            : ""
        }`}
      >
        <div className="container">
          <div className="relative -mx-4 flex items-center justify-between">
            <div className="w-60 max-w-full px-4 xl:mr-12">
              <Link href="/" className="header-logo block w-full py-5">
                <Image
                  src="/images/logo.svg"
                  alt="logo"
                  width={140}
                  height={30}
                  className="dark:hidden"
                  priority
                />
              </Link>
            </div>

            <div className="flex w-full items-center justify-between px-4">
              <div>
                <button
                  onClick={() => setNavbarOpen(!navbarOpen)}
                  aria-label="Toggle Menu"
                  className={`absolute right-4 top-10 block lg:hidden ${
                    navbarOpen ? "top-10" : "top-10"
                  }`}
                >
                  <svg
                    className="fill-current"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z" />
                  </svg>
                </button>

                <nav
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
              </div>

              <div className="flex items-center gap-4">
                {user ? (
                  <>
                    <div className="relative cursor-pointer" onClick={handleProfileClick}>
                      <Image
                        src={user.image ? `/images/${user.image}` : "/images/default-avatar.png"}
                        alt="Avatar"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    </div>

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

                <ThemeToggler />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;