
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { BookOpen } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previousLogin, setPreviousLogin] = useState<string | null>(null);

  // Predict user login from previous sessions
  useEffect(() => {
    // Check for previous logins
    const lastLogin = localStorage.getItem("lastLoginEmail");
    if (lastLogin) {
      setPreviousLogin(lastLogin);
    }

    // If already authenticated, redirect
    if (isAuthenticated) {
      navigate("/subjects");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    // Simple login - in a real app, this would validate with a backend
    setTimeout(() => {
      login(email);
      localStorage.setItem("lastLoginEmail", email);
      toast.success("Welcome to StudyPlanner!");
      navigate("/subjects");
      setIsLoading(false);
    }, 800);
  };

  const handleQuickLogin = () => {
    if (previousLogin) {
      setEmail(previousLogin);
      setTimeout(() => {
        login(previousLogin);
        toast.success("Welcome back to StudyPlanner!");
        navigate("/subjects");
      }, 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-primary text-white p-4 rounded-xl inline-flex shadow-soft">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold mt-4">StudyPlanner</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered study scheduling and learning
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-soft border-0 neomorphism">
          <h2 className="text-2xl font-bold mb-6">Welcome</h2>

          {previousLogin && (
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Previously logged in as:</p>
              <div className="flex items-center justify-between">
                <span className="font-medium">{previousLogin}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleQuickLogin}
                >
                  Quick Login
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-focus-effect"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Continue with Email"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            This is a demo app. No password needed - just enter any email to try it out.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
