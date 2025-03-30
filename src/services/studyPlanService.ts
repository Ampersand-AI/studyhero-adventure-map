
import { v4 as uuidv4 } from 'uuid';
import { toast } from "@/hooks/use-toast";
import { userService } from './userService';

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

interface TestScore {
  id: string;
  subject: string;
  weekNumber: number;
  score: number;
  date: string;
}

// Generate a weekly plan with a test for each subject
const generateWeeklyPlans = (): WeeklyPlan[] => {
  const now = new Date();
  const weeklyPlans: WeeklyPlan[] = [];
  
  // Get all subjects from localStorage
  const profileData = localStorage.getItem('studyHeroProfile');
  let subjects: string[] = [];
  
  if (profileData) {
    const profile = JSON.parse(profileData);
    subjects = profile.subjects || [];
  }
  
  if (subjects.length === 0) {
    subjects = ['Mathematics', 'Science', 'English', 'Social Studies'];
  }
  
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
      
      // Generate lessons for each subject on this day
      const items: StudyItem[] = [];
      
      // Rotate subjects through days of the week
      subjects.forEach((subject, subjectIndex) => {
        // Only include 1-2 subjects per day to avoid overloading
        if ((subjectIndex + day) % 5 === 0 || (subjectIndex + day) % 5 === 1) {
          items.push({
            id: uuidv4(),
            title: `${subject} Lesson ${week}.${day + 1}`,
            description: `Study session for ${subject}`,
            type: "lesson",
            status: "future",
            dueDate: activityDate.toISOString().split('T')[0],
            content: `Lesson content for ${subject}`,
            estimatedTimeInMinutes: 30 + Math.floor(Math.random() * 30),
            subject: subject
          });
          
          // Add a quiz for some days and subjects
          if ((subjectIndex + day) % 3 === 0) {
            items.push({
              id: uuidv4(),
              title: `${subject} Practice Quiz`,
              description: `Quick practice quiz on ${subject} concepts`,
              type: "quiz",
              status: "future",
              dueDate: activityDate.toISOString().split('T')[0],
              content: `Quiz content for ${subject}`,
              estimatedTimeInMinutes: 15,
              subject: subject
            });
          }
        }
      });
      
      dailyActivities.push({
        date: activityDate.toISOString().split('T')[0],
        items
      });
    }
    
    // Create weekly comprehensive test that covers all subjects
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

// Sample data for demonstration - now updated to be more subject-specific
const generateMockStudyPlans = (subjects: string[] = []): StudyPlan[] => {
  if (subjects.length === 0) {
    subjects = ['Mathematics', 'Physics'];
  }
  
  return subjects.map(subject => {
    const items = generateItemsForSubject(subject);
    
    return {
      id: uuidv4(),
      subject,
      items
    };
  });
};

// Generate study items specific to each subject
const generateItemsForSubject = (subject: string): StudyItem[] => {
  const topics = getTopicsForSubject(subject);
  const now = new Date();
  
  return topics.map((topic, index) => {
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + index * 2);
    
    const types: ("lesson" | "quiz" | "practice")[] = ["lesson", "quiz", "practice"];
    
    return {
      id: uuidv4(),
      title: topic,
      description: `Learn about ${topic} in ${subject}`,
      type: types[index % 3],
      status: index === 0 ? "current" : "future",
      dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      content: `This is sample content for ${topic} in ${subject}`,
      estimatedTimeInMinutes: 30 + (index * 10),
      subject
    };
  });
};

