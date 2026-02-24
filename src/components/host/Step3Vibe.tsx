import { useState } from "react";
import { Upload, X, Sparkles } from "lucide-react";
import { ListingFormData } from "@/types/host";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface StepProps {
    data: ListingFormData;
    update: (updates: Partial<ListingFormData>) => void;
}

const AMENITIES: { emoji: string; label: string; value: string }[] = [
    { emoji: "🛏", label: "Furnished", value: "Furnished" },
    { emoji: "🪑", label: "Partly Furnished", value: "Partly Furnished" },
    { emoji: "❄️", label: "Air Conditioning", value: "Air Conditioning" },
    { emoji: "💧", label: "Running Water", value: "Running Water" },
    { emoji: "⚡", label: "Generator", value: "Generator" },
    { emoji: "🚿", label: "En-suite Bathroom", value: "En-suite Bathroom" },
    { emoji: "🪟", label: "Balcony / Terrace", value: "Balcony/Terrace" },
    { emoji: "🅿️", label: "Parking", value: "Parking" },
    { emoji: "🔒", label: "Secured Gate", value: "Secured Gate" },
    { emoji: "📹", label: "CCTV", value: "CCTV" },
    { emoji: "🧺", label: "Laundry Access", value: "Laundry Access" },
    { emoji: "🍽️", label: "Kitchen Access", value: "Kitchen Access" },
    { emoji: "☀️", label: "Solar Power", value: "Solar Power" },
    { emoji: "📶", label: "WiFi Included", value: "WiFi Included" },
    { emoji: "🌿", label: "Garden / Yard", value: "Garden/Yard" },
    { emoji: "🧹", label: "Cleaning Included", value: "Cleaning Included" },
];

