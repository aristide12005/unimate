import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Search, MapPin, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType } from "embla-carousel";
import BottomNav from "@/components/BottomNav";
import InstallPWA from "@/components/InstallPWA";
import { useListings } from "@/hooks/useListings";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useUnread } from "@/contexts/UnreadContext";
import logo from "@/assets/logo.png";
import bgVideo from "@/assets/background.webm";

const CATEGORIES = ["All", "Single Room", "Shared Room", "Studio", "Apartment", "En-suite"];

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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = listings.filter((l) => {
    const matchesSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.location?.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || l.type === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pt-2 pb-12 w-full">
      {/* ── Hero ── */}
      <div className="relative rounded-3xl overflow-hidden mb-10 px-10 py-12 min-h-[400px] flex flex-col justify-center">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bgVideo} type="video/webm" />
        </video>

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
  const isMobile = useIsMobile();
  const { unreadCount } = useUnread();
  const [profile, setProfile] = useState<any>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center", skipSnaps: false });
  const [tweenValues, setTweenValues] = useState<{ scale: number; rotate: number; zIndex: number; opacity: number; xTranslate: string }[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onScroll = useCallback((emblaApi: EmblaCarouselType) => {
    if (!emblaApi) return;
    const scrollProgress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    if (!snaps || snaps.length === 0) return;
    const styles = snaps.map((snap) => {
      let diffToTarget = snap - scrollProgress;
      if (Math.abs(diffToTarget) > 1) diffToTarget = diffToTarget - Math.sign(diffToTarget) * snaps.length;
      const isNext = diffToTarget > 0;
      const zIndex = Math.round(10 - Math.abs(diffToTarget) * 10);
      const scale = 1 - Math.abs(diffToTarget) * 0.05;
      const opacity = 1 - Math.abs(diffToTarget) * 0.1;
      const xTranslate = isNext ? `${diffToTarget * -100}%` : '0%';
      return { scale, rotate: 0, zIndex, opacity, xTranslate };
    });
    setTweenValues(styles as any);
  }, []);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll(emblaApi);
    onSelect(emblaApi);
    emblaApi.on("scroll", () => onScroll(emblaApi));
    emblaApi.on("reInit", () => onScroll(emblaApi));
    emblaApi.on("select", () => onSelect(emblaApi));
  }, [emblaApi, onScroll, onSelect]);

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
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-primary/10 w-full overflow-x-hidden">

      {/* ─── Video Hero Section ─── */}
      <div className="relative w-full overflow-hidden h-[320px] sm:h-[400px]">
        {/* Background video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={bgVideo} type="video/webm" />
        </video>

        {/* Dark gradient overlay — stronger at bottom for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-black/70" />

        {/* ─── Header (floated on top of video) ─── */}
        <div className="relative z-10 px-5 pt-14 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/profile")}>
            <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden border-2 border-white/40">
              <img
                src={profile?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-[10px] text-white/70 uppercase tracking-wider font-bold">Welcome {user ? 'back' : 'to uniMate'}</p>
              <h2 className="text-base font-bold text-white leading-none truncate max-w-[200px]">
                Hi {profile?.first_name || "Guest"} 👋
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <InstallPWA />
            <button
              onClick={() => navigate("/notifications")}
              className="relative w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />
              )}
            </button>
            <button
              onClick={() => navigate("/listings", { state: { autoFocus: true } })}
              className="w-9 h-9 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/25 transition-colors"
            >
              <Search size={18} />
            </button>
          </div>
        </div>

        {/* ─── Hero Text + Search CTA ─── */}
        <div className="relative z-10 px-6 mt-6 text-white">
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            Find your perfect room<br />
            <span className="text-primary">in Dakar</span>
          </h1>
          <p className="text-white/75 text-sm mt-1.5 font-medium">
            Verified rooms near your university
          </p>

          {/* Search pill — taps into listings */}
          <button
            onClick={() => navigate("/listings", { state: { autoFocus: true } })}
            className="mt-5 w-full flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3.5 shadow-2xl active:scale-[0.98] transition-transform"
          >
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Search size={16} className="text-primary" />
            </div>
            <span className="text-gray-400 text-sm font-semibold">Search rooms, areas, prices…</span>
            <div className="ml-auto w-7 h-7 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <SlidersHorizontal size={13} className="text-white" />
            </div>
          </button>
        </div>
      </div>

      {/* ─── Carousel ─── */}
      <div className="embla" ref={emblaRef}>
        <div className="flex px-4 items-center touch-pan-y h-[280px]">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="flex-[0_0_100%] min-w-0 px-4 relative"
              style={{
                transform: `translateX(${tweenValues[index]?.xTranslate ?? '0%'}) scale(${tweenValues[index]?.scale ?? 0.9})`,
                opacity: tweenValues[index]?.opacity ?? 1,
                zIndex: tweenValues[index]?.zIndex ?? 1,
              }}
              onClick={() => navigate(`/listings/${listing.id}`)}
            >
              <div className="relative rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl h-full cursor-pointer">
                <img src={listing.image} alt={listing.title} className="w-full h-full object-cover object-top" loading="eager" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-left">
                  <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2">{listing.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="text-[10px] uppercase font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">{listing.type}</span>
                    <span className="text-[10px] uppercase font-bold bg-primary/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">{listing.price}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                      <MapPin size={12} className="text-white" />
                    </div>
                    {listing.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Pagination Dots ─── */}
      <div className="flex justify-center gap-2 mt-6">
        {listings.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`transition-all duration-300 rounded-full ${selectedIndex === index ? "w-8 h-2 bg-primary" : "w-2 h-2 bg-gray-300 hover:bg-gray-400"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ─── See All Listings CTA ─── */}
      <div className="mt-8 px-6 mb-4">
        <button
          onClick={() => navigate("/listings")}
          className="w-full flex items-center justify-between bg-primary/10 border border-primary/20 rounded-2xl px-5 py-4 hover:bg-primary/15 transition-colors active:scale-[0.98]"
        >
          <div className="text-left">
            <p className="text-sm font-bold text-primary">Browse all rooms</p>
            <p className="text-xs text-primary/70 mt-0.5">Find your perfect match nearby</p>
          </div>
          <ArrowRight size={18} className="text-primary shrink-0" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
