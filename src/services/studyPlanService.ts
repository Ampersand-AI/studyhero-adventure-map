
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";

// Interface definitions
interface StudyItem {
  id: string;
  title: string;
  description: string;
  type: "lesson" | "quiz" | "practice";
  status: "completed" | "current" | "future";
  dueDate: string;
  content?: string;
  estimatedTimeInMinutes: number;
  subject?: string;
}

interface StudyPlan {
  id: string;
  subject: string;
  items: StudyItem[];
}

interface WeeklyTest {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  dueDate: string;
  estimatedTimeInMinutes: number;
  subject: string;
  isWeeklyTest: boolean;
  weekNumber: number;
}

interface DailyActivity {
  date: string;
  items: StudyItem[];
}

interface WeeklyPlan {
  weekNumber: number;
  startDate: string;
  endDate: string;
  dailyActivities: DailyActivity[];
  weeklyTest: WeeklyTest;
}

// Sample data for demonstration
const generateMockStudyPlans = (): StudyPlan[] => {
  return [
    {
      id: uuidv4(),
      subject: "Mathematics",
      items: [
        {
          id: uuidv4(),
          title: "Algebra Basics",
          description: "Introduction to algebraic expressions and equations",
          type: "lesson",
          status: "current",
          dueDate: "2023-05-15",
          content: "Algebra is a branch of mathematics dealing with symbols and the rules for manipulating these symbols.",
          estimatedTimeInMinutes: 45,
          subject: "Mathematics"
        },
        {
          id: uuidv4(),
          title: "Solving Linear Equations",
          description: "Learn how to solve basic linear equations",
          type: "practice",
          status: "future",
          dueDate: "2023-05-16",
          content: "Linear equations are equations with variables raised to the power of 1.",
          estimatedTimeInMinutes: 30,
          subject: "Mathematics"
        }
      ]
    },
    {
      id: uuidv4(),
      subject: "Physics",
      items: [
        {
          id: uuidv4(),
          title: "Laws of Motion",
          description: "Understanding Newton's laws of motion",
          type: "lesson",
          status: "future",
          dueDate: "2023-05-18",
          content: "Newton's laws of motion describe the relationship between a body and the forces acting upon it.",
          estimatedTimeInMinutes: 60,
          subject: "Physics"
        },
        {
          id: uuidv4(),
          title: "Motion Quiz",
          description: "Test your understanding of Newton's laws",
          type: "quiz",
          status: "future",
          dueDate: "2023-05-20",
          content: "Quiz content about Newton's laws of motion",
          estimatedTimeInMinutes: 20,
          subject: "Physics"
        }
      ]
    }
  ];
};

// Generate a weekly plan with a test
const generateWeeklyPlans = (): WeeklyPlan[] => {
  const now = new Date();
  const weeklyPlans: WeeklyPlan[] = [];
  
  // Create 4 weeks of plans
  for (let week = 1; week <= 4; week++) {
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + (week - 1) * 7);
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    const dailyActivities: DailyActivity[] = [];
    
    // Create activities for each day of the week
    for (let day = 0; day < 5; day++) { // Monday to Friday
      const activityDate = new Date(startDate);
      activityDate.setDate(startDate.getDate() + day);
      
      const items: StudyItem[] = [
        {
          id: uuidv4(),
          title: `Day ${day + 1} Study: ${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]}`,
          description: `Study session for ${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]}`,
          type: "lesson",
          status: "future",
          dueDate: activityDate.toISOString().split('T')[0],
          content: `Lesson content for ${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]}`,
          estimatedTimeInMinutes: 30 + Math.floor(Math.random() * 30),
          subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]
        }
      ];
      
      // Add a quiz for some days
      if (day % 2 === 0) {
        items.push({
          id: uuidv4(),
          title: `${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]} Quiz`,
          description: `Quick quiz on ${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]} concepts`,
          type: "quiz",
          status: "future",
          dueDate: activityDate.toISOString().split('T')[0],
          content: `Quiz content for ${['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]}`,
          estimatedTimeInMinutes: 15,
          subject: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'History'][day]
        });
      }
      
      dailyActivities.push({
        date: activityDate.toISOString().split('T')[0],
        items
      });
    }
    
    // Create weekly test
    const weeklyTest: WeeklyTest = {
      id: uuidv4(),
      title: `Week ${week} Comprehensive Test`,
      description: "Weekly assessment covering all subjects studied this week",
      type: "quiz",
      status: "future",
      dueDate: endDate.toISOString().split('T')[0],
      estimatedTimeInMinutes: 60,
      subject: "All Subjects",
      isWeeklyTest: true,
      weekNumber: week
    };
    
    weeklyPlans.push({
      weekNumber: week,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      dailyActivities,
      weeklyTest
    });
  }
  
  return weeklyPlans;
};

export const studyPlanService = {
  /**
   * Get study plans for the current user
   */
  getStudyPlans: async () => {
    // In a real application, this would call an API
    toast({
      title: "Loading study plans",
      description: "Fetching your personalized study plans...",
    });
    
    return new Promise<StudyPlan[]>((resolve) => {
      setTimeout(() => {
        const plans = generateMockStudyPlans();
        
        toast({
          title: "Study plans loaded",
          description: `Successfully loaded ${plans.length} study plans.`,
        });
        
        resolve(plans);
      }, 1000);
    });
  },
  
  /**
   * Get weekly study plans
   */
  getWeeklyPlans: async () => {
    // In a real application, this would call an API
    toast({
      title: "Generating weekly schedule",
      description: "Creating your optimized weekly study plan...",
    });
    
    return new Promise<WeeklyPlan[]>((resolve) => {
      setTimeout(() => {
        const weeklyPlans = generateWeeklyPlans();
        
        toast({
          title: "Weekly plan ready",
          description: `Successfully created a ${weeklyPlans.length}-week study plan.`,
        });
        
        localStorage.setItem('weeklyPlans', JSON.stringify(weeklyPlans));
        resolve(weeklyPlans);
      }, 1500);
    });
  },
  
  /**
   * Create a new study plan for a subject
   */
  createStudyPlan: async (subject: string) => {
    // In a real application, this would call an API
    toast({
      title: "Connecting to NCERT",
      description: `Extracting ${subject} curriculum data...`,
    });
    
    return new Promise<StudyPlan>((resolve) => {
      setTimeout(() => {
        const newPlan: StudyPlan = {
          id: uuidv4(),
          subject,
          items: [
            {
              id: uuidv4(),
              title: `${subject} Fundamentals`,
              description: `Introduction to ${subject} basics`,
              type: "lesson",
              status: "current",
              dueDate: new Date().toISOString().split('T')[0],
              content: `This is the introductory content for ${subject}.`,
              estimatedTimeInMinutes: 45,
              subject
            },
            {
              id: uuidv4(),
              title: `${subject} Practice`,
              description: `Practice exercises for ${subject}`,
              type: "practice",
              status: "future",
              dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              content: `Practice exercises for ${subject}.`,
              estimatedTimeInMinutes: 30,
              subject
            }
          ]
        };
        
        toast({
          title: "Subject Added",
          description: `${subject} has been added to your study plan.`,
        });
        
        resolve(newPlan);
      }, 2000);
    });
  }
};
