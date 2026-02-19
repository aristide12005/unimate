
import { useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { ListingFormData } from "@/types/host";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface StepProps {
    data: ListingFormData;
    update: (updates: Partial<ListingFormData>) => void;
}

export default function Step3Vibe({ data, update }: StepProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        if (!user) {
            toast.error("Please log in to upload images");
            return;
        }

        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('listing-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('listing-images')
                .getPublicUrl(filePath);

            update({ image_url: publicUrl });
            toast.success("Image uploaded!");

        } catch (error: any) {
            console.error('Upload Error:', error);
            toast.error(error.message || "Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
                <h3 className="font-bold text-primary mb-1">Set The Vibe</h3>
                <p className="text-sm text-gray-600">Photos bring your arrangement to life.</p>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-bold text-gray-700 ml-1">Cover Photo</label>

                {data.image_url && !data.image_url.includes("unsplash") ? (
                    <div className="relative rounded-2xl overflow-hidden aspect-video shadow-md group">
                        <img src={data.image_url} alt="Cover" className="w-full h-full object-cover" />
                        <button
                            onClick={() => update({ image_url: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-gray-50 transition-all cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploading}
                        />
                        <div className="p-4 bg-primary/10 text-primary rounded-full">
                            {uploading ? <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /> : <Upload size={24} />}
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-700">Tap to upload</p>
                            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 5MB</p>
                        </div>
                    </div>
                )}

                {/* Stock Image Fallback */}
                {(!data.image_url || data.image_url.includes("unsplash")) && (
                    <div className="pt-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Or choose a placeholder</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
                                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
                                "https://images.unsplash.com/photo-1600596542815-225bad65dbd8"
                            ].map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => update({ image_url: img })}
                                    className={`rounded-lg overflow-hidden h-20 border-2 transition-all ${data.image_url === img ? 'border-primary' : 'border-transparent opacity-60'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
