import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, X, Bookmark, Share, Send, MapPin, MessageCircle, Copy } from "lucide-react";
import { useListings } from "@/hooks/useListings";
import { toast } from "sonner";
import { ShareDialog } from "@/components/ShareDialog";

const ListingDetailsScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { listings, loading, savedListingIds, toggleSave } = useListings();

    const listing = listings.find((l) => l.id === Number(id));
    const isSaved = listing ? savedListingIds.has(listing.id) : false;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!listing) {
        return <div className="p-8 text-center">Listing not found</div>;
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
                    <ShareDialog title={shareTitle} description={shareDesc} url={shareUrl}>
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors active:scale-95">
                            <Share size={24} className="text-primary" />
                        </button>
                    </ShareDialog>
                    <button className="p-2 hover:bg-gray-100 rounded-full">
                        <Send size={24} className="text-primary" />
                    </button>
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

                <button
                    onClick={() => navigate(`/chat/${listing.author.id}`)}
                    className="bg-primary text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors active:scale-95"
                >
                    <MessageCircle size={18} fill="currentColor" />
                    Message
                </button>
            </div>
        </div>
    );
};

export default ListingDetailsScreen;
