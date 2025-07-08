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
      className="bg-black/70 shadow-lg px-4 sm:px-8 py-4 sticky top-0 z-50 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center border border-white/20 shadow-md">
            <div className="w-5 h-5 bg-white rounded-sm"></div>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight select-none drop-shadow">
            Interview <span className="text-pink-400">AI</span>
          </span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="text-sm font-semibold text-white/80 hover:text-pink-400 transition"
          >
            Home
          </Link>
          <Link
            to="/interview"
            onClick={handleLinkClick}
            className="text-sm font-semibold text-white/80 hover:text-pink-400 transition"
          >
            Interview
          </Link>
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="text-sm font-semibold text-white/80 hover:text-pink-400 transition"
          >
            Profile
          </Link>
          <Button variant="outline" onClick={handleLogout} className="text-sm font-semibold border-white/20 text-white hover:bg-pink-500/20 hover:text-pink-300 transition">
            Logout
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            {/* Hamburger icon */}
            <svg
              className="h-6 w-6 text-white"
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
        <div className="md:hidden mt-4 space-y-4 px-2 pb-4 border-t border-white/10 bg-black/80 rounded-b-xl shadow-xl">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="block text-white/90 font-semibold text-base px-3 py-2 rounded-md hover:bg-pink-500/10 hover:text-pink-400 transition"
          >
            Home
          </Link>
          <Link
            to="/interview"
            onClick={handleLinkClick}
            className="block text-white/90 font-semibold text-base px-3 py-2 rounded-md hover:bg-pink-500/10 hover:text-pink-400 transition"
          >
            Interview
          </Link>
          <Link
            to="/profile"
            onClick={handleLinkClick}
            className="block text-white/90 font-semibold text-base px-3 py-2 rounded-md hover:bg-pink-500/10 hover:text-pink-400 transition"
          >
            Profile
          </Link>
          <Button
            variant="outline"
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-base font-semibold border-white/20 text-white hover:bg-pink-500/20 hover:text-pink-300 transition"
          >
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
}
