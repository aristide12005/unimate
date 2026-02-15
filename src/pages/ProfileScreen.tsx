import { Settings, Edit3, LogOut, Camera, Star, Users, BookOpen } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  avatar_url: string | null;
  birthday: string | null;
}

const stats = [
  { icon: Users, label: "Connections", value: "47" },
  { icon: Star, label: "Rank", value: "#12" },
  { icon: BookOpen, label: "Groups", value: "5" },
];

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("first_name, last_name, username, avatar_url, birthday")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => setProfile(data));
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const displayName = profile?.first_name
    ? `${profile.first_name} ${profile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "User";

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] || ""}`.toUpperCase()
    : displayName[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex flex-col pb-24">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Profile</h1>
        <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
          <Settings size={18} className="text-foreground" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="mx-5 mt-5 bg-card rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-3 border-primary bg-secondary/20 flex items-center justify-center overflow-hidden glow-ring">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-black text-secondary">{initials}</span>
              )}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-md">
              <Camera size={14} className="text-primary-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-black text-foreground">{displayName}</h2>
            {profile?.username && (
              <p className="text-sm text-secondary font-bold">@{profile.username}</p>
            )}
            <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-5 pt-4 border-t border-border">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon size={18} className="text-primary mb-1" />
              <span className="text-lg font-black text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="mx-5 mt-5 space-y-2">
        <button className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card shadow-sm active:scale-[0.98] transition-transform">
          <Edit3 size={18} className="text-secondary" />
          <span className="text-sm font-bold text-foreground">Edit Profile</span>
        </button>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card shadow-sm active:scale-[0.98] transition-transform"
        >
          <LogOut size={18} className="text-destructive" />
          <span className="text-sm font-bold text-destructive">Sign Out</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
