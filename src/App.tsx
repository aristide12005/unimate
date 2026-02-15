import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import CheckEmailScreen from "./pages/CheckEmailScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import OccupationScreen from "./pages/OccupationScreen";
import LocationScreen from "./pages/LocationScreen";
import InterestsScreen from "./pages/InterestsScreen";
import ConditionsScreen from "./pages/ConditionsScreen";
import UsernameScreen from "./pages/UsernameScreen";
import PhotoScreen from "./pages/PhotoScreen";
import SuccessScreen from "./pages/SuccessScreen";
import HomeScreen from "./pages/HomeScreen";
import ExploreScreen from "./pages/ExploreScreen";
import MessagesScreen from "./pages/MessagesScreen";
import ActivityScreen from "./pages/ActivityScreen";
import ProfileScreen from "./pages/ProfileScreen";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/auth-callback" element={<OAuthCallback />} />
            <Route path="/check-email" element={<CheckEmailScreen />} />
            <Route path="/welcome" element={<ProtectedRoute><WelcomeScreen /></ProtectedRoute>} />
            <Route path="/occupation" element={<ProtectedRoute><OccupationScreen /></ProtectedRoute>} />
            <Route path="/location" element={<ProtectedRoute><LocationScreen /></ProtectedRoute>} />
            <Route path="/interests" element={<ProtectedRoute><InterestsScreen /></ProtectedRoute>} />
            <Route path="/conditions" element={<ProtectedRoute><ConditionsScreen /></ProtectedRoute>} />
            <Route path="/username" element={<ProtectedRoute><UsernameScreen /></ProtectedRoute>} />
            <Route path="/photo" element={<ProtectedRoute><PhotoScreen /></ProtectedRoute>} />
            <Route path="/success" element={<ProtectedRoute><SuccessScreen /></ProtectedRoute>} />
            <Route path="/home" element={<ProtectedRoute><HomeScreen /></ProtectedRoute>} />
            <Route path="/explore" element={<ProtectedRoute><ExploreScreen /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><MessagesScreen /></ProtectedRoute>} />
            <Route path="/activity" element={<ProtectedRoute><ActivityScreen /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileScreen /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
