import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize session from Supabase client or localStorage
  useEffect(() => {
    const initAuth = async () => {
      // 1. If live Supabase client configured, listen for session
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setToken(session.access_token);
            localStorage.setItem('kisanconnect_token', session.access_token);

            // Fetch profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              const formattedUser = {
                _id: profile.id,
                id: profile.id,
                name: profile.name,
                email: profile.email,
                phone: profile.phone,
                role: profile.role,
                location: {
                  district: profile.district,
                  state: profile.state,
                  pincode: profile.pincode,
                  address: profile.address || '',
                  village: profile.village || ''
                },
                farmDetails: profile.farm_details || {},
                buyerDetails: profile.buyer_details || {},
                trustScore: Number(profile.trust_score) || 4.8,
                isVerified: Boolean(profile.is_verified)
              };
              setUser(formattedUser);
              localStorage.setItem('kisanconnect_user', JSON.stringify(formattedUser));
            }
          }
        } catch (e) {
          console.warn('Supabase session init error:', e);
        }
      }

      // 2. Fallback to stored token / user
      const storedToken = localStorage.getItem('kisanconnect_token');
      const storedUser = localStorage.getItem('kisanconnect_user');
      if (storedToken && storedUser && !user) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('kisanconnect_token');
          localStorage.removeItem('kisanconnect_user');
        }
      }

      setLoading(false);
    };

    initAuth();

    // Supabase auth state change listener
    let authListener = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('kisanconnect_token');
          localStorage.removeItem('kisanconnect_user');
        } else if (session?.access_token) {
          setToken(session.access_token);
          localStorage.setItem('kisanconnect_token', session.access_token);
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      if (authListener) authListener.unsubscribe();
    };
  }, []);

  // Login via Supabase / backend API
  const login = async (emailOrPhone, password) => {
    try {
      const res = await API.post('/auth/login', { emailOrPhone, password });
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('kisanconnect_token', receivedToken);
        localStorage.setItem('kisanconnect_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Login failed. Please verify your credentials.'
      };
    }
  };

  // Register via Supabase / backend API
  const register = async (userData) => {
    try {
      const res = await API.post('/auth/register', userData);
      if (res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('kisanconnect_token', receivedToken);
        localStorage.setItem('kisanconnect_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Registration failed.'
      };
    }
  };

  // Logout
  const logout = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('kisanconnect_token');
    localStorage.removeItem('kisanconnect_user');
  };

  // Quick Demo Login for SIH testing
  const quickDemoLogin = async (role) => {
    let email = 'farmer@kisanconnect.in';
    if (role === 'farmer3') email = 'farmer3@kisanconnect.in';
    if (role === 'buyer') email = 'buyer@kisanconnect.in';
    if (role === 'admin') email = 'admin@kisanconnect.in';

    return await login(email, 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isFarmer: user?.role === 'farmer',
        isBuyer: user?.role === 'buyer',
        isAdmin: user?.role === 'admin',
        loading,
        login,
        register,
        logout,
        quickDemoLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
