import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import ProgressPage from "./pages/ProgressPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import CourseComplete from "./pages/CourseComplete";
import Community from "./pages/Community";
import CommunityTopic from "./pages/CommunityTopic";
import NewCommunityTopic from "./pages/NewCommunityTopic";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModules from "./pages/admin/AdminModules";
import ModuleEditor from "./pages/admin/ModuleEditor";
import ChapterEditor from "./pages/admin/ChapterEditor";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminUsers from "./pages/admin/AdminUsers";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OAuthConsent from "./pages/OAuthConsent";
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
            {/* Public pages */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Payment success - Public (validates session_id before allowing signup) */}
            <Route path="/payment-success" element={<PaymentSuccess />} />

            {/* OAuth consent page for MCP / external clients */}
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            
            {/* Student pages - Protected */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/course/:moduleId" element={
              <ProtectedRoute>
                <ModulePage />
              </ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute>
                <ProgressPage />
              </ProtectedRoute>
            } />
            <Route path="/course-complete" element={
              <ProtectedRoute>
                <CourseComplete />
              </ProtectedRoute>
            } />
            
            {/* Community pages - Protected */}
            <Route path="/community" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/community/new" element={
              <ProtectedRoute>
                <NewCommunityTopic />
              </ProtectedRoute>
            } />
            <Route path="/community/:topicId" element={
              <ProtectedRoute>
                <CommunityTopic />
              </ProtectedRoute>
            } />
            
            {/* Admin pages - Protected + Admin role required */}
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/modules" element={
              <ProtectedRoute requireAdmin>
                <AdminModules />
              </ProtectedRoute>
            } />
            <Route path="/admin/modules/:moduleId" element={
              <ProtectedRoute requireAdmin>
                <ModuleEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/chapters/:chapterId" element={
              <ProtectedRoute requireAdmin>
                <ChapterEditor />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requireAdmin>
                <AdminSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
