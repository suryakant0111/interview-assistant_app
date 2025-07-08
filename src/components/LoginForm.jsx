// src/components/LoginForm.jsx
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Spinner from "@/components/ui/Spinner";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";

export function LoginForm({ className, onLogin, ...props }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (onLogin) onLogin();
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Login failed. Please try again.");
      }
      console.error("Login error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onLogin) onLogin();
    } catch (error) {
      console.error("Google login failed:", error.message);
      setError("Google login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900/80 via-purple-900/80 to-pink-900/80 px-4",
        className
      )}
      {...props}
    >
      <form
        onSubmit={handleEmailLogin}
        className="w-full max-w-md bg-black/70 rounded-2xl shadow-2xl p-8 flex flex-col gap-6 backdrop-blur-md border border-white/10"
      >
        <div className="mb-2 text-center">
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Login to your account</h1>
          <p className="text-white/60 text-sm">Enter your email and password to continue</p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 text-center mt-2">{error}</p>
          )}
          <div className="flex flex-col gap-3 mt-2">
            <Button type="submit" className="w-full" variant="premium" disabled={loading}>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  Logging in...
                </div>
              ) : (
                "Login"
              )}
            </Button>
            <Button
              variant="glass"
              type="button"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Spinner />
                  Authenticating...
                </div>
              ) : (
                "Login with Google"
              )}
            </Button>
          </div>
        </div>
        <p className="mt-4 text-center text-sm text-white/70">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline text-pink-400 hover:text-pink-300 transition">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
