import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import UMLogo from "@/components/UMLogo";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async () => {
    if (!email || (!showForgot && !password)) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (showForgot) {
        // Password reset flow
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth-callback`,
        });
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Password reset link sent! Check your email.");
          setShowForgot(false);
        }
        return;
      }

      if (isSignUp) {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Check your email to verify your account!");
          navigate("/check-email");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("onboarding_complete")
              .eq("user_id", user.id)
              .single();

            if (profile?.onboarding_complete) {
              const returnTo = location.state?.returnTo || "/home";
              navigate(returnTo);
            } else {
              navigate("/welcome");
            }
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6">
      {/* Logo */}
      <UMLogo size={80} className="mt-12 mb-2" />

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-foreground mt-4 tracking-tight">
        {showForgot ? "Reset your password" : isSignUp ? "Create an account" : "Welcome back"}
      </h1>

      {/* Toggle link */}
      {!showForgot && (
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignUp ? "Already have an account? " : "Don't have an account? "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-bold text-secondary hover:underline transition-colors"
          >
            {isSignUp ? "Login" : "Sign up"}
          </button>
        </p>
      )}

      {showForgot && (
        <p className="mt-2 text-sm text-muted-foreground">
          Enter your email and we'll send you a reset link.
        </p>
      )}

      {/* Form */}
      <div className="w-full max-w-sm mt-8 space-y-4">
        {/* Email */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
          />
        </div>

        {/* Password (hidden in forgot mode) */}
        {!showForgot && (
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
        )}

        {/* Forgot password link */}
        {!isSignUp && !showForgot && (
          <div className="text-right">
            <button
              onClick={() => setShowForgot(true)}
              className="text-xs font-semibold text-secondary hover:underline transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}

        {/* Back to login from forgot */}
        {showForgot && (
          <div className="text-right">
            <button
              onClick={() => setShowForgot(false)}
              className="text-xs font-semibold text-secondary hover:underline transition-colors"
            >
              Back to Login
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3.5 rounded-xl gradient-primary-btn text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {showForgot ? "Send Reset Link" : "Continue"}
        </button>

        {/* Guest fallback */}
        {!showForgot && (
          <button
            onClick={() => navigate('/home')}
            type="button"
            className="w-full mt-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            Not now, continue as guest
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto mb-8 pt-6 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          By clicking "{showForgot ? "Send Reset Link" : isSignUp ? "Create account" : "Continue"}" you agree to uniMate
          <br />
          <button
            onClick={() => navigate("/settings/terms")}
            className="font-semibold text-secondary hover:underline"
          >
            Terms of use
          </button>
          {" "}and{" "}
          <button
            onClick={() => navigate("/settings/privacy")}
            className="font-semibold text-secondary hover:underline"
          >
            Privacy policy
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
