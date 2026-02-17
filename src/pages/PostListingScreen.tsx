
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Check, Home, DollarSign, MapPin, FileText, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const PostListingScreen = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [type, setType] = useState("Room");
    const [price, setPrice] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState("");
    const [features, setFeatures] = useState<string[]>([]);
    // Using a set of default images for now as agreed
    const [image, setImage] = useState("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!profile) {
            toast.error("Profile not found. Please try refreshing the page.");
            return;
        }

        setLoading(true);

        try {
            // 2. Insert Listing with Profile ID
            const { error } = await supabase
                .from('listings')
                .insert({
                    title,
                    type,
                    price,
                    location,
                    description,
                    features, // Save amenities
                    image,
                    author_id: profile.id, // Use Profile ID, not Auth ID
                    created_at: new Date().toISOString()
                });

            if (error) throw error;

            toast.success("Listing published successfully!");
            navigate("/profile");

        } catch (error: any) {
            console.error("Error posting listing:", error);
            toast.error(error.message || "Failed to publish listing.");
        } finally {
            setLoading(false);
        }
    };

    const STOCK_IMAGES = [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
        "https://images.unsplash.com/photo-1600596542815-225bad65dbd8",
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c"
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-10">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white px-4 py-3 flex items-center gap-3 border-b border-gray-100 shadow-sm">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-gray-900">Post a Room</h1>
            </div>

            <form onSubmit={handleSubmit} className="px-5 pt-6 space-y-6">

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Title</label>
                    <input
                        required
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Cozy Room in Downtown"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                {/* Type & Price Row */}
                <div className="flex gap-4">
                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                            <Home size={14} /> Type
                        </label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 appearance-none"
                        >
                            <option value="Room">Room</option>
                            <option value="Studio">Studio</option>
                            <option value="Apartment">Apartment</option>
                            <option value="Coloc">Coloc</option>
                        </select>
                    </div>

                    <div className="space-y-2 flex-1">
                        <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                            <DollarSign size={14} /> Price
                        </label>
                        <input
                            required
                            type="text"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="e.g. 150.000"
                            className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                        <MapPin size={14} /> Location
                    </label>
                    <input
                        required
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Mermoz, Dakar"
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                        <FileText size={14} /> Description
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the room, amenities, and what you are looking for..."
                        className="w-full px-4 py-3.5 rounded-2xl bg-white border border-gray-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-400 resize-none"
                    />
                </div>

                {/* Amenities */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                        <Sparkles size={14} /> Amenities
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {['WiFi', 'AC', 'Private Bathroom', 'Furnished', 'Non-Smoker', 'No Pets', 'Security', 'Terrace'].map(feat => (
                            <button
                                key={feat}
                                type="button"
                                onClick={() => {
                                    setFeatures(prev =>
                                        prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
                                    );
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${features.includes(feat)
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                                    }`}
                            >
                                {feat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Image Selection */}
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 ml-1 flex items-center gap-1">
                        <Upload size={14} /> Choose Cover Image
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {STOCK_IMAGES.map((img, idx) => (
                            <div
                                key={idx}
                                onClick={() => setImage(img)}
                                className={`relative rounded-xl overflow-hidden h-24 cursor-pointer border-2 transition-all ${image === img ? 'border-primary ring-2 ring-primary/30' : 'border-transparent opacity-70 hover:opacity-100'
                                    }`}
                            >
                                <img src={img} alt="Option" className="w-full h-full object-cover" />
                                {image === img && (
                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                        <div className="bg-primary text-white p-1 rounded-full">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Or paste an image URL..."
                        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-xs text-gray-500 outline-none focus:border-primary"
                    />
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold text-lg py-4 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Publish Listing</span>
                                <ArrowLeft size={20} className="rotate-180" />
                            </>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default PostListingScreen;
