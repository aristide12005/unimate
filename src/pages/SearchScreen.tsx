import { ArrowLeft, Search, X, MapPin, SlidersHorizontal, ChevronRight, Home, DollarSign, Zap, GraduationCap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useListings } from "@/hooks/useListings";

const SearchScreen = () => {
    const navigate = useNavigate();
    const inputRef = useRef<HTMLInputElement>(null);
    const { listings, loading, searchListings } = useListings(); // Listings will be updated by searchListings

    // UI State
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
                query: filters.location, // Use location input as general query for now
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
            default: return ""; // For budget/type/conditions, we might not use the text input directly or use it for global search
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
                // For other categories, maybe we treat it as global location/keyword search?
                // Or just switch back to location view if they start typing?
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

    return (
        <div className="min-h-screen bg-gray-50 pb-24 font-sans flex flex-col">
            {/* ─── Header ─── */}
            <div className="bg-white px-4 pt-12 pb-2 shadow-sm sticky top-0 z-50">
                <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft size={24} className="text-gray-700" />
                    </button>
                    <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-4 py-2.5 gap-3 transition-all ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white">
                        <Search size={20} className="text-gray-400" />
                        <input
                            ref={inputRef}
                            className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                            placeholder={getPlaceholder()}
                            value={getInputValue()}
                            onChange={(e) => handleInputChange(e.target.value)}
                            onFocus={() => {
                                // If focusing while in a non-text category, maybe switch to location? 
                                // Or just let them type. 
                                // Let's keep current category unless they type.
                            }}
                            disabled={activeCategory === 'budget' || activeCategory === 'conditions' || activeCategory === 'type'}
                        // Disable text input for non-text categories to avoid confusion? 
                        // The user wanted "changes in search bar". Disabling acts as a visual change.
                        // But maybe they want to type "Studio"? 
                        // Creating a truly "Omnibar" is hard. Let's stick to guided input.
                        />
                        {(activeCategory === 'location' && filters.location) || (activeCategory === 'school' && filters.school) ? (
                            <button onClick={() => handleInputChange("")}>
                                <X size={16} className="text-gray-400" />
                            </button>
                        ) : null}
                    </div>
                </div>

                {/* ─── Filter Tray ─── */}
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

            {/* ─── Dynamic Content Area ─── */}
            <div className="flex-1 overflow-y-auto p-4">

                {/* 1. Location View */}
                {activeCategory === 'location' && (
                    <div className="space-y-2">
                        {filters.location === "" ? (
                            <>
                                <h3 className="text-sm font-bold text-gray-400 uppercase mb-2">Recent searches</h3>
                                {["Mermoz", "Plateau", "Almadies"].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setFilters({ ...filters, location: term })}
                                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-white border border-gray-100 text-gray-600 active:scale-[0.98] transition-transform"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-50 rounded-full">
                                                <Search size={16} className="text-gray-400" />
                                            </div>
                                            <span className="font-semibold text-gray-900">{term}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300" />
                                    </button>
                                ))}
                            </>
                        ) : (
                            // Show search results directly when typing (like Airbnb)
                            <div className="pb-20">
                                {loading ? (
                                    <div className="text-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary mx-auto"></div>
                                    </div>
                                ) : (
                                    listings.map(l => (
                                        <div key={l.id} onClick={() => navigate(`/listings/${l.id}`)} className="flex gap-4 p-3 mb-3 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-all">
                                            <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                                                <img src={l.image} alt={l.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{l.title}</h4>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <MapPin size={12} /> {l.location}
                                                </p>
                                                <p className="text-primary font-bold text-sm mt-2">{l.price}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 2. School View */}
                {activeCategory === 'school' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-4">Target School</h3>
                        <div className="bg-gray-100 rounded-xl flex items-center px-4 py-3 gap-3 mb-4">
                            <GraduationCap size={20} className="text-gray-400" />
                            <input
                                className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                                placeholder="e.g. ISM, Bem, Esp..."
                                value={filters.school}
                                onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                            />
                        </div>
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

                {/* 3. Budget View */}
                {activeCategory === 'budget' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Price Range</h3>
                        <div className="flex items-center justify-between mb-8">
                            <div className="p-3 border rounded-xl w-32 text-center">
                                <p className="text-xs text-gray-400 uppercase font-bold">Min</p>
                                <p className="text-lg font-black text-gray-900">{filters.minPrice.toLocaleString()} F</p>
                            </div>
                            <div className="p-3 border rounded-xl w-32 text-center">
                                <p className="text-xs text-gray-400 uppercase font-bold">Max</p>
                                <p className="text-lg font-black text-gray-900">{filters.maxPrice.toLocaleString()}+ F</p>
                            </div>
                        </div>

                        {/* Simple Range Slider Simulation */}
                        <input
                            type="range"
                            min="0"
                            max="500000"
                            step="5000"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <p className="text-xs text-gray-400 mt-4 text-center">
                            Move slider to adjust maximum budget
                        </p>
                    </div>
                )}

                {/* 4. Type View */}
                {activeCategory === 'type' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Property Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {['Room', 'Studio', 'Coloc', 'Apartment'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilters({ ...filters, type: filters.type === type ? "" : type })}
                                    className={`p-4 rounded-2xl border-2 text-left transition-all ${filters.type === type
                                        ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                                        : "border-gray-100 bg-white hover:border-gray-200"
                                        }`}
                                >
                                    <span className={`block font-bold mb-1 ${filters.type === type ? "text-primary" : "text-gray-900"}`}>{type}</span>
                                    <span className="text-xs text-gray-400">Standard {type.toLowerCase()}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Conditions View */}
                {activeCategory === 'conditions' && (
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-black text-gray-900 mb-6">Conditions & Features</h3>
                        <div className="flex flex-wrap gap-3">
                            {['WiFi', 'AC', 'Private Bathroom', 'Furnished', 'Non-Smoker', 'No Pets', 'Security', 'Terrace'].map(feat => (
                                <button
                                    key={feat}
                                    onClick={() => toggleFeature(feat)}
                                    className={`px-4 py-3 rounded-xl font-bold text-sm transition-all ${filters.features.includes(feat)
                                        ? "bg-black text-white shadow-lg transform scale-105"
                                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                        }`}
                                >
                                    {feat}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Footer: Show Results ─── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 pb-8 z-50">
                <button
                    onClick={() => setActiveCategory('location')} // Go back to results list
                    className="w-full bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
                >
                    <Search size={20} />
                    See {listings.length} Results
                </button>
            </div>
        </div>
    );
};

export default SearchScreen;
