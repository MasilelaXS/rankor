import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const useTokenValidation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuthStore();

  const handleTokenExpiration = () => {
    logout();
    // Clear any additional stored data if needed
    localStorage.removeItem('ctecg-auth');
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  // Listen for storage events (logout from another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ctecg-auth' && e.newValue === null && isAuthenticated) {
        // Auth data was cleared in another tab
        logout();
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated, logout, navigate]);

  // Expose the token expiration handler for manual use
  return {
    handleTokenExpiration,
  };
};

// Global token expiration handler that can be called from anywhere
export const handleGlobalTokenExpiration = () => {
  // Clear auth data
  localStorage.removeItem('ctecg-auth');
  
  // Show a brief notification
  alert('Your session has expired. You will be redirected to the login page.');
  
  // Force page reload to reset all state and redirect to login
  window.location.href = '/login';
};