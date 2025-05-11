"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";






//const isAdmin: boolean = true; // Set to true to show the SidebarProvider
export function Providers({ children }: { children: React.ReactNode }) {

  const [master, setMaster] = useState<boolean | null>(null);
const [user, setUser] = useState(null);
const router = useRouter();

// ✅ Vérifie la session et le rôle admin
const fetchUserSession = async () => {
  try {
    const token = localStorage.getItem("token");

    const response = await axios.get("http://localhost:3000/user/session", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      withCredentials: true,
    });

    if (response.data.status === "SUCCESS") {
      const currentUser = response.data.user;

      setMaster(currentUser.role === "admin");
      setUser(currentUser);
    } else {
      setMaster(false); // Or handle based on your application's logic for non-success
      setUser(null);
      // Optionally, you might want to log this or handle it differently
    }
  } catch (error) {
    console.error("❌ Error session:", error);
    setMaster(false); // Or handle based on your application's error logic
    console.log(master);
    setUser(null);
    // Optionally, you might want to log this or handle it differently
  }
};


useEffect(() => {
    fetchUserSession();
  }, []);


  const isAdmin = master; // Set to true to show the SidebarProvider



  return (
    <ThemeProvider defaultTheme="light" attribute="class">
       {isAdmin ? (
        <SidebarProvider>{children}</SidebarProvider>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="min-h-screen bg-gray-2 dark:bg-[#020d1a] flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You don't have permission to access this page.</p>
             
            </div>
          </div>
        </div>
      )}
      </ThemeProvider>
  );
}





/*"use client";

import { SidebarProvider } from "@/components/Layouts/sidebar/sidebar-context";
import { ThemeProvider } from "next-themes";

const isAdmin: boolean = true; // Set to true to show the SidebarProvider



export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" attribute="class">

      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
=======
       {isAdmin ? (
        <SidebarProvider>{children}</SidebarProvider>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="min-h-screen bg-gray-2 dark:bg-[#020d1a] flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
              <p>You don't have permission to access this page.</p>
            </div>
          </div>
        </div>
      )}
      </ThemeProvider>
  );
}
 */

