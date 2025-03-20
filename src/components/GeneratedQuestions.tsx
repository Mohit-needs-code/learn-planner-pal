
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubjectContext } from "@/context/SubjectContext";
import { ThumbsUp, ThumbsDown, Save, Award, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { calculateQuizScore } from "@/utils/mlUtils";

interface GeneratedQuestionsProps {
  questions: Array<{ question: string; answer: string }>;
  subjectId: string;
}

const GeneratedQuestions: React.FC<GeneratedQuestionsProps> = ({ questions, subjectId }) => {
  const { addFlashcard } = useSubjectContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState<string[]>([]);
  const [userResponses, setUserResponses] = useState<Record<number, boolean>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [isQuizMode, setIsQuizMode] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isSaved = savedQuestions.includes(currentQuestion?.question || "");
  const hasAnswer = typeof userResponses[currentIndex] === 'boolean';

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };

  const handleSave = () => {
    const questionText = currentQuestion.question;
    const answerText = currentQuestion.answer;
    
    addFlashcard({
      subjectId,
      question: questionText,
      answer: answerText,
    });
    
    setSavedQuestions([...savedQuestions, questionText]);
    toast.success("Saved as flashcard!");
  };

  const handleAnswer = (correct: boolean) => {
    if (isQuizMode) {
      const newResponses = { ...userResponses, [currentIndex]: correct };
      setUserResponses(newResponses);
      
      // If we've answered all questions, calculate the score
      if (Object.keys(newResponses).length === questions.length) {
        const score = calculateQuizScore(newResponses);
        setQuizScore(score);
        
        let message = "";
        if (score >= 90) message = "Excellent work!";
        else if (score >= 70) message = "Good job!";
        else if (score >= 50) message = "Keep practicing!";
        else message = "More study needed!";
        
        toast.success(`Quiz complete! Your score: ${score}%. ${message}`);
      } else {
        // Move to next question automatically in quiz mode
        setTimeout(() => {
          if (currentIndex < questions.length - 1) {
            handleNext();
          }
        }, 1000);
      }
    }
  };

  const startQuiz = () => {
    setIsQuizMode(true);
    setUserResponses({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setQuizScore(null);
    toast.info("Quiz mode started. Test your knowledge!");
  };

  const resetQuiz = () => {
    setIsQuizMode(false);
    setUserResponses({});
    setCurrentIndex(0);
    setShowAnswer(false);
    setQuizScore(null);
  };

  // Progress calculation
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="space-y-6">
      {/* Quiz mode toggle */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {!isQuizMode ? "Review Mode" : "Quiz Mode"}
        </div>
        <div className="flex items-center gap-2">
          {isQuizMode && quizScore !== null && (
            <div className="flex items-center mr-2">
              <Award className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">{quizScore}%</span>
            </div>
          )}
          <Button 
            size="sm" 
            variant={isQuizMode ? "default" : "outline"} 
            onClick={isQuizMode ? resetQuiz : startQuiz}
          >
            {isQuizMode ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1" />
                Reset
              </>
            ) : (
              <>Start Quiz</>
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question card */}
      <Card className="neomorphism border-0 p-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Question {currentIndex + 1} of {questions.length}</div>
            <div className="text-base font-medium">{currentQuestion?.question}</div>
          </div>
          
          {(showAnswer || (isQuizMode && hasAnswer)) && (
            <div className="mt-4 pt-4 border-t border-muted">
              <div className="text-xs text-muted-foreground mb-1">Answer</div>
              <div className="text-base">{currentQuestion?.answer}</div>
            </div>
          )}
          
          <div className="pt-4 flex flex-wrap gap-2">
            {!isQuizMode ? (
              <>
                {/* Review mode controls */}
                {!showAnswer && (
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setShowAnswer(true)}
                  >
                    Show Answer
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(isSaved && "text-green-500 border-green-200")}
                  onClick={handleSave}
                  disabled={isSaved}
                >
                  <Save className="h-4 w-4" />
                </Button>
              </>
            ) : (
              /* Quiz mode controls */
              !hasAnswer && (
                <>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => handleAnswer(false)}
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    Don't Know
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 text-green-500 border-green-200 hover:bg-green-50"
                    onClick={() => handleAnswer(true)}
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    Know It
                  </Button>
                </>
              )
            )}
          </div>
        </div>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default GeneratedQuestions;
