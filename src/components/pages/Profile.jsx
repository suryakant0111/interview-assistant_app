import React, { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../lib/firebase";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { CheckCircle, Mail, LogOut, Edit, BadgeCheck, Star, SunMoon, ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

const providerIcons = {
  "google.com": (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><g><path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148 0-3.359 2.75-6.148 6.125-6.148 1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.703-1.57-3.906-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.781 0 9.594-4.055 9.594-9.773 0-.656-.07-1.156-.156-1.625z" fill="#4285F4"/><path d="M3.153 7.345l3.289 2.414c.891-1.781 2.578-2.961 4.558-2.961 1.172 0 2.227.406 3.055 1.078l2.883-2.805c-1.703-1.57-3.906-2.539-6.656-2.539-3.828 0-7.055 2.672-8.242 6.273z" fill="#34A853"/><path d="M12 22c2.672 0 4.922-.883 6.594-2.406l-3.047-2.492c-.844.594-1.922.953-3.547.953-2.828 0-5.219-1.914-6.078-4.477l-3.242 2.5c1.672 3.406 5.094 5.922 9.32 5.922z" fill="#FBBC05"/><path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.148 0-3.359 2.75-6.148 6.125-6.148 1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.703-1.57-3.906-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.781 0 9.594-4.055 9.594-9.773 0-.656-.07-1.156-.156-1.625z" fill="#4285F4"/></g></svg>
  ),
};

function formatDate(ts) {
  if (!ts) return "-";
  const date = new Date(Number(ts));
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function formatDateTime(ts) {
  if (!ts) return "-";
  const date = new Date(Number(ts));
  return date.toLocaleString();
}

export default function Profile() {
  const [user, loading, error] = useAuthState(auth);
  const [editOpen, setEditOpen] = useState(false);
  const [bio, setBio] = useState("Building the future of AI. 🚀");
  const [banner, setBanner] = useState("");
  const [theme, setTheme] = useState("dark");
  const [badges] = useState(["Verified", "Pro", "Early Adopter"]);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast.success("Signed out!");
    } catch (err) {
      toast.error("Sign out failed");
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBanner(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Parallax mouse effect for banner
  const handleBannerMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2; // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2; // -1 to 1
    setParallax({ x, y });
  };
  const handleBannerMouseLeave = () => setParallax({ x: 0, y: 0 });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black/90"><p className="p-6 text-center text-gray-500">Loading profile...</p></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center bg-black/90"><p className="p-6 text-center text-red-500">Error loading profile: {error.message}</p></div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-black/90"><p className="p-6 text-center text-gray-700">No user logged in.</p></div>;

  const providerId = user.providerData?.[0]?.providerId;
  const isVerified = user.emailVerified;

  return (
    <div className="min-h-screen flex flex-col items-center bg-black/90">
      {/* Hero/banner */}
      <div
        className="relative w-full h-48 md:h-64 flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900/60 via-purple-900/60 to-pink-900/60"
        onMouseMove={handleBannerMouseMove}
        onMouseLeave={handleBannerMouseLeave}
      >
        {banner ? (
          <img
            src={banner}
            alt="Banner"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
            style={{
              transform: `translate3d(${parallax.x * 20}px, ${parallax.y * 12}px, 0) scale(1.05)`,
              transition: "transform 0.2s cubic-bezier(.4,1.6,.6,1)",
            }}
          />
        ) : null}
        <Button
          size="icon"
          variant="glass"
          className="absolute top-4 right-4 z-10"
          onClick={() => setEditOpen(true)}
          aria-label="Edit banner"
        >
          <ImagePlus className="w-5 h-5" />
        </Button>
      </div>
      {/* Avatar overlaps banner */}
      <div className="relative flex flex-col items-center -mt-20 md:-mt-28 z-10">
        <div className="relative">
          <img
            src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || "U")}`}
            alt="Profile"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white/20 shadow-lg bg-black"
          />
          {providerId && (
            <span className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              {providerIcons[providerId]}
            </span>
          )}
        </div>
        {/* Name, badges, edit */}
        <div className="flex items-center gap-2 mt-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center bg-gradient-to-r from-pink-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent drop-shadow">
            {user.displayName || "No Name"}
          </h2>
          <Button size="icon" variant="glass" onClick={() => setEditOpen(true)} aria-label="Edit profile">
            <Edit className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap justify-center mt-2">
          {badges.includes("Verified") && isVerified && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-semibold">
              <BadgeCheck className="w-4 h-4" /> Verified
            </span>
          )}
          {badges.filter(b => b !== "Verified").map(badge => (
            <span key={badge} className="flex items-center gap-1 px-2 py-1 rounded-full bg-pink-500/20 text-pink-200 text-xs font-semibold">
              <Star className="w-4 h-4" /> {badge}
            </span>
          ))}
        </div>
      </div>
      {/* Profile info stack */}
      <div className="w-full max-w-xl mx-auto flex flex-col items-center gap-4 mt-6 px-4">
        {/* Bio */}
        <p className="text-white/80 text-center text-lg mt-2 mb-1">{bio}</p>
        {/* Email + Verified */}
        <div className="flex items-center gap-2 text-white/80 text-center">
          <Mail className="w-5 h-5" />
          <span>{user.email}</span>
          {isVerified && (
            <span className="flex items-center gap-1 text-green-400 ml-2 text-xs font-semibold">
              <CheckCircle className="w-4 h-4" /> Verified
            </span>
          )}
        </div>
        {/* Dates */}
        <div className="flex flex-col md:flex-row gap-2 text-xs text-white/60 mt-2 mb-1 text-center">
          <span>Member since: <b>{formatDate(user.createdAt)}</b></span>
          <span>Last login: <b>{formatDateTime(user.lastLoginAt)}</b></span>
        </div>
        {/* Theme Switcher */}
        <Button size="icon" variant="glass" className="absolute top-4 left-4" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Switch theme">
          <SunMoon className="w-5 h-5" />
        </Button>
        {/* Sign Out */}
        <Button variant="premium" className="mt-6 w-full flex items-center gap-2 justify-center" onClick={handleSignOut}>
          <LogOut className="w-5 h-5" /> Sign Out
        </Button>
      </div>
      {/* Edit Profile Modal */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/80">Name</span>
              <input
                className="rounded-lg px-3 py-2 bg-black/40 border border-white/10 text-white"
                value={user.displayName || ""}
                disabled
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/80">Bio</span>
              <input
                className="rounded-lg px-3 py-2 bg-black/40 border border-white/10 text-white"
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={100}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-white/80">Banner Image</span>
              <input
                type="file"
                accept="image/*"
                className="rounded-lg px-3 py-2 bg-black/40 border border-white/10 text-white"
                onChange={handleBannerChange}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="premium" onClick={() => setEditOpen(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
