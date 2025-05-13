
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import Search from "./pages/Search";
import EpisodeDetails from "./pages/EpisodeDetails";
import Dashboard from "./pages/admin/Dashboard";
import EpisodeList from "./pages/admin/EpisodeList";
import EpisodeForm from "./pages/admin/EpisodeForm";
import NotFound from "./pages/NotFound";

// Layouts
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/search" element={<Search />} />
            <Route path="/episodes/:id" element={<EpisodeDetails />} />
          </Route>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="episodes" element={<EpisodeList />} />
            <Route path="episodes/new" element={<EpisodeForm />} />
            <Route path="episodes/:id" element={<EpisodeForm />} />
          </Route>
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
