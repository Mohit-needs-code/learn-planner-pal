
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Subject {
  id: string;
  name: string;
  examDate: Date;
  difficulty: number;
  timeToSpend: number | null;
}

export interface FlashCard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
}

interface ScheduleEntry {
  id: string;
  subjectId: string;
  date: Date;
  duration: number;
  completed: boolean;
}

interface SubjectContextType {
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  removeSubject: (id: string) => void;
  flashcards: FlashCard[];
  addFlashcard: (flashcard: Omit<FlashCard, 'id'>) => void;
  updateFlashcard: (flashcard: FlashCard) => void;
  removeFlashcard: (id: string) => void;
  schedule: ScheduleEntry[];
  updateSchedule: (schedule: ScheduleEntry[]) => void;
  markScheduleCompleted: (id: string, completed: boolean) => void;
}

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const useSubjectContext = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error('useSubjectContext must be used within a SubjectProvider');
  }
  return context;
};

interface SubjectProviderProps {
  children: ReactNode;
}

export const SubjectProvider = ({ children }: SubjectProviderProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [flashcards, setFlashcards] = useState<FlashCard[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);

  const addSubject = (subject: Omit<Subject, 'id'>) => {
    const newSubject = {
      ...subject,
      id: crypto.randomUUID(),
    };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const updateSubject = (subject: Subject) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === subject.id ? subject : s))
    );
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setFlashcards((prev) => prev.filter((f) => f.subjectId !== id));
    setSchedule((prev) => prev.filter((s) => s.subjectId !== id));
  };

  const addFlashcard = (flashcard: Omit<FlashCard, 'id'>) => {
    const newFlashcard = {
      ...flashcard,
      id: crypto.randomUUID(),
    };
    setFlashcards((prev) => [...prev, newFlashcard]);
  };

  const updateFlashcard = (flashcard: FlashCard) => {
    setFlashcards((prev) =>
      prev.map((f) => (f.id === flashcard.id ? flashcard : f))
    );
  };

  const removeFlashcard = (id: string) => {
    setFlashcards((prev) => prev.filter((f) => f.id !== id));
  };

  const updateSchedule = (newSchedule: ScheduleEntry[]) => {
    setSchedule(newSchedule);
  };

  const markScheduleCompleted = (id: string, completed: boolean) => {
    setSchedule((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, completed } : entry
      )
    );
  };

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        removeSubject,
        flashcards,
        addFlashcard,
        updateFlashcard,
        removeFlashcard,
        schedule,
        updateSchedule,
        markScheduleCompleted,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};
