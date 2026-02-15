import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import UMLogo from "@/components/UMLogo";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Please fill in all fields");
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
        navigate("/home");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error(error.message);
    }
  };

  const handleFacebookSignIn = async () => {
    toast.info("Facebook sign in coming soon!");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-6">
      {/* Logo */}
      <UMLogo size={80} className="mt-12 mb-2" />

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-foreground mt-4 tracking-tight">
        {isSignUp ? "Create an account" : "Welcome back"}
      </h1>

      {/* Toggle link */}
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "Don't have an account? "}
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="font-bold text-secondary hover:underline transition-colors"
        >
          {isSignUp ? "Login" : "Sign up"}
        </button>
      </p>

      {/* Form */}
      <div className="w-full max-w-sm mt-8 space-y-4">
        {/* Email */}
        <div className="relative">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-sm font-semibold text-foreground outline-none transition-all placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>

        {/* Recovery password */}
        {!isSignUp && (
          <div className="text-right">
            <button className="text-xs font-semibold text-secondary hover:underline transition-colors">
              Recovery Password
            </button>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3.5 rounded-xl gradient-primary-btn text-white font-bold text-base shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200"
        >
          Continue
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mt-8 w-full max-w-sm">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs font-semibold text-gray-400">
          or {isSignUp ? "sign up" : "sign in"} with
        </span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Social Login Buttons */}
      <div className="flex gap-4 mt-5 w-full max-w-sm">
        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          className="flex-1 flex items-center justify-center py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
        >
          {/* ... existing Google SVG ... */}
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </button>

        {/* Apple */}
        <button
          onClick={() => toast.info("Apple sign in coming soon!")}
          className="flex-1 flex items-center justify-center py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
        </button>

        {/* Facebook */}
        <button
          onClick={() => toast.info("Facebook sign in coming soon!")}
          className="flex-1 flex items-center justify-center py-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-[0.97] transition-all duration-200"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-auto mb-8 pt-6 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          By clicking "{isSignUp ? "Create account" : "Continue"}" you agree to uniMate
          <br />
          <button className="font-semibold text-secondary hover:underline">Terms of use</button>
          {" "}and{" "}
          <button className="font-semibold text-secondary hover:underline">Privacy policy</button>
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;