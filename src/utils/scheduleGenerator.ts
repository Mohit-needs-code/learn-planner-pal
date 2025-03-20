
import { Subject } from "../context/SubjectContext";

interface ScheduleEntry {
  id: string;
  subjectId: string;
  date: Date;
  duration: number;
  completed: boolean;
}

interface ScheduleParams {
  subjects: Subject[];
  startDate: Date;
  endDate: Date;
  dailyHours: number;
  preferredTimeOfDay: 'morning' | 'afternoon' | 'evening' | 'distributed';
}

// Helper function to distribute hours based on difficulty
const distributeHours = (subjects: Subject[], totalHours: number): Map<string, number> => {
  const distribution = new Map<string, number>();
  
  // Calculate total difficulty points
  const totalDifficulty = subjects.reduce((sum, subject) => sum + subject.difficulty, 0);
  
  // Distribute hours proportionally to difficulty
  subjects.forEach(subject => {
    const subjectHours = Math.round((subject.difficulty / totalDifficulty) * totalHours);
    distribution.set(subject.id, subjectHours);
  });
  
  return distribution;
};

// Helper to get date difference in days
const getDaysDifference = (start: Date, end: Date): number => {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Generate study schedule based on inputs
export const generateSchedule = ({
  subjects,
  startDate,
  endDate,
  dailyHours,
  preferredTimeOfDay
}: ScheduleParams): ScheduleEntry[] => {
  const schedule: ScheduleEntry[] = [];
  
  if (subjects.length === 0) return schedule;
  
  // Clone dates to avoid mutations
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Calculate total available study hours
  const days = getDaysDifference(start, end);
  const totalAvailableHours = days * dailyHours;
  
  // Distribute hours among subjects based on difficulty
  const hourDistribution = distributeHours(subjects, totalAvailableHours);
  
  // Update subjects with timeToSpend
  subjects.forEach(subject => {
    const timeToSpend = hourDistribution.get(subject.id) || 0;
    subject.timeToSpend = timeToSpend;
  });
  
  // Sort subjects by exam date (ascending)
  const sortedSubjects = [...subjects].sort((a, b) => 
    a.examDate.getTime() - b.examDate.getTime()
  );
  
  // Assign daily study sessions
  const currentDate = new Date(start);
  
  // Track remaining hours for each subject
  const remainingHours = new Map<string, number>();
  sortedSubjects.forEach(subject => {
    remainingHours.set(subject.id, subject.timeToSpend || 0);
  });
  
  // Generate schedule entries day by day
  while (currentDate <= end) {
    // Skip days where we've allocated all hours
    let remainingDailyHours = dailyHours;
    
    // Determine which subjects to study today based on exam proximity and remaining hours
    const todaySubjects = sortedSubjects.filter(subject => {
      const remaining = remainingHours.get(subject.id) || 0;
      return remaining > 0 && currentDate <= subject.examDate;
    });
    
    if (todaySubjects.length > 0) {
      // Determine time of day for sessions
      let startHour = 9; // Default to morning
      if (preferredTimeOfDay === 'afternoon') startHour = 13;
      if (preferredTimeOfDay === 'evening') startHour = 18;
      
      // Distribute hours for today among subjects
      let hourIncrement = remainingDailyHours / todaySubjects.length;
      
      todaySubjects.forEach((subject, index) => {
        const remaining = remainingHours.get(subject.id) || 0;
        let hoursToday = Math.min(remaining, hourIncrement);
        
        // Round to nearest 0.5 hour
        hoursToday = Math.round(hoursToday * 2) / 2;
        
        if (hoursToday > 0) {
          // Create a schedule entry
          const sessionDate = new Date(currentDate);
          
          // For distributed, spread throughout the day
          if (preferredTimeOfDay === 'distributed') {
            sessionDate.setHours(9 + (index * 4) % 12);
          } else {
            sessionDate.setHours(startHour + index);
          }
          
          schedule.push({
            id: crypto.randomUUID(),
            subjectId: subject.id,
            date: sessionDate,
            duration: hoursToday,
            completed: false
          });
          
          // Update remaining hours
          remainingHours.set(subject.id, remaining - hoursToday);
          remainingDailyHours -= hoursToday;
        }
      });
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return schedule;
};
