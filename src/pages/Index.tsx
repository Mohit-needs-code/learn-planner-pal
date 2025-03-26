
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Book, Lightbulb, Clock, ArrowRight, FileText } from "lucide-react";
import { useSubjectContext } from "@/context/SubjectContext";
import { MLStatusIndicator } from "@/components/MLStatusIndicator";
import { mlManager } from "@/utils/realMlUtils";

const Index = () => {
  const { subjects, schedule } = useSubjectContext();
  
  // Count completed sessions
  const completedSessions = schedule.filter(session => session.completed).length;
  const totalSessionsCount = schedule.length;
  
  // Get next session if available
  const upcomingStudySessions = schedule
    .filter(session => !session.completed && new Date(session.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  const nextSession = upcomingStudySessions.length > 0 ? upcomingStudySessions[0] : null;

  // Features list
  const features = [
    {
      icon: <Book className="h-10 w-10 text-blue-500" />,
      title: "Subject Management",
      description: "Organize your courses and assign difficulty levels",
    },
    {
      icon: <Calendar className="h-10 w-10 text-green-500" />,
      title: "Smart Scheduling",
      description: "Get personalized study plans based on exam dates",
    },
    {
      icon: <Lightbulb className="h-10 w-10 text-yellow-500" />,
      title: "Flashcards",
      description: "Create and practice with flashcards to reinforce your learning",
    },
    {
      icon: <FileText className="h-10 w-10 text-purple-500" />,
      title: "Smart Notes",
      description: "Get AI-powered summaries and generate flashcards from your notes",
    }
  ];

  return (
    <div className="notebook-page pt-20 pb-16 md:pb-8 overflow-x-hidden">
      {/* Punch holes */}
      <div className="punchhole punchhole-1"></div>
      <div className="punchhole punchhole-2"></div>
      <div className="punchhole punchhole-3"></div>
      <div className="punchhole punchhole-4"></div>
      
      <div className="container px-4 mx-auto relative">
        <div className="pencil"></div>

        {/* Hero section */}
        <section className="py-12 md:py-20 animate-fade-in relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 animate-scale-in">
              Master Your Studies with Personalized Planning
            </h1>
            <p className="text-lg text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Create tailored study schedules, track your progress, and ace your exams with our intelligent study planning system.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <Button asChild size="lg" className="rounded-full">
                <Link to="/subjects">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/schedule">View Schedule</Link>
              </Button>
            </div>
            <div className="mt-4 flex justify-center">
              <MLStatusIndicator isLoaded={mlManager.areModelsLoaded()} />
            </div>
          </div>
        </section>

        {/* Quick Access Cards */}
        <section className="py-6 animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="notebook-card border shadow-sm hover:shadow-md transition-shadow relative">
              <div className="paper-clip"></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 text-purple-500" />
                    <div>
                      <h3 className="text-lg font-medium">Smart Notes</h3>
                      <p className="text-muted-foreground">Get AI summaries and generate flashcards</p>
                    </div>
                  </div>
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/notes">
                      Take Notes
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="notebook-card border shadow-sm hover:shadow-md transition-shadow relative">
              <div className="paper-clip"></div>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Lightbulb className="h-10 w-10 text-yellow-500" />
                    <div>
                      <h3 className="text-lg font-medium">Flashcards</h3>
                      <p className="text-muted-foreground">Create and practice with flashcards</p>
                    </div>
                  </div>
                  <Button asChild className="w-full md:w-auto">
                    <Link to="/flashcards">
                      Practice Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats section */}
        {(subjects.length > 0 || schedule.length > 0) && (
          <section className="py-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="sticky-note mx-auto max-w-md my-8 transform rotate-[-1deg] relative rounded shadow-md">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-3 text-center">Your Progress</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold">{subjects.length}</div>
                    <div className="text-sm text-gray-600">Subjects</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold">{totalSessionsCount}</div>
                    <div className="text-sm text-gray-600">Sessions</div>
                  </div>
                  <div className="text-center p-2">
                    <div className="text-2xl font-bold">
                      {completedSessions > 0 && totalSessionsCount > 0
                        ? Math.round((completedSessions / totalSessionsCount) * 100)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Next session prompt */}
        {nextSession && (
          <section className="py-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            <Card className="notebook-card border shadow-soft hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Your next study session</h3>
                    <p className="text-muted-foreground">
                      {new Date(nextSession.date).toLocaleString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <Button asChild className="mt-4 md:mt-0">
                    <Link to="/schedule">
                      View Schedule
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Features */}
        <section className="py-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Plan Smarter, Study Better</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="notebook-card border-0 overflow-hidden relative"
              >
                <CardContent className="p-6">
                  <div className="flex gap-5">
                    <div className="flex-shrink-0 mt-1">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 text-center animate-fade-in" style={{ animationDelay: "0.7s" }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to elevate your study experience?</h2>
            <p className="text-muted-foreground mb-8">
              Start by adding your subjects and creating a personalized study plan.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/subjects">Add Subjects</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/notes">Take Notes</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
