import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import UMLogo from "@/components/UMLogo";

const WelcomeScreen = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("user_id", user.id)
        .single();

      if (data && !error) {
        if (data.first_name) setFirstName(data.first_name);
        if (data.last_name) setLastName(data.last_name);
      }
    };
    fetchProfile();
  }, [user]);

  const handleContinue = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (error) {
      toast.error("Could not save name");
    } else {
      navigate("/occupation");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6">
      {/* Logo */}
      <UMLogo size={72} className="mt-14" />

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-foreground mt-6 tracking-tight text-center">
        Welcome to uniMate!
      </h1>
      <p className="text-sm text-muted-foreground mt-2 text-center max-w-[280px]">
        Let's get started. What's your name?
      </p>

      {/* Name Inputs */}
      <div className="w-full max-w-sm mt-8 space-y-4">
        <input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Illustration area */}
      <div className="flex-1 flex items-center justify-center w-full max-w-sm py-6">
        <div className="flex items-center gap-3 opacity-60">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <div className="w-2.5 h-2.5 rounded-full bg-secondary" />
          <div className="w-2.5 h-2.5 rounded-full bg-accent" />
          <div className="w-8 h-1 rounded-full bg-gray-200" />
          <div className="w-2.5 h-2.5 rounded-full bg-gray-200" />
        </div>
      </div>

      {/* Continue Button */}
      <div className="w-full max-w-sm pb-8">
        <button
          onClick={handleContinue}
          disabled={!firstName || !lastName}
          className="w-full py-3.5 rounded-xl gradient-primary-btn text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:shadow-none"
        >
          Continue
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">
          Step 1 of 6
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
