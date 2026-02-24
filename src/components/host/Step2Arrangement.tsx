import { FileText, Phone, Calendar } from "lucide-react";
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

            {/* Terms and Conditions */}
            <div className="space-y-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <FileText size={18} className="text-primary" /> My Terms & Conditions
                </h3>

                <div className="space-y-1.5 relative">
                    <textarea
                        value={rules.custom_terms || ""}
                        onChange={(e) => updateRules({ custom_terms: e.target.value })}
                        placeholder="I want a roommate where we share rent 50%...

Here are my rules:
- No loud music after 10 PM
- We alternate cleaning the kitchen"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-400 text-sm min-h-[200px] resize-y leading-relaxed"
                    />
                    <div className="absolute right-4 bottom-4 text-xs font-bold text-gray-400 bg-white/80 px-2 py-1 rounded backdrop-blur-sm">
                        {rules.custom_terms?.length || 0} / 1000
                    </div>
                </div>
                <p className="text-xs text-gray-400 ml-1">
                    Describe how rent, utilities, and chores are divided. Make it clear and friendly!
                </p>
            </div>

        </div>
    );
}
