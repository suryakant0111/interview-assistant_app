import React, { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
  e.preventDefault();
  setError(null);
  setSuccessMessage(null);

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    // ✅ Send verification email
    await userCredential.user.sendEmailVerification();

    // Show success message
    setSuccessMessage("Registration successful! We've sent a verification email. Please check your inbox.");

    // Optional: Clear form fields
    setName("");
    setEmail("");
    setPassword("");

    // Optionally redirect after a short delay
    setTimeout(() => {
      navigate("/");
    }, 3000);
  } catch (err) {
    if (err.code === "auth/email-already-in-use") {
      setError("Email already registered. Try logging in.");
    } else {
      setError("Registration failed. Please try again.");
    }
  }
};


  // Automatically clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md relative">
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>Create an account to start using Interview AI.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-500 animate-fadeIn">{error}</p>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="relative bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md animate-slideDown shadow-md">
                  {successMessage}
                </div>
              )}

              <Button type="submit" className="w-full">Register</Button>

              <p className="text-sm text-center">
                Already have an account?{" "}
                <a href="/" className="underline text-blue-600 hover:text-blue-800">
                  Login
                </a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideDown {
          0% {
            opacity: 0;
            transform: translateY(-10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
