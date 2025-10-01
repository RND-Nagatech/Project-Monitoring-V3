import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Inquiry, AuthResponse } from '../types';
import { authAPI, inquiryAPI } from '../services/api';

interface AppContextType {
  user: User | null;
  inquiries: Inquiry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  loading: boolean;
  error: string | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
  addInquiry: (inquiryData: FormData) => Promise<void>;
  updateInquiry: (id: string, updates: Partial<Inquiry> | FormData) => Promise<void>;
  updateInquiryStatus: (id: string, statusData: { status: string; followUpMessage?: string }) => Promise<void>;
  refreshInquiries: (params?: any) => Promise<void>;
  setPage: (page: number) => void;
  setRowsPerPage: (limit: number) => void;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  searchTerm: string;
  statusFilter: string;
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
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Monitor user state changes
  useEffect(() => {
    // User state monitoring removed for production
  }, [user]);

  // Check for saved user data on app initialization
  useEffect(() => {
    const savedUserData = localStorage.getItem('userData');
    const token = localStorage.getItem('token');

    if (savedUserData && token) {
      try {
        const userData = JSON.parse(savedUserData);
        setUser(userData);
        // Refresh inquiries if user is logged in
        refreshInquiries({ page: 1, limit: 10 });
      } catch (error) {
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const login = async (credentials: { username: string; password: string }) => {
    try {
      setLoading(true);
      setError(null);

      const response: AuthResponse = await authAPI.login({ user_id: credentials.username, password: credentials.password });

      const { token, user: userData } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);

      // Try to refresh inquiries, but don't fail login if it fails
      try {
        await refreshInquiries();
      } catch (inquiryError) {
        // Don't throw error here - login was successful, just log the error
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setInquiries([]);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  };

  type InquiryQueryParams = { page?: number; limit?: number; search?: string; status?: string };
  const refreshInquiries = async (params: InquiryQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      // params: { page, limit, search, status }
      const response = await inquiryAPI.getAll({
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        search: params.search !== undefined ? params.search : searchTerm,
        status: params.status !== undefined ? params.status : statusFilter,
      });
      // API returns { success: true, data: [...], pagination: {...} }
      const mappedInquiries = (response.data || []).map((inquiry: any) => ({
        ...inquiry,
        id: inquiry._id || inquiry.id
      }));
      setInquiries(mappedInquiries);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch inquiries');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Handlers for pagination/filter
  const setPage = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    refreshInquiries({ page });
  };
  const setRowsPerPage = (limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
    refreshInquiries({ limit, page: 1 });
  };
  const setSearchTermHandler = (term: string) => {
    setSearchTerm(term);
    refreshInquiries({ search: term, page: 1 });
  };
  const setStatusFilterHandler = (status: string) => {
    setStatusFilter(status);
    refreshInquiries({ status, page: 1 });
  };

  const addInquiry = async (inquiryData: FormData) => {
    try {
      setLoading(true);
      setError(null);

      await inquiryAPI.create(inquiryData);
      await refreshInquiries(); // Refresh the list after adding
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add inquiry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInquiry = async (id: string, updates: Partial<Inquiry> | FormData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Frontend: Calling updateInquiry with ID:', id);
      console.log('Frontend: Update data:', updates);

      const result = await inquiryAPI.update(id, updates);
      console.log('Frontend: API response:', result);

      await refreshInquiries(); // Refresh the list after updating
      console.log('Frontend: Inquiries refreshed after update');
    } catch (error) {
      console.error('Frontend: Update inquiry failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to update inquiry');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateInquiryStatus = async (id: string, statusData: { status: string; followUpMessage?: string }) => {
    try {
      setLoading(true);
      setError(null);

      await inquiryAPI.updateStatus(id, statusData);
      await refreshInquiries(); // Refresh the list after status update
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update inquiry status');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      inquiries,
      pagination,
      loading,
      error,
      login,
      logout,
      addInquiry,
      updateInquiry,
      updateInquiryStatus,
      refreshInquiries,
      setPage,
      setRowsPerPage,
      setSearchTerm: setSearchTermHandler,
      setStatusFilter: setStatusFilterHandler,
      searchTerm,
      statusFilter,
    }}>
      {children}
    </AppContext.Provider>
  );
};