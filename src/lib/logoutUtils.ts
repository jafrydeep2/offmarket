/**
 * Utility functions for handling complete logout and data clearing
 */

import { persistor } from '@/store';
import { clearAuth } from '@/store/authSlice';

/**
 * Clears all user data from various storage mechanisms
 * This is a comprehensive cleanup that should be called on logout
 */
export const clearAllUserData = async (dispatch: any) => {
  console.log('Starting comprehensive user data cleanup...');
  
  try {
    // Clear Redux auth data first
    dispatch(clearAuth());
    
    // Clear all localStorage completely - be more aggressive
    localStorage.clear();
    
    // Clear session storage completely
    sessionStorage.clear();
    
    // Purge persisted storage to completely clear all cached data
    await persistor.purge();
    
    // Clear any cookies that might contain auth data
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
      if (name && (name.includes('supabase') || name.includes('auth') || name.includes('session') || name.includes('sb-'))) {
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=." + window.location.hostname;
      }
    });
    
    // Clear any other potential storage mechanisms
    try {
      // Clear IndexedDB if it exists
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (db.name && (db.name.includes('supabase') || db.name.includes('auth') || db.name.includes('redux') || db.name.includes('luxe'))) {
            indexedDB.deleteDatabase(db.name);
          }
        }
      }
    } catch (error) {
      console.log('Error clearing IndexedDB:', error);
    }
    
    // Clear any cached data in memory
    try {
      // Clear any service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName.includes('supabase') || cacheName.includes('auth') || cacheName.includes('luxe')) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      }
    } catch (error) {
      console.log('Error clearing caches:', error);
    }
    
    console.log('User data cleanup completed successfully');
  } catch (error) {
    console.error('Error during user data cleanup:', error);
    throw error;
  }
};

/**
 * Forces a complete page reload to ensure all state is reset
 * This should be called after clearing all data
 */
export const forcePageReload = () => {
  console.log('Forcing page reload to complete logout...');
  setTimeout(() => {
    // Use replaceState to avoid adding to browser history
    window.history.replaceState(null, '', '/');
    // Force a hard reload to clear all memory
    window.location.href = window.location.origin;
  }, 100);
};

/**
 * Debug function to check what data remains after logout
 * This should be called before logout to verify cleanup
 */
export const debugStorageState = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== Storage Debug Before Logout ===');
    console.log('LocalStorage keys:', Object.keys(localStorage));
    console.log('SessionStorage keys:', Object.keys(sessionStorage));
    console.log('Cookies:', document.cookie);
    console.log('Redux state:', (window as any).__REDUX_DEVTOOLS_EXTENSION__ ? 'Available' : 'Not available');
    console.log('===================================');
  }
};

/**
 * Complete logout process that clears all data and reloads the page
 */
export const performCompleteLogout = async (dispatch: any) => {
  try {
    // Debug storage state before clearing
    debugStorageState();
    
    await clearAllUserData(dispatch);
    
    // Debug storage state after clearing
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Storage Debug After Logout ===');
      console.log('LocalStorage keys:', Object.keys(localStorage));
      console.log('SessionStorage keys:', Object.keys(sessionStorage));
      console.log('Cookies:', document.cookie);
      console.log('==================================');
    }
    
    forcePageReload();
  } catch (error) {
    console.error('Error during complete logout:', error);
    // Even if there's an error, try to reload the page
    forcePageReload();
  }
};
