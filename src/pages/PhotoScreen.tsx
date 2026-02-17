import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Image } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PhotoScreen = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data?.avatar_url) {
        setPhoto(data.avatar_url); // Assuming 'photo' is the state for the displayed avatar
      }
    };
    fetchProfile();
  }, [user]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    setPhoto(URL.createObjectURL(file));
    setUploading(true);

    const filePath = `${user.id}/avatar.${file.name.split('.').pop()}`;
    const { error } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });

    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
    await supabase.from("profiles").upsert({
      user_id: user.id,
      avatar_url: publicUrl,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
    setUploading(false);
  };

  const handleContinue = async () => {
    if (user) {
      // Mark onboarding as complete
      await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          onboarding_complete: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6">
      <div className="mt-16 relative">
        <div className="w-48 h-48 rounded-full border-4 border-card overflow-hidden bg-muted flex items-center justify-center shadow-lg">
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl text-muted-foreground">👤</span>
          )}
        </div>
        <label className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-muted flex items-center justify-center shadow cursor-pointer">
          <Pencil size={16} className="text-muted-foreground" />
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>
      </div>

      <label className="mt-6 w-full max-w-sm py-4 rounded-2xl gradient-primary-btn text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-[0.98] transition-transform">
        <Image size={20} />
        {uploading ? "Uploading..." : "Change From Photos"}
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
      </label>

      <div className="mt-auto mb-6 w-full max-w-sm pb-4">
        <button onClick={handleContinue}
          className="w-full py-4 rounded-2xl gradient-primary-btn text-primary-foreground font-bold text-lg shadow-lg active:scale-[0.98] transition-transform">
          Finish Setup
        </button>
      </div>
    </div>
  );
};

export default PhotoScreen;
