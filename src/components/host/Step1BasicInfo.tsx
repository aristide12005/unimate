
import { Home, DollarSign, MapPin, FileText } from "lucide-react";
import { ListingFormData } from "@/types/host";

interface StepProps {
    data: ListingFormData;
    update: (updates: Partial<ListingFormData>) => void;
}

export default function Step1BasicInfo({ data, update }: StepProps) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Title */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">Title</label>
                <input
                    required
                    type="text"
                    value={data.title}
                    onChange={(e) => update({ title: e.target.value })}
                    placeholder="e.g. Sunny Room near ISM"
                    className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 ml-1">Catchy titles attract 3x more students.</p>
            </div>

            {/* Type & Price Row */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <Home size={16} className="text-primary" /> Type
                    </label>
                    <div className="relative">
                        <select
                            value={data.type}
                            onChange={(e) => update({ type: e.target.value })}
                            className="w-full px-4 py-4 rounded-xl bg-white border-2 border-gray-100 outline-none focus:border-primary transition-all font-medium text-gray-900 appearance-none"
                        >
                            <option value="Room">Private Room</option>
                            <option value="Studio">Studio</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Shared Room">Shared Room</option>
                        </select>
                        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                        <DollarSign size={16} className="text-primary" /> Monthly Rent
                    </label>
                    <input
                        required
                        type="number"
                        value={data.price || ''}
                        onChange={(e) => update({ price: Number(e.target.value) })}
                        placeholder="150000"
                        className="w-full px-4 py-4 rounded-xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <MapPin size={16} className="text-primary" /> Location
                </label>
                <input
                    required
                    type="text"
                    value={data.location}
                    onChange={(e) => update({ location: e.target.value })}
                    placeholder="e.g. Mermoz, Dakar"
                    className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                />
            </div>

            {/* Description */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-2">
                    <FileText size={16} className="text-primary" /> Description
                </label>
                <textarea
                    required
                    rows={5}
                    value={data.description}
                    onChange={(e) => update({ description: e.target.value })}
                    placeholder="Describe the vibe of the house..."
                    className="w-full px-4 py-4 rounded-2xl bg-white border-2 border-gray-100 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none leading-relaxed"
                />
            </div>
        </div>
    );
}
