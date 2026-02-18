import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireProfile = false,
  redirectIfComplete = false
}: {
  children: React.ReactNode,
  requireAdmin?: boolean,
  requireProfile?: boolean,
  redirectIfComplete?: boolean
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // 1. Check Admin Requirement
  if (requireAdmin) {
    if (!profile || profile.role !== 'admin') {
      return <Navigate to="/home" replace />;
    }
  }

  // 2. Check Profile Completion (For main app pages)
  // We consider a profile "complete" if they have a username (last step of onboarding)
  const isProfileComplete = profile && profile.username;

  if (requireProfile && !isProfileComplete) {
    // If user tries to access Home but hasn't finished onboarding, send to Welcome
    return <Navigate to="/welcome" replace />;
  }

  // 3. Check if already complete (For onboarding pages)
  if (redirectIfComplete && isProfileComplete) {
    // If user tries to access Welcome but is already set up, send to Home
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
