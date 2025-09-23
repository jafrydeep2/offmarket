import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, setLoading, loginSuccess, logout as logoutAction, clearAuth, clearLoginSuccess } from '@/store/authSlice';
import { performCompleteLogout } from '@/lib/logoutUtils';
import { userActivityTracker } from '@/lib/userActivityTracker';

interface ProfileRow {
  id: string;
  username: string | null;
  email: string | null;
  subscription_type: 'basic' | 'premium';
  subscription_expiry: string;
  is_active: boolean;
  is_admin: boolean;
  avatar_url: string | null;
}

interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  subscriptionType: 'basic' | 'premium';
  subscriptionExpiry: string; // ISO date string
  isActive: boolean;
  isAdmin?: boolean;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string, redirectPath?: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signup: (email: string, password: string, username?: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  checkSubscription: () => boolean;
  extendSubscription: (days: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  console.log('fetchUserProfile called with userId:', userId);
  try {
    console.log('Querying profiles table...');
    
    // Add timeout to prevent hanging
    const queryPromise = supabase
      .from('profiles')
      .select('id, username, email, subscription_type, subscription_expiry, is_active, is_admin, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database query timeout after 10 seconds')), 10000)
    );
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
    console.log('Profile query result:', { data, error });

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }

    if (!data) {
      console.log('No profile data found');
      return null;
    }

    console.log('Processing profile data...');
    const profile = data as ProfileRow;
    const result = {
      id: profile.id,
      username: profile.username ?? null,
      email: profile.email ?? null,
      subscriptionType: profile.subscription_type ?? 'basic',
      subscriptionExpiry: profile.subscription_expiry ?? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
      isActive: Boolean(profile.is_active ?? true),
      isAdmin: Boolean(profile.is_admin ?? false),
      avatar_url: profile.avatar_url ?? null,
    };
    console.log('Profile processed:', result);
    return result;
  } catch (err) {
    console.error('fetchUserProfile error:', err);
    return null;
  }
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isAdmin, isLoading } = useAppSelector((state) => state.auth);
  
  // Check if Redux Persist has rehydrated
  const isRehydrated = useAppSelector((state) => state._persist?.rehydrated);
  
  // Debug logging
  useEffect(() => {
    console.log('AuthProvider: State changed:', { 
      user: user?.id, 
      isAuthenticated, 
      isAdmin, 
      isLoading, 
      isRehydrated 
    });
  }, [user, isAuthenticated, isAdmin, isLoading, isRehydrated]);

  // Additional safeguard: Clear user if no valid session exists
  useEffect(() => {
    if (user && !isLoading && isRehydrated) {
      // Check if we have a valid session
      supabase.auth.getSession().then(({ data: sessionResult }) => {
        const session = sessionResult?.session;
        if (!session || !session.user || session.user.id !== user.id) {
          console.log('AuthProvider: No valid session found, clearing user');
          dispatch(clearAuth());
        }
      }).catch(() => {
        console.log('AuthProvider: Error checking session, clearing user');
        dispatch(clearAuth());
      });
    }
  }, [user, isLoading, isRehydrated, dispatch]);

  // Debug logging for user data changes
  useEffect(() => {
    console.log('AuthProvider: User data changed:', { 
      userId: user?.id,
      username: user?.username,
      email: user?.email,
      isAuthenticated,
      isAdmin
    });
  }, [user?.id, user?.username, user?.email, isAuthenticated, isAdmin]);

  // Initialize session and subscribe to auth changes
  useEffect(() => {
    // Don't run until Redux Persist has rehydrated
    if (!isRehydrated) {
      console.log('AuthProvider: Waiting for Redux Persist rehydration...');
      return;
    }

    let mounted = true;
    let validationTimeout: NodeJS.Timeout;

    const init = async () => {
      console.log('AuthProvider: Initializing...');
      console.log('AuthProvider: Current user from Redux:', user);
      console.log('AuthProvider: isRehydrated:', isRehydrated);
      
      // Always validate session on initialization, regardless of persisted user
      dispatch(setLoading(true));
      
      try {
        const { data: sessionResult } = await supabase.auth.getSession();
        const session = sessionResult?.session ?? null;
        console.log('AuthProvider: Session result:', session);
        
        if (session?.user?.id) {
          console.log('AuthProvider: Valid session found, fetching profile...');
          const profile = await fetchUserProfile(session.user.id);
          console.log('AuthProvider: Profile fetched:', profile);
          if (mounted && profile) {
            dispatch(setUser(profile));
          } else if (mounted) {
            // No valid profile found, clear any persisted user
            dispatch(clearAuth());
          }
        } else {
          console.log('AuthProvider: No valid session, clearing any persisted user');
          if (mounted) {
            dispatch(clearAuth());
          }
        }
      } catch (error) {
        console.error('AuthProvider: Initialization error:', error);
        if (mounted) {
          dispatch(clearAuth());
        }
      } finally {
        if (mounted) {
          console.log('AuthProvider: Initialization complete');
          dispatch(setLoading(false));
        }
      }
    };

    init();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      // Handle sign out explicitly
      if (event === 'SIGNED_OUT') {
        console.log('AuthProvider: User signed out, clearing auth state');
        dispatch(clearAuth());
        return;
      }
      
      // Handle token refresh - don't clear user on token refresh
      if (event === 'TOKEN_REFRESHED') {
        console.log('AuthProvider: Token refreshed, keeping user');
        return;
      }
      
      if (!session?.user?.id) {
        // Clear user if no session
        if (user) {
          console.log('AuthProvider: No session user, clearing user');
          dispatch(clearAuth());
        }
        return;
      }
      
      // Handle email confirmation and new sign in
      if (event === 'SIGNED_IN') {
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile && mounted) {
            dispatch(setUser(profile));
          }
        } catch (error) {
          console.error('Error fetching profile on auth state change:', error);
          // Clear user on profile fetch errors
          if (mounted) {
            dispatch(clearAuth());
          }
        }
      }
    });

    return () => {
      mounted = false;
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
      subscription.subscription.unsubscribe();
    };
  }, [dispatch, isRehydrated]);

  const login = async (usernameOrEmail: string, password: string, redirectPath?: string): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    console.log('AuthContext login called with:', { usernameOrEmail, passwordLength: password.length });
    console.log('Supabase client check:', { 
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'Set' : 'Missing',
      supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Set' : 'Missing'
    });
    console.log('Supabase client instance:', supabase);
    dispatch(setLoading(true));
    try {
      // Resolve username to email if needed
      let email = usernameOrEmail;
      if (!usernameOrEmail.includes('@')) {
        console.log('Looking up username:', usernameOrEmail);
        // This looks like a username, try to find the email
        const { data: profileData } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', usernameOrEmail)
          .maybeSingle();
        
        console.log('Username lookup result:', profileData);
        if (profileData?.email) {
          email = profileData.email;
          console.log('Found email for username:', email);
        } else {
          console.log('Username not found');
          return { success: false, error: 'Username not found' };
        }
      }

      console.log('Attempting Supabase login with email:', email);
      try {
        console.log('Calling signInWithPassword...');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log('Supabase login response:', { data: data ? 'success' : 'no data', error: error?.message });
        
        if (error) {
          console.log('Supabase login error:', error);
          // Check if error is due to email not confirmed
          if (error.message?.includes('email_not_confirmed') || error.message?.includes('Email not confirmed')) {
            return { success: false, error: 'Please check your email and click the confirmation link before logging in.', needsConfirmation: true };
          }
          // Handle specific error cases
          if (error.message?.includes('Invalid login credentials')) {
            return { success: false, error: 'Invalid email or password' };
          }
          return { success: false, error: error.message || 'Login failed. Please check your credentials.' };
        }

        if (!data?.user?.id) {
          console.log('No user ID in response');
          return { success: false, error: 'Login failed' };
        }

        console.log('Fetching user profile for ID:', data.user.id);
        const profile = await fetchUserProfile(data.user.id);
        console.log('Profile fetched:', profile);
        
        if (!profile) {
          console.log('Profile not found, creating fallback profile from auth data');
          // Create a fallback profile from the authentication data
          const fallbackProfile: UserProfile = {
            id: data.user.id,
            username: null,
            email: data.user.email || email,
            subscriptionType: 'basic',
            subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
            isActive: true,
            isAdmin: false,
            avatar_url: null,
          };
          console.log('Using fallback profile:', fallbackProfile);
          
          // Dispatch login success to Redux store
          dispatch(loginSuccess({ user: fallbackProfile, redirectPath }));
          console.log('Login success dispatched with fallback profile');
          return { success: true };
        }

        // Check subscription validity and active status
        const isValid = profile.isActive && new Date(profile.subscriptionExpiry) > new Date();
        console.log('Subscription check:', { isActive: profile.isActive, subscriptionExpiry: profile.subscriptionExpiry, isValid });
        
        if (!isValid) {
          console.log('Subscription invalid');
          return { success: false, error: 'Subscription expired or account inactive' };
        }

        // Check if user is admin trying to login to regular user area
        if (profile.isAdmin && !redirectPath?.includes('/admin')) {
          console.log('Admin user trying to access regular user area');
          return { success: false, error: 'User not found' };
        }

        console.log('Dispatching login success to Redux');
        // Dispatch login success to Redux store
        dispatch(loginSuccess({ user: profile, redirectPath }));
        
        // Track login activity
        userActivityTracker.setUserId(profile.id);
        userActivityTracker.trackLogin();
        
        console.log('Login success dispatched');
        return { success: true };
      } catch (supabaseError) {
        console.error('Supabase login error:', supabaseError);
        return { success: false, error: supabaseError?.message || 'Supabase login failed' };
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Login error:', err);
      return { success: false, error: err?.message || 'Login failed' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (email: string, password: string, username?: string) => {
    dispatch(setLoading(true));
    try {
      // Basic validation
      if (!email || !password) {
        return { success: false, error: 'Email and password are required' };
      }
      
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        // Handle specific error cases
        if (error.message?.includes('User already registered')) {
          return { success: false, error: 'An account with this email already exists' };
        }
        if (error.message?.includes('Password should be at least')) {
          return { success: false, error: 'Password must be at least 6 characters long' };
        }
        if (error.message?.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address' };
        }
        return { success: false, error: error.message || 'Signup failed' };
      }
      
      if (!data.user) {
        return { success: false, error: 'Signup failed' };
      }

      // Check if email confirmation is required
      const needsConfirmation = !data.session;

      // profiles row is inserted by trigger; optionally update username using upsert
      if (username) {
        await supabase.from('profiles').upsert({ 
          id: data.user.id, 
          username,
          email: data.user.email,
          subscription_type: 'basic',
          subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          is_active: true,
          is_admin: false
        });
      }

      // Only set user if session exists (email confirmed)
      if (data.session) {
        const profile = await fetchUserProfile(data.user.id);
        if (profile) {
          dispatch(setUser(profile));
          return { success: true };
        } else {
          // Profile not found, but user is confirmed - this shouldn't happen with trigger
          console.warn('Profile not found for confirmed user:', data.user.id);
          return { success: true, needsConfirmation: true };
        }
      } else {
        return { success: true, needsConfirmation: true };
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Signup error:', err?.message || err);
      return { success: false, error: err?.message || 'Unknown error' };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    dispatch(setLoading(true));
    try {
      console.log('Starting logout process...');
      
      // Track logout activity before signing out
      if (user) {
        userActivityTracker.setUserId(user.id);
        userActivityTracker.trackLogout();
      }
      
      // Clear all contexts first
      console.log('Clearing all contexts...');
      dispatch(clearAuth());
      
      // Sign out from Supabase
      console.log('Signing out from Supabase...');
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Supabase signOut error:', signOutError);
      }
      
      // Use the comprehensive logout utility
      await performCompleteLogout(dispatch);
      
      console.log('User logged out, all storage cleared, and page will reload');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, try to clear what we can
      dispatch(clearAuth());
      localStorage.clear();
      sessionStorage.clear();
      
      // Still reload the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const checkSubscription = (): boolean => {
    if (!user) return false;
    // Normalize dates to avoid timezone edge cases
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of day
    const expiryDate = new Date(user.subscriptionExpiry);
    expiryDate.setHours(23, 59, 59, 999); // End of day
    return user.isActive && expiryDate >= today;
  };

  // Debug function to check storage state (available in development)
  const debugStorage = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== Storage Debug Info ===');
      console.log('Redux State:', { user, isAuthenticated, isAdmin, isLoading });
      console.log('LocalStorage keys:', Object.keys(localStorage));
      console.log('SessionStorage keys:', Object.keys(sessionStorage));
      console.log('Supabase session:', supabase.auth.getSession());
      console.log('========================');
    }
  };

  // Expose debug function to window in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      (window as any).debugAuth = debugStorage;
    }
  }, [user, isAuthenticated, isAdmin, isLoading]);

  const extendSubscription = async (days: number) => {
    if (!user) return;
    try {
      const currentExpiry = new Date(user.subscriptionExpiry);
      const newExpiry = new Date(currentExpiry.getTime() + days * 24 * 60 * 60 * 1000);
      const iso = newExpiry.toISOString().split('T')[0];
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_expiry: iso })
        .eq('id', user.id);
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Extend subscription error:', error.message);
        return;
      }
      dispatch(setUser({ ...user, subscriptionExpiry: iso }));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Extend subscription exception:', err);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && checkSubscription() && !isLoading,
    isAdmin: Boolean(user?.isAdmin),
    isLoading,
    login,
    signup,
    logout,
    checkSubscription,
    extendSubscription,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth must be used within an AuthProvider');
    // Return a default context instead of throwing to prevent app crash
    return {
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true,
      login: async () => ({ success: false, error: 'Auth not initialized' }),
      signup: async () => ({ success: false, error: 'Auth not initialized' }),
      logout: async () => {},
      checkSubscription: () => false,
      extendSubscription: async () => {},
    };
  }
  return context;
};
