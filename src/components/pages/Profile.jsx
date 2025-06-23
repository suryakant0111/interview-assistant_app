import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { signOut, reload } from "firebase/auth";

export default function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const [refreshing, setRefreshing] = useState(false);

  // Refresh user data from Firebase
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      await reload(user);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
    setRefreshing(false);
  };

  // Sign out handler
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  // Helper: get initials from displayName or email
  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "?";
  };

  if (loading) return <p className="p-6 text-center text-gray-500">Loading profile...</p>;
  if (error) return <p className="p-6 text-center text-red-500">Error loading profile: {error.message}</p>;
  if (!user) return <p className="p-6 text-center text-gray-700">No user logged in.</p>;

  return (
    <div className="p-6 flex justify-center">
      <Card className="max-w-md w-full animate-fadeIn shadow-lg border border-blue-300">
        <CardContent className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            {/* Avatar */}
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border-2 border-blue-600 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-md select-none">
                {getInitials(user.displayName, user.email)}
              </div>
            )}

            {/* User Info */}
            <div>
              <h2 className="text-3xl font-bold text-blue-700">{user.displayName || "No Name"}</h2>
              <p className="text-gray-600">{user.email}</p>
              {user.emailVerified ? (
                <p className="text-green-600 font-semibold mt-1">Email Verified ✔️</p>
              ) : (
                <p className="text-red-600 font-semibold mt-1">Email Not Verified ❌</p>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <p>
              <strong>Last Sign-in:</strong>{" "}
              {user.metadata?.lastSignInTime
                ? new Date(user.metadata.lastSignInTime).toLocaleString()
                : "Unknown"}
            </p>
            <p>
              <strong>Account Created:</strong>{" "}
              {user.metadata?.creationTime
                ? new Date(user.metadata.creationTime).toLocaleDateString()
                : "Unknown"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              {refreshing ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  Refreshing...
                </>
              ) : (
                "Refresh Profile"
              )}
            </Button>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animation styles */}
      <style >{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </div>
  );
}
