import { ArrowLeft, SlidersHorizontal, Map, Bookmark, MapPin, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";

const ListingsScreen = () => {
    const navigate = useNavigate();
    const { listings, loading, savedListingIds, toggleSave } = useListings();
    const [showSavedOnly, setShowSavedOnly] = useState(false);

    // Filters
    const [showFilters, setShowFilters] = useState(false);
    const [filterGender, setFilterGender] = useState<string | null>(null);
    const [filterSchool, setFilterSchool] = useState<string | null>(null);

    // Derived Filters
    const uniqueSchools = Array.from(new Set(listings.map(l => l.author.school).filter(Boolean)));

    const filteredListings = listings.filter(l => {
        if (showSavedOnly && !savedListingIds.has(l.id)) return false;
        if (filterGender && l.author.gender !== filterGender) return false;
        if (filterSchool && l.author.school !== filterSchool) return false;
        return true;
    });

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
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">
                            {showSavedOnly ? "Saved" : "Listings"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <Map size={24} className="text-foreground" />
                        </button>
                        <button
                            onClick={() => setShowSavedOnly(!showSavedOnly)}
                            className={`p-2 rounded-full transition-all ${showSavedOnly ? "bg-orange-100" : "hover:bg-gray-100"}`}
                        >
                            <Bookmark size={24} className={`transition-colors ${showSavedOnly ? "text-orange-500 fill-orange-500" : "text-gray-400"}`} />
                        </button>
                    </div>
                </div>

                {/* ─── Search/Filter Bar ─── */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? "bg-primary text-white" : "bg-gray-100 text-gray-600"}`}
                    >
                        <SlidersHorizontal size={20} />
                    </button>

                    {/* Filter Chips / Active Filters */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
                        <button
                            onClick={() => navigate("/search")}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm active:scale-95 transition-transform"
                        >
                            Location <span className="text-foreground font-bold">Search...</span>
                        </button>

                        {/* Dynamic School Filter Chip if active */}
                        {filterSchool && (
                            <button
                                onClick={() => setFilterSchool(null)}
                                className="px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-transform"
                            >
                                {filterSchool} <X size={14} />
                            </button>
                        )}

                        {/* Dynamic Gender Filter Chip if active */}
                        {filterGender && (
                            <button
                                onClick={() => setFilterGender(null)}
                                className="px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-full text-sm font-bold whitespace-nowrap flex items-center gap-1 active:scale-95 transition-transform"
                            >
                                {filterGender} <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Expanded Filter Panel */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-in slide-in-from-top-2 fade-in duration-200">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Gender</h3>
                                <div className="flex gap-2">
                                    {['Male', 'Female'].map(g => (
                                        <button
                                            key={g}
                                            onClick={() => setFilterGender(filterGender === g ? null : g)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filterGender === g
                                                    ? "bg-primary text-white border-primary"
                                                    : "bg-white text-gray-600 border-gray-200 hover:border-primary/30"
                                                }`}
                                        >
                                            {g}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {uniqueSchools.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">School</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {uniqueSchools.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setFilterSchool(filterSchool === s ? null : s)}
                                                className={`px-4 py-1.5 rounded-full text-sm font-bold border transition-all ${filterSchool === s
                                                        ? "bg-secondary text-white border-secondary"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-secondary/30"
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Listings Feed ─── */}
            <div className="px-4 pt-4 space-y-4">
                {filteredListings.length > 0 ? (
                    filteredListings.map((listing) => {
                        const isSaved = savedListingIds.has(listing.id);
                        return (
                            <div
                                key={listing.id}
                                className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.99] transition-transform"
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
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleSave(listing.id);
                                            }}
                                            className="p-1 hover:bg-gray-50 rounded-full transition-colors"
                                        >
                                            <Bookmark size={22} className={`transition-colors ${isSaved ? "text-orange-500 fill-orange-500" : "text-gray-300"}`} />
                                        </button>
                                    </div>

                                    {/* Author & School */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <img src={listing.author.avatar} alt={listing.author.name} className="w-6 h-6 rounded-full object-cover" />
                                        <span className="text-sm font-semibold text-gray-700">{listing.author.name}</span>
                                        {listing.author.school && (
                                            <>
                                                <span className="text-gray-300">•</span>
                                                <span className="text-xs font-bold text-gray-500">{listing.author.school}</span>
                                            </>
                                        )}
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
                        );
                    })
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {showSavedOnly ? <Bookmark size={32} className="text-gray-300" /> : <MapPin size={32} className="text-gray-300" />}
                        </div>
                        <p className="font-semibold">No listings found</p>
                        <p className="text-sm max-w-[200px] mx-auto mt-1">
                            {showSavedOnly ? "Mark rooms as favorites to see them here" : "Try adjusting your filters"}
                        </p>
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default ListingsScreen;
