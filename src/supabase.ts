import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder');

export const isConfigured = Boolean(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

// Auth helper functions
export const signInWithGoogle = async () => {
  if (!isConfigured) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file in the Settings menu.');
  }
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      if (error.message.includes('provider is not enabled')) {
        throw new Error('Google Sign-In is not enabled in your Supabase project. Please enable it in Authentication > Providers > Google.');
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signInAnonymously = async () => {
  if (!isConfigured) {
    // Return a mock user for preview if not configured
    console.warn('Supabase not configured, using mock guest login');
    return {
      data: {
        user: {
          id: 'mock-guest-' + Date.now(),
          email: 'guest@utubechat.com',
          user_metadata: { display_name: 'Guest User' },
          aud: 'authenticated',
          role: 'authenticated',
          created_at: new Date().toISOString(),
          app_metadata: {},
        }
      },
      error: null
    };
  }
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      if (error.message.toLowerCase().includes('disabled') || error.message.toLowerCase().includes('not enabled')) {
        console.warn('Supabase Anonymous Sign-In is disabled. Falling back to mock guest login.');
        return {
          data: {
            user: {
              id: 'mock-guest-' + Date.now(),
              email: 'guest@utubechat.com',
              user_metadata: { display_name: 'Guest User' },
              aud: 'authenticated',
              role: 'authenticated',
              created_at: new Date().toISOString(),
              app_metadata: {},
            }
          },
          error: null
        };
      }
      throw error;
    }
    return { data, error: null };
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    throw error;
  }
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface SupabaseErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
  }
}

export async function handleSupabaseError(error: any, operationType: OperationType, path: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const errInfo: SupabaseErrorInfo = {
    error: error?.message || String(error),
    authInfo: {
      userId: user?.id,
      email: user?.email,
    },
    operationType,
    path
  }
  console.error('Supabase Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
