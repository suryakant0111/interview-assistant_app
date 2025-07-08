// File: src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import TestMic from "@/components/pages/TestMic";

import { LoginForm } from "@/components/LoginForm";
import Home from "@/components/pages/Home";
import Interview from "@/components/pages/Interview";
import Profile from "@/components/pages/Profile";
import Navbar from "@/components/Navbar";
import { RegisterForm } from "@/components/Register";

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  const isLoggedIn = !!user;

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-black/90 text-white">
        {isLoggedIn && <Navbar />}

        <div className="flex-1">
          <Routes>
            {!isLoggedIn ? (
              <>
                <Route path="/" element={<LoginForm />} />
                <Route path="/register" element={<RegisterForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Home />} />
                <Route path="/interview" element={<Interview />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              
               {/* other routes */}
              <Route path="/test-mic" element={<TestMic />} />
             
              </>
            )}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
