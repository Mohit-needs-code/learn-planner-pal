
import { pipeline, RawImage } from '@huggingface/transformers';
import { Subject, FlashCard } from "@/context/SubjectContext";

// Class for managing ML models
export class MLModelManager {
  private static instance: MLModelManager;
  private textEmbeddingModel: any = null;
  private textClassificationModel: any = null;
  private modelLoading: boolean = false;
  private modelLoadPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): MLModelManager {
    if (!MLModelManager.instance) {
      MLModelManager.instance = new MLModelManager();
    }
    return MLModelManager.instance;
  }

  // Initialize models - load them in background
  public async initModels(): Promise<void> {
    // Only start loading if we haven't already
    if (!this.modelLoading && !this.modelLoadPromise) {
      this.modelLoading = true;
      
      this.modelLoadPromise = (async () => {
        try {
          console.log("Loading ML models from Hugging Face...");
          
          // Load text embedding model (for flashcard similarity, note processing)
          this.textEmbeddingModel = await pipeline(
            'feature-extraction',
            'mixedbread-ai/mxbai-embed-xsmall-v1',
            { quantized: true }
          );
          
          console.log("Text embedding model loaded");
          
          // Load text classification model (for study performance prediction)
          this.textClassificationModel = await pipeline(
            'text-classification',
            'distilbert-base-uncased-finetuned-sst-2-english',
            { quantized: true }
          );
          
          console.log("Text classification model loaded");
          
          this.modelLoading = false;
        } catch (error) {
          console.error("Error loading ML models:", error);
          this.modelLoading = false;
          throw error;
        }
      })();
      
      return this.modelLoadPromise;
    } else if (this.modelLoadPromise) {
      // Return existing promise if already loading
      return this.modelLoadPromise;
    } else {
      // Models already loaded - return resolved promise
      return Promise.resolve();
    }
  }
  
  // Check if models are loaded
  public areModelsLoaded(): boolean {
    return !!this.textEmbeddingModel && !!this.textClassificationModel;
  }
  
  // Get text embeddings
  public async getTextEmbeddings(text: string | string[]): Promise<number[][] | null> {
    if (!this.textEmbeddingModel) {
      console.warn("Text embedding model not loaded yet");
      return null;
    }
    
    try {
      const embeddings = await this.textEmbeddingModel(text, { 
        pooling: "mean", 
        normalize: true 
      });
      return embeddings.tolist();
    } catch (error) {
      console.error("Error generating embeddings:", error);
      return null;
    }
  }
  
  // Calculate similarity between two texts
  public async calculateTextSimilarity(text1: string, text2: string): Promise<number | null> {
    const embeddings = await this.getTextEmbeddings([text1, text2]);
    
    if (!embeddings || embeddings.length < 2) return null;
    
    // Calculate cosine similarity between the two embeddings
    const v1 = embeddings[0];
    const v2 = embeddings[1];
    
    const dotProduct = v1.reduce((sum, a, i) => sum + a * v2[i], 0);
    const mag1 = Math.sqrt(v1.reduce((sum, a) => sum + a * a, 0));
    const mag2 = Math.sqrt(v2.reduce((sum, a) => sum + a * a, 0));
    
    return dotProduct / (mag1 * mag2);
  }
  
  // Analyze sentiment of text (for study performance prediction)
  public async analyzeSentiment(text: string): Promise<number | null> {
    if (!this.textClassificationModel) {
      console.warn("Text classification model not loaded yet");
      return null;
    }
    
    try {
      const result = await this.textClassificationModel(text);
      const positiveScore = result.find((r: any) => r.label === 'POSITIVE')?.score || 0;
      return positiveScore;
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return null;
    }
  }
}

// Enhanced class for study optimization with real ML
export class EnhancedStudyOptimizer {
  private metrics: { 
    subject: Subject; 
    studyTime: number; 
    performance: number; 
    timestamp: Date;
    notes?: string;
  }[] = [];
  private mlManager = MLModelManager.getInstance();
  
  constructor() {
    // Initialize ML models in background
    this.mlManager.initModels().catch(err => 
      console.error("Failed to initialize ML models:", err)
    );
  }
  
