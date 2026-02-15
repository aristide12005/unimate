import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  showBack?: boolean;
  className?: string;
}

const OnboardingLayout = ({ children, showBack = false, className = "" }: OnboardingLayoutProps) => {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-background flex flex-col items-center px-6 ${className}`}>
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="self-start mt-4 p-2 rounded-full bg-foreground/10"
        >
          <ArrowLeft size={20} className="text-foreground" />
        </button>
      )}
      {children}
    </div>
  );
};

export default OnboardingLayout;
