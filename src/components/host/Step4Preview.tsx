import { ListingFormData } from "@/types/host";
import { MapPin, CheckCircle2, Circle, Phone, Calendar } from "lucide-react";

interface StepProps {
    data: ListingFormData;
}

const UTILITY_LABELS: Record<string, string> = {
    included: "Included in rent",
    split_percentage: "Split equally",
    metered: "Pay per use",
    fixed_monthly: "Fixed amount",
};

function Check({ ok, label }: { ok: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 text-sm ${ok ? "text-green-700" : "text-gray-400"}`}>
            {ok
                ? <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                : <Circle size={16} className="shrink-0" />
            }
            <span className={ok ? "font-semibold" : ""}>{label}</span>
        </div>
    );
}

export default function Step4Preview({ data }: StepProps) {
    const hasPhoto = !!data.image_url;
    const hasTitle = data.title.trim().length >= 5;
    const hasPrice = data.price > 0;
    const hasLocation = data.location.trim().length >= 3;
    const hasDescription = data.description.trim().length >= 20;
    const hasFeatures = (data.features?.length ?? 0) > 0;
    const hasPhone = (data.contact_phone?.length ?? 0) >= 8;

    const ready = hasPhoto && hasTitle && hasPrice && hasLocation && hasDescription;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

            {/* Readiness Checklist */}
            <div className={`p-4 rounded-2xl border-2 space-y-2 ${ready ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                <h3 className={`font-black text-sm uppercase tracking-wider mb-3 ${ready ? "text-green-700" : "text-amber-700"}`}>
                    {ready ? "✓ Ready to publish!" : "Complete your listing"}
                </h3>
                <Check ok={hasTitle} label="Listing title" />
                <Check ok={hasPrice} label="Monthly rent (FCFA)" />
                <Check ok={hasLocation} label="Neighbourhood" />
                <Check ok={hasDescription} label="Description (min 20 chars)" />
                <Check ok={hasPhoto} label="Cover photo" />
                <Check ok={hasFeatures} label="Amenities selected" />
                <Check ok={hasPhone} label="WhatsApp contact" />
            </div>

            {/* Listing Card Preview */}
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview</p>
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">

                    {/* Photo */}
                    <div className="aspect-video relative bg-gray-100">
                        {hasPhoto ? (
                            <img src={data.image_url} alt={data.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📷</div>
                        )}
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-black">
                            {data.price > 0 ? `${data.price.toLocaleString("fr-SN")} FCFA / mois` : "Price not set"}
                        </div>
                    </div>

                    <div className="p-5 space-y-4">
                        {/* Type + Title + Location */}
                        <div>
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{data.type}</span>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
                                {data.title || <span className="text-gray-300 italic">No title yet</span>}
                            </h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                                <MapPin size={13} />
                                {data.location || <span className="italic text-gray-300">No location</span>}
                            </div>
                        </div>

                        {/* Description */}
                        {data.description && (
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                                {data.description}
                            </p>
                        )}

                        {/* Amenities */}
                        {hasFeatures && (
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amenities</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.features.map((f) => (
                                        <span key={f} className="px-2.5 py-1 bg-primary/8 text-primary text-xs font-bold rounded-full border border-primary/20">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <hr className="border-gray-100" />

                        {/* Utilities snapshot */}
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Utilities</p>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: "⚡ Electricity", val: data.housing_rules.utility_modes.electricity },
                                    { label: "💧 Water", val: data.housing_rules.utility_modes.water },
                                    { label: "📶 WiFi", val: data.housing_rules.utility_modes.wifi },
                                ].map(({ label, val }) => (
                                    <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                                        <p className="text-[10px] font-bold text-gray-400 mb-1">{label}</p>
                                        <p className="text-[11px] font-bold text-gray-700 leading-tight">
                                            {UTILITY_LABELS[val] ?? val}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact */}
                        {(data.contact_phone || data.available_from) && (
                            <>
                                <hr className="border-gray-100" />
                                <div className="flex items-center gap-4 text-sm">
                                    {data.contact_phone && (
                                        <div className="flex items-center gap-1.5 text-green-600 font-semibold">
                                            <Phone size={13} />
                                            {data.contact_phone}
                                        </div>
                                    )}
                                    {data.available_from && (
                                        <div className="flex items-center gap-1.5 text-gray-500 font-semibold">
                                            <Calendar size={13} />
                                            From {new Date(data.available_from).toLocaleDateString("fr-SN", { day: "numeric", month: "short" })}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
