import { Settings, Edit3, LogOut, Camera, Star, Users, BookOpen, MapPin, Briefcase, GraduationCap, Phone, MessageCircle, Zap, Globe, Home, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
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
  host_mode_active?: boolean;
  host_persona?: string | null;
}

const stats = [
  { icon: Users, label: "Connections", value: "47" },
  { icon: Star, label: "Rank", value: "#12" },
  { icon: BookOpen, label: "Groups", value: "5" },
];

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHostMode, setIsHostMode] = useState(false);
  const [showPersonaSelector, setShowPersonaSelector] = useState(false);

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

        const hostActive = (data as any).host_mode_active || false;
        setIsHostMode(hostActive);
        setLoading(false);

        // Auto-activate host mode if routed from Desktop Header "Become a Host"
        if (location.search.includes("activateHost=true") && !hostActive) {
          // We explicitly call this to trigger the same UI flow
          setShowPersonaSelector(true);
          setIsHostMode(true);
          supabase.from("profiles").update({ host_mode_active: true } as any).eq("id", (data as any).id);

          // Clean up the URL
          navigate("/profile", { replace: true });
        }
      });
  }, [user, location.search, navigate]);

  const toggleHostMode = async () => {
    const newMode = !isHostMode;
    setIsHostMode(newMode);

    // If activating and no persona selected, show selector
    if (newMode && !profile?.host_persona) {
      setShowPersonaSelector(true);
    }

    // Save to profile
    if (user) {
      await supabase.from("profiles").update({ host_mode_active: newMode } as any).eq("id", profile?.id || user.id);
    }
  };

  const selectPersona = async (persona: string) => {
    const updatedProfile = { ...profile, host_persona: persona } as Profile;
    setProfile(updatedProfile);
    setShowPersonaSelector(false);

    if (user && profile?.id) {
      await supabase.from("profiles").update({ host_persona: persona } as any).eq("id", profile.id);
    }
  };

  const hostModeColors = isHostMode ? "bg-indigo-50 text-indigo-900 border-indigo-200" : "bg-card text-foreground border-border/50";
  const primaryButtonColors = isHostMode ? "bg-indigo-600 shadow-indigo-600/20" : "bg-primary shadow-primary/20";

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
      <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-6">
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
    <div className="min-h-screen bg-background flex flex-col pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4">
        <h1 className="text-2xl font-black text-foreground">Profile</h1>
        <button
          onClick={() => navigate("/settings")}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
        >
          <Settings size={18} className="text-foreground" />
        </button>
      </div>

      {/* Host Mode Toggle Card */}
      <div className="mx-5 mt-4">
        <div className={`rounded-3xl p-5 shadow-sm border transition-colors duration-300 flex items-center justify-between ${isHostMode ? "bg-gradient-to-r from-indigo-600 to-indigo-800 text-white border-indigo-700" : "bg-white border-gray-200"}`}>
          <div>
            <h2 className={`text-lg font-black ${isHostMode ? "text-white" : "text-gray-900"}`}>Host on uniMate</h2>
            <p className={`text-xs font-semibold mt-1 ${isHostMode ? "text-indigo-100" : "text-gray-500"}`}>
              {isHostMode ? (profile?.host_persona || 'Pro Dashboard') : 'Switch to manage listings'}
            </p>
          </div>
          <button
            onClick={toggleHostMode}
            className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 p-1 ${isHostMode ? "bg-indigo-400" : "bg-gray-200"}`}
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isHostMode ? "translate-x-6" : "translate-x-0"}`} />
          </button>
        </div>
      </div>

      {/* Persona Selector Overlay */}
      {showPersonaSelector && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-5">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-center mb-2">Choose Your Role</h3>
            <p className="text-sm text-gray-500 text-center mb-6">How will you use the Host Dashboard?</p>

            <div className="space-y-3">
              <button onClick={() => selectPersona('Student Seeker')} className="w-full p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Student Seeker</h4>
                  <p className="text-xs text-gray-500">I need a roommate</p>
                </div>
              </button>

              <button onClick={() => selectPersona('Landlord')} className="w-full p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Home size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Landlord</h4>
                  <p className="text-xs text-gray-500">I own property</p>
                </div>
              </button>

              <button onClick={() => selectPersona('Commissioner')} className="w-full p-4 rounded-2xl border-2 border-indigo-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Commissioner</h4>
                  <p className="text-xs text-gray-500">I manage rentals</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className={`mx-5 mt-5 rounded-3xl p-6 shadow-sm border transition-colors ${hostModeColors}`}>
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
              className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-transform ${isHostMode ? "bg-indigo-600 text-white" : "bg-primary text-primary-foreground"}`}
            >
              <Edit3 size={14} />
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
          onClick={() => navigate(`/user/${profile?.id}/places`)}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl shadow-sm active:scale-[0.98] transition-transform mb-2 ${isHostMode ? "bg-indigo-100" : "bg-orange-100"}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHostMode ? "bg-indigo-200" : "bg-orange-200"}`}>
            <MapPin className={isHostMode ? "text-indigo-600" : "text-orange-600"} size={18} />
          </div>
          <span className={`text-sm font-bold flex-1 text-left ${isHostMode ? "text-indigo-900" : "text-orange-900"}`}>My Places / Listings</span>
          <ArrowRightIcon className={isHostMode ? "text-indigo-600/70" : "text-orange-600/70"} size={18} />
        </button>

        <button
          onClick={() => isHostMode ? navigate("/post-room") : toggleHostMode()}
          className={`w-full flex items-center gap-3 p-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform mb-4 text-white ${primaryButtonColors}`}
        >
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <StartIcon className="text-white" size={18} />
          </div>
          <span className="text-sm font-bold text-white flex-1 text-left">{isHostMode ? "Post a Room" : "Become a Host"}</span>
          <ArrowRightIcon className="text-white/70" size={18} />
        </button>

        <button
          onClick={() => navigate("/contracts")}
          className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-colors mb-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
            <FileText className="text-blue-600 group-hover:text-primary transition-colors" size={20} />
          </div>
          <span className="text-sm font-bold text-gray-800 flex-1 text-left">My Contracts</span>
          <ArrowRightIcon className="text-gray-400 group-hover:translate-x-1 transition-transform" size={18} />
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
