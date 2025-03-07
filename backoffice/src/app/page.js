"use client"; // Mark the file as a Client Component


import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

import Wrapper from './components/wrapper'
import { useEffect } from 'react';

import { jwtDecode } from 'jwt-decode';



export default function Home() {



  useEffect(() => {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      
      // Function to get the value of a specific cookie by name
      const getCookie = (name) => {
        const value = `; ${cookies}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null; // Return null if cookie is not found
      };
      
      const authToken = getCookie('auth_token'); // Replace 'auth_token' with the name of your cookie
      console.log(authToken); // This will log the token or null if not found
      if (authToken) {
        try {
          const decoded = jwtDecode(authToken); // Use jwtDecode without `.default`

          console.log("🆔 User ID from Token:", decoded.userId); // Log the user ID
        } catch (error) {
          console.error("❌ Invalid token:", error);
        }


      }
    }
  }, []);

  
  
  return (
    <Wrapper>
      
    </Wrapper>
  )
}
