import { ArrowLeft, Search, X, MapPin, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useListings } from "@/hooks/useListings";

const SearchScreen = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const { listings } = useListings(); // Fetch listings for search

    // Auto-focus input on mount
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const filteredListings = query.trim() === "" ? [] : listings.filter(l =>
        l.title.toLowerCase().includes(query.toLowerCase()) ||
        l.location.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-8 font-sans">
            {/* Header / Search Bar */}
            <div className="bg-white px-4 py-4 pt-12 shadow-sm sticky top-0 z-50 flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <div className="flex-1 bg-gray-100 rounded-xl flex items-center px-4 py-2.5 gap-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                        ref={inputRef}
                        className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                        placeholder="Search for rooms, mates..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button onClick={() => setQuery("")}>
                            <X size={16} className="text-gray-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                {query.trim() === "" ? (
                    // Empty State / Recent Searches
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Recent Searches</h3>
                        <div className="space-y-2">
                            {["Mermoz", "Studio Plateau", "Coloc Almadies"].map((term) => (
                                <button
                                    key={term}
                                    onClick={() => setQuery(term)}
                                    className="flex items-center justify-between w-full p-3 rounded-xl bg-white border border-gray-100 text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 bg-gray-100 rounded-md">
                                            <Search size={14} className="text-gray-400" />
                                        </div>
                                        <span className="text-sm font-medium">{term}</span>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    // Results
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 mb-2">Results ({filteredListings.length})</h3>
                        {filteredListings.length > 0 ? (
                            filteredListings.map((listing) => (
                                <div
                                    key={listing.id}
                                    onClick={() => navigate(`/listings/${listing.id}`)}
                                    className="flex gap-4 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm cursor-pointer active:scale-[0.98] transition-all"
                                >
                                    <div className="w-20 h-20 bg-gray-200 rounded-xl overflow-hidden shrink-0">
                                        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate">{listing.title}</h4>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <MapPin size={12} /> {listing.location}
                                        </p>
                                        <p className="text-primary font-bold text-sm mt-2">{listing.price}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10 text-gray-400">
                                <Search size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No results found for "{query}"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchScreen;
