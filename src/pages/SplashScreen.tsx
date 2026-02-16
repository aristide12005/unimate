import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import splashBg from "@/assets/splash-bg.jpg";
import logo from "@/assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // Wait a bit for the splash effect (optional, strictly speaking we could go faster)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarding_complete')
          .eq('user_id', session.user.id)
          .single();

        if (profile?.onboarding_complete) {
          navigate("/home");
        } else {
          navigate("/welcome"); // Start/Resume onboarding
        }
      } else {
        navigate("/login");
      }
    };

    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-background">
      <img src={splashBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="p-6 rounded-[2.5rem] bg-white/50 backdrop-blur-xl border border-white/40 shadow-2xl animate-in zoom-in duration-700">
          <img src={logo} alt="uniMate" className="w-32 h-32 object-contain drop-shadow-md" />
        </div>
        <div className="w-48 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-4">
          <div className="h-full bg-primary rounded-full animate-[loading_2.5s_ease-in-out]" />
        </div>
        <p className="text-muted-foreground text-sm font-bold tracking-wide animate-pulse">uniMate</p>
      </div>
      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;
