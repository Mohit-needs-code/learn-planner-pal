
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SubjectProvider } from "./context/SubjectContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Schedule from "./pages/Schedule";
import Flashcards from "./pages/Flashcards";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubjectProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<><Navbar /><Index /></>} />
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/subjects" element={<><Navbar /><Subjects /></>} />
                <Route path="/schedule" element={<><Navbar /><Schedule /></>} />
                <Route path="/flashcards" element={<><Navbar /><Flashcards /></>} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SubjectProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
