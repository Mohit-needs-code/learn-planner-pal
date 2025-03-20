
import { Subject, FlashCard } from "@/context/SubjectContext";

// ML utility for study schedule optimization
export interface StudyMetrics {
  subjectId: string;
  studyTime: number; // hours
  performance: number; // 0-100
  fatigue: number; // 0-100
  timestamp: Date;
}

// Simple ML model for study time prediction
export class StudyOptimizer {
  private metrics: StudyMetrics[] = [];
  private subjectWeights: Map<string, number> = new Map();
  private timeOfDayWeights: number[] = [0.7, 0.8, 1, 0.9, 0.7, 0.6]; // 0-4, 4-8, 8-12, 12-16, 16-20, 20-24

  constructor() {
    // Load from localStorage if available
    const savedMetrics = localStorage.getItem("studyMetrics");
    const savedWeights = localStorage.getItem("subjectWeights");
    
    if (savedMetrics) {
      try {
        this.metrics = JSON.parse(savedMetrics);
      } catch (e) {
        console.error("Failed to parse saved study metrics", e);
      }
    }
    
    if (savedWeights) {
      try {
        this.subjectWeights = new Map(JSON.parse(savedWeights));
      } catch (e) {
        console.error("Failed to parse saved weights", e);
      }
    }
  }

  // Add new study metrics
  public addMetrics(metric: StudyMetrics): void {
    this.metrics.push(metric);
    this.updateModel();
    this.saveState();
  }

  // Update the model weights based on performance data
  private updateModel(): void {
    // Simple model: weights are updated based on past performance
    const subjects = [...new Set(this.metrics.map(m => m.subjectId))];
    
    subjects.forEach(subjectId => {
      const subjectMetrics = this.metrics.filter(m => m.subjectId === subjectId);
      
      if (subjectMetrics.length > 0) {
        // Calculate average performance
        const avgPerformance = subjectMetrics.reduce((sum, m) => sum + m.performance, 0) / subjectMetrics.length;
        
        // Calculate optimal study duration based on performance and fatigue
        const weightedAvgTime = subjectMetrics.reduce((sum, m) => {
          // Higher performance with lower fatigue gets higher weight
          const weight = (m.performance / 100) * (1 - m.fatigue / 100);
          return sum + (m.studyTime * weight);
        }, 0) / subjectMetrics.reduce((sum, m) => (m.performance / 100) * (1 - m.fatigue / 100), 0);
        
        // Store the weight - this represents optimal study duration
        this.subjectWeights.set(subjectId, weightedAvgTime);
      }
    });
  }

  // Predict optimal study duration for a subject
  public predictOptimalDuration(subjectId: string, difficulty: number): number {
    const baseTime = difficulty * 0.5; // Base duration based on difficulty
    
    if (this.subjectWeights.has(subjectId)) {
      // Blend model prediction with base time
      return (this.subjectWeights.get(subjectId)! * 0.7) + (baseTime * 0.3);
    }
    
    return baseTime; // Default if no data
  }

  // Predict best time of day for studying
  public predictBestTimeOfDay(metrics: StudyMetrics[]): 'morning' | 'afternoon' | 'evening' | 'distributed' {
    // Not enough data, return distributed
    if (metrics.length < 5) {
      return 'distributed';
    }
    
    // Group metrics by time of day
    const morningPerformance: number[] = [];
    const afternoonPerformance: number[] = [];
    const eveningPerformance: number[] = [];
    
    metrics.forEach(metric => {
      const hour = new Date(metric.timestamp).getHours();
      
      if (hour >= 5 && hour < 12) {
        morningPerformance.push(metric.performance);
      } else if (hour >= 12 && hour < 18) {
        afternoonPerformance.push(metric.performance);
      } else {
        eveningPerformance.push(metric.performance);
      }
    });
    
    // Calculate average performance for each time
    const avgMorning = morningPerformance.length > 0 
      ? morningPerformance.reduce((a, b) => a + b, 0) / morningPerformance.length 
      : 0;
      
    const avgAfternoon = afternoonPerformance.length > 0 
      ? afternoonPerformance.reduce((a, b) => a + b, 0) / afternoonPerformance.length 
      : 0;
      
    const avgEvening = eveningPerformance.length > 0 
      ? eveningPerformance.reduce((a, b) => a + b, 0) / eveningPerformance.length 
      : 0;
    
    // Find the best time
    const max = Math.max(avgMorning, avgAfternoon, avgEvening);
    
    // If all times are close, suggest distributed
    if (Math.abs(avgMorning - avgAfternoon) < 10 && 
        Math.abs(avgAfternoon - avgEvening) < 10 && 
        Math.abs(avgMorning - avgEvening) < 10) {
      return 'distributed';
    }
    
    if (max === avgMorning) return 'morning';
    if (max === avgAfternoon) return 'afternoon';
    return 'evening';
  }

