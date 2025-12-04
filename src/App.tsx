import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ModulePage from "./pages/ModulePage";
import ProgressPage from "./pages/ProgressPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminModules from "./pages/admin/AdminModules";
import ModuleEditor from "./pages/admin/ModuleEditor";
import AdminPrompts from "./pages/admin/AdminPrompts";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Student pages */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/course/:moduleId" element={<ModulePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          
          {/* Admin pages */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/modules" element={<AdminModules />} />
          <Route path="/admin/modules/:moduleId" element={<ModuleEditor />} />
          <Route path="/admin/prompts" element={<AdminPrompts />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
