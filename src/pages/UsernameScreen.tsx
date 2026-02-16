import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, X, AtSign, Cake, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UMLogo from "@/components/UMLogo";

const UsernameScreen = () => {
  const [username, setUsername] = useState("");
  const [available, setAvailable] = useState<boolean | null>(null);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("username, birthday, avatar_url")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        if (data.username) setUsername(data.username);
        if (data.birthday) {
          const [y, m, d] = data.birthday.split("-");
          if (y) setYear(y);
          if (m) setMonth(m);
          if (d) setDay(d);
        }
        if (data.avatar_url) setAvatarPreview(data.avatar_url);
      }
    };
    fetchProfile();
  }, [user]);

  const checkAvailability = async (name: string) => {
    if (name.length < 2) { setAvailable(null); return; }
    const { data } = await supabase.from("profiles").select("id").eq("username", name).maybeSingle();
    setAvailable(!data);
  };

  const handleChange = (val: string) => {
    const clean = val.replace(/[^a-zA-Z0-9_]/g, "");
    setUsername(clean);
    checkAvailability(clean);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const birthdayValid = month.length >= 1 && day.length >= 1 && year.length === 4;

  const handleContinue = async () => {
    if (!user || !available) return;
    const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    try {
      let currentAvatarUrl = null;
      if (avatarFile) {
        const filePath = `${user.id}/avatar-${Date.now()}.${avatarFile.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true });
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
          currentAvatarUrl = publicUrl;
        }
      }

      const updateData: any = {
        username,
        birthday,
        updated_at: new Date().toISOString()
      };

      if (currentAvatarUrl) {
        updateData.avatar_url = currentAvatarUrl;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("user_id", user.id);

      if (error) throw error;
      navigate("/photo");

    } catch (error: any) {
      toast.error(error.message || "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-5 pb-6">
      {/* Step */}
      <div className="flex flex-col items-center mt-10 w-full max-w-xs">
        <p className="text-xs font-bold text-foreground tracking-wide">Step 6 of 6</p>
        <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full rounded-full gradient-primary-btn" style={{ width: "100%" }} />
        </div>
      </div>

      {/* Profile Photo Upload */}
      <div className="mt-7 relative">
        <button
          onClick={() => fileRef.current?.click()}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 hover:border-primary hover:bg-primary/5 transition-all duration-200 active:scale-95"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Camera size={22} className="text-gray-400" />
              <span className="text-[9px] font-bold text-gray-400 uppercase">Add photo</span>
            </div>
          )}
        </button>
        {/* UM Logo Badge */}
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center border border-gray-100">
          <UMLogo size={22} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          onChange={handlePhoto}
          className="hidden"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {avatarPreview ? "Tap to change" : "Upload your profile pic"}
      </p>

      {/* Cards */}
      <div className="w-full max-w-sm mt-5 space-y-3">

        {/* ─── Username Card ─── */}
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <AtSign size={14} className="text-primary" />
            </div>
            <p className="text-xs font-bold text-foreground uppercase tracking-wider">Username</p>
          </div>

          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-bold">@</span>
            <input
              value={username}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="your_username"
              className={`w-full rounded-xl border bg-gray-50 pl-8 pr-9 py-3 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:bg-white ${available === true
                ? "border-green-300 focus:border-green-400 focus:ring-2 focus:ring-green-100"
                : available === false
                  ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
                  : "border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                }`}
            />
            {available === true && (
              <CheckCircle size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
            )}
            {available === false && (
              <X size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />
            )}
          </div>
          {available === true && (
            <p className="text-[11px] font-semibold text-green-500 mt-1.5 ml-0.5">
              ✓ Available — this is how friends find you
            </p>
          )}
          {available === false && (
            <p className="text-[11px] font-semibold text-red-400 mt-1.5 ml-0.5">
              Already taken, try another
            </p>
          )}
        </div>

        {/* ─── Birthday Card ─── */}
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Cake size={14} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Birthday</p>
              <p className="text-[10px] text-muted-foreground">To verify you're old enough</p>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                placeholder="MM"
                maxLength={2}
                value={month}
                onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 text-center py-3 text-sm font-bold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
              <span className="absolute -bottom-4 left-0 right-0 text-[9px] text-muted-foreground text-center">Month</span>
            </div>
            <span className="text-gray-300 font-bold self-center text-lg">/</span>
            <div className="flex-1 relative">
              <input
                placeholder="DD"
                maxLength={2}
                value={day}
                onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 text-center py-3 text-sm font-bold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
              <span className="absolute -bottom-4 left-0 right-0 text-[9px] text-muted-foreground text-center">Day</span>
            </div>
            <span className="text-gray-300 font-bold self-center text-lg">/</span>
            <div className="flex-[1.4] relative">
              <input
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 text-center py-3 text-sm font-bold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
              <span className="absolute -bottom-4 left-0 right-0 text-[9px] text-muted-foreground text-center">Year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom */}
      <div className="w-full max-w-sm pt-4">
        <button
          onClick={handleContinue}
          disabled={!username || !available || !birthdayValid}
          className="w-full py-3.5 rounded-xl gradient-primary-btn text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none"
        >
          Finish Setup
        </button>
      </div>
    </div>
  );
};

export default UsernameScreen;
