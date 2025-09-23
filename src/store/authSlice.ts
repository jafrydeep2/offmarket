import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  subscriptionType: 'basic' | 'premium';
  subscriptionExpiry: string; // ISO date string
  isActive: boolean;
  isAdmin?: boolean;
  avatar_url?: string | null;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginSuccess: boolean;
  redirectPath: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  isLoading: false,
  loginSuccess: false,
  redirectPath: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserProfile | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = Boolean(action.payload?.isAdmin);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<{ user: UserProfile; redirectPath?: string }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isAdmin = Boolean(action.payload.user.isAdmin);
      state.loginSuccess = true;
      state.redirectPath = action.payload.redirectPath || null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.loginSuccess = false;
      state.redirectPath = null;
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isLoading = false;
      state.loginSuccess = false;
      state.redirectPath = null;
    },
    clearLoginSuccess: (state) => {
      state.loginSuccess = false;
      state.redirectPath = null;
    },
    setRedirectPath: (state, action: PayloadAction<string | null>) => {
      state.redirectPath = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle rehydration from Redux Persist
    builder.addCase('persist/REHYDRATE', (state, action: any) => {
      console.log('Auth slice: Rehydrating from storage:', action.payload);
      if (action.payload?.auth) {
        const persistedAuth = action.payload.auth;
        console.log('Auth slice: Restored auth state:', persistedAuth);
        // Don't override if we already have data
        if (!state.user && persistedAuth.user) {
          state.user = persistedAuth.user;
          state.isAuthenticated = persistedAuth.isAuthenticated;
          state.isAdmin = persistedAuth.isAdmin;
          state.loginSuccess = false; // Reset login success on rehydration
          state.redirectPath = null; // Reset redirect path on rehydration
        }
      }
    });
  },
});

export const { 
  setUser, 
  setLoading, 
  loginSuccess, 
  logout, 
  clearAuth,
  clearLoginSuccess, 
  setRedirectPath 
} = authSlice.actions;

export default authSlice.reducer;
