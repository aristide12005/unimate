import { Zap, Droplets, Wifi, Globe, Heart, Phone, Calendar } from "lucide-react";
import { ListingFormData, HousingRules } from "@/types/host";

interface StepProps {
    data: ListingFormData;
    update: (updates: Partial<ListingFormData>) => void;
}

export default function Step2Arrangement({ data, update }: StepProps) {
    const rules = data.housing_rules;

    const updateRules = (updates: Partial<HousingRules>) => {
        update({ housing_rules: { ...rules, ...updates } });
    };

    const toggleSpace = (type: "shared" | "private", space: string) => {
        const list = type === "shared" ? rules.shared_spaces : rules.private_spaces;
        const newList = list.includes(space)
            ? list.filter((s) => s !== space)
            : [...list, space];
        if (type === "shared") updateRules({ shared_spaces: newList });
        else updateRules({ private_spaces: newList });
    };

    const SHARED_SPACES = ["Kitchen", "Living Room", "Bathroom", "Balcony", "Garden", "Terrace", "Laundry"];
    const PRIVATE_SPACES = ["Bedroom", "Bathroom", "Study Room", "Balcony"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

            {/* Contact & Availability */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Phone size={18} className="text-green-500" /> Contact & Availability
                </h3>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                            WhatsApp Number
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">
                                +221
                            </span>
                            <input
                                type="tel"
                                value={data.contact_phone?.replace("+221", "") ?? ""}
                                onChange={(e) =>
                                    update({ contact_phone: "+221" + e.target.value.replace(/\D/g, "") })
                                }
                                placeholder="77 123 45 67"
                                maxLength={12}
                                className="w-full pl-14 pr-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <p className="text-xs text-gray-400 ml-1">Students will contact you directly on WhatsApp</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                            <Calendar size={12} /> Available From
                        </label>
                        <input
                            type="date"
                            value={data.available_from ?? ""}
                            onChange={(e) => update({ available_from: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 text-sm"
                        />
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Shared vs Private */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Heart size={18} className="text-rose-500" /> What's Shared vs. Private?
                </h3>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Shared with housemates
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SHARED_SPACES.map((space) => (
                            <button
                                key={`shared-${space}`}
                                type="button"
                                onClick={() => toggleSpace("shared", space)}
                                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all border ${rules.shared_spaces.includes(space)
                                        ? "bg-blue-100 text-blue-700 border-blue-200"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {space}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Your private spaces
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {PRIVATE_SPACES.map((space) => (
                            <button
                                key={`private-${space}`}
                                type="button"
                                onClick={() => toggleSpace("private", space)}
                                className={`px-3.5 py-2 rounded-full text-sm font-semibold transition-all border ${rules.private_spaces.includes(space)
                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                        : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {space}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Utilities */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Utilities — Who Pays?
                </h3>

                <div className="grid gap-3">
                    {[
                        {
                            icon: <Zap size={18} />,
                            bg: "bg-amber-50",
                            color: "text-amber-600",
                            label: "Electricity (SENELEC)",
                            key: "electricity" as const,
                            options: [
                                { val: "included", label: "Included in rent" },
                                { val: "split_percentage", label: "Split equally" },
                                { val: "metered", label: "Pay per use (compteur)" },
                            ],
                        },
                        {
                            icon: <Droplets size={18} />,
                            bg: "bg-blue-50",
                            color: "text-blue-600",
                            label: "Water (SDE)",
                            key: "water" as const,
                            options: [
                                { val: "included", label: "Included in rent" },
                                { val: "fixed_monthly", label: "Fixed amount/month" },
                                { val: "split_percentage", label: "Split equally" },
                            ],
                        },
                        {
                            icon: <Wifi size={18} />,
                            bg: "bg-indigo-50",
                            color: "text-indigo-600",
                            label: "WiFi / Internet",
                            key: "wifi" as const,
                            options: [
                                { val: "included", label: "Included in rent" },
                                { val: "split_percentage", label: "Split equally" },
                                { val: "fixed_monthly", label: "Fixed amount/month" },
                            ],
                        },
                    ].map(({ icon, bg, color, label, key, options }) => (
                        <div
                            key={key}
                            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 ${bg} ${color} rounded-xl`}>{icon}</div>
                                    <span className="font-semibold text-gray-700 text-sm">{label}</span>
                                </div>
                                <select
                                    value={rules.utility_modes[key]}
                                    onChange={(e) =>
                                        updateRules({
                                            utility_modes: {
                                                ...rules.utility_modes,
                                                [key]: e.target.value as any,
                                            },
                                        })
                                    }
                                    className="text-xs font-bold border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:border-primary max-w-[140px]"
                                >
                                    {options.map((o) => (
                                        <option key={o.val} value={o.val}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Languages */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={18} className="text-purple-500" /> Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                    {["Wolof", "French", "English", "Arabic", "Pulaar", "Sérère"].map((lang) => (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => {
                                const langs = rules.host_preferences.languages;
                                const newLangs = langs.includes(lang)
                                    ? langs.filter((l) => l !== lang)
                                    : [...langs, lang];
                                updateRules({
                                    host_preferences: { ...rules.host_preferences, languages: newLangs },
                                });
                            }}
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition-all ${rules.host_preferences.languages.includes(lang)
                                    ? "bg-purple-100 text-purple-700 border-purple-200"
                                    : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-gray-400">Wolof is the most spoken language in Dakar</p>
            </div>
        </div>
    );
}