  // Predict optimal study duration with ML enhancement
  public async predictOptimalDuration(subject: Subject, notes?: string): Promise<number> {
    // Base calculation using subject difficulty
    const baseTime = subject.difficulty * 0.5; 
    
    // If ML models aren't loaded, return base calculation
    if (!this.mlManager.areModelsLoaded()) {
      return baseTime;
    }
    
    try {
      // Get subject-specific metrics
      const subjectMetrics = this.metrics.filter(m => m.subject.id === subject.id);
      
      // If we have enough data points, use them
      if (subjectMetrics.length >= 3) {
        // Calculate average performance weighted by recency
        let totalWeight = 0;
        const weightedAvgTime = subjectMetrics.reduce((sum, m, index) => {
          // More recent entries have higher weight
          const recencyWeight = 1 + (index / subjectMetrics.length);
          totalWeight += recencyWeight;
          return sum + (m.studyTime * recencyWeight);
        }, 0) / totalWeight;
        
        // Use the weightedAvgTime as a starting point
        let recommendedTime = weightedAvgTime;
        
        // If we have notes, analyze their sentiment to adjust time
        if (notes && notes.length > 20) {
          const sentiment = await this.mlManager.analyzeSentiment(notes);
          if (sentiment !== null) {
            // If sentiment is negative, increase study time
            // If positive, slightly decrease (student is confident)
            const sentimentAdjustment = 0.5 - sentiment;
            recommendedTime += sentimentAdjustment;
          }
        }
        
        // Blend ML prediction with base calculation
        return (recommendedTime * 0.7) + (baseTime * 0.3);
      }
    } catch (error) {
      console.error("Error in ML prediction:", error);
    }
    
    // Fallback to base calculation
    return baseTime;
  }
  
  // Add metrics to training data
  public addMetrics(metric: { 
    subject: Subject; 
    studyTime: number; 
    performance: number; 
    timestamp: Date;
    notes?: string;
  }): void {
    this.metrics.push(metric);
  }
}

// Enhanced flashcard system with ML
export class EnhancedAdaptiveFlashcards {
  private responseHistory: Map<string, { 
    correct: number, 
    incorrect: number,
    nextReview: Date,
    interval: number,
    easeFactor: number
  }> = new Map();
  private mlManager = MLModelManager.getInstance();
  
  constructor() {
    // Initialize ML models in background
    this.mlManager.initModels().catch(err => 
      console.error("Failed to initialize ML models:", err)
    );
  }
  