export default function Step3Vibe({ data, update }: StepProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    const toggleAmenity = (value: string) => {
        const current = data.features ?? [];
        const next = current.includes(value)
            ? current.filter((f) => f !== value)
            : [...current, value];
        update({ features: next });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!user) { toast.error("Please log in to upload images"); return; }

        setUploading(true);
        const file = e.target.files[0];
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${ext}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("listing-images")
                .upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("listing-images")
                .getPublicUrl(filePath);

            update({ image_url: publicUrl });
            toast.success("Cover photo uploaded!");
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    const [uploadingRoom, setUploadingRoom] = useState(false);

    // Convert existing categories from images into a unique list, plus defaults
    const existingCategories = Array.from(new Set(data.images?.map(img => img.category) || []));
    const [customRooms, setCustomRooms] = useState<string[]>([
        "Bedroom", "Kitchen", "Bathroom", "Living Room", ...existingCategories.filter(c => !["Bedroom", "Kitchen", "Bathroom", "Living Room"].includes(c))
    ]);
    const [selectedCategory, setSelectedCategory] = useState(customRooms[0]);

    const addCustomRoom = () => {
        const roomName = prompt("Enter new room name (e.g. Master Bedroom, Balcony):");
        if (roomName && roomName.trim() !== "" && !customRooms.includes(roomName.trim())) {
            const newRoom = roomName.trim();
            setCustomRooms([...customRooms, newRoom]);
            setSelectedCategory(newRoom);
        }
    };

    const deleteCustomRoom = (roomToDelete: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Remove "${roomToDelete}"? This will also remove any photos in this room.`)) {
            const newRooms = customRooms.filter(r => r !== roomToDelete);
            setCustomRooms(newRooms);
            if (selectedCategory === roomToDelete) {
                setSelectedCategory(newRooms[0] || "");
            }
            // Remove associated images
            const remainingImages = (data.images || []).filter(img => img.category !== roomToDelete);
            update({ images: remainingImages });
        }
    };

    const handleRoomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!user) { toast.error("Please log in to upload images"); return; }

        setUploadingRoom(true);
        const file = e.target.files[0];
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/room_${Date.now()}.${ext}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from("listing-images")
                .upload(filePath, file, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from("listing-images")
                .getPublicUrl(filePath);

            const newImages = [...(data.images || []), { url: publicUrl, category: selectedCategory }];
            update({ images: newImages });
            toast.success(`Photo added to ${selectedCategory}!`);
        } catch (err: any) {
            toast.error(err.message || "Upload failed");
        } finally {
            setUploadingRoom(false);
            e.target.value = "";
        }
    };

    const removeRoomImage = (indexToRemove: number) => {
        const nextImages = data.images.filter((_, idx) => idx !== indexToRemove);
        update({ images: nextImages });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Amenities */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">What amenities does your place offer?</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Select everything that applies — students filter by these
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {AMENITIES.map((a) => {
                        const selected = (data.features ?? []).includes(a.value);
                        return (
                            <button
                                key={a.value}
                                type="button"
                                onClick={() => toggleAmenity(a.value)}
                                className={`relative flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 hover:shadow-sm active:scale-[0.98] ${selected
                                        ? "border-gray-900 bg-gray-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                    }`}
                            >
                                <span className="text-xl leading-none">{a.emoji}</span>
                                <span className={`text-sm font-medium leading-tight ${selected ? "text-gray-900" : "text-gray-700"}`}>
                                    {a.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {data.features && data.features.length > 0 && (
                    <p className="text-xs font-bold text-primary ml-1">
                        ✓ {data.features.length} amenit{data.features.length === 1 ? "y" : "ies"} selected
                    </p>
                )}
            </div>

            <hr className="border-gray-200" />

            {/* Photo */}
            <div className="space-y-3">
                <div>
                    <h3 className="text-sm font-semibold text-gray-900">Cover photo</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Listings with a real photo get 5× more interest
                    </p>
                </div>

                {data.image_url && !data.image_url.includes("unsplash") ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video shadow-md">
                        <img src={data.image_url} alt="Cover" className="w-full h-full object-cover" />
                        <button
                            onClick={() => update({ image_url: "" })}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full">
                            ✓ Photo uploaded
                        </div>
                    </div>
                ) : (
                    <label className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                        <div className="p-4 bg-primary/10 text-primary rounded-full">
                            {uploading
                                ? <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
                                : <Upload size={24} />
                            }
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-700">
                                {uploading ? "Uploading..." : "Tap to upload a photo"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG — max 5 MB</p>
                        </div>
                    </label>
                )}

                {/* Placeholder fallbacks */}
                {(!data.image_url || data.image_url.includes("unsplash")) && (
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Or use a placeholder
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                                "https://images.unsplash.com/photo-1600596542815-225bad65dbd8",
                            ].map((img, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => update({ image_url: img })}
                                    className={`rounded-xl overflow-hidden h-20 border-2 transition-all ${data.image_url === img ? "border-primary" : "border-transparent opacity-60 hover:opacity-80"
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt="Room" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <hr className="border-gray-100" />

            {/* Additional Room Photos */}
            <div className="space-y-3">
                <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Upload size={18} className="text-primary" /> Gallery Photos
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                        Add more photos to show different rooms like kitchen, bathroom, etc.
                    </p>
                </div>

                <div className="bg-white border text-gray-900 border-gray-200 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm min-h-[400px]">

                    {/* Left Sidebar: Room List */}
                    <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50 flex flex-col">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-100/50">
                            <span className="font-bold text-sm text-gray-700">Spaces</span>
                            <button
                                onClick={addCustomRoom}
                                className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                            >
                                + Add Space
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1">
                            {customRooms.map(room => {
                                const photoCount = (data.images || []).filter(img => img.category === room).length;
                                return (
                                    <div
                                        key={room}
                                        onClick={() => setSelectedCategory(room)}
                                        className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${selectedCategory === room
                                            ? 'bg-primary text-white shadow-md'
                                            : 'hover:bg-gray-200/50 text-gray-700'
                                            }`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-sm">{room}</span>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 ${selectedCategory === room ? 'text-white/80' : 'text-gray-400'}`}>
                                                {photoCount} photo{photoCount !== 1 && 's'}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => deleteCustomRoom(room, e)}
                                            className={`p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${selectedCategory === room ? 'hover:bg-white/20' : 'hover:bg-red-100 text-red-500'
                                                }`}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Right Canvas: Photo Upload & Grid */}
                    <div className="w-full md:w-2/3 p-4 flex flex-col bg-white">
                        {selectedCategory ? (
                            <>
                                <div className="mb-4 flex items-center justify-between">
                                    <h4 className="font-bold text-lg text-gray-800">{selectedCategory} Photos</h4>
                                    <span className="text-xs font-bold text-gray-400">Drag & drop supported</span>
                                </div>

                                <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer bg-gray-50/50">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleRoomImageUpload}
                                        disabled={uploadingRoom}
                                        className="hidden"
                                    />
                                    <div className="p-3 bg-white shadow-sm text-primary rounded-full">
                                        {uploadingRoom
                                            ? <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                                            : <Upload size={20} />
                                        }
                                    </div>
                                    <div className="text-center">
                                        <p className="font-bold text-sm text-gray-700">
                                            {uploadingRoom ? "Uploading..." : "Click to upload"}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">JPG, PNG up to 5MB</p>
                                    </div>
                                </label>

                                {/* Grid of uploaded room images */}
                                {data.images && data.images.filter(img => img.category === selectedCategory).length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                                        {data.images.map((img, idx) => {
                                            if (img.category !== selectedCategory) return null;
                                            return (
                                                <div key={idx} className="group relative rounded-lg overflow-hidden aspect-square border-2 border-gray-100 shadow-sm transition-all hover:border-primary/30 hover:shadow-md">
                                                    <img src={img.url} alt={img.category} className="w-full h-full object-cover" />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRoomImage(idx)}
                                                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 mt-4 border-2 border-dashed border-transparent rounded-xl">
                                        <Sparkles size={24} className="mb-2 opacity-50 text-gray-300" />
                                        <p className="text-sm font-medium text-gray-500">No photos yet</p>
                                        <p className="text-xs mt-1">Add beautiful photos to make this room stand out</p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400">
                                <p className="font-medium">Select or create a space to add photos.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
