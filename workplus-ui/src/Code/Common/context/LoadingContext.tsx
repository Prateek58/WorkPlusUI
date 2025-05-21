import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from '../components/Loader';

interface LoadingContextType {
  showLoading: (message?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Loading...');
  const [startTime, setStartTime] = useState<number | null>(null);

  const showLoading = useCallback((customMessage?: string) => {
    setMessage(customMessage || 'Loading...');
    setLoading(true);
    setStartTime(Date.now());
  }, []);

  const hideLoading = useCallback(() => {
    if (startTime) {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 2000 - elapsedTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          setLoading(false);
          setStartTime(null);
        }, remainingTime);
      } else {
        setLoading(false);
        setStartTime(null);
      }
    } else {
      setLoading(false);
      setStartTime(null);
    }
  }, [startTime]);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      <Loader open={loading} message={message} />
    </LoadingContext.Provider>
  );
}; 