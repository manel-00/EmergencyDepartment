// hoc/withAuth.js
import React from 'react';

const withAuth = (WrappedComponent) => {
  return (props) => {
    // Function to decode JWT token (simplified example)
    const decodeToken = (token) => {
      try {
        // In a real app, you would properly decode the JWT
        // This is a simplified example assuming the token is a simple object
        if (typeof token === 'string') {
          return JSON.parse(atob(token.split('.')[1]));
        }
        return token; // if it's already an object
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    };

    // Get token from where you store it (localStorage, cookies, etc.)
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!token) {
      // No token found, redirect to login or show unauthorized message
      return <div>Unauthorized. Please login.</div>;
    }

    const decodedToken = decodeToken(token);
    
    if (decodedToken && decodedToken.role === 'admin') {
      // If user is admin, show the special message
      return <div>Hi Admin!</div>;
    } else if (decodedToken) {
      // If user has a valid token but isn't admin, render the wrapped component
      return <WrappedComponent {...props} />;
    } else {
      // If token is invalid
      return <div>Invalid token. Access denied.</div>;
    }
  };
};

export default withAuth;