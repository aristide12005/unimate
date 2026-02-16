import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, BedDouble, Users, MapPin, Plus, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LocationItem {
    city: string;
    country: string;
    campus?: string;
}

const LOCATIONS: LocationItem[] = [
    { city: "Dakar", country: "Senegal", campus: "Groupe ISM" },
    { city: "Dakar", country: "Senegal", campus: "UCAD" },
    { city: "Dakar", country: "Senegal", campus: "IAM" },
    { city: "Abidjan", country: "Côte d'Ivoire", campus: "Université FHB" },
    { city: "Casablanca", country: "Morocco", campus: "UM6P" },
    { city: "Kigali", country: "Rwanda", campus: "University of Rwanda" },
    { city: "Nairobi", country: "Kenya", campus: "University of Nairobi" },
    { city: "Lagos", country: "Nigeria", campus: "UNILAG" },
    { city: "Accra", country: "Ghana", campus: "University of Ghana" },
    { city: "Cape Town", country: "South Africa", campus: "UCT" },
    { city: "Paris", country: "France" },
    { city: "London", country: "United Kingdom" },
    { city: "Montreal", country: "Canada" },
    { city: "Dubai", country: "UAE" },
    { city: "New York", country: "USA" },
];

type HousingRole = "host" | "guest" | "co-applicant" | null;

