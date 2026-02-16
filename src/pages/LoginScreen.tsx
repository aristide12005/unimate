import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        // Check if profile is complete
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_complete')
            .eq('user_id', user.id)
            .single();

          if (profile?.onboarding_complete) {
            navigate("/home");
          } else {
            navigate("/welcome");
          }
        }
      }
    }
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
