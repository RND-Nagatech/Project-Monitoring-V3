import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Inquiry } from '../types';
import { dummyInquiries, dummyUsers } from '../data/dummy';

interface AppContextType {
  user: User | null;
  inquiries: Inquiry[];
  login: (user: User) => void;
  logout: () => void;
  addInquiry: (inquiry: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => void;
  updateInquiry: (id: string, updates: Partial<Inquiry>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [inquiries, setInquiries] = useState<Inquiry[]>(dummyInquiries);

  // Check for saved user data on app initialization
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    if (savedUserData) {
      try {
        const userData = JSON.parse(savedUserData);
        // Verify the user still exists in dummy data
        const existingUser = dummyUsers.find(u => u.user_id === userData.user_id);
        if (existingUser) {
          setUser(existingUser);
        } else {
          // Clear invalid data
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('userData');
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    // Save user data to localStorage for persistence
    localStorage.setItem('userData', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    // Only clear current session data, keep remember me credentials
    localStorage.removeItem('userData');
  };

  const addInquiry = (inquiryData: Omit<Inquiry, 'id' | 'created_at' | 'updated_at'>) => {
    const newInquiry: Inquiry = {
      ...inquiryData,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setInquiries(prev => [...prev, newInquiry]);
  };

  const updateInquiry = (id: string, updates: Partial<Inquiry>) => {
    setInquiries(prev => 
      prev.map(inquiry => 
        inquiry.id === id 
          ? { ...inquiry, ...updates, updated_at: new Date().toISOString() }
          : inquiry
      )
    );
  };

  return (
    <AppContext.Provider value={{
      user,
      inquiries,
      login,
      logout,
      addInquiry,
      updateInquiry,
    }}>
      {children}
    </AppContext.Provider>
  );
};