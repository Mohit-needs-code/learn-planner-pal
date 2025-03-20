
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashCard } from "@/context/SubjectContext";
import { ChevronRight, ChevronLeft, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { adaptiveFlashcards } from "@/utils/mlUtils";
import { toast } from "sonner";

interface FlashcardComponentProps {
  flashcards: FlashCard[];
  subjectName?: string;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  flashcards,
  subjectName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [dueCards, setDueCards] = useState<FlashCard[]>([]);
  const [useAdaptive, setUseAdaptive] = useState(true);
  
  // Filter cards due for review on load and when flashcards change
  useEffect(() => {
    if (flashcards.length > 0) {
      if (useAdaptive) {
        const due = adaptiveFlashcards.getDueFlashcards(flashcards);
        setDueCards(due);
        if (due.length < flashcards.length) {
          toast.info(`Showing ${due.length} of ${flashcards.length} cards that are due for review`);
        }
      } else {
        setDueCards(flashcards);
      }
    } else {
      setDueCards([]);
    }
  }, [flashcards, useAdaptive]);
  
  const currentCard = dueCards[currentIndex];
  
  // Flip animation
  const handleFlip = () => {
    setFlipped(true);
    setShowAnswer(!showAnswer);
    
    // Reset flip animation after it completes
    setTimeout(() => {
      setFlipped(false);
    }, 300);
  };
  
  // Navigate to previous card
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };
  
  // Navigate to next card
  const handleNext = () => {
    if (currentIndex < dueCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };
  
  // Reset to first card
  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };
  
  // Record answer for spaced repetition
  const handleRecordAnswer = (correct: boolean) => {
    if (currentCard && useAdaptive) {
      adaptiveFlashcards.recordResponse(currentCard.id, correct);
      
      toast.success(correct 
        ? "Great job! This card will be shown less frequently." 
        : "Keep practicing! We'll show this card more often.");
      
      // Move to next card
      if (currentIndex < dueCards.length - 1) {
        handleNext();
      } else {
        // End of deck - refresh the due cards
        const refreshedDue = adaptiveFlashcards.getDueFlashcards(flashcards);
        setDueCards(refreshedDue);
        setCurrentIndex(0);
        toast.success("You've completed this study session!");
      }
    }
  };
  
  // Toggle adaptive learning
  const toggleAdaptive = () => {
    setUseAdaptive(!useAdaptive);
    if (!useAdaptive) {
      toast.info("Adaptive learning enabled - system will prioritize difficult cards");
    } else {
      setDueCards(flashcards);
      toast.info("Showing all flashcards in sequence");
    }
  };
  
  // Progress percentage
  const progress = dueCards.length > 0 ? ((currentIndex + 1) / dueCards.length) * 100 : 0;
  
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium mb-2">No flashcards available</h3>
        <p className="text-muted-foreground">
          {subjectName 
            ? `Create flashcards for ${subjectName} to start studying.` 
            : 'Add some subjects and create flashcards to start studying.'}
        </p>
      </div>
    );
  }
  
  if (dueCards.length === 0 && useAdaptive) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/30 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium mb-2">All caught up!</h3>
        <p className="text-muted-foreground mb-4">
          You've reviewed all the flashcards that are due for today.
        </p>
        <Button onClick={() => setUseAdaptive(false)}>
          Show All Cards Anyway
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {dueCards.length}
          </span>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleAdaptive}
            className={cn(
              "ml-2 text-xs",
              useAdaptive ? "text-primary" : "text-muted-foreground"
            )}
          >
            {useAdaptive ? "Adaptive Learning On" : "Adaptive Learning Off"}
          </Button>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleReset}
          className="text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Flashcard */}
      <div className="w-full p-4">
        <div 
          className="relative w-full mx-auto perspective-1000"
          style={{ height: '300px' }}
        >
          <div 
            className={cn(
              "absolute w-full h-full transition-transform duration-300 preserve-3d shadow-xl rounded-xl",
              flipped && "rotate-y-180"
            )}
          >
            {/* Card front (Question) */}
            <Card 
              className={cn(
                "absolute w-full h-full backface-hidden p-8 flex flex-col items-center justify-center text-center backface-hidden cursor-pointer neomorphism border-0",
                showAnswer && "invisible"
              )}
              onClick={handleFlip}
            >
              <div className="text-sm text-muted-foreground mb-4">Question</div>
              <p className="text-xl font-medium">{currentCard?.question}</p>
              <div className="mt-8 text-sm text-muted-foreground">Tap to reveal answer</div>
            </Card>
            
            {/* Card back (Answer) */}
            <Card 
              className={cn(
                "absolute w-full h-full backface-hidden p-8 flex flex-col items-center justify-center text-center cursor-pointer neomorphism border-0 rotate-y-180",
                !showAnswer && "invisible"
              )}
              onClick={handleFlip}
            >
              <div className="text-sm text-muted-foreground mb-4">Answer</div>
              <p className="text-xl font-medium">{currentCard?.answer}</p>
              <div className="mt-8 text-sm text-muted-foreground">Tap to see question</div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Navigation and feedback buttons */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        {useAdaptive && showAnswer && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleRecordAnswer(false)}
              className="text-red-500 border-red-200"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              Still Learning
            </Button>
            <Button
              variant="outline"
              onClick={() => handleRecordAnswer(true)}
              className="text-green-500 border-green-200"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              Got It
            </Button>
          </div>
        )}
        
        {(!useAdaptive || !showAnswer) && (
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === dueCards.length - 1}
            className="flex items-center"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default FlashcardComponent;