  // Save state to localStorage
  private saveState(): void {
    localStorage.setItem("studyMetrics", JSON.stringify(this.metrics));
    localStorage.setItem("subjectWeights", JSON.stringify([...this.subjectWeights]));
  }
}

// Adaptive flashcard system using spaced repetition algorithm
export class AdaptiveFlashcards {
  private responseHistory: Map<string, { 
    correct: number, 
    incorrect: number,
    nextReview: Date,
    interval: number, // Days until next review
    easeFactor: number // Multiplier for interval
  }> = new Map();

  constructor() {
    // Load from localStorage if available
    const savedHistory = localStorage.getItem("flashcardHistory");
    
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        this.responseHistory = new Map(parsed);
      } catch (e) {
        console.error("Failed to parse flashcard history", e);
      }
    }
  }

  // Record a response to a flashcard
  public recordResponse(flashcardId: string, isCorrect: boolean): void {
    const now = new Date();
    let cardData = this.responseHistory.get(flashcardId);
    
    if (!cardData) {
      cardData = {
        correct: 0,
        incorrect: 0,
        nextReview: now,
        interval: 1,
        easeFactor: 2.5
      };
    }
    
    // Update response counts
    if (isCorrect) {
      cardData.correct++;
      // SM-2 Algorithm for spaced repetition
      if (cardData.interval === 1) {
        cardData.interval = 6; // 6 days
      } else {
        cardData.interval = Math.round(cardData.interval * cardData.easeFactor);
      }
      cardData.easeFactor += 0.1;
    } else {
      cardData.incorrect++;
      cardData.interval = 1; // Reset to 1 day
      cardData.easeFactor = Math.max(1.3, cardData.easeFactor - 0.2);
    }
    
    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(now.getDate() + cardData.interval);
    cardData.nextReview = nextReview;
    
    // Update the map
    this.responseHistory.set(flashcardId, cardData);
    this.saveState();
  }

  // Get flashcards due for review
  public getDueFlashcards(flashcards: FlashCard[]): FlashCard[] {
    const now = new Date();
    
    return flashcards.filter(card => {
      const cardData = this.responseHistory.get(card.id);
      
      // If no data, it's new, so include it
      if (!cardData) return true;
      
      // Check if it's due for review
      return cardData.nextReview <= now;
    });
  }

  // Get difficulty level for a flashcard (0-1)
  public getFlashcardDifficulty(flashcardId: string): number {
    const cardData = this.responseHistory.get(flashcardId);
    
    if (!cardData) return 0.5; // Default medium difficulty
    
    const total = cardData.correct + cardData.incorrect;
    if (total === 0) return 0.5;
    
    return 1 - (cardData.correct / total);
  }

  // Save state to localStorage
  private saveState(): void {
    localStorage.setItem("flashcardHistory", JSON.stringify([...this.responseHistory]));
  }
}

// Initialize ML models
export const studyOptimizer = new StudyOptimizer();
export const adaptiveFlashcards = new AdaptiveFlashcards();

// Note Processing ML System
export interface ProcessedNotes {
  summary: string;
  importantTopics: string[];
  generatedQuestions: Array<{ question: string; answer: string }>;
}

