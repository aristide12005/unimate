import { ArrowLeft, Search, X, MapPin, ChevronRight, Home, DollarSign, Zap, GraduationCap, Map, Bookmark, Wifi, Wind, ShieldCheck, Armchair, Ban, Cat, TreePalm, Loader2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { searchUniversities, University } from "@/services/universityService";
import { searchLocations, Location as NominatimLocation } from "@/services/locationService";
import { useDebounce } from "@/hooks/use-debounce";

import { SmartSearchInput } from "@/components/SmartSearchInput";

const ListingsScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);
    const { listings, loading, savedListingIds, toggleSave, filters, setFilters } = useListings();

    // UI State
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'location' | 'budget' | 'type' | 'conditions' | 'school'>('location');



    // Check for initial Navigation State
    useEffect(() => {
        if (location.state?.filters) {
            setFilters(prev => ({ ...prev, ...location.state.filters }));
            // If location filter is present, ensure we are in location mode
            if (location.state.filters.location) setActiveCategory('location');
            if (location.state.filters.school) setActiveCategory('school');
        }
    }, [location.state]);

    // Categories Configuration
    const categories = [
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'school', label: 'School', icon: GraduationCap },
        { id: 'budget', label: 'Budget', icon: DollarSign },
        { id: 'type', label: 'Type', icon: Home },
        { id: 'conditions', label: 'Conditions', icon: Zap },
    ];

    const toggleFeature = (feature: string) => {
        setFilters(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    // Handlers for SmartSearchInput
    const handleSmartSearch = (newFilters: Partial<typeof filters>) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        // Switch category based on what was updated
        if (newFilters.school) setActiveCategory('school');
        if (newFilters.location) setActiveCategory('location');
        if (newFilters.maxPrice) setActiveCategory('budget');
        if (newFilters.features) setActiveCategory('conditions');
    };

    const getPlaceholder = () => {
        switch (activeCategory) {
            case 'school': return "Search university (e.g. Cheikh Anta Diop)";
            case 'budget': return "Adjust price slider below...";
            case 'type': return "Select property type...";
            case 'conditions': return "Select amenities...";
            default: return "Search location (e.g. Mermoz, Fann)";
        }
    };

    // Filter listings for Favorites view
    const displayedListings = showSavedOnly
        ? listings.filter(l => savedListingIds.has(l.id))
        : listings;

    // Helper to map feature text to icon
    const getFeatureIcon = (feature: string) => {
        const lower = feature.toLowerCase();
        if (lower.includes('wifi')) return <Wifi size={12} />;
        if (lower.includes('ac') || lower.includes('air')) return <Wind size={12} />;
        if (lower.includes('security')) return <ShieldCheck size={12} />;
        if (lower.includes('furnished')) return <Armchair size={12} />;
        if (lower.includes('smoker')) return <Ban size={12} />;
        if (lower.includes('pet')) return <Cat size={12} />;
        if (lower.includes('terrace') || lower.includes('garden')) return <TreePalm size={12} />;
        return <Zap size={12} />;
    };

    const clearFilters = () => {
        setFilters({
            query: "",
            location: "",
            minPrice: 0,
            maxPrice: 300000,
            type: "",
            features: [],
            school: ""
        });
        setActiveCategory('location');
        setActiveCategory('location');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans flex flex-col">
            {/* ─── Header & Search Widget ─── */}
            <div className="bg-white shadow-sm sticky top-0 z-50 transition-all duration-300">
                <div className="px-4 pt-12 pb-2">
                    {/* Top Row: Back | Search | Favorites */}
                    <div className="flex items-center gap-2 mb-4">
                        <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft size={24} className="text-gray-700" />
                        </button>

                        {/* Connected Smart Input */}
                        <div className="flex-1 z-50">
                            <SmartSearchInput
                                onSearch={handleSmartSearch}
                                initialValue={filters.school || filters.location}
                                placeholder={
                                    activeCategory === 'school' ? "Search university..." :
                                        activeCategory === 'budget' ? "Type max price..." :
                                            "Search location, budget, etc..."
                                }
                                autoFocus={location.state?.autoFocus}
                            />
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setShowSavedOnly(!showSavedOnly)}
                                className={`p-2 rounded-full transition-all ${showSavedOnly ? "bg-orange-100" : "hover:bg-gray-100"}`}
                            >
                                <Bookmark size={24} className={`transition-colors ${showSavedOnly ? "text-orange-500 fill-orange-500" : "text-gray-400"}`} />
                            </button>
                        </div>
                    </div>

                    {/* Filter Tray */}
                    <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white text-gray-600 border border-gray-100"
                                    }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ─── INLINE FILTER PANELS (Sticky) ─── */}

                {/* School Suggestions (Static Fallback/Quick Links) */}
                {activeCategory === 'school' && !filters.school && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            Suggested:
                            {['ISM', 'BEM', 'UCAD', 'ESP'].map(s => (
                                <button key={s} onClick={() => setFilters(prev => ({ ...prev, school: s }))} className="text-primary font-bold hover:underline">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Budget Slider */}
                {activeCategory === 'budget' && (
                    <div className="px-6 pb-6 pt-2 bg-gray-50/50 border-t border-gray-100 animate-in slide-in-from-top-2">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-bold text-gray-500">Max Price</span>
                            <span className="text-xl font-black text-gray-900">{filters.maxPrice.toLocaleString()} F</span>
                        </div>
                        <input
                            type="range"
                            min="50000"
                            max="500000"
                            step="5000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                )}

                {/* Type Chips */}
                {activeCategory === 'type' && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-3 overflow-x-auto no-scrollbar animate-in slide-in-from-top-2">
                        {['Room', 'Studio', 'Coloc', 'Apartment'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilters(prev => ({ ...prev, type: prev.type === type ? "" : type }))}
                                className={`px-4 py-2 rounded-xl text-sm font-bold border whitespace-nowrap transition-all ${filters.type === type
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200"
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                {/* Conditions/Features Chips */}
                {activeCategory === 'conditions' && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 flex gap-2 flex-wrap animate-in slide-in-from-top-2">
                        {['WiFi', 'AC', 'Private Bathroom', 'Furnished', 'Non-Smoker', 'No Pets', 'Security', 'Terrace'].map(feat => (
                            <button
                                key={feat}
                                onClick={() => toggleFeature(feat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filters.features.includes(feat)
                                    ? "bg-black text-white border-black"
                                    : "bg-white text-gray-600 border-gray-200"
                                    }`}
                            >
                                {feat}
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── ACTIVE FILTERS PILLS ─── */}
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                    {filters.type && (
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, type: "" }))}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-900 text-white rounded-full text-xs font-bold animate-in fade-in zoom-in"
                        >
                            {filters.type} <X size={12} />
                        </button>
                    )}
                    {filters.features.map(f => (
                        <button
                            key={f}
                            onClick={() => toggleFeature(f)}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold animate-in fade-in zoom-in"
                        >
                            {f} <X size={12} />
                        </button>
                    ))}
                    {filters.maxPrice < 300000 && (
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, maxPrice: 300000 }))}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-xs font-bold animate-in fade-in zoom-in"
                        >
                            &lt; {filters.maxPrice.toLocaleString()} F <X size={12} />
                        </button>
                    )}
                </div>
            </div>

            {/* ─── Listings Feed ─── */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {/* Recent Searches Hint */}
                {activeCategory === 'location' && filters.location === "" && !showSavedOnly && (
                    <div className="py-2">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {["Mermoz", "Plateau", "Almadies"].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setFilters(prev => ({ ...prev, location: term }))}
                                    className="px-4 py-2 bg-white border border-gray-100 rounded-full text-xs font-bold text-gray-500 whitespace-nowrap active:scale-95 transition-transform"
                                >
                                    <Search size={12} className="inline mr-1" />
                                    {term}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results Header */}
                <div className="flex items-center justify-between pb-2 pt-2">
                    <h2 className="font-bold text-gray-900">
                        {loading
                            ? "Finding matches..."
                            : showSavedOnly
                                ? `${displayedListings.length} Saved Items`
                                : (filters.query || filters.location || filters.type || filters.features.length > 0)
                                    ? `${displayedListings.length} places found`
                                    : "Explore uniMate"
                        }
                    </h2>
                </div>

                {loading ? (
                    // Skeleton Loading
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-4 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <div className="flex justify-between pt-2">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-6 w-24" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedListings.length > 0 ? (
                    displayedListings.map((listing) => {
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
                                    {/* Feature Icons Overlay */}
                                    <div className="absolute bottom-2 left-2 flex gap-1">
                                        {listing.features && listing.features.slice(0, 3).map((f: string) => (
                                            <div key={f} className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-700 shadow-sm" title={f}>
                                                {getFeatureIcon(f)}
                                            </div>
                                        ))}
                                        {(listing.features?.length || 0) > 3 && (
                                            <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-xs font-bold text-gray-700 shadow-sm">
                                                +{listing.features.length - 3}
                                            </div>
                                        )}
                                    </div>
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
                                            <span className="text-lg font-black text-foreground">{parseInt(listing.price).toLocaleString()} F</span>
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
                    // Smart Empty State
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            {showSavedOnly ? <Bookmark size={32} className="text-gray-300" /> : <Search size={32} className="text-gray-300" />}
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-1">No Matches Found</h3>
                        <p className="text-sm max-w-[240px] mx-auto text-gray-500">
                            {showSavedOnly ? "You haven't saved any listings yet." : "We couldn't find any places matching your filters. Try widening your search?"}
                        </p>
                        {!showSavedOnly && (
                            <button
                                onClick={clearFilters}
                                className="mt-6 px-6 py-2 bg-black text-white rounded-full text-sm font-bold shadow-lg shadow-black/20 hover:scale-105 transition-transform"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default ListingsScreen;
