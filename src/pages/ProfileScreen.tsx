import { Settings, Edit3, LogOut, Camera, Star, Users, BookOpen, MapPin, Briefcase, GraduationCap, Phone, MessageCircle, Zap, Globe } from "lucide-react";
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
  bio: string | null;
  avatar_url: string | null;
  occupation: string | null;
  school_company: string | null;
  level_role: string | null;
  location_city: string | null;
  location_country: string | null;
  campus: string | null;
  interests: string[] | null;
  phone_number: string | null;
  contact_type: string | null;
  lifestyle: any | null;
  languages: string[] | null;
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
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setProfile(data as unknown as Profile);
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
      <div className="mx-5 mt-5 bg-card rounded-3xl p-6 shadow-sm border border-border/50">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="w-24 h-24 rounded-full border-4 border-background bg-secondary/10 flex items-center justify-center overflow-hidden shadow-sm">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-black text-secondary">{initials}</span>
              )}
            </div>
            <button
              onClick={() => navigate("/edit-profile")}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md hover:scale-105 transition-transform"
            >
              <Edit3 size={14} className="text-primary-foreground" />
            </button>
          </div>

          <h2 className="text-xl font-black text-foreground">{displayName}</h2>
          {profile?.username && (
            <p className="text-sm text-primary font-bold">@{profile.username}</p>
          )}

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mt-2 max-w-[250px] leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Tags: Occupation & Location */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {profile?.occupation && (
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold border border-blue-100 flex items-center gap-1">
                <Briefcase size={10} />
                {profile.occupation === 'student' ? 'Student' : 'Pro'}
              </span>
            )}
            {profile?.location_city && (
              <span className="px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-bold border border-orange-100 flex items-center gap-1">
                <MapPin size={10} />
                {profile.location_city}
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex justify-around mt-6 pt-6 border-t border-border/50">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <stat.icon size={18} className="text-muted-foreground mb-1" />
              <span className="text-lg font-black text-foreground">{stat.value}</span>
              <span className="text-[10px] text-muted-foreground font-semibold">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Info Cards */}
      {(profile?.school_company || profile?.interests?.length) && (
        <div className="mx-5 mt-4 space-y-3">
          {profile.school_company && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <GraduationCap size={20} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-bold uppercase">Education / Work</p>
                <p className="text-sm font-bold text-foreground">{profile.school_company}</p>
                {profile.level_role && (
                  <p className="text-xs text-muted-foreground">{profile.level_role}</p>
                )}
              </div>
            </div>
          )}

          {profile.lifestyle && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 space-y-3">
              <h3 className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-2">
                <Zap size={14} /> Lifestyle
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(profile.lifestyle).map(([key, value]) => value && (
                  <div key={key} className="flex flex-col bg-gray-50 p-2 rounded-lg">
                    <span className="text-[10px] text-gray-400 font-bold uppercase">{key}</span>
                    <span className="font-semibold text-gray-700 capitalize">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.languages && profile.languages.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
              <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                <Globe size={14} /> Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.languages.map(lang => (
                  <span key={lang} className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50">
              <p className="text-xs text-muted-foreground font-bold uppercase mb-3 flex items-center gap-2">
                <Star size={12} /> Interests
              </p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(i => (
                  <span key={i} className="px-3 py-1.5 rounded-full bg-gray-100 text-foreground text-xs font-bold border border-gray-200 capitalize">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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

        <button
          onClick={() => navigate("/edit-profile")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card shadow-sm active:scale-[0.98] transition-transform"
        >
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
