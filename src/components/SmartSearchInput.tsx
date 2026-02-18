import { useState, useEffect, useRef } from "react";
import { Search, MapPin, GraduationCap, DollarSign, Zap, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { searchUniversities, University } from "@/services/universityService";
import { searchLocations, Location as NominatimLocation } from "@/services/locationService";

export type SuggestionItem =
    | { type: 'school', data: University }
    | { type: 'location', data: NominatimLocation }
    | { type: 'budget', price: number }
    | { type: 'feature', feature: string };

interface SmartSearchInputProps {
    onSearch: (filters: {
        school?: string;
        location?: string;
        maxPrice?: number;
        features?: string[];
        type?: string;
    }) => void;
    initialValue?: string;
    placeholder?: string;
    className?: string;
    autoFocus?: boolean;
}

export const SmartSearchInput = ({ onSearch, initialValue = "", placeholder = "Search...", className, autoFocus }: SmartSearchInputProps) => {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Categories are detected automatically based on input
    // We can also have manual toggles if needed, but for "Smart" input, auto-detection is key.

    useEffect(() => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const newSuggestions: SuggestionItem[] = [];

            // 1. Check for Budget (Numeric)
            const num = parseInt(query.replace(/[^0-9]/g, ''));
            if (!isNaN(num) && num > 5000) {
                newSuggestions.push({ type: 'budget', price: num });
            }

            // 2. Check for Features
            const featureKeywords = ['wifi', 'ac', 'air', 'security', 'furnished', 'smoker', 'pet', 'terrace', 'garden'];
            const matchedFeature = featureKeywords.find(k => query.toLowerCase().includes(k));
            if (matchedFeature) {
                const label = matchedFeature === 'air' ? 'AC' : matchedFeature.charAt(0).toUpperCase() + matchedFeature.slice(1);
                newSuggestions.push({ type: 'feature', feature: label });
            }

            try {
                // 3. Search Data (Mixed Concept: School & Location)
                // We'll search both and merge? Or prioritize?
                // For a "Global" search, let's try to infer intent or just show both.

                // If it looks like a school "univ", "ecole", "sup"
                const isSchoolLike = /univ|ecole|sup|institut/i.test(query);

                if (isSchoolLike) {
                    const schools = await searchUniversities(query);
                    newSuggestions.push(...schools.slice(0, 3).map(r => ({ type: 'school', data: r } as SuggestionItem)));
                }

                // Always search locations as fallback/primary
                const locations = await searchLocations(query);
                newSuggestions.push(...locations.slice(0, 3).map(r => ({ type: 'location', data: r } as SuggestionItem)));

                // If not school specific but we have space, verify school anyway if result count is low
                if (!isSchoolLike && newSuggestions.filter(x => x.type === 'location').length < 3) {
                    const schools = await searchUniversities(query);
                    newSuggestions.push(...schools.slice(0, 2).map(r => ({ type: 'school', data: r } as SuggestionItem)));
                }

                setSuggestions(newSuggestions);
            } catch (error) {
                console.error("Autocomplete error:", error);
            } finally {
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

    const selectSuggestion = (item: SuggestionItem) => {
        let filters: any = {};

        if (item.type === 'school') {
            filters.school = item.data.name;
            setQuery(item.data.name);
        } else if (item.type === 'location') {
            const loc = item.data;
            const parts = loc.display_name.split(',').map(p => p.trim());
            const shortName = parts.slice(0, 2).join(', ');
            filters.location = shortName;
            setQuery(shortName);
        } else if (item.type === 'budget') {
            filters.maxPrice = item.price;
            filters.location = ""; // Reset location if setting budget via text? Or keep?
            // Usually if typing "150000", they want that constraint.
        } else if (item.type === 'feature') {
            filters.features = [item.feature];
        }

        onSearch(filters);
        setShowSuggestions(false);
    };

    // Auto-focus handling
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className={`relative ${className}`}>
            <div className="bg-gray-100 rounded-xl flex items-center px-4 py-2.5 gap-3 transition-all ring-1 ring-transparent focus-within:ring-primary/20 focus-within:bg-white relative z-10 w-full">
                {isSearching ? (
                    <Loader2 size={20} className="text-primary animate-spin" />
                ) : (
                    <Search size={20} className="text-gray-400" />
                )}
                <input
                    ref={inputRef}
                    className="bg-transparent border-none outline-none w-full text-sm font-semibold text-gray-900 placeholder:text-gray-400"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                {query && (
                    <button onClick={() => { setQuery(""); onSearch({ location: "" }); }}>
                        <X size={16} className="text-gray-400" />
                    </button>
                )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    {suggestions.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectSuggestion(item)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                        >
                            {/* Icon Logic */}
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                {item.type === 'school' && <GraduationCap size={14} className="text-gray-500" />}
                                {item.type === 'location' && <MapPin size={14} className="text-gray-500" />}
                                {item.type === 'budget' && <DollarSign size={14} className="text-green-600" />}
                                {item.type === 'feature' && <Zap size={14} className="text-orange-500" />}
                            </div>

                            {/* Text Logic */}
                            <div>
                                <div className="font-semibold text-sm text-gray-800">
                                    {item.type === 'school' && item.data.name}
                                    {item.type === 'location' && item.data.display_name.split(',')[0]}
                                    {item.type === 'budget' && `Set Max Budget: ${item.price.toLocaleString()} F`}
                                    {item.type === 'feature' && `Filter by: ${item.feature}`}
                                </div>
                                <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                    {item.type === 'school' && item.data.country}
                                    {item.type === 'location' && item.data.display_name}
                                    {item.type === 'budget' && "Tap to apply filter"}
                                    {item.type === 'feature' && "Tap to add condition"}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
