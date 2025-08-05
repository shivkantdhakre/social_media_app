import { supabase, isSupabaseConfigured } from './supabase';
import type { User, AuthState } from '../types';

class AuthManager {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    loading: true,
    error: null
  };

  constructor() {
    this.initialize();
  }

  private async initialize() {
    if (!isSupabaseConfigured()) {
      this.setState({
        user: null,
        loading: false,
        error: 'Supabase not configured. Please connect to Supabase to enable authentication.'
      });
      return;
    }

    try {
      const { data: { session } } = await supabase!.auth.getSession();
      
      if (session?.user) {
        const { data: profile } = await supabase!
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        this.setState({
          user: profile || {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || 'Anonymous User',
            created_at: session.user.created_at
          },
          loading: false,
          error: null
        });
      } else {
        this.setState({
          user: null,
          loading: false,
          error: null
        });
      }

      // Listen for auth changes
      supabase!.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase!
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          this.setState({
            user: profile || {
              id: session.user.id,
              email: session.user.email!,
              full_name: session.user.user_metadata?.full_name || 'Anonymous User',
              created_at: session.user.created_at
            },
            loading: false,
            error: null
          });
        } else {
          this.setState({
            user: null,
            loading: false,
            error: null
          });
        }
      });
    } catch (error) {
      this.setState({
        user: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.state); // Call immediately with current state
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  async signUp(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    this.setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase!.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // Create user profile
      if (data.user) {
        await supabase!.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName
        });
      }

      return data;
    } catch (error) {
      this.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      });
      throw error;
    }
  }

  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    this.setState({ loading: true, error: null });

    try {
      const { data, error } = await supabase!.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return data;
    } catch (error) {
      this.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      });
      throw error;
    }
  }

  async signOut() {
    if (!isSupabaseConfigured()) {
      return;
    }

    this.setState({ loading: true, error: null });

    try {
      const { error } = await supabase!.auth.signOut();
      if (error) throw error;
    } catch (error) {
      this.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      });
      throw error;
    }
  }
}

export const authManager = new AuthManager();