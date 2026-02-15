import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const CheckEmailScreen = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center px-6">
      <button onClick={() => navigate(-1)} className="self-start mt-4 p-2 rounded-full bg-foreground/10">
        <ArrowLeft size={20} className="text-foreground" />
      </button>

      <h1 className="text-3xl font-black text-foreground mt-16">Check your email</h1>
      <p className="text-base text-foreground font-semibold mt-4 text-center">
        We sent a verification link to your email.
      </p>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Don't see it? Check your Spam/Junk folder (or "Promotions" in Gmail).
      </p>

      <div className="mt-auto mb-6 w-full max-w-sm space-y-3 pb-4">
        <button
          onClick={() => navigate("/login")}
          className="w-full py-4 rounded-2xl gradient-primary-btn text-primary-foreground font-bold text-lg"
        >
          Back to Login
        </button>
        <button
          disabled={countdown > 0}
          className="w-full py-4 rounded-2xl gradient-secondary-btn text-accent-foreground font-bold text-lg disabled:opacity-60"
        >
          {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
        </button>
      </div>
    </div>
  );
};

export default CheckEmailScreen;
