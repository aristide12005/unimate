import { Settings, Edit3, LogOut, Camera, Star, Users, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("profiles")
      .select("first_name, last_name, username, avatar_url, birthday")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data);
        setLoading(false);
      });
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

  // ─── SKELETON LOADER ───
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col pb-24">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between px-5 pt-4">
          <Skeleton className="w-24 h-8" />
          <Skeleton className="w-9 h-9 rounded-full" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="mx-5 mt-5 bg-card rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-40 h-3" />
            </div>
          </div>
          {/* Stats Skeleton */}
          <div className="flex justify-around mt-5 pt-4 border-t border-border">
            <div className="flex flex-col items-center gap-1"><Skeleton className="w-5 h-5" /><Skeleton className="w-8 h-6" /><Skeleton className="w-12 h-3" /></div>
            <div className="flex flex-col items-center gap-1"><Skeleton className="w-5 h-5" /><Skeleton className="w-8 h-6" /><Skeleton className="w-12 h-3" /></div>
            <div className="flex flex-col items-center gap-1"><Skeleton className="w-5 h-5" /><Skeleton className="w-8 h-6" /><Skeleton className="w-12 h-3" /></div>
          </div>
        </div>

        {/* Menu Skeleton */}
        <div className="mx-5 mt-5 space-y-4">
          <Skeleton className="w-full h-16 rounded-2xl" />
          <Skeleton className="w-full h-14 rounded-2xl" />
          <Skeleton className="w-full h-14 rounded-2xl" />
        </div>

        <BottomNav />
      </div>
    );
  }

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
        <button
          onClick={() => navigate("/post-room")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-primary shadow-lg shadow-primary/20 active:scale-[0.98] transition-transform mb-4"
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <StartIcon className="text-white" size={18} />
          </div>
          <span className="text-sm font-bold text-white flex-1 text-left">Post a Room</span>
          <ArrowRightIcon className="text-white/70" size={18} />
        </button>

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

const StartIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
);

const ArrowRightIcon = ({ className, size }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
);

export default ProfileScreen;
