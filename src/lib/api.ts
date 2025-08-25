// API endpoints and utilities
export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.proforge.com' 
  : 'http://localhost:3001';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile'
  },
  PROFILES: {
    LIST: '/profiles',
    CREATE: '/profiles',
    UPDATE: '/profiles/:id',
    DELETE: '/profiles/:id',
    VIEW: '/profiles/:id'
  },
  ANALYTICS: {
    VIEWS: '/analytics/views',
    EARNINGS: '/analytics/earnings',
    REFERRALS: '/analytics/referrals'
  }
};

// Mock API functions for development
export const mockAPI = {
  login: async (email: string, password: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      user: { id: 1, email, name: 'أحمد محمد' },
      token: 'mock-jwt-token'
    };
  },
  
  getProfile: async (id: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      id,
      name: 'أحمد محمد',
      title: 'مطور مواقع ومصمم واجهات',
      bio: 'مطور شغوف بخبرة أكثر من 5 سنوات في تطوير المواقع والتطبيقات',
      location: 'الرياض، السعودية',
      email: 'ahmed@example.com',
      phone: '+966 50 123 4567',
      website: 'https://ahmed-dev.com',
      skills: ['React', 'TypeScript', 'Node.js', 'تصميم UI/UX'],
      social: {
        linkedin: 'https://linkedin.com/in/ahmed',
        twitter: 'https://twitter.com/ahmed',
        github: 'https://github.com/ahmed'
      }
    };
  }
};