const LocationScreen = () => {
    const [query, setQuery] = useState("");
    const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
    const [housing, setHousing] = useState<HousingRole>(null);
    const [showResults, setShowResults] = useState(false);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("location_city, location_country, campus, housing_status")
                .eq("user_id", user.id)
                .single();

            if (data && !error) {
                if (data.location_city) {
                    // Try to match with existing LOCATIONS or create a custom one
                    const matched = LOCATIONS.find(l => l.city === data.location_city && l.country === data.location_country && l.campus === data.campus);
                    setSelectedLocation(matched || { city: data.location_city, country: data.location_country || "", campus: data.campus || undefined });
                    setQuery(data.location_city);
                }
                if (data.housing_status) setHousing(data.housing_status as HousingRole);
            }
        };
        fetchProfile();
    }, [user]);

    const filtered = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return LOCATIONS.filter(
            (loc) =>
                loc.city.toLowerCase().includes(q) ||
                loc.country.toLowerCase().includes(q) ||
                (loc.campus && loc.campus.toLowerCase().includes(q))
        ).slice(0, 5);
    }, [query]);

    const handleSelect = (loc: LocationItem) => {
        setSelectedLocation(loc);
        setQuery(`${loc.city}, ${loc.country}`);
        setShowResults(false);
    };

    const handleUseCustom = () => {
        if (query.trim()) {
            setSelectedLocation({ city: query.trim(), country: "" });
            setShowResults(false);
        }
    };

    const handleContinue = async () => {
        if (!selectedLocation || !housing || !user) return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                location_city: selectedLocation.city,
                location_country: selectedLocation.country,
                campus: selectedLocation.campus || null,
                housing_status: housing,
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        setSaving(false);

        if (error) {
            toast.error("Failed to save location");
        } else {
            navigate("/interests");
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-5 pb-6">
            {/* Step Indicator */}
            <div className="flex flex-col items-center mt-10 w-full max-w-xs">
                <p className="text-xs font-bold text-foreground tracking-wide">
                    Step 3 of 6
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-primary-btn transition-all duration-500"
                        style={{ width: "50%" }}
                    />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-foreground mt-8 text-center leading-tight">
                What's your <span className="text-primary">housing</span> status?
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center max-w-[280px]">
                Help us find your perfect match
            </p>

            {/* Housing Role Cards */}
            <div className="w-full max-w-sm mt-7 space-y-3">
                {/* Host - I have a place */}
                <button
                    onClick={() => setHousing("host")}
                    className={`
            w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]
            ${housing === "host"
                            ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
          `}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${housing === "host" ? "bg-primary/10" : "bg-gray-100"}`}>
                        <div className="relative">
                            <Home size={22} className={housing === "host" ? "text-primary" : "text-gray-500"} />
                            <Plus size={10} className={`absolute -top-1 -right-1.5 ${housing === "host" ? "text-primary" : "text-gray-400"}`} strokeWidth={3} />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${housing === "host" ? "text-primary" : "text-foreground"}`}>
                            I have a place
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Looking for a roommate to move in
                        </p>
                    </div>
                    {housing === "host" && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* Guest - I need a place */}
                <button
                    onClick={() => setHousing("guest")}
                    className={`
            w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]
            ${housing === "guest"
                            ? "border-secondary bg-secondary/5 shadow-lg shadow-secondary/10"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
          `}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${housing === "guest" ? "bg-secondary/10" : "bg-gray-100"}`}>
                        <BedDouble size={22} className={housing === "guest" ? "text-secondary" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${housing === "guest" ? "text-secondary" : "text-foreground"}`}>
                            I need a place
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Looking for a room or a shared house
                        </p>
                    </div>
                    {housing === "guest" && (
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>

                {/* Co-applicant */}
                <button
                    onClick={() => setHousing("co-applicant")}
                    className={`
            w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 active:scale-[0.98]
            ${housing === "co-applicant"
                            ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                        }
          `}
                >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${housing === "co-applicant" ? "bg-accent/10" : "bg-gray-100"}`}>
                        <Users size={22} className={housing === "co-applicant" ? "text-accent" : "text-gray-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold ${housing === "co-applicant" ? "text-accent" : "text-foreground"}`}>
                            Find a partner to hunt with
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Team up with someone to search together
                        </p>
                    </div>
                    {housing === "co-applicant" && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                    )}
                </button>
            </div>

            {/* Target Area Search (shown after role selected) */}
            {housing && (
                <div className="w-full max-w-sm mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                        Where are you located?
                    </label>
                    <div className="relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Type any city, campus, neighborhood..."
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                setShowResults(true);
                                setSelectedLocation(null);
                            }}
                            onFocus={() => setShowResults(true)}
                            className="w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Search Results + Custom option */}
                    {showResults && query.trim().length > 0 && (
                        <div className="absolute z-10 mt-1 w-[calc(100%-2.5rem)] max-w-sm rounded-xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                            {filtered.map((loc, i) => (
                                <button
                                    key={`${loc.city}-${loc.campus}-${i}`}
                                    onClick={() => handleSelect(loc)}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <MapPin size={14} className="text-secondary mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-foreground">
                                            {loc.city}, {loc.country}
                                        </p>
                                        {loc.campus && (
                                            <p className="text-xs text-muted-foreground">{loc.campus}</p>
                                        )}
                                    </div>
                                </button>
                            ))}
                            {/* Use custom location */}
                            <button
                                onClick={handleUseCustom}
                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left border-t border-gray-100"
                            >
                                <Plus size={14} className="text-primary flex-shrink-0" />
                                <p className="text-sm font-bold text-primary">
                                    Use "{query.trim()}"
                                </p>
                            </button>
                        </div>
                    )}

                    {/* Selected Badge */}
                    {selectedLocation && (
                        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/10 border border-secondary/20 w-fit">
                            <MapPin size={12} className="text-secondary" />
                            <span className="text-xs font-bold text-secondary">
                                {selectedLocation.city}{selectedLocation.country && `, ${selectedLocation.country}`}
                                {selectedLocation.campus && ` · ${selectedLocation.campus}`}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Continue Button */}
            <div className="w-full max-w-sm mt-auto flex flex-col gap-3">
                <button
                    onClick={handleContinue}
                    disabled={!selectedLocation || !housing || saving}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all
                            ${selectedLocation && housing
                            ? "gradient-primary-btn text-primary-foreground shadow-primary/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    {saving ? "Saving..." : "Continue"}
                </button>

                <button
                    onClick={() => navigate("/interests")}
                    className="text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors pb-2"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default LocationScreen;
