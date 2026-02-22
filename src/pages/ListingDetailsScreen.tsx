import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Bookmark, Share, Send, MapPin, MessageCircle, Copy, MoreVertical, Edit, Trash } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { toast } from "sonner";
import { ShareDialog } from "@/components/ShareDialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCompatibility } from "@/hooks/useCompatibility";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ListingDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { listings, loading, savedListingIds, toggleSave } = useListings();
    const { user, profile } = useAuth() as any; // Temporary cast if type is missing profile
    const [requesting, setRequesting] = useState(false);

    const [singleListing, setSingleListing] = useState<any>(null);
    const [loadingSingle, setLoadingSingle] = useState(true);

    // Compatibility Hook
    // We pass the listing (which contains housing_rules) and potentially listing.author
    // Since listing might be null initially, we verify inside the render or effect, but the hook handles undefined safely.
    const listingForHook = singleListing;
    const compatibility = useCompatibility(listingForHook);

    // Import ContractService and Auth at top if needed
    // ...

    const handleDelete = async () => {
        if (!singleListing) return;

        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', singleListing.id);

            if (error) throw error;

            toast.success("Listing deleted successfully");
            navigate(-1);
        } catch (error: any) {
            console.error("Error deleting listing:", error);
            toast.error("Failed to delete listing");
        }
    };

    const handleEdit = () => {
        // Navigate to edit screen - assuming PostListingScreen handles edits or we need to pass data
        // For now, let's toast as "Coming Soon" or check if we can reuse PostListing with params
        // Implementing simple redirect to a theoretical edit route or back to wizard?
        // Let's assume we don't have a full edit flow yet, but user asked for it to work.
        // I will navigate to '/post-room' but that's for new.
        // Let's check HostListingWizard usage.
        // Actually, best to just show "Edit feature standard" or maybe redirect to a new route I'll make?
        // Let's implement a simple direct-to-wizard redirect but wizard needs to load data.
        // User asked "make sure their function works".
        // Use a query param to signal edit mode?
        navigate(`/host/wizard?edit=${singleListing.id}`); // I will need to support this in Wizard
    };

    const handleRequestArrangement = async () => {
        if (!user || !profile) {
            toast.error("Please log in to request an arrangement");
            navigate('/login');
            return;
        }

        const listing = singleListing; // use singleListing directly in handler to avoid closure staleness if needed, or use 'listing' from render scope
        if (!listing) return;

        setRequesting(true);
        try {
            // Check if contract already exists (optional, skippable for MVP)

            const { error } = await supabase
                .from('contracts' as any)
                .insert({
                    host_id: listing.author.id,
                    student_id: profile.id, // Reverting to profile.id as contracts table references profiles.id
                    listing_id: listing.id,
                    terms: listing.housing_rules || {}, // Snapshot current rules
                    status: 'pending'
                })
                .select()
                .single();

            if (error) throw error;

            toast.success("Arrangement Requested!");
            // Navigate to chats or show success modal
            navigate(`/chat/${listing.author.id}`);

        } catch (error: any) {
            console.error(error);
            toast.error("Failed to send request");
        } finally {
            setRequesting(false);
        }
    };

    useEffect(() => {
        const fetchListing = async () => {
            if (!id) return;

            // Try to find in existing list first (cache)
            const cached = listings.find(l => l.id === Number(id));
            if (cached) {
                setSingleListing(cached);
                setLoadingSingle(false);
                return;
            }

            // Fallback: Fetch from DB directly
            const { data, error } = await supabase
                .from('listings')
                .select(`
                    *,
                    author:author_id (
                        id,
                        first_name,
                        last_name,
                        username,
                        avatar_url,
                        background_image,
                        age,
                        gender,
                        bio,
                        occupation,
                        school_company
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

    const listing = singleListing;
    const isSaved = listing ? savedListingIds.has(listing.id) : false;

    if (loadingSingle) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <p className="text-gray-500 font-medium">Listing not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-700"
                >
                    Go Back
                </button>
            </div>
        );
    }
    const shareUrl = window.location.href;
    const shareTitle = `Check out this place: ${listing.title}`;
    const shareDesc = `${listing.title} in ${listing.location} - ${listing.price}/month`;

    return (
        <div className="min-h-screen bg-white pb-24 font-sans relative">
            {/* ─── Header (Absolute/Overlay) ─── */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm px-4 pt-12 pb-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={24} className="text-primary" />
                    </button>
                    <button
                        onClick={() => toggleSave(listing.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bookmark
                            size={24}
                            className={`transition-colors ${isSaved ? "text-orange-500 fill-orange-500" : "text-primary"}`}
                        />
                    </button>
                </div>
                <h1 className="text-lg font-bold text-foreground">Listing Details</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-2 hover:bg-gray-100 rounded-full outline-none">
                                <MoreVertical size={24} className="text-gray-600" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 bg-white shadow-xl border-gray-100">

                            <ShareDialog title={shareTitle} description={shareDesc} url={shareUrl}>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="flex items-center gap-2 p-3 font-medium cursor-pointer rounded-lg hover:bg-gray-50 text-gray-700">
                                    <Share size={16} /> Share Listing
                                </DropdownMenuItem>
                            </ShareDialog>

                            {/* Show Edit/Delete only if user is author */}
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

            {/* ─── Hero Image ─── */}
            <div className="w-full h-72 bg-gray-200 relative">
                <img
                    src={listing.image}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* ─── Main Content ─── */}
            <div className="px-5 pt-6">
                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-900 leading-snug mb-2">
                    {listing.title}
                </h1>

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600 mb-6 font-medium">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin size={12} className="text-primary" />
                    </div>
                    <span>{listing.location}</span>
                </div>

                {/* Compatibility Score */}
                {compatibility && !compatibility.loading && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 flex items-center justify-between shadow-sm">
                        <div>
                            <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                ✨ Compatibility Match
                            </h3>
                            <p className="text-xs text-indigo-600 mt-1 font-medium">
                                {compatibility.score >= 80 ? "Great Match!" : compatibility.score >= 50 ? "Good Potential" : "Low Compatibility"}
                            </p>
                            <div className="flex gap-1 mt-2 flex-wrap">
                                {compatibility.matches.slice(0, 2).map((m, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 bg-white/60 text-indigo-700 rounded-full border border-indigo-100">{m}</span>
                                ))}
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center w-14 h-14">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-indigo-100" />
                                <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={150} strokeDashoffset={150 - (150 * compatibility.score) / 100} className="text-indigo-600 transition-all duration-1000 ease-out" />
                            </svg>
                            <span className="absolute text-sm font-black text-indigo-700">{compatibility.score}%</span>
                        </div>
                    </div>
                )}

                {/* Info Card (Type & Price) */}
                <div className="bg-gray-50 rounded-[1.5rem] p-6 mb-6 flex items-center justify-between border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-400 font-medium mb-1">Type</p>
                        <p className="text-lg font-bold text-gray-900">{listing.type}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400 font-medium mb-1">Price</p>
                        <p className="text-lg font-bold text-gray-900">{listing.price}<span className="text-sm font-normal text-gray-400">/month</span></p>
                    </div>
                </div>

                {/* Description Card */}
                <div className="bg-gray-50 rounded-[1.5rem] p-6 mb-8 border border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Description</h3>
                    <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">
                        {listing.description}
                    </p>
                </div>
            </div>

            {/* ─── Sticky Footer ─── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 pb-8 safe-area-bottom flex items-center justify-between z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => navigate(`/user/${listing.author.id}`)}
                >
                    <div className="relative">
                        <img
                            src={listing.author.avatar}
                            alt={listing.author.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border border-white"></div>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">{listing.author.name}</span>
                </div>

                <div className="flex items-center gap-3 w-full">
                    <button
                        onClick={() => navigate(`/chat/${listing.author.id}`)}
                        className="p-3 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        <MessageCircle size={24} />
                    </button>
                    <button
                        onClick={handleRequestArrangement}
                        disabled={requesting}
                        className="flex-1 bg-primary text-white py-3 rounded-full font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {requesting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>Request Arrangement <Send size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ListingDetailsScreen;