  // Record response with ML-enhanced spacing
  public async recordResponse(flashcard: FlashCard, isCorrect: boolean): Promise<void> {
    const now = new Date();
    let cardData = this.responseHistory.get(flashcard.id);
    
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
      
      // SM-2 Algorithm with ML enhancement
      if (cardData.interval === 1) {
        cardData.interval = 6; // 6 days
      } else {
        // ML enhancement: if models are loaded, calculate card difficulty
        if (this.mlManager.areModelsLoaded()) {
          try {
            // Calculate difficulty based on question complexity
            const sentiment = await this.mlManager.analyzeSentiment(flashcard.question);
            if (sentiment !== null) {
              // Lower sentiment indicates more difficult question
              // Adjust ease factor based on question complexity
              const difficultyAdjustment = (1 - sentiment) * 0.3;
              cardData.easeFactor = Math.max(1.3, cardData.easeFactor - difficultyAdjustment);
            }
          } catch (error) {
            console.error("Error in ML card difficulty calculation:", error);
          }
        }
        
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
    this.responseHistory.set(flashcard.id, cardData);
  }
  
  // Get flashcards due for review with ML enhancement
  public async getDueFlashcards(flashcards: FlashCard[]): Promise<FlashCard[]> {
    const now = new Date();
    const dueCards = flashcards.filter(card => {
      const cardData = this.responseHistory.get(card.id);
      
      // If no data, it's new, so include it
      if (!cardData) return true;
      
      // Check if it's due for review
      return cardData.nextReview <= now;
    });
    
    // If ML models are loaded, sort cards by similarity to increase learning efficiency
    if (this.mlManager.areModelsLoaded() && dueCards.length > 1) {
      try {
        // Get embeddings for all due cards
        const questions = dueCards.map(card => card.question);
        const embeddings = await this.mlManager.getTextEmbeddings(questions);
        
        if (embeddings && embeddings.length === dueCards.length) {
          // Sort cards to group similar topics together
          // This uses a greedy approach to minimize topic switching
          const sortedIndices: number[] = [0]; // Start with the first card
          const remainingIndices = Array.from({ length: dueCards.length - 1 }, (_, i) => i + 1);
          
          while (remainingIndices.length > 0) {
            const lastIndex = sortedIndices[sortedIndices.length - 1];
            const lastEmbedding = embeddings[lastIndex];
            
            // Find the most similar card to the last one
            let mostSimilarIndex = -1;
            let highestSimilarity = -1;
            
            for (const index of remainingIndices) {
              const currentEmbedding = embeddings[index];
              // Calculate cosine similarity
              const dotProduct = lastEmbedding.reduce((sum, a, i) => sum + a * currentEmbedding[i], 0);
              const mag1 = Math.sqrt(lastEmbedding.reduce((sum, a) => sum + a * a, 0));
              const mag2 = Math.sqrt(currentEmbedding.reduce((sum, a) => sum + a * a, 0));
              const similarity = dotProduct / (mag1 * mag2);
              
              if (similarity > highestSimilarity) {
                highestSimilarity = similarity;
                mostSimilarIndex = index;
              }
            }
            
            // Add the most similar card next
            if (mostSimilarIndex !== -1) {
              sortedIndices.push(mostSimilarIndex);
              const indexToRemove = remainingIndices.indexOf(mostSimilarIndex);
              remainingIndices.splice(indexToRemove, 1);
            } else {
              // Fallback: just add the next card
              sortedIndices.push(remainingIndices[0]);
              remainingIndices.shift();
            }
          }
          
          // Return cards in the optimized order
          return sortedIndices.map(index => dueCards[index]);
        }
      } catch (error) {
        console.error("Error sorting flashcards by similarity:", error);
      }
    }
    
    // Fallback to unsorted cards
    return dueCards;
  }
  
  // Get difficulty level for a flashcard (0-1)
  public getFlashcardDifficulty(flashcardId: string): number {
    const cardData = this.responseHistory.get(flashcardId);
    
    if (!cardData) return 0.5; // Default medium difficulty
    
    const total = cardData.correct + cardData.incorrect;
    if (total === 0) return 0.5;
    
    return 1 - (cardData.correct / total);
  }
}

// Enhanced note processing with real ML
export const enhancedProcessNotes = async (
  noteText: string,
  subjectId: string
): Promise<{
  summary: string;
  importantTopics: string[];
  generatedQuestions: Array<{ question: string; answer: string }>;
}> => {
  const mlManager = MLModelManager.getInstance();
  
  // Ensure models are loaded
  try {
    await mlManager.initModels();
  } catch (error) {
    console.error("Failed to initialize ML models for note processing:", error);
    // Fall back to basic processing if ML fails
    return basicProcessNotes(noteText);
  }
  
  // If models are ready, use ML-enhanced processing
  if (mlManager.areModelsLoaded()) {
    try {
      // Extract sentences and paragraphs for processing
      const sentences = noteText
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
      
      const paragraphs = noteText
        .split(/\n+/)
        .map(p => p.trim())
        .filter(p => p.length > 30);
      
      // Get embeddings for all sentences to find important ones
      const sentenceEmbeddings = await mlManager.getTextEmbeddings(sentences);
      
      if (!sentenceEmbeddings) {
        return basicProcessNotes(noteText);
      }
      
      // Calculate importance scores for each sentence based on centrality
      // (How similar it is to the overall document)
      const importanceScores = await calculateSentenceImportance(sentences, sentenceEmbeddings);
      
      // Get top sentences for summary based on importance
      const topSentenceIndices = getTopIndices(importanceScores, 
        Math.min(5, Math.ceil(sentences.length / 3)));
      
      // Create summary from top sentences
      let summary = "";
      
      if (topSentenceIndices.length > 0) {
        // Sort indices to maintain original order
        topSentenceIndices.sort((a, b) => a - b);
        
        // Build the summary
        summary = topSentenceIndices.map(idx => sentences[idx]).join(". ");
      } else if (paragraphs.length > 0) {
        // Fall back to first paragraph
        summary = paragraphs[0];
      } else {
        summary = "Unable to generate a meaningful summary from the provided notes.";
      }
      
      // Extract important topics based on embeddings
      const words = extractImportantWords(noteText, 10);
      
      // Generate questions from the most important sentences
      const questions: Array<{ question: string; answer: string }> = [];
      
      for (const idx of topSentenceIndices) {
        if (questions.length >= 8) break;
        
        const sentence = sentences[idx];
        const generatedQuestion = await generateQuestionFromSentence(sentence);
        
        if (generatedQuestion) {
          questions.push(generatedQuestion);
        }
      }
      
      // If we couldn't generate enough questions, use important topics
      if (questions.length < 5 && words.length > 0) {
        for (let i = 0; i < Math.min(5, words.length); i++) {
          if (questions.length >= 8) break;
          
          const word = words[i];
          
          // Find a sentence containing this word
          const relevantSentenceIdx = sentences.findIndex(s => 
            s.toLowerCase().includes(word.toLowerCase())
          );
          
          if (relevantSentenceIdx >= 0) {
            const sentence = sentences[relevantSentenceIdx];
            const generatedQuestion = await generateQuestionFromTopic(word, sentence);
            
            if (generatedQuestion && 
                !questions.some(q => q.answer === generatedQuestion.answer)) {
              questions.push(generatedQuestion);
            }
          }
        }
      }
      
      return {
        summary,
        importantTopics: words,
        generatedQuestions: questions
      };
      
    } catch (error) {
      console.error("Error in ML-enhanced note processing:", error);
      return basicProcessNotes(noteText);
    }
  } else {
    // Fall back to basic processing
    return basicProcessNotes(noteText);
  }
};

// Helper function to calculate sentence importance
async function calculateSentenceImportance(
  sentences: string[], 
  embeddings: number[][]
): Promise<number[]> {
  // Calculate document centroid (average of all embeddings)
  const dimensions = embeddings[0].length;
  const centroid = Array(dimensions).fill(0);
  
  for (const embedding of embeddings) {
    for (let i = 0; i < dimensions; i++) {
      centroid[i] += embedding[i] / embeddings.length;
    }
  }
  
  // Calculate similarity of each sentence to the centroid
  const importanceScores = embeddings.map(embedding => {
    // Cosine similarity to centroid
    const dotProduct = embedding.reduce((sum, a, i) => sum + a * centroid[i], 0);
    const mag1 = Math.sqrt(embedding.reduce((sum, a) => sum + a * a, 0));
    const mag2 = Math.sqrt(centroid.reduce((sum, a) => sum + a * a, 0));
    
    return dotProduct / (mag1 * mag2);
  });
  
  return importanceScores;
}

// Helper function to extract important words
function extractImportantWords(text: string, count: number): string[] {
  // Remove common stop words
  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for", "with",
    "by", "about", "as", "into", "like", "through", "after", "over", "between",
    "out", "of", "from", "is", "are", "was", "were", "be", "been", "being", 
    "have", "has", "had", "do", "does", "did", "can", "could", "will", "would",
    "should", "may", "might", "must", "this", "that", "these", "those", "it",
    "they", "them", "their", "he", "she", "his", "her", "i", "we", "you", "who"
  ]);
  
  // Tokenize and count words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
  
  const wordCounts: Record<string, number> = {};
  
  for (const word of words) {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  }
  
  // Sort by frequency and get top words
  return Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

