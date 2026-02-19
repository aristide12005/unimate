import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { UnreadProvider } from "@/contexts/UnreadContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import SplashScreen from "./pages/SplashScreen";
import LoginScreen from "./pages/LoginScreen";
import CheckEmailScreen from "./pages/CheckEmailScreen";
import WelcomeScreen from "./pages/WelcomeScreen";
import OccupationScreen from "./pages/OccupationScreen";
import LocationScreen from "./pages/LocationScreen";
import InterestsScreen from "./pages/InterestsScreen";
import ConditionsScreen from "./pages/ConditionsScreen";
import ContactScreen from "./pages/ContactScreen";
import UsernameScreen from "./pages/UsernameScreen";
import PhotoScreen from "./pages/PhotoScreen";
import SuccessScreen from "./pages/SuccessScreen";
import HomeScreen from "./pages/HomeScreen";
import ListingsScreen from "./pages/ListingsScreen";
import ListingDetailsScreen from "./pages/ListingDetailsScreen";
import UserProfileScreen from "./pages/UserProfileScreen";
import UserListingsScreen from "./pages/UserListingsScreen";
import ChatScreen from "./pages/ChatScreen";
import ConnectScreen from "./pages/ConnectScreen";
import NotificationScreen from "./pages/NotificationScreen";
import MessagesScreen from "./pages/MessagesScreen";
import ActivityScreen from "./pages/ActivityScreen";
import ProfileScreen from "./pages/ProfileScreen";
import EditProfileScreen from "./pages/EditProfileScreen";
import PostListingScreen from "./pages/PostListingScreen";
import HostListingWizard from "./pages/host/HostListingWizard";
import ContractRequestScreen from "./pages/contract/ContractRequestScreen";
import OAuthCallback from "./pages/OAuthCallback";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ReportsDashboard from "./pages/admin/ReportsDashboard";
import UserManagement from "./pages/admin/UserManagement";
import TeamManagement from "./pages/admin/TeamManagement";
import ListingManagement from "./pages/admin/ListingManagement";
import AdminMessages from "./pages/admin/AdminMessages";
import DiagnosticPage from "./pages/DiagnosticPage";
import AdminLoginScreen from "./pages/admin/AdminLoginScreen";
import AdminSignupScreen from "./pages/admin/AdminSignupScreen";

const queryClient = new QueryClient();

import MobileWrapper from "@/components/MobileWrapper";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <UnreadProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MobileWrapper>
              <Routes>
                <Route path="/" element={<SplashScreen />} />
                <Route path="/splash" element={<SplashScreen />} />
                <Route path="/login" element={<LoginScreen />} />
                <Route path="/auth-callback" element={<OAuthCallback />} />
                <Route path="/check-email" element={<CheckEmailScreen />} />
                <Route path="/welcome" element={<ProtectedRoute redirectIfComplete><WelcomeScreen /></ProtectedRoute>} />
                <Route path="/occupation" element={<ProtectedRoute redirectIfComplete><OccupationScreen /></ProtectedRoute>} />
                <Route path="/location" element={<ProtectedRoute redirectIfComplete><LocationScreen /></ProtectedRoute>} />
                <Route path="/interests" element={<ProtectedRoute redirectIfComplete><InterestsScreen /></ProtectedRoute>} />
                <Route path="/conditions" element={<ProtectedRoute redirectIfComplete><ConditionsScreen /></ProtectedRoute>} />
                <Route path="/contact" element={<ProtectedRoute redirectIfComplete><ContactScreen /></ProtectedRoute>} />
                <Route path="/username" element={<ProtectedRoute redirectIfComplete><UsernameScreen /></ProtectedRoute>} />
                <Route path="/photo" element={<ProtectedRoute redirectIfComplete><PhotoScreen /></ProtectedRoute>} />
                <Route path="/success" element={<ProtectedRoute redirectIfComplete><SuccessScreen /></ProtectedRoute>} />
                <Route path="/home" element={<ProtectedRoute requireProfile><HomeScreen /></ProtectedRoute>} />
                <Route path="/listings" element={<ProtectedRoute requireProfile><ListingsScreen /></ProtectedRoute>} />
                <Route path="/listings/:id" element={<ProtectedRoute requireProfile><ListingDetailsScreen /></ProtectedRoute>} />
                <Route path="/user/:id" element={<ProtectedRoute requireProfile><UserProfileScreen /></ProtectedRoute>} />
                <Route path="/user/:id/places" element={<ProtectedRoute requireProfile><UserListingsScreen /></ProtectedRoute>} />
                <Route path="/chat/:id" element={<ProtectedRoute requireProfile><ChatScreen /></ProtectedRoute>} />
                <Route path="/connect" element={<ProtectedRoute requireProfile><ConnectScreen /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute requireProfile><NotificationScreen /></ProtectedRoute>} />
                <Route path="/messages" element={<ProtectedRoute requireProfile><MessagesScreen /></ProtectedRoute>} />
                <Route path="/activity" element={<ProtectedRoute requireProfile><ActivityScreen /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute requireProfile><ProfileScreen /></ProtectedRoute>} />
                <Route path="/edit-profile" element={<ProtectedRoute requireProfile><EditProfileScreen /></ProtectedRoute>} />
                <Route path="/post-room" element={<ProtectedRoute requireProfile><HostListingWizard /></ProtectedRoute>} />
                <Route path="/contract/:id" element={<ProtectedRoute requireProfile><ContractRequestScreen /></ProtectedRoute>} />
                <Route path="/admin-debug" element={<ProtectedRoute requireProfile><DiagnosticPage /></ProtectedRoute>} />

                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLoginScreen />} />
                <Route path="/admin/signup" element={<AdminSignupScreen />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="team" element={<TeamManagement />} />
                  <Route path="reports" element={<ReportsDashboard />} />
                  <Route path="messages" element={<AdminMessages />} />
                  <Route path="listings" element={<ListingManagement />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </MobileWrapper>
          </BrowserRouter>
        </TooltipProvider>
      </UnreadProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
