import { ArrowLeft, Search, X, MapPin, ChevronRight, Home, DollarSign, Zap, GraduationCap, Map, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";

const ListingsScreen = () => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const { listings, loading, savedListingIds, toggleSave, searchListings } = useListings();

    // UI State
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'location' | 'budget' | 'type' | 'conditions' | 'school'>('location');

    // Filter State
    const [filters, setFilters] = useState({
        location: "",
        minPrice: 0,
        maxPrice: 300000,
        type: "",
        features: [] as string[],
        school: ""
    });

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            searchListings({
                query: filters.location,
                location: filters.location,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                type: filters.type === "All" ? "" : filters.type,
                features: filters.features,
                school: filters.school
            });
        }, 500);

        return () => clearTimeout(timer);
    }, [filters]);

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

    // Dynamic Input Handling
    const getInputValue = () => {
        switch (activeCategory) {
            case 'school': return filters.school;
            case 'location': return filters.location;
            default: return "";
        }
    };

    const handleInputChange = (val: string) => {
        switch (activeCategory) {
            case 'school':
                setFilters({ ...filters, school: val });
                break;
            case 'location':
                setFilters({ ...filters, location: val });
                break;
            default:
                if (val.length > 0) {
                    setActiveCategory('location');
                    setFilters({ ...filters, location: val });
                }
                break;
        }
    };

    const getPlaceholder = () => {
        switch (activeCategory) {
            case 'school': return "Which school? (e.g. ISM)";
            case 'budget': return "Adjust price slider below...";
            case 'type': return "Select property type...";
            case 'conditions': return "Select amenities...";
            default: return "Where to? (Location, keywords...)";
        }
    };

    // Filter listings for Favorites view
    const displayedListings = showSavedOnly
        ? listings.filter(l => savedListingIds.has(l.id))
        : listings;

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

                        {/* Omnibar */}
                        <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-4 py-2.5 gap-3 transition-all ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white">
                            <Search size={20} className="text-gray-400" />
                            <input
                                ref={inputRef}
                                className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                                placeholder={getPlaceholder()}
                                value={getInputValue()}
                                onChange={(e) => handleInputChange(e.target.value)}
                                onFocus={() => {
                                    if (activeCategory !== 'location' && activeCategory !== 'school') {
                                        setActiveCategory('location');
                                    }
                                }}
                                disabled={activeCategory === 'budget' || activeCategory === 'conditions' || activeCategory === 'type'}
                            />
                            {(activeCategory === 'location' && filters.location) || (activeCategory === 'school' && filters.school) ? (
                                <button onClick={() => handleInputChange("")}>
                                    <X size={16} className="text-gray-400" />
                                </button>
                            ) : null}
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            {/* Map Toggle (Future) */}
                            {/* <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <Map size={24} className="text-gray-700" />
                            </button> */}

                            {/* Favorites Toggle */}
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

                {/* School Suggestions */}
                {activeCategory === 'school' && (
                    <div className="px-4 pb-4 animate-in slide-in-from-top-2">
                        <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                            Suggested:
                            {['ISM', 'BEM', 'UCAD', 'ESP'].map(s => (
                                <button key={s} onClick={() => setFilters({ ...filters, school: s })} className="text-primary font-bold hover:underline">
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
                            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
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
                                onClick={() => setFilters({ ...filters, type: filters.type === type ? "" : type })}
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
            </div>

            {/* ─── Listings Feed ─── */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
                {/* Recent Searches Hint (Only if Location active & empty) */}
                {activeCategory === 'location' && filters.location === "" && !showSavedOnly && (
                    <div className="py-2">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {["Mermoz", "Plateau", "Almadies"].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setFilters({ ...filters, location: term })}
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
                        {loading ? "Searching..." : showSavedOnly ? `${displayedListings.length} Saved Items` : `${displayedListings.length} places found`}
                    </h2>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
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
                    <div className="text-center py-20 text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            {showSavedOnly ? <Bookmark size={32} className="text-gray-300" /> : <Home size={32} className="text-gray-300" />}
                        </div>
                        <p className="font-semibold">No listings found</p>
                        <p className="text-sm max-w-[200px] mx-auto mt-1">
                            {showSavedOnly ? "Mark rooms as favorites to see them here" : "Try adjusting your filters"}
                        </p>
                        {!showSavedOnly && (
                            <button onClick={() => setFilters({ location: "", minPrice: 0, maxPrice: 300000, type: "", features: [], school: "" })} className="text-primary font-bold text-sm mt-4">Clear all filters</button>
                        )}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
};

export default ListingsScreen;