// Mock ML processing for notes
export const processNotes = async (
  noteText: string,
  subjectId: string
): Promise<ProcessedNotes> => {
  // In a real application, this would call a backend ML service
  // Here we'll simulate processing with some basic NLP-like operations
  
  // Simulate API call with a delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Extract sentences and paragraphs
      const sentences = noteText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
      
      const paragraphs = noteText
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 30);
      
      // Extract "important" terms (simulate keyword extraction)
      // In real ML, this would use TF-IDF or similar algorithms
      const words = noteText.toLowerCase().split(/\W+/).filter(w => w.length > 4);
      const wordCounts = words.reduce((acc: Record<string, number>, word) => {
        acc[word] = (acc[word] || 0) + 1;
        return acc;
      }, {});
      
      // Get top words by frequency as important topics
      const importantWords = Object.entries(wordCounts)
        .filter(([word, count]) => count > 1 && word.length > 4)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
      
      // Generate a summary (in real ML, this would use extractive/abstractive summarization)
      let summary = "";
      
      if (paragraphs.length > 0) {
        // Take first paragraph as intro
        summary = paragraphs[0].trim();
        
        // Add one middle paragraph if available
        if (paragraphs.length > 2) {
          summary += "\n\n" + paragraphs[Math.floor(paragraphs.length / 2)].trim();
        }
        
        // Add conclusion if available
        if (paragraphs.length > 1) {
          summary += "\n\n" + paragraphs[paragraphs.length - 1].trim();
        }
      } else if (sentences.length > 0) {
        // If no clear paragraphs, use key sentences
        const numSentences = Math.min(sentences.length, 5);
        const step = Math.max(1, Math.floor(sentences.length / numSentences));
        
        for (let i = 0; i < sentences.length; i += step) {
          if (summary) summary += " ";
          summary += sentences[i] + ".";
        }
      } else {
        summary = "The text was too short to generate a meaningful summary.";
      }
      
      // Generate "questions" from the notes
      // In real ML, this would use something like T5/GPT for question generation
      const questions: Array<{ question: string; answer: string }> = [];
      
      // Use longer sentences as potential question material
      const potentialQuestionSentences = sentences.filter(s => s.length > 30);
      
      // Limit to 10 questions
      const numQuestions = Math.min(potentialQuestionSentences.length, 10);
      
      // Generate simple questions using patterns
      for (let i = 0; i < numQuestions; i++) {
        const sentence = potentialQuestionSentences[i];
        
        // Skip if sentence is too similar to previous ones to avoid duplication
        if (questions.some(q => 
          sentence.includes(q.question.replace("What is ", "").replace("?", "")) ||
          sentence.includes(q.answer)
        )) {
          continue;
        }
        
        const words = sentence.split(" ");
        
        if (words.length < 5) continue;
        
        // Determine what kind of question to create
        const questionType = i % 3;
        
        if (questionType === 0 && sentence.includes(" is ")) {
          // Definition question - "What is X?"
          const parts = sentence.split(" is ");
          if (parts[0].length > 3 && parts[1].length > 10) {
            const subject = parts[0].trim();
            const definition = parts[1].replace(/[.!?]$/, "").trim();
            
            questions.push({
              question: `What is ${subject}?`,
              answer: definition
            });
          }
        } else if (questionType === 1) {
          // Fill-in-the-blank by removing a key term
          const keyTermIndex = Math.floor(words.length / 2);
          if (words[keyTermIndex] && words[keyTermIndex].length > 4) {
            const keyTerm = words[keyTermIndex];
            const questionText = [...words];
            questionText[keyTermIndex] = "___________";
            
            questions.push({
              question: questionText.join(" ") + "?",
              answer: keyTerm
            });
          }
        } else {
          // Convert statement to question
          const firstWord = words[0];
          
          // Skip sentences that don't work well as questions
          if (["the", "a", "an", "in", "on", "at"].includes(firstWord.toLowerCase())) {
            const restOfSentence = words.slice(1).join(" ").replace(/[.!?]$/, "");
            
            questions.push({
              question: `What ${restOfSentence}?`,
              answer: firstWord
            });
          } else if (words.length > 6) {
            // Create a who/what/why question from longer sentences
            const answer = words.slice(0, 3).join(" ");
            const partialQuestion = words.slice(3).join(" ").replace(/[.!?]$/, "");
            
            questions.push({
              question: `Who ${partialQuestion}?`,
              answer
            });
          }
        }
      }
      
      // If we couldn't generate enough questions, add some generic ones
      if (questions.length < 5 && importantWords.length > 0) {
        for (let i = 0; i < Math.min(5, importantWords.length); i++) {
          const word = importantWords[i];
          
          // Find a sentence containing this word
          const relevantSentence = sentences.find(s => 
            s.toLowerCase().includes(word.toLowerCase())
          );
          
          if (relevantSentence) {
            questions.push({
              question: `What is the significance of ${word}?`,
              answer: relevantSentence
            });
          }
        }
      }
      
      resolve({
        summary,
        importantTopics: importantWords,
        generatedQuestions: questions.slice(0, 10) // Limit to 10 questions
      });
    }, 1500); // Simulate processing time
  });
};

// Calculate score for quiz
export const calculateQuizScore = (
  userResponses: Record<number, boolean>
): number => {
  const total = Object.keys(userResponses).length;
  if (total === 0) return 0;
  
  const correct = Object.values(userResponses).filter(Boolean).length;
  return Math.round((correct / total) * 100);
};
