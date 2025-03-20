
import React from "react";
import { Button } from "@/components/ui/button";
import { SliderProps } from "@radix-ui/react-slider";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DifficultyQuestionProps {
  value: number;
  onChange: (value: number) => void;
}

const DifficultyQuestion: React.FC<DifficultyQuestionProps> = ({
  value,
  onChange,
}) => {
  const difficultyLevels = [
    { value: 1, label: "Easy", description: "I understand this well" },
    { value: 2, label: "Medium", description: "I'm comfortable with most concepts" },
    { value: 3, label: "Challenging", description: "I need to review several topics" },
    { value: 4, label: "Hard", description: "I struggle with many concepts" },
    { value: 5, label: "Very Hard", description: "I need to learn most of the material" },
  ];

  const handleValueChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const currentLevel = difficultyLevels.find((level) => level.value === value);

  // Generate color based on difficulty
  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return "bg-green-500";
      case 2: return "bg-blue-500";
      case 3: return "bg-yellow-500";
      case 4: return "bg-orange-500";
      case 5: return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="animate-fade-in space-y-6 my-6">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium">How difficult is this subject for you?</h3>
        <p className="text-muted-foreground text-sm">
          This helps us allocate appropriate study time
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-soft max-w-md mx-auto">
        <div className="mb-8 flex justify-center">
          <div className="text-center">
            <div 
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl transition-all",
                getDifficultyColor(value)
              )}
            >
              {value}
            </div>
            <span className="block text-lg font-medium">{currentLevel?.label}</span>
            <span className="block text-sm text-muted-foreground">{currentLevel?.description}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Easy</span>
              <span>Very Hard</span>
            </div>
            <Slider
              value={[value]}
              min={1}
              max={5}
              step={1}
              onValueChange={handleValueChange}
              className="cursor-pointer"
            />
          </div>

          <div className="flex justify-between mt-4">
            {difficultyLevels.map((level) => (
              <Button
                key={level.value}
                variant="outline"
                size="sm"
                className={cn(
                  "px-2 border-0 bg-transparent hover:bg-secondary transition-colors",
                  value === level.value && "bg-secondary font-medium"
                )}
                onClick={() => onChange(level.value)}
              >
                {level.value}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DifficultyQuestion;
