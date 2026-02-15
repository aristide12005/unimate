import { useNavigate } from "react-router-dom";
import UMLogo from "@/components/UMLogo";

const SuccessScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center px-5 pb-6"
      style={{ background: "linear-gradient(135deg, hsl(28,90%,55%) 0%, hsl(28,85%,65%) 40%, hsl(168,55%,50%) 100%)" }}
    >
      {/* Title */}
      <h1 className="text-2xl font-black text-white mt-12 tracking-tight">
        Success!
      </h1>

      {/* Founders Note Card */}
      <div className="w-full max-w-sm mt-5 bg-white rounded-3xl p-6 shadow-xl relative">
        {/* Logo badge inside card */}
        <div className="absolute top-5 right-5 w-10 h-10 rounded-full border-2 border-secondary/30 flex items-center justify-center bg-white">
          <UMLogo size={28} />
        </div>

        <h3 className="text-primary font-bold text-base italic mb-3 pr-12">
          A note from our founders
        </h3>

        <p className="text-foreground font-semibold text-sm mb-3">
          Hey there!
        </p>

        <p className="text-foreground/75 text-[13px] leading-relaxed">
          We're thrilled you're here. uniMate was built on a simple idea: that life is better
          when you share it with the right people. Whether you're a student starting a new
          chapter or a professional building your career, we want to help you find a space
          that feels like home.
        </p>

        <p className="text-foreground/75 text-[13px] leading-relaxed mt-3">
          Your feedback is what helps us grow. Welcome to the community, and let's find
          your perfect match.
        </p>

        <p className="text-foreground font-semibold text-sm mt-4">
          — The uniMate Team
        </p>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* CTA Button */}
      <div className="w-full max-w-sm pt-4">
        <button
          onClick={() => navigate("/home")}
          className="w-full py-3.5 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white font-bold text-base shadow-lg hover:bg-white/30 active:scale-[0.98] transition-all duration-200"
        >
          Let's Go →
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
