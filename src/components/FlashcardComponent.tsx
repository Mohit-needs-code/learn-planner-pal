
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlashCard } from "@/context/SubjectContext";
import { ChevronRight, ChevronLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
  
  const currentCard = flashcards[currentIndex];
  
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
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    }
  };
  
  // Reset to first card
  const handleReset = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };
  
  // Progress percentage
  const progress = ((currentIndex + 1) / flashcards.length) * 100;
  
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
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-sm text-muted-foreground">
            Card {currentIndex + 1} of {flashcards.length}
          </span>
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
              <p className="text-xl font-medium">{currentCard.question}</p>
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
              <p className="text-xl font-medium">{currentCard.answer}</p>
              <div className="mt-8 text-sm text-muted-foreground">Tap to see question</div>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Navigation buttons */}
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
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default FlashcardComponent;
