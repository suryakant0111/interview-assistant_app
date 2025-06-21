import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // redirect to login or home
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Close menu on navigation (for mobile)
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <nav
      className="bg-white shadow-md px-4 sm:px-8 py-4 sticky top-0 z-50 backdrop-filter backdrop-saturate-180 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-300 shadow-sm">
            <div className="w-5 h-5 bg-black rounded-sm"></div>
          </div>
          <span className="text-2xl font-semibold text-blue-600 select-none">
            Interview AI
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
          >
            Home
          </Link>
          <Link
            to="/interview"
            onClick={handleLinkClick}
            className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
          >
            Interview
          </Link>
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="text-sm font-medium text-gray-700 hover:text-blue-600 hover:underline transition"
          >
            Profile
          </Link>
          <Button variant="outline" onClick={handleLogout} className="text-sm font-medium">
            Logout
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                // Close icon (X)
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                // Hamburger icon
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 space-y-4 px-2 pb-4 border-t border-gray-200">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="block text-gray-700 font-medium text-base px-3 py-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition"
          >
            Home
          </Link>
          <Link
            to="/interview"
            onClick={handleLinkClick}
            className="block text-gray-700 font-medium text-base px-3 py-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition"
          >
            Interview
          </Link>
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="block text-gray-700 font-medium text-base px-3 py-2 rounded-md hover:bg-blue-100 hover:text-blue-700 transition"
          >
            Profile
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-base font-medium"
          >
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
