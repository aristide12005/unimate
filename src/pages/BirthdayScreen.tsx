import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BirthdayScreen = () => {
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContinue = async () => {
    if (!user) return;
    const birthday = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    const { error } = await supabase
      .from("profiles")
      .update({ birthday })
      .eq("user_id", user.id);
    if (error) {
      toast.error("Could not save birthday");
    } else {
      navigate("/username");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6">
      <h1 className="text-xl font-black text-foreground mt-16 text-center">
        Hi there, when's your birthday?
      </h1>

      <div className="flex gap-3 mt-6">
        <input placeholder="MM" maxLength={2} value={month}
          onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
          className="w-20 h-20 rounded-2xl bg-card text-center text-2xl font-bold text-muted-foreground outline-none shadow-sm" />
        <input placeholder="DD" maxLength={2} value={day}
          onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
          className="w-20 h-20 rounded-2xl bg-card text-center text-2xl font-bold text-muted-foreground outline-none shadow-sm" />
        <input placeholder="YYYY" maxLength={4} value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
          className="w-24 h-20 rounded-2xl bg-card text-center text-2xl font-bold text-muted-foreground outline-none shadow-sm" />
      </div>

      <p className="text-sm text-foreground mt-4 text-center">
        Any user 17 or younger will be in our teen account.
      </p>

      <div className="mt-auto mb-6 w-full max-w-sm text-center pb-4">
        <p className="text-xs text-foreground/70 mb-4">Only to make sure you're old enough to use uniMate.</p>
        <button onClick={handleContinue} disabled={!month || !day || !year}
          className="w-full py-4 rounded-2xl gradient-primary-btn text-primary-foreground font-bold text-lg disabled:opacity-40 active:scale-[0.98] transition-transform">
          Continue
        </button>
      </div>
    </div>
  );
};

export default BirthdayScreen;
