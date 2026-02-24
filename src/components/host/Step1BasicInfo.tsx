import { useEffect } from "react";
import { MapPin, FileText, Sparkles } from "lucide-react";
import { ListingFormData } from "@/types/host";

interface StepProps {
    data: ListingFormData;
    update: (updates: Partial<ListingFormData>) => void;
}

// ─── Auto-title generator ────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
    "Room": "Chambre",
    "Shared Room": "Chambre partagée",
    "Studio": "Studio",
    "Apartment": "Appartement",
    "En-suite": "Chambre en-suite",
};

const FEATURE_WORDS: { key: string; word: string }[] = [
    { key: "Furnished", word: "meublé(e)" },
    { key: "Air Conditioning", word: "climatisé(e)" },
    { key: "En-suite Bathroom", word: "avec SdB privée" },
    { key: "WiFi Included", word: "avec WiFi" },
    { key: "Generator", word: "avec groupe électrogène" },
    { key: "Running Water", word: "eau courante" },
    { key: "Secured Gate", word: "sécurisé(e)" },
];

function generateTitle(type: string, location: string, features: string[]): string {
    const base = TYPE_LABELS[type] ?? "Chambre";
    const neighborhood = location.replace(/,?\s*dakar\s*$/i, "").trim();
    const descriptors = FEATURE_WORDS
        .filter(f => features.includes(f.key))
        .slice(0, 2)
        .map(f => f.word);
    let title = base;
    if (descriptors.length) title += " " + descriptors.join(", ");
    if (neighborhood) title += " à " + neighborhood;
    return title;
}
// ─────────────────────────────────────────────────────────────────────────────

const ROOM_TYPES = [
    { value: "Room", label: "Private Room", desc: "A room all to yourself", emoji: "🚪" },
    { value: "Shared Room", label: "Shared Room", desc: "A bed in a shared space", emoji: "👥" },
    { value: "Studio", label: "Studio", desc: "Self-contained unit", emoji: "🏠" },
    { value: "Apartment", label: "Full Apartment", desc: "The entire place", emoji: "🏢" },
    { value: "En-suite", label: "En-suite", desc: "Room with private bath", emoji: "🛁" },
];

const DAKAR_NEIGHBORHOODS = [
    "Almadies", "Mermoz", "Sacré-Cœur", "Ouakam", "Yoff",
    "Plateau", "Liberté 6", "HLM", "Grand Yoff", "Point E",
    "Fann", "Médina", "Parcelles Assainies", "Ngor", "Dakar Ponty",
];

export default function Step1BasicInfo({ data, update }: StepProps) {

    // Auto-generate title when it's empty (user hasn't typed their own)
    useEffect(() => {
        if (data.title.trim()) return; // don't overwrite custom titles
        const suggested = generateTitle(data.type, data.location, data.features ?? []);
        if (suggested !== TYPE_LABELS[data.type]) {
            update({ title: suggested });
        }
    }, [data.type, data.location, data.features]);

    const handleSuggest = () => {
        const suggested = generateTitle(data.type, data.location, data.features ?? []);
        update({ title: suggested });
    };

    const handleNeighborhood = (nb: string) => {
        update({ location: nb + ", Dakar" });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* ─── Room Type Selection (Airbnb-style big cards) ─── */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900">
                    Which of these best describes your place?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ROOM_TYPES.map(rt => {
                        const selected = data.type === rt.value;
                        return (
                            <button
                                key={rt.value}
                                type="button"
                                onClick={() => update({ type: rt.value })}
                                className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md active:scale-[0.98] ${selected
                                        ? "border-gray-900 bg-gray-50 shadow-sm"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                            >
                                <span className="text-2xl mb-3 block">{rt.emoji}</span>
                                <p className={`text-sm font-bold leading-tight ${selected ? "text-gray-900" : "text-gray-800"}`}>
                                    {rt.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{rt.desc}</p>
                                {selected && (
                                    <div className="absolute top-4 right-4 w-5 h-5 bg-gray-900 rounded-full flex items-center justify-center">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ─── Location ─── */}
            <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" /> Where's your place located?
                </label>
                <div className="flex flex-wrap gap-2">
                    {DAKAR_NEIGHBORHOODS.map(nb => {
                        const isSelected = data.location.startsWith(nb);
                        return (
                            <button
                                key={nb}
                                type="button"
                                onClick={() => handleNeighborhood(nb)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:shadow-sm"
                                    }`}
                            >
                                {nb}
                            </button>
                        );
                    })}
                </div>
                <input
                    type="text"
                    value={data.location}
                    onChange={(e) => update({ location: e.target.value })}
                    placeholder="Or type a custom location…"
                    className="w-full px-4 py-4 rounded-xl bg-white border border-gray-300 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder:text-gray-400 text-sm"
                />
            </div>

            {/* ─── Title & Price ─── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold text-gray-900">Title your listing</label>
                        <button
                            type="button"
                            onClick={handleSuggest}
                            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            <Sparkles size={12} />
                            Suggest
                        </button>
                    </div>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => update({ title: e.target.value })}
                        placeholder="Auto-generated from your details…"
                        maxLength={80}
                        className="w-full px-4 py-4 rounded-xl bg-white border border-gray-300 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder:text-gray-400 text-sm"
                    />
                    <p className="text-xs text-gray-400">{data.title.length}/80 characters</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-900">Monthly rent</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                            FCFA
                        </span>
                        <input
                            type="number"
                            value={data.price || ""}
                            onChange={(e) => update({ price: Number(e.target.value) })}
                            placeholder="80,000"
                            min={0}
                            className="w-full pl-16 pr-4 py-4 rounded-xl bg-white border border-gray-300 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all font-semibold text-gray-900 placeholder:text-gray-400 text-sm"
                        />
                    </div>
                    {data.price > 0 && (
                        <p className="text-sm font-semibold text-primary">
                            {data.price.toLocaleString("fr-SN")} FCFA / month
                        </p>
                    )}
                    <p className="text-xs text-gray-400">Typical range: 60,000–200,000 FCFA/mo</p>
                </div>
            </div>

            {/* ─── Description ─── */}
            <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <FileText size={16} className="text-primary" /> Describe your place
                </label>
                <textarea
                    rows={5}
                    value={data.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Share what makes your place unique — proximity to campus, quiet neighbourhood, natural light, etc."
                    className="w-full px-4 py-4 rounded-xl bg-white border border-gray-300 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-all text-gray-900 placeholder:text-gray-400 text-sm resize-none leading-relaxed"
                />
                <p className="text-xs text-gray-400">Mention proximity to universities, transport, and key features</p>
            </div>
        </div>
    );
}
