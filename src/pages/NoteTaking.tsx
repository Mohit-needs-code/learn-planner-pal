import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import NoteSummary from "@/components/NoteSummary";
import GeneratedQuestions from "@/components/GeneratedQuestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen, Brain, ListChecks, FileText } from "lucide-react";
import { toast } from "sonner";
import { processNotes } from "@/utils/mlUtils";
import { enhancedProcessNotes, mlManager } from "@/utils/realMlUtils";
import { useSubjectContext } from "@/context/SubjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MLStatusIndicator } from "@/components/MLStatusIndicator";

const NoteTaking = () => {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [processedData, setProcessedData] = useState<{
    summary: string;
    importantTopics: string[];
    generatedQuestions: Array<{ question: string; answer: string }>;
  } | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [useEnhancedML, setUseEnhancedML] = useState(true);
  const [mlModelsLoaded, setMlModelsLoaded] = useState(false);
  const { subjects } = useSubjectContext();

  useEffect(() => {
    let mounted = true;
    
    const checkMLStatus = async () => {
      try {
        await mlManager.initModels();
        if (mounted) {
          setMlModelsLoaded(mlManager.areModelsLoaded());
        }
      } catch (error) {
        console.error("Error initializing ML models:", error);
        if (mounted) {
          setMlModelsLoaded(false);
        }
      }
    };
    
    checkMLStatus();
    
    const interval = setInterval(() => {
      if (mlManager.areModelsLoaded() && mounted) {
        setMlModelsLoaded(true);
        clearInterval(interval);
      }
    }, 2000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleProcessNotes = async () => {
    if (!notes.trim()) {
      toast.error("Please enter some notes first");
      return;
    }

    if (!selectedSubject) {
      toast.error("Please select a subject for your notes");
      return;
    }

    setLoading(true);
    try {
      let result;
      
      if (useEnhancedML && mlModelsLoaded) {
        toast.info("Processing notes with enhanced ML models");
        result = await enhancedProcessNotes(notes, selectedSubject);
      } else {
        if (useEnhancedML && !mlModelsLoaded) {
          toast.info("Enhanced ML models not ready yet, using basic processing");
        }
        result = await processNotes(notes, selectedSubject);
      }
      
      setProcessedData(result);
      toast.success("Notes processed successfully!");
    } catch (error) {
      console.error("Error processing notes:", error);
      toast.error("Failed to process notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-24 md:pb-16">
      <div className="container px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold">Smart Notes</h1>
                <p className="text-muted-foreground mt-1">
                  Take notes and get AI-powered summaries and flashcards
                </p>
              </div>
              <MLStatusIndicator isLoaded={mlModelsLoaded} />
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 animate-fade-in">
              <Card className="neomorphism border-0">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Take Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="use-enhanced-ml" 
                      checked={useEnhancedML} 
                      onCheckedChange={setUseEnhancedML}
                    />
                    <Label htmlFor="use-enhanced-ml">Use enhanced ML models</Label>
                  </div>
                  
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Enter your notes here..."
                    className="min-h-[300px] resize-y input-focus-effect"
                  />
                  <Button 
                    onClick={handleProcessNotes} 
                    disabled={loading || !notes.trim() || !selectedSubject}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>Process Notes</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="animate-fade-in">
              <div className="space-y-6">
                {processedData ? (
                  <>
                    <Card className="neomorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Brain className="h-5 w-5 mr-2" />
                          Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <NoteSummary 
                          summary={processedData.summary} 
                          importantTopics={processedData.importantTopics} 
                        />
                      </CardContent>
                    </Card>

                    <Card className="neomorphism border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <ListChecks className="h-5 w-5 mr-2" />
                          Generated Flashcards
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <GeneratedQuestions 
                          questions={processedData.generatedQuestions}
                          subjectId={selectedSubject}
                        />
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card className="neomorphism border-0 bg-muted/30">
                    <CardContent className="p-6 text-center">
                      <p className="text-muted-foreground py-12">
                        Enter your notes and click "Process Notes" to get a summary and generated questions.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteTaking;
