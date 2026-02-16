import { ArrowLeft, SlidersHorizontal, Map, Bookmark, MapPin, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { MOCK_LISTINGS } from "@/data/mockData";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";


const ListingsScreen = () => {
    const navigate = useNavigate();
    const { listings, loading } = useListings();
    const [selectedType, setSelectedType] = useState("All");
    const [activeTab, setActiveTab] = useState("Listings");

    const filteredListings = selectedType === "All"
        ? listings
        : listings.filter(l => l.type === selectedType);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">
            {/* ─── Header ─── */}
            <div className="sticky top-0 z-50 bg-white px-4 pt-12 pb-4 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {/* Back Button (optional, but good for UX) */}
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Listings</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Map size={24} className="text-foreground" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-full">
                            <Bookmark size={24} className="text-primary fill-current" />
                        </button>
                    </div>
                </div>

                {/* ─── Search/Filter Bar ─── */}
                <div className="flex items-center gap-3">
                    <button className="p-2 bg-gray-100 rounded-full">
                        <SlidersHorizontal size={20} className="text-gray-600" />
                    </button>

                    {/* Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                            Location <span className="text-foreground font-bold">Dakar</span>
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                            Sort <span className="text-foreground font-bold">New</span>
                        </button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm">
                            Price
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── Listings Feed ─── */}
            <div className="px-4 pt-4 space-y-4">
                {filteredListings.map((listing) => (
                    <div
                        key={listing.id}
                        className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                        onClick={() => navigate(`/listings/${listing.id}`)}
                    >
                        {/* Header: Location & Time */}
                        <div className="px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin size={12} className="text-primary" />
                                </div>
                                <span>{listing.location}</span>
                                <span className="text-gray-300">|</span>
                                <span>{listing.postedAt}</span>
                            </div>
                            {/* User Info (Abstracted) */}
                            <div className="text-xs font-bold text-gray-800">
                                {listing.author.gender}, {listing.author.age}
                            </div>
                        </div>

                        {/* Hero Image */}
                        <div className="relative h-48 w-full bg-gray-200">
                            <img
                                src={listing.image}
                                alt={listing.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-xl font-bold text-foreground leading-tight w-3/4">
                                    {listing.title}
                                </h3>
                                <Bookmark size={20} className="text-primary" />
                            </div>

                            {/* Author */}
                            <div className="flex items-center gap-2 mb-3">
                                <img src={listing.author.avatar} alt={listing.author.name} className="w-6 h-6 rounded-full object-cover" />
                                <span className="text-sm font-semibold text-gray-700">{listing.author.name}</span>
                            </div>

                            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                {listing.description}
                            </p>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin size={12} />
                                    <span>{listing.location}</span>
                                    <span>|</span>
                                    <span>{listing.distance}</span>
                                    <span>|</span>
                                    <span>{listing.type}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-black text-foreground">{listing.price}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/chat/${listing.author.id}`);
                                        }}
                                        className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold hover:bg-primary/20 transition-colors"
                                    >
                                        Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* ─── Bottom Navigation ─── */}
            <BottomNav />
        </div>
    );
};

export default ListingsScreen;