// Get topics based on subject
const getTopicsForSubject = (subject: string): string[] => {
  switch(subject.toLowerCase()) {
    case 'mathematics':
      return ['Algebra', 'Geometry', 'Calculus', 'Statistics', 'Trigonometry', 'Number Theory'];
    case 'science':
      return ['Physics', 'Chemistry', 'Biology', 'Astronomy', 'Earth Science', 'Ecology'];
    case 'english':
      return ['Grammar', 'Literature', 'Writing', 'Comprehension', 'Poetry', 'Vocabulary'];
    case 'social studies':
      return ['History', 'Geography', 'Civics', 'Economics', 'Sociology', 'Political Science'];
    case 'physics':
      return ['Mechanics', 'Electromagnetism', 'Thermodynamics', 'Optics', 'Modern Physics', 'Waves'];
    case 'chemistry':
      return ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry', 'Nuclear Chemistry'];
    case 'biology':
      return ['Cell Biology', 'Genetics', 'Ecology', 'Evolution', 'Human Physiology', 'Microbiology'];
    case 'history':
      return ['Ancient Civilizations', 'Medieval Period', 'Renaissance', 'Industrial Revolution', 'World Wars', 'Modern History'];
    case 'geography':
      return ['Physical Geography', 'Human Geography', 'Cartography', 'Climate', 'Natural Resources', 'Population Studies'];
    case 'economics':
      return ['Microeconomics', 'Macroeconomics', 'International Trade', 'Economic Systems', 'Financial Markets', 'Development Economics'];
    case 'computer science':
      return ['Programming', 'Data Structures', 'Algorithms', 'Computer Systems', 'Networking', 'Databases'];
    default:
      return ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6'];
  }
};

export const studyPlanService = {
  /**
   * Get study plans for the current user
   */
  getStudyPlans: async () => {
    // Get subjects from profile
    const profileData = localStorage.getItem('studyHeroProfile');
    let subjects: string[] = [];
    
    if (profileData) {
      const profile = JSON.parse(profileData);
      subjects = profile.subjects || [];
    }
    
    toast({
      title: "Loading study plans",
      description: "Fetching your personalized study plans...",
    });
    
    return new Promise<StudyPlan[]>((resolve) => {
      setTimeout(() => {
        const plans = generateMockStudyPlans(subjects);
        
        toast({
          title: "Study plans loaded",
          description: `Successfully loaded ${plans.length} study plans.`,
        });
        
        resolve(plans);
      }, 1000);
    });
  },
  
  /**
   * Get weekly study plans with subject integration
   */
  getWeeklyPlans: async () => {
    toast({
      title: "Generating weekly schedule",
      description: "Creating your optimized weekly study plan...",
    });
    
    return new Promise<{weeklyPlans: WeeklyPlan[]}>(resolve => {
      setTimeout(() => {
        const weeklyPlans = generateWeeklyPlans();
        
        toast({
          title: "Weekly plan ready",
          description: `Successfully created a ${weeklyPlans.length}-week study plan with all your subjects.`,
        });
        
        localStorage.setItem('weeklyPlans', JSON.stringify(weeklyPlans));
        resolve({weeklyPlans});
      }, 1500);
    });
  },
  
  /**
   * Create a new study plan for a subject
   */
  createStudyPlan: async (subject: string) => {
    toast({
      title: "Connecting to NCERT",
      description: `Extracting ${subject} curriculum data...`,
    });
    
    return new Promise<StudyPlan>((resolve) => {
      setTimeout(() => {
        const items = generateItemsForSubject(subject);
        
        const newPlan: StudyPlan = {
          id: uuidv4(),
          subject,
          items
        };
        
        toast({
          title: "Subject Added",
          description: `${subject} has been added to your study plan.`,
        });
        
        resolve(newPlan);
      }, 2000);
    });
  },
  
  /**
   * Save a test score
   */
  saveTestScore: async (testId: string, subject: string, weekNumber: number, score: number) => {
    const newScore: TestScore = {
      id: uuidv4(),
      subject,
      weekNumber,
      score,
      date: new Date().toISOString()
    };
    
    // Get existing scores or initialize new array
    const savedScores = localStorage.getItem('weeklyTestScores');
    let scores: TestScore[] = [];
    
    if (savedScores) {
      scores = JSON.parse(savedScores);
    }
    
    // Add new score
    scores.push(newScore);
    localStorage.setItem('weeklyTestScores', JSON.stringify(scores));
    
    // Update XP based on score
    const xpGained = Math.round(score * 10); // 10 XP per 1% score
    await userService.updateUserXP(xpGained);
    
    toast({
      title: "Test Completed",
      description: `You scored ${score}% and earned ${xpGained} XP!`,
    });
    
    return newScore;
  }
};
