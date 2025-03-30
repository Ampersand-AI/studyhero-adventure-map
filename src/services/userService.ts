
import { v4 as uuidv4 } from 'uuid';

// Mock user data
const mockUser = {
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
  getUserProfile: async () => {
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
  updateUserXP: async (xpAmount: number) => {
    // In a real app, this would call an API
    mockUser.xp += xpAmount;
    
    // Level up if XP exceeds threshold
    if (mockUser.xp >= mockUser.level * 1000) {
      mockUser.level += 1;
    }
    
    return mockUser;
  }
};
