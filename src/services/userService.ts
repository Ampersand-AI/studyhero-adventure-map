
import { v4 as uuidv4 } from 'uuid';

// Define User type
export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
}

// Mock user data
const mockUser: User = {
  id: uuidv4(),
  name: "Student User",
  email: "student@example.com",
  level: 3,
  xp: 750,
};

export const userService = {
  /**
   * Get the current user's profile
   */
  getUserProfile: async (): Promise<User> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockUser);
      }, 500);
    });
  },

  /**
   * Update user XP
   */
  updateUserXP: async (xpAmount: number): Promise<User> => {
    // In a real app, this would call an API
    mockUser.xp += xpAmount;
    
    // Level up if XP exceeds threshold
    if (mockUser.xp >= mockUser.level * 1000) {
      mockUser.level += 1;
    }
    
    return mockUser;
  }
};
