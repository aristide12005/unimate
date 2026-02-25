import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Search, MapPin, ArrowRight, SlidersHorizontal, MessageCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, useLocation } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import InstallPWA from "@/components/InstallPWA";
import { useListings } from "@/hooks/useListings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUnread } from "@/contexts/UnreadContext";
import logo from "@/assets/logo.png";
import bgVideo1 from "@/assets/background.webm";
import bgVideo2 from "@/assets/background2.webm";
import bgVideo3 from "@/assets/background3.webm";

const MEDIA_SLIDES = [bgVideo1, bgVideo2, bgVideo3];

// ─────────────────────────────────────────────────────────────────────────────
// Desktop listing card
// ─────────────────────────────────────────────────────────────────────────────
const ListingCard = ({ listing, onClick }: { listing: any; onClick: () => void }) => (
  <div
    onClick={onClick}
    className="group cursor-pointer rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
  >
    <div className="relative h-52 overflow-hidden bg-gray-100">
      <img
        src={listing.image}
        alt={listing.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      <span className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm">
        {listing.type}
      </span>
    </div>
    <div className="p-4">
      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{listing.title}</h3>
      <div className="flex items-center gap-1 text-gray-400 text-xs mb-3">
        <MapPin size={11} />
        <span className="line-clamp-1">{listing.location}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-primary font-bold text-sm">{listing.price}</span>
        <span className="text-[11px] text-gray-400">/month</span>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Desktop Home View
// ─────────────────────────────────────────────────────────────────────────────
const DesktopHome = ({ listings, loading, profile, navigate }: {
  listings: any[];
  loading: boolean;
  profile: any;
  navigate: (path: string, opts?: any) => void;
}) => {
}) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % MEDIA_SLIDES.length);
    }, 8000); // Change slide every 8 seconds
    return () => clearInterval(timer);
  }, []);

  const filtered = listings.filter((l) => {
    const matchesSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || l.type === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pt-2 pb-12 w-full">
      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden mb-10 px-10 py-12 min-h-[400px] flex flex-col justify-center">
        {/* Background video slideshow */}
        {MEDIA_SLIDES.map((src, idx) => (
          <video
            key={src}
            autoPlay
            muted
            loop
            playsInline
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? "opacity-100" : "opacity-0"}`}
          >
            <source src={src} type="video/webm" />
          </video>
        ))}

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80" />

        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <img src={logo} alt="uniMate" className="w-7 h-7 rounded-lg object-contain" />
            <p className="text-white/90 font-semibold text-sm uppercase tracking-widest">Student Housing</p>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-3">
            Find your perfect<br />
            <span className="text-primary">room today</span>
          </h1>
          <p className="text-white/80 text-base mb-8">
            Browse verified listings from trusted hosts in your university area.
          </p>
          {/* Search bar */}
          <div className="flex items-center bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden pr-2 gap-0">
            <div className="flex items-center gap-3 flex-1 px-5 py-4">
              <Search size={18} className="text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by location or title…"
                className="flex-1 outline-none text-sm text-gray-800 placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <button
              onClick={() => navigate("/listings", { state: { autoFocus: true } })}
              className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all active:scale-95 shrink-0"
            >
              Search
            </button>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute right-0 top-0 bottom-0 w-72 hidden xl:flex items-center justify-center pointer-events-none">
          <div className="w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
        </div>
      </div>

      {/* ── Category filters ── */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${activeCategory === cat
              ? "bg-primary text-white border-primary shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
              }`}
          >
            {cat}
          </button>
        ))}
        <button
          onClick={() => navigate("/listings")}
          className="ml-auto flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition-colors"
        >
          <SlidersHorizontal size={14} />
          All filters
        </button>
      </div>

      {/* ── Listings grid ── */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {activeCategory === "All" ? "Featured Rooms" : activeCategory}
          {!loading && <span className="text-sm font-normal text-gray-400 ml-2">({filtered.length})</span>}
        </h2>
        <button
          onClick={() => navigate("/listings")}
          className="flex items-center gap-1 text-sm text-primary font-medium hover:underline"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-gray-100">
              <Skeleton className="h-52 w-full" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-1/4 mt-2" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Search size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-medium">No rooms match your search</p>
          <button onClick={() => { setSearch(""); setActiveCategory("All"); }} className="mt-3 text-primary text-sm hover:underline">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.slice(0, 12).map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClick={() => navigate(`/listings/${listing.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProtectedAction = (path: string) => {
    if (!user) {
      navigate('/login', { state: { returnTo: location.pathname } });
    } else {
      navigate(path);
    }
  };
  const isMobile = useIsMobile();
  const { unreadCount } = useUnread();
  const [profile, setProfile] = useState<any>(null);
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex(prev => (prev + 1) % MEDIA_SLIDES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user.id).single();
      setProfile(data);
    };
    getProfile();
  }, [user]);

  const { listings, loading } = useListings();

  // ── Desktop view ──────────────────────────────────────────────────────────
  if (!isMobile) {
    return <DesktopHome listings={listings} loading={loading} profile={profile} navigate={navigate} />;
  }

  // ── Mobile view (unchanged) ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 font-sans">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-6 pt-14 pb-2 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full" />
            <div>
              <Skeleton className="w-12 h-3 mb-1" />
              <Skeleton className="w-24 h-5" />
            </div>
          </div>
          <div className="flex gap-4">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
        </div>
        <div className="px-6 pt-32 mb-5 text-center flex flex-col items-center">
          <Skeleton className="w-3/4 h-8 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>
        <div className="flex px-4 items-center justify-center h-[280px]">
          <Skeleton className="w-full max-w-[320px] h-[260px] rounded-[2.5rem]" />
        </div>
        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map(i => <Skeleton key={i} className="w-2 h-2 rounded-full" />)}
        </div>
        <div className="mt-8 px-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-black w-full overflow-hidden h-[100dvh]">

      {/* Global overlay for mobile (top gradient for icons) */}
      <div className="fixed top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent z-40 pointer-events-none" />

      {/* Global Background Video */}
      <div className="fixed inset-0 z-0 bg-black pointer-events-none">
        {MEDIA_SLIDES.map((src, idx) => (
          <video
            key={src}
            src={src}
            autoPlay
            loop
            muted
            playsInline
            controls={false}
            className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-1000 ease-in-out ${idx === bgIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>

      {/* ─── Global Overlays (Floating on top) ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 px-5 pt-14 pb-2 flex items-center justify-between pointer-events-none">
        {/* Left: Profile Badge */}
        <div
          onClick={() => handleProtectedAction("/profile")}
          className="flex items-center gap-2 bg-black/20 backdrop-blur-md pl-1.5 pr-4 py-1.5 rounded-full border border-white/10 shadow-lg pointer-events-auto active:scale-95 transition-transform"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/40 shadow-sm shrink-0">
            <img
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-[9px] text-white/80 uppercase tracking-widest font-bold">Welcome {user ? 'back' : 'Guest'}</p>
            <h2 className="text-sm font-bold text-white leading-none truncate max-w-[150px]">
              {profile?.first_name || "Guest"}
            </h2>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <InstallPWA />
          <button
            onClick={() => handleProtectedAction("/notifications")}
            className="relative w-10 h-10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white rounded-full transition-colors drop-shadow-lg border border-white/10"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-black/20" />
            )}
          </button>
          <button
            onClick={() => navigate("/listings", { state: { autoFocus: true } })}
            className="w-10 h-10 bg-black/20 backdrop-blur-md flex items-center justify-center text-white rounded-full transition-colors drop-shadow-lg border border-white/10"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Snap Container (Scrollable) */}
      <div
        className="relative h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-transparent z-10 pb-16"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {listings.slice(0, 15).map((listing, index) => (
          <div key={listing.id} className="h-full w-full snap-start relative bg-transparent group">

            {/* Background Media */}
            <div className="absolute inset-0 w-full h-full bg-black/40">
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover opacity-90 mix-blend-overlay"
              />
              {/* Bottom gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* ─── Bottom Info Overlay ─── */}
            <div className="absolute bottom-4 left-0 right-0 px-5 flex flex-col justify-end text-white safe-bottom pointer-events-auto">

              <div className="flex justify-between items-end gap-4">
                {/* Left: Details */}
                <div className="flex-1">

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-[10px] uppercase font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                      {listing.type}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] uppercase font-bold bg-primary px-3 py-1 rounded-full border border-primary-dark">
                        Trending
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-1.5 leading-tight line-clamp-2 drop-shadow-md">
                    {listing.title}
                  </h3>

                  {/* Location & Host */}
                  <div className="flex items-center gap-3 text-white/90 text-xs font-semibold drop-shadow-md mb-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-primary-light" />
                      <span className="truncate max-w-[120px]">{listing.location}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-gray-300 overflow-hidden shrink-0 border border-white/50">
                        {listing.author?.avatar_url ? (
                          <img src={listing.author.avatar_url} alt={listing.author.first_name || ""} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-400 text-[8px] text-white">
                            {listing.author?.first_name?.charAt(0) || "U"}
                          </div>
                        )}
                      </div>
                      <span className="truncate max-w-[100px]">By {listing.author?.first_name || "Host"}</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <span className="text-3xl font-black">{listing.price}</span>
                    <span className="text-sm font-medium text-white/70 ml-1">/month</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col items-center gap-4 pb-2 shrink-0">
                  <button
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-95 transition-transform"
                  >
                    <ArrowRight size={22} strokeWidth={2.5} />
                  </button>
                  <button
                    onClick={() => handleProtectedAction(`/chat/${listing.author?.id}`)}
                    className="flex flex-col items-center"
                  >
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg shadow-primary/30 active:scale-95 transition-transform">
                      <MessageCircle size={22} strokeWidth={2.5} />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* End of feed CTA */}
        <div className="h-[250px] w-full snap-start flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Search size={28} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Want to see more?</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-[250px]">
            Use our directory to search by exact location, price, and amenities.
          </p>
          <button
            onClick={() => navigate("/listings")}
            className="w-full max-w-[200px] py-3.5 bg-primary text-white font-bold rounded-xl shadow-lg active:scale-95 transition-transform"
          >
            Go to Search
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
