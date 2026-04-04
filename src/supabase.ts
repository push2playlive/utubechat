import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Auth helper functions
export const signInWithGoogle = async () => {
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
    return data;
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

export const signInAnonymously = async () => {
  try {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      if (error.message.includes('provider is not enabled')) {
        throw new Error('Anonymous Sign-In is not enabled in your Supabase project. Please enable it in Authentication > Providers > Anonymous.');
      }
      throw error;
    }
    return data;
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