// Helper function to get top N indices from an array
function getTopIndices(arr: number[], n: number): number[] {
  return arr
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)
    .map(item => item.index);
}

// Helper function to generate questions from sentences
async function generateQuestionFromSentence(
  sentence: string
): Promise<{ question: string; answer: string } | null> {
  const words = sentence.split(" ");
  
  if (words.length < 5) return null;
  
  // Simple approach: try to create a fill-in-the-blank question
  // In a real implementation, this would use a more sophisticated model
  
  // Find a candidate word to blank out (preferably a noun or key term)
  const candidateIndices: number[] = [];
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    // Skip short words, first and last words
    if (word.length > 4 && i > 0 && i < words.length - 1) {
      candidateIndices.push(i);
    }
  }
  
  if (candidateIndices.length === 0) return null;
  
  // Pick a candidate at random
  const blankIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  const answer = words[blankIndex];
  
  // Create the question
  const questionWords = [...words];
  questionWords[blankIndex] = "_______";
  
  return {
    question: questionWords.join(" "),
    answer
  };
}

// Helper function to generate topic-based questions
async function generateQuestionFromTopic(
  topic: string,
  context: string
): Promise<{ question: string; answer: string } | null> {
  // Create a question about the topic
  return {
    question: `What is the significance of ${topic}?`,
    answer: context
  };
}

// Fallback function for basic note processing
function basicProcessNotes(noteText: string) {
  // This is a simplified version of the original processNotes function
  const sentences = noteText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 10);
  
  const paragraphs = noteText
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 30);
  
  // Extract "important" terms (simulate keyword extraction)
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
    
    if (questions.length >= 10) break;
  }
  
  return {
    summary,
    importantTopics: importantWords,
    generatedQuestions: questions.slice(0, 10) // Limit to 10 questions
  };
}

// Initialize models
export const mlManager = MLModelManager.getInstance();
export const enhancedStudyOptimizer = new EnhancedStudyOptimizer();
export const enhancedAdaptiveFlashcards = new EnhancedAdaptiveFlashcards();
