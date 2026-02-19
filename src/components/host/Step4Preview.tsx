
import { ListingFormData } from "@/types/host";
import { MapPin, Home, Check } from "lucide-react";

interface StepProps {
    data: ListingFormData;
}

export default function Step4Preview({ data }: StepProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-gray-900">Is this correct?</h2>
                <p className="text-gray-500 text-sm">Review your listing before publishing.</p>
            </div>

            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
                <div className="aspect-video relative">
                    <img src={data.image_url} alt="Cover" className="w-full h-full object-cover" />
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold">
                        {data.price.toLocaleString()} FCFA / month
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{data.type}</span>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{data.title}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                            <MapPin size={14} /> {data.location}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Arrangement Snapshot */}
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-900">The Arrangement</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 p-3 rounded-xl">
                                <span className="block text-xs text-gray-400 mb-1">Shared</span>
                                <div className="flex flex-wrap gap-1">
                                    {data.housing_rules.shared_spaces.map(s => (
                                        <span key={s} className="font-medium text-gray-700">{s}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-emerald-50 p-3 rounded-xl">
                                <span className="block text-xs text-emerald-600/70 mb-1">Private</span>
                                <div className="flex flex-wrap gap-1">
                                    {data.housing_rules.private_spaces.map(s => (
                                        <span key={s} className="font-medium text-emerald-900">{s}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl text-xs space-y-1">
                            <div className="flex justify-between">
                                <span className="text-amber-700/70">Electricity</span>
                                <span className="font-bold text-amber-900 uppercase">{data.housing_rules.utility_modes.electricity.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-700/70">Water</span>
                                <span className="font-bold text-amber-900 uppercase">{data.housing_rules.utility_modes.water.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-700/70">WiFi</span>
                                <span className="font-bold text-amber-900 uppercase">{data.housing_rules.utility_modes.wifi.replace('_', ' ')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
