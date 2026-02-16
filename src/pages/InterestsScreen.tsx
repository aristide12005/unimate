import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Interest {
    id: string;
    label: string;
    emoji: string;
    color: string;
    selectedColor: string;
}

const INTERESTS: Interest[] = [
    { id: "sports", label: "Sports", emoji: "⚽", color: "bg-orange-100 text-orange-700 border-orange-200", selectedColor: "bg-orange-400 text-white border-orange-400" },
    { id: "music", label: "Music", emoji: "🎵", color: "bg-pink-100 text-pink-700 border-pink-200", selectedColor: "bg-pink-400 text-white border-pink-400" },
    { id: "reading", label: "Reading", emoji: "📚", color: "bg-amber-100 text-amber-700 border-amber-200", selectedColor: "bg-amber-400 text-white border-amber-400" },
    { id: "movies", label: "Movies & TV", emoji: "🎬", color: "bg-purple-100 text-purple-700 border-purple-200", selectedColor: "bg-purple-400 text-white border-purple-400" },
    { id: "travel", label: "Travel", emoji: "✈️", color: "bg-rose-100 text-rose-700 border-rose-200", selectedColor: "bg-rose-400 text-white border-rose-400" },
    { id: "fitness", label: "Yoga & Fitness", emoji: "🧘", color: "bg-teal-100 text-teal-700 border-teal-200", selectedColor: "bg-teal-400 text-white border-teal-400" },
    { id: "gadgets", label: "Gadgets", emoji: "🎮", color: "bg-violet-100 text-violet-700 border-violet-200", selectedColor: "bg-violet-400 text-white border-violet-400" },
    { id: "pets", label: "Pets", emoji: "🐾", color: "bg-cyan-100 text-cyan-700 border-cyan-200", selectedColor: "bg-cyan-400 text-white border-cyan-400" },
    { id: "volunteering", label: "Volunteering", emoji: "💚", color: "bg-green-100 text-green-700 border-green-200", selectedColor: "bg-green-400 text-white border-green-400" },
    { id: "coffee", label: "Coffee Lover", emoji: "☕", color: "bg-orange-100 text-orange-700 border-orange-200", selectedColor: "bg-orange-400 text-white border-orange-400" },
    { id: "outdoors", label: "Outdoors", emoji: "🌿", color: "bg-emerald-100 text-emerald-700 border-emerald-200", selectedColor: "bg-emerald-400 text-white border-emerald-400" },
    { id: "languages", label: "Languages", emoji: "🌍", color: "bg-blue-100 text-blue-700 border-blue-200", selectedColor: "bg-blue-400 text-white border-blue-400" },
    { id: "writing", label: "Writing", emoji: "✍️", color: "bg-rose-100 text-rose-700 border-rose-200", selectedColor: "bg-rose-400 text-white border-rose-400" },
    { id: "cooking", label: "Cooking", emoji: "🍳", color: "bg-amber-100 text-amber-700 border-amber-200", selectedColor: "bg-amber-400 text-white border-amber-400" },
    { id: "gaming", label: "Gaming", emoji: "🕹️", color: "bg-indigo-100 text-indigo-700 border-indigo-200", selectedColor: "bg-indigo-400 text-white border-indigo-400" },
    { id: "art", label: "Art & Design", emoji: "🎨", color: "bg-pink-100 text-pink-700 border-pink-200", selectedColor: "bg-pink-400 text-white border-pink-400" },
    { id: "photography", label: "Photography", emoji: "📸", color: "bg-slate-100 text-slate-700 border-slate-200", selectedColor: "bg-slate-400 text-white border-slate-400" },
];

// Diamond layout: rows with increasing then decreasing items
const LAYOUT_ROWS = [1, 2, 2, 3, 3, 2, 2, 1, 1];

const InterestsScreen = () => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("interests")
                .eq("user_id", user.id)
                .single();

            if (data?.interests && !error) {
                setSelected(new Set(data.interests));
            }
        };
        fetchProfile();
    }, [user]);

    const toggleInterest = (id: string) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleContinue = async () => {
        if (selected.size < 3 || !user) return;
        setSaving(true);

        const { error } = await supabase
            .from("profiles")
            .update({
                interests: Array.from(selected),
                updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id);

        setSaving(false);

        if (error) {
            toast.error("Failed to save interests");
        } else {
            navigate("/username");
        }
    };

    // Build rows from the layout
    let idx = 0;
    const rows: Interest[][] = [];
    for (const count of LAYOUT_ROWS) {
        if (idx >= INTERESTS.length) break;
        rows.push(INTERESTS.slice(idx, idx + count));
        idx += count;
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-5">
            {/* Step Indicator */}
            <div className="flex flex-col items-center mt-10 w-full max-w-xs">
                <p className="text-xs font-bold text-foreground tracking-wide">
                    Step 4 of 6
                </p>
                <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                        className="h-full rounded-full gradient-primary-btn transition-all duration-500"
                        style={{ width: "66%" }}
                    />
                </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-black text-foreground mt-8 text-center leading-tight">
                What makes you, <span className="text-primary">YOU</span>?
            </h1>
            <p className="text-sm text-muted-foreground mt-2 text-center">
                Pick your vibes (select all that apply)
            </p>

            {/* Interest Tags - Diamond Layout */}
            <div className="flex flex-col items-center gap-2.5 mt-8 flex-1 w-full overflow-y-auto pb-4">
                {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className="flex items-center justify-center gap-2.5 flex-wrap">
                        {row.map((interest) => {
                            const isSelected = selected.has(interest.id);
                            return (
                                <button
                                    key={interest.id}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={`
                    flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold
                    border transition-all duration-200 active:scale-95
                    ${isSelected ? interest.selectedColor : interest.color}
                    ${isSelected ? "shadow-md" : "shadow-sm hover:shadow-md"}
                  `}
                                >
                                    <span className="text-base">{interest.emoji}</span>
                                    <span>{interest.label}</span>
                                    {isSelected && (
                                        <Check size={14} className="ml-0.5" strokeWidth={3} />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Continue Button */}
            <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
                <button
                    onClick={handleContinue}
                    disabled={selected.size < 3 || saving}
                    className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all
                            ${selected.size >= 3
                            ? "gradient-primary-btn text-primary-foreground shadow-primary/25"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                        }`}
                >
                    {saving ? "Saving..." : "Continue"}
                </button>

                <button
                    onClick={() => navigate("/username")}
                    className="text-gray-400 font-medium text-sm hover:text-gray-600 transition-colors pb-2"
                >
                    Skip for now
                </button>
            </div>
        </div>
    );
};

export default InterestsScreen;

