
import { Zap, Droplets, Wifi, Globe, Heart } from "lucide-react";
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

    const toggleSpace = (type: 'shared' | 'private', space: string) => {
        const list = type === 'shared' ? rules.shared_spaces : rules.private_spaces;
        const newList = list.includes(space)
            ? list.filter(s => s !== space)
            : [...list, space];

        if (type === 'shared') updateRules({ shared_spaces: newList });
        else updateRules({ private_spaces: newList });
    };

    const SPACES = ['Kitchen', 'Living Room', 'Bathroom', 'Balcony', 'Garden'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">

            {/* Introduction */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h3 className="font-bold text-primary mb-1">Define The Arrangement</h3>
                <p className="text-sm text-gray-600">Clear boundaries make great roommates. Be specific.</p>
            </div>

            {/* Shared vs Private */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Heart size={18} className="text-rose-500" /> Shared vs. Private
                </h3>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Shared Spaces</label>
                    <div className="flex flex-wrap gap-2">
                        {SPACES.map(space => (
                            <button
                                key={`shared-${space}`}
                                onClick={() => toggleSpace('shared', space)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${rules.shared_spaces.includes(space)
                                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {space}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Private Spaces</label>
                    <div className="flex flex-wrap gap-2">
                        {['Bedroom', 'Bathroom', 'Study'].map(space => (
                            <button
                                key={`private-${space}`}
                                onClick={() => toggleSpace('private', space)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${rules.private_spaces.includes(space)
                                        ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-200'
                                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
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
                    <Zap size={18} className="text-amber-500" /> Utilities
                </h3>

                <div className="grid gap-4">
                    {/* Electricity */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Zap size={20} /></div>
                            <span className="font-medium text-gray-700">Electricity</span>
                        </div>
                        <select
                            value={rules.utility_modes.electricity}
                            onChange={(e) => updateRules({
                                utility_modes: { ...rules.utility_modes, electricity: e.target.value as any }
                            })}
                            className="text-sm border-none bg-gray-50 rounded-lg px-3 py-2 font-medium text-gray-600 focus:ring-0"
                        >
                            <option value="included">Included</option>
                            <option value="split_percentage">Split Bill</option>
                            <option value="metered">Metered (Pay per use)</option>
                        </select>
                    </div>

                    {/* Water */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Droplets size={20} /></div>
                            <span className="font-medium text-gray-700">Water</span>
                        </div>
                        <select
                            value={rules.utility_modes.water}
                            onChange={(e) => updateRules({
                                utility_modes: { ...rules.utility_modes, water: e.target.value as any }
                            })}
                            className="text-sm border-none bg-gray-50 rounded-lg px-3 py-2 font-medium text-gray-600 focus:ring-0"
                        >
                            <option value="included">Included</option>
                            <option value="fixed_monthly">Fixed Amount</option>
                            <option value="split_percentage">Split Bill</option>
                        </select>
                    </div>

                    {/* WiFi */}
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Wifi size={20} /></div>
                            <span className="font-medium text-gray-700">WiFi</span>
                        </div>
                        <select
                            value={rules.utility_modes.wifi}
                            onChange={(e) => updateRules({
                                utility_modes: { ...rules.utility_modes, wifi: e.target.value as any }
                            })}
                            className="text-sm border-none bg-gray-50 rounded-lg px-3 py-2 font-medium text-gray-600 focus:ring-0"
                        >
                            <option value="included">Included</option>
                            <option value="split_percentage">Split Bill</option>
                        </select>
                    </div>
                </div>
            </div>

            <hr className="border-gray-100" />

            {/* Languages */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={18} className="text-purple-500" /> Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                    {['English', 'French', 'Wolof', 'Spanish', 'Arabic'].map(lang => (
                        <button
                            key={lang}
                            onClick={() => {
                                const langs = rules.host_preferences.languages;
                                const newLangs = langs.includes(lang) ? langs.filter(l => l !== lang) : [...langs, lang];
                                updateRules({ host_preferences: { ...rules.host_preferences, languages: newLangs } });
                            }}
                            className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${rules.host_preferences.languages.includes(lang)
                                    ? 'bg-purple-100 text-purple-700 border-purple-200'
                                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

        </div>
    );
}
