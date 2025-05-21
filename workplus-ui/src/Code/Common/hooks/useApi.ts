import { useLoading } from '../context/LoadingContext';

interface ApiOptions {
  loadingMessage?: string;
  minLoadingTime?: number;
  demoDelay?: number; // Add delay for demo purposes
}

export const useApi = () => {
  const { showLoading, hideLoading } = useLoading();

  const callApi = async <T>(
    apiCall: () => Promise<T>,
    options: ApiOptions = {}
  ): Promise<T> => {
    const {
      loadingMessage = 'Loading...',
      minLoadingTime = 2000,
      demoDelay = 2000 // Default 2 second delay for demo
    } = options;

    showLoading(loadingMessage);
    const startTime = Date.now();

    try {
      // Add artificial delay for demo
      await new Promise(resolve => setTimeout(resolve, demoDelay));
      
      const result = await apiCall();
      
      // Ensure minimum loading time
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      hideLoading();
    }
  };

  return { callApi };
}; 