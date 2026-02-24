import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Bookmark, Share, Send, MapPin, MessageCircle, MoreVertical, Edit, Trash, Images } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { toast } from "sonner";
import { ShareDialog } from "@/components/ShareDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompatibility } from "@/hooks/useCompatibility";
import { ListingGallery, GalleryImage } from "@/components/ListingGallery";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ListingDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { listings, savedListingIds, toggleSave } = useListings();
    const { user, profile } = useAuth() as any;
    const [requesting, setRequesting] = useState(false);

    const [singleListing, setSingleListing] = useState<any>(null);
    const [loadingSingle, setLoadingSingle] = useState(true);

    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [activeRoomFilter, setActiveRoomFilter] = useState("All");

    const compatibility = useCompatibility(singleListing);

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return;

            const cached = listings.find(l => l.id === Number(id));
            if (cached) {
                setSingleListing(cached);
                setLoadingSingle(false);
                return;
            }

            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    author:author_id (
                        id, first_name, last_name, username, avatar_url, background_image, age, gender, bio, occupation, school_company
                    )
                `)
                .eq('id', Number(id))
                .single();

            if (data) {
                setSingleListing({
                    ...data,
                    author: {
                        id: data.author.id,
                        name: `${data.author.first_name || ''} ${data.author.last_name || ''}`.trim() || data.author.username,
                        avatar: data.author.avatar_url,
                        backgroundImage: data.author.background_image,
                        age: data.author.age,
                        gender: data.author.gender,
                        bio: data.author.bio,
                        occupation: data.author.occupation,
                        school: data.author.school_company
                    },
                    postedAt: new Date(data.created_at).toLocaleDateString()
                });
            }
            setLoadingSingle(false);
        };

        fetchListing();
    }, [id, listings]);

    const handleDelete = async () => {
        if (!singleListing) return;
        try {
            const { error } = await supabase.from('listings').delete().eq('id', singleListing.id);
            if (error) throw error;
            toast.success("Listing deleted successfully");
            navigate(-1);
        } catch (error: any) {
            toast.error("Failed to delete listing");
        }
    };

    const handleEdit = () => {
        navigate(`/host/wizard?edit=${singleListing?.id}`);
    };

    const handleRequestArrangement = async () => {
        if (!user || !profile) {
            toast.error("Please log in to request an arrangement");
            navigate('/login');
            return;
        }

        if (!singleListing) return;

        setRequesting(true);
        try {
            const { error } = await supabase
                .from('contracts' as any)
                .insert({
                    host_id: singleListing.author.id,
                    student_id: profile.id,
                    listing_id: singleListing.id,
                    terms: singleListing.housing_rules || {},
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Arrangement Requested!");
            navigate(`/chat/${singleListing.author.id}`);

        } catch (error: any) {
            toast.error("Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    if (loadingSingle) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!singleListing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 font-medium">Listing not found</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold">
                    Go Back
                </button>
            </div>
        );
    }

    const listing = singleListing;
    const isSaved = savedListingIds.has(listing.id);
    const shareUrl = window.location.href;
    const shareTitle = `Check out this place: ${listing.title}`;
    const shareDesc = `${listing.title} in ${listing.location} - ${listing.price}/month`;

    // --- Dynamic Multi-Image Gallery Logic ---
    // Make sure we always have the primary cover image as part of the gallery if it's not already in it.
    const listingImages = listing.images as GalleryImage[] || [];
    const galleryImages: GalleryImage[] = listingImages.length > 0
        ? listingImages
        : [{ url: listing.image, category: "Exterior / Overview" }];

    // If there ARE room images but the primary image isn't included, unshift it? (Optional, let's keep it simple: just use listingImages if they exist, else fallback to cover)
    // Actually, user might not add `listing.image` to `listing.images`. Let's ensure Cover Photo is always the first image under "Cover".
    const completeGallery = listingImages.some(img => img.url === listing.image)
        ? listingImages
        : [{ url: listing.image, category: "Overview" }, ...listingImages];

    const categories = ["All", ...Array.from(new Set(completeGallery.map(img => img.category)))];

    // Determine the main display image based on selected room filter
    const activeImage = activeRoomFilter === "All"
        ? completeGallery[0].url
        : completeGallery.find(img => img.category === activeRoomFilter)?.url || completeGallery[0].url;

    // Filter images inside the component to show a miniature preview gallery below main image
    const previewImages = activeRoomFilter === "All"
        ? completeGallery
        : completeGallery.filter(img => img.category === activeRoomFilter);

    return (
        <div className="min-h-screen bg-white md:bg-gray-50/50 pb-24 md:pb-8 font-sans relative flex flex-col">

            {/* ─── Global Navbar (Desktop & Mobile) ─── */}
            <div className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-12 md:pt-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center">
                            <ArrowLeft size={24} className="text-gray-900" />
                        </button>
                    </div>

                    <h1 className="text-lg font-bold text-gray-900 md:hidden">Details</h1>
                    <div className="hidden md:flex flex-1 justify-center space-x-6 px-4">
                        {/* Desktop breadcrumb or similar could go here */}
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={() => toggleSave(listing.id)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Bookmark size={24} className={`transition-colors ${isSaved ? "text-orange-500 fill-orange-500" : "text-gray-700"}`} />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 hover:bg-gray-100 rounded-full outline-none">
                                    <MoreVertical size={24} className="text-gray-700" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 bg-white shadow-xl border-gray-100">
                                <ShareDialog title={shareTitle} description={shareDesc} url={shareUrl}>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 p-3 font-medium cursor-pointer rounded-lg hover:bg-gray-50 text-gray-700">
                                        <Share size={16} /> Share Listing
                                    </DropdownMenuItem>
                                </ShareDialog>
                                {listing && profile && listing.author.id === profile.id && (
                                    <>
                                        <DropdownMenuItem onClick={handleEdit} className="flex items-center gap-2 p-3 font-medium cursor-pointer rounded-lg hover:bg-gray-50 text-gray-700">
                                            <Edit size={16} /> Edit Listing
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="flex items-center gap-2 p-3 font-medium cursor-pointer rounded-lg hover:bg-red-50 text-red-600 focus:text-red-600 focus:bg-red-50">
                                            <Trash size={16} /> Delete Listing
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* ─── Main Layout (Grid on MD+) ─── */}
            <div className="flex-1 w-full max-w-7xl mx-auto md:px-8 py-0 md:py-8 flex flex-col md:flex-row gap-8">

                {/* ─── Left Column: Gallery & Core Details ─── */}
                <div className="w-full md:w-[65%] flex flex-col gap-6 md:gap-8 min-w-0">

                    {/* Desktop-only Title Header - Moved Above Hero Image for better visual hierarchy */}
                    <div className="hidden md:flex flex-col mb-2 px-5 md:px-0">
                        <div className="flex items-end justify-between w-full">
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none mb-4">
                                    {listing.title}
                                </h1>
                                <div className="flex items-center gap-2 text-gray-500 font-medium">
                                    <MapPin size={18} className="text-primary" />
                                    <span className="text-lg">{listing.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Hero Image Container */}
                    <div className="relative w-full h-[40vh] md:h-[500px] bg-gray-100 md:rounded-[2rem] overflow-hidden group shadow-sm border border-gray-100/50">
                        <img
                            src={activeImage}
                            alt={listing.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 cursor-pointer"
                            onClick={() => setIsGalleryOpen(true)}
                        />
                        {/* Elegant gradient overlay for premium feel */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10 pointer-events-none" />

                        {/* Overlay Open Gallery Button */}
                        <button
                            onClick={() => setIsGalleryOpen(true)}
                            className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-black/80 transition-colors shadow-lg"
                        >
                            <Images size={16} />
                            <span>Show all {completeGallery.length} photos</span>
                        </button>
                    </div>

                    {/* Room Category Filters (Horizontal Scroll) */}
                    <div className="sticky top-[72px] md:top-0 z-30 bg-white/95 md:bg-gray-50/95 backdrop-blur-md pt-2 pb-3 -mx-5 px-5 md:mx-0 md:px-0 flex gap-2 overflow-x-auto scrollbar-hide border-b border-gray-100 md:border-none shadow-sm md:shadow-none">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveRoomFilter(cat)}
                                className={`flex-shrink-0 px-5 py-2.5 rounded-[1rem] text-sm font-bold transition-all border ${activeRoomFilter === cat
                                    ? "bg-gray-900 border-gray-900 text-white shadow-md shadow-gray-900/20"
                                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-800"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {/* Premium Photo Grid Explorer */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4 px-5 md:px-0">
                            <h3 className="text-xl font-black text-gray-900 leading-tight">
                                {activeRoomFilter === "All" ? "Tour the property" : `Inside the ${activeRoomFilter}`}
                            </h3>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-3 py-1 rounded-lg">
                                {previewImages.length} Photos
                            </span>
                        </div>

                        {/* Dynamic Masonry-ish Grid display for the selected room(s) */}
                        <div className="px-5 md:px-0 grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {previewImages.map((img, i) => (
                                <div
                                    key={i}
                                    className={`relative overflow-hidden cursor-pointer shadow-sm border border-gray-100 bg-gray-100 group transition-all duration-500 hover:shadow-xl hover:border-gray-300 rounded-[1.5rem] 
                                        ${i === 0 && previewImages.length % 2 !== 0 ? 'col-span-2 lg:col-span-2 aspect-[2/1]' : 'col-span-1 aspect-square'}
                                    `}
                                    onClick={() => {
                                        setActiveRoomFilter(img.category);
                                        setIsGalleryOpen(true);
                                    }}
                                >
                                    <img src={img.url} alt={img.category} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        <p className="text-white font-bold text-sm">{img.category}</p>
                                    </div>
                                    {/* Glassmorphism View icon on hover */}
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                        <Images size={18} className="text-white" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Mobile-only Title Header (Moved below gallery for better flow) */}
                    <div className="md:hidden px-5 pt-6 pb-2 border-t border-gray-100 mt-4">
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs tracking-wide mb-3">
                            {listing.type}
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight mb-3">
                            {listing.title}
                        </h1>
                        <div className="flex items-center gap-2 text-gray-600 font-medium bg-gray-50 p-3 rounded-2xl border border-gray-100">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin size={16} className="text-primary" />
                            </div>
                            <span className="text-sm">{listing.location}</span>
                        </div>
                    </div>

                    <div className="px-5 md:px-0 space-y-6 md:space-y-8 mt-4 md:mt-8">
                        {/* Compatibility Score */}
                        {compatibility && !compatibility.loading && (
                            <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-[1.5rem] border border-indigo-100/50 flex items-center justify-between shadow-sm">
                                <div>
                                    <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                        ✨ Compatibility Match
                                    </h3>
                                    <p className="text-sm text-indigo-600/80 mt-1 font-medium">
                                        {compatibility.score >= 80 ? "Great Match!" : compatibility.score >= 50 ? "Good Potential" : "Low Compatibility"}
                                    </p>
                                    <div className="flex gap-1.5 mt-3 flex-wrap">
                                        {compatibility.matches.slice(0, 3).map((m, i) => (
                                            <span key={i} className="text-[10px] uppercase tracking-wider font-bold px-3 py-1 bg-white/60 text-indigo-700 rounded-full border border-indigo-100">{m}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="relative flex items-center justify-center w-16 h-16">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-indigo-100" />
                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="transparent" strokeDasharray={176} strokeDashoffset={176 - (176 * compatibility.score) / 100} className="text-indigo-500 transition-all duration-1000 ease-out" />
                                    </svg>
                                    <span className="absolute text-sm font-black text-indigo-900">{compatibility.score}%</span>
                                </div>
                            </div>
                        )}

                        {/* Description Card */}
                        <div className="bg-white md:bg-gray-50 rounded-[1.5rem] p-6 border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-4">About this place</h3>
                            <p className="text-gray-600 leading-relaxed text-[15px] whitespace-pre-wrap">
                                {listing.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ─── Right Column: Sticky Sidebar for Desktop ─── */}
                <div className="hidden md:block w-full md:w-[35%] relative">
                    <div className="sticky top-24 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40">
                        {/* Price & Type Header */}
                        <div className="pb-6 border-b border-gray-100 flex items-end justify-between">
                            <div>
                                <p className="text-4xl font-black text-gray-900">
                                    {listing.price}<span className="text-lg font-medium text-gray-400">/mo</span>
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm">
                                {listing.type}
                            </span>
                        </div>

                        {/* Host Mini Profile */}
                        <div className="py-6 border-b border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Hosted by</h3>
                            <div className="flex items-center gap-4 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-xl transition-colors" onClick={() => navigate(`/user/${listing.author.id}`)}>
                                <div className="relative w-14 h-14">
                                    <img src={listing.author.avatar} alt={listing.author.name} className="w-full h-full rounded-full object-cover shadow-sm bg-gray-100" />
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-extrabold text-gray-900 text-lg truncate">{listing.author.name}</p>
                                    <p className="text-sm font-medium text-gray-500 truncate">
                                        {listing.author.age} • {listing.author.gender}
                                    </p>
                                </div>
                                <ArrowLeft size={16} className="text-gray-400 rotate-180" />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 space-y-3">
                            {listing && profile && listing.author.id === profile.id ? (
                                <div className="w-full bg-gray-100 text-gray-400 py-4 rounded-full font-bold flex items-center justify-center text-sm cursor-not-allowed">
                                    You posted this listing
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={handleRequestArrangement}
                                        disabled={requesting}
                                        className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {requesting ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Request Arrangement <Send size={18} /></>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/chat/${listing.author.id}`)}
                                        className="w-full bg-white text-gray-700 border-2 border-gray-100 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 hover:-translate-y-0.5 transition-all"
                                    >
                                        <MessageCircle size={18} /> Chat with Host
                                    </button>
                                </>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            {/* ─── Mobile Sticky Footer Action Bar ─── */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 pb-safe-bottom z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between mb-3 px-1">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Price</p>
                        <p className="text-xl font-black text-gray-900">{listing.price}<span className="text-sm font-normal text-gray-400">/mo</span></p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 font-bold rounded-lg text-xs tracking-wide">
                        {listing.type}
                    </span>
                </div>
                <div className="flex items-center gap-3 w-full">
                    {listing && profile && listing.author.id === profile.id ? (
                        <div className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-full font-bold flex items-center justify-center gap-2 cursor-not-allowed text-sm">
                            <span>You posted this</span>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => navigate(`/chat/${listing.author.id}`)}
                                className="p-3 bg-gray-100 rounded-full text-gray-700 hover:bg-gray-200 transition-colors shadow-sm"
                            >
                                <MessageCircle size={22} />
                            </button>
                            <button
                                onClick={handleRequestArrangement}
                                disabled={requesting}
                                className="flex-1 bg-primary text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {requesting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>Request <Send size={16} /></>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Lightbox Gallery Modal ─── */}
            <ListingGallery
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={completeGallery}
                initialCategory={activeRoomFilter}
            />

        </div>
    );
};

export default ListingDetailsScreen;
