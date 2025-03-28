
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Calendar, Book, Clock, ListChecks, Lightbulb, FileText } from "lucide-react";
import { MLStatusIndicator } from "./MLStatusIndicator";
import { mlManager } from "@/utils/realMlUtils";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: <ListChecks className="h-5 w-5" /> },
    { path: "/subjects", label: "Subjects", icon: <Book className="h-5 w-5" /> },
    { path: "/schedule", label: "Schedule", icon: <Calendar className="h-5 w-5" /> },
    { path: "/flashcards", label: "Flashcards", icon: <Lightbulb className="h-5 w-5" /> },
    { path: "/notes", label: "Notes", icon: <FileText className="h-5 w-5" /> },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 notebook-header">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-primary font-semibold text-xl transition-all hover:opacity-80"
          >
            <Clock className="h-6 w-6" />
            <span className="handwritten-heading text-2xl">StudyPlanner</span>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 notebook-text",
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <MLStatusIndicator isLoaded={mlManager.areModelsLoaded()} />
          </div>

          <div className="md:hidden flex">
            {/* Mobile dropdown menu would go here */}
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 notebook-header border-t border-gray-200">
        <div className="flex justify-around py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg notebook-text",
                location.pathname === item.path
                  ? "text-blue-600"
                  : "text-gray-500"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
