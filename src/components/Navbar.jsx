// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to login or home
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav
      className="bg-white shadow-md px-8 py-4 flex justify-between items-center sticky top-0 z-50"
      style={{ backdropFilter: "saturate(180%) blur(10px)" }}
    >
      {/* Logo/Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
          <div className="w-5 h-5 bg-black rounded-sm"></div>
        </div>
        <span className="text-2xl font-semibold text-blue-600 select-none">Interview AI</span>
      </div>

      {/* Navigation Links and Logout */}
      <div className="flex gap-8 items-center">
        <Link
          to="/"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
        >
          Home
        </Link>
        <Link
          to="/interview"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
        >
          Interview
        </Link>
        <Link
          to="/profile"
          className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
        >
          Profile
        </Link>
        <Button variant="outline" onClick={handleLogout} className="text-sm font-medium">
          Logout
        </Button>
      </div>
    </nav>
  );
}
