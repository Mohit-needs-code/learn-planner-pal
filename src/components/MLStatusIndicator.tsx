
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Brain } from "lucide-react";

interface MLStatusIndicatorProps {
  isLoaded: boolean;
}

const MLStatusIndicator = ({ isLoaded }: MLStatusIndicatorProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={isLoaded ? "default" : "outline"}
            className={`flex items-center gap-1 ${isLoaded ? "bg-green-500 hover:bg-green-600" : "text-yellow-600 border-yellow-400"}`}
          >
            <Brain className="h-3 w-3" />
            {isLoaded ? "ML Models Loaded" : "Loading ML Models..."}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {isLoaded 
            ? "Enhanced ML models are loaded and ready to use" 
            : "ML models are still loading. Basic processing will be used until loading completes."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MLStatusIndicator;
