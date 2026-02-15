import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import splashBg from "@/assets/splash-bg.jpg";

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/login"), 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden">
      <img src={splashBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, hsla(28,90%,55%,0.5), hsla(168,55%,45%,0.5))" }} />
      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1 className="text-4xl font-black text-primary-foreground tracking-wide">uniMate</h1>
        <div className="w-48 h-1.5 bg-primary-foreground/30 rounded-full overflow-hidden">
          <div className="h-full bg-primary-foreground rounded-full animate-[loading_2.5s_ease-in-out]" />
        </div>
        <p className="text-primary-foreground/80 text-sm font-semibold">Preparing your experience...</p>
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
