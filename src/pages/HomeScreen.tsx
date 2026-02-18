import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Search, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import { EmblaCarouselType } from "embla-carousel";
import BottomNav from "@/components/BottomNav";
import InstallPWA from "@/components/InstallPWA";
import { SmartSearchInput } from "@/components/SmartSearchInput";

import { useListings } from "@/hooks/useListings";

const MOCK_NEARBY = [
  { id: 4, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400" }, // Stylish chair/corner
  { id: 5, image: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=400" }, // Kitchen
  { id: 6, image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=400" }  // Bright living room
];

const HomeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);

  // Embla with scale effect
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
      // Simple loop adjustment
      if (Math.abs(diffToTarget) > 1) {
        diffToTarget = diffToTarget - Math.sign(diffToTarget) * snaps.length;
      }

      const isNext = diffToTarget > 0;

      const zIndex = Math.round(10 - Math.abs(diffToTarget) * 10);
      const scale = 1 - Math.abs(diffToTarget) * 0.05; // Less aggressive scale
      const opacity = 1 - Math.abs(diffToTarget) * 0.1;

      // STACK MAGIC:
      // If it's a "Future" card (diff > 0), pull it back to the center so it doesn't float right.
      // If it's a "Past" card (diff < 0), let it slide off normally (translateX 0 relative to flow).
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24 font-sans">
        {/* Header Skeleton */}
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

        {/* Hero Text Skeleton */}
        <div className="px-6 pt-32 mb-5 text-center flex flex-col items-center">
          <Skeleton className="w-3/4 h-8 mb-2" />
          <Skeleton className="w-1/2 h-4" />
        </div>

        {/* Carousel Skeleton */}
        <div className="flex px-4 items-center justify-center h-[280px]">
          <Skeleton className="w-full max-w-[320px] h-[260px] rounded-[2.5rem]" />
        </div>

        {/* Dots Skeleton */}
        <div className="flex justify-center gap-2 mt-6">
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
          <Skeleton className="w-2 h-2 rounded-full" />
        </div>

        {/* Moms Near You Skeleton */}
        <div className="mt-8 px-6">
          <div className="flex justify-between mb-4">
            <Skeleton className="w-32 h-6" />
            <Skeleton className="w-9 h-9 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
            <Skeleton className="aspect-square rounded-2xl" />
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-sans selection:bg-primary/10">
      {/* ─── Header ─── */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-6 pt-14 pb-2 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3" onClick={() => navigate("/profile")}>
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border border-gray-100 cursor-pointer">
            <img
              src={profile?.avatar_url || "https://images.unsplash.com/photo-1544005313-94ddf0286df2"}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Welcome</p>
            <h2 className="text-lg font-bold text-foreground leading-none">
              Hi {profile?.first_name || "uniMate"}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <InstallPWA />
          <button
            onClick={() => navigate("/notifications")}
            className="text-foreground hover:text-primary transition-colors relative"
          >
            <Bell size={22} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <button
            onClick={() => navigate("/listings", { state: { autoFocus: true } })}
            className="text-foreground hover:text-primary transition-colors"
          >
            <Search size={22} />
          </button>
        </div>
      </div>

      {/* ─── Hero Section ─── */}
      <div className="px-6 pt-32 mb-5 text-center">
        <h1 className="text-2xl font-black text-foreground tracking-tight mb-2">
          Perfect rooms for you
        </h1>
        <p className="text-muted-foreground text-sm">
          Here are some users willing to share their room with you
        </p>
      </div>

      {/* ─── Carousel (Tinder-style) ─── */}
      <div className="embla" ref={emblaRef}>
        <div className="flex px-4 items-center touch-pan-y h-[280px]">
          {listings.map((listing, index) => (
            <div
              key={listing.id}
              className="flex-[0_0_100%] min-w-0 px-4 relative"
              style={{
                transform: `
                  translateX(${tweenValues[index]?.xTranslate ?? '0%'})
                  scale(${tweenValues[index]?.scale ?? 0.9}) 
                `,
                opacity: tweenValues[index]?.opacity ?? 1,
                zIndex: tweenValues[index]?.zIndex ?? 1,
              }}
              onClick={() => navigate(`/listings/${listing.id}`)}
            >
              <div
                className={`relative rounded-[2.5rem] overflow-hidden bg-gray-100 dark:bg-gray-800 shadow-2xl h-full cursor-pointer`}
              >
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-full object-cover object-top"
                  loading="eager"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white text-left">
                  {/* H3: Category Type (Was Name) */}
                  <h3 className="text-2xl font-bold mb-2 leading-tight line-clamp-2">{listing.title}</h3>

                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {/* Badge 1: Type */}
                    <span className="text-[10px] uppercase font-bold bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                      {listing.type}
                    </span>
                    {/* Badge 2: Price */}
                    <span className="text-[10px] uppercase font-bold bg-primary/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                      {listing.price}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-white/90 text-sm font-bold">
                    {/* MapPin: Location */}
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
            className={`transition-all duration-300 rounded-full ${selectedIndex === index
              ? "w-8 h-2 bg-primary"
              : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* ─── Moms Near You ─── */}
      <div className="mt-8 px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Roomies near you</h2>
          <button
            onClick={() => navigate("/listings")}
            className="w-9 h-9 rounded-full border border-gray-100 flex items-center justify-center text-foreground hover:bg-gray-50 transition-colors"
          >
            <span className="sr-only">See all</span>
            <svg width="6" height="10" viewBox="0 0 6 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 9L5 5L1 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {MOCK_NEARBY.map((mom) => (
            <div key={mom.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm">
              <img src={mom.image} alt="Mom" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div >
  );
};

export default HomeScreen;
