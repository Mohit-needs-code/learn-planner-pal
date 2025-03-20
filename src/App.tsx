
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SubjectProvider } from "./context/SubjectContext";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Subjects from "./pages/Subjects";
import Schedule from "./pages/Schedule";
import Flashcards from "./pages/Flashcards";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SubjectProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SubjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
