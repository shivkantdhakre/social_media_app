import { supabase, isSupabaseConfigured } from './supabase';
import type { Post, Comment } from '../types';

export class PostsManager {
  async createPost(content: string, imageUrl?: string): Promise<Post> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content,
        image_url: imageUrl
      })
      .select(`
        *,
        user:users(*),
        likes_count:likes(count),
        comments_count:comments(count)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getPosts(limit = 20, offset = 0): Promise<Post[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockPosts();
    }

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(*),
        likes_count:likes(count),
        comments_count:comments(count),
        is_liked:likes!inner(user_id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Process the is_liked field
    return data.map(post => ({
      ...post,
      is_liked: user ? post.is_liked?.some((like: any) => like.user_id === user.id) : false
    }));
  }

  async likePost(postId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id
      });

    if (error) throw error;
  }

  async unlikePost(postId: string): Promise<void> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user.id);

    if (error) throw error;
  }

  async addComment(postId: string, content: string): Promise<Comment> {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.id,
        content
      })
      .select(`
        *,
        user:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getComments(postId: string): Promise<Comment[]> {
    if (!isSupabaseConfigured()) {
      return this.getMockComments(postId);
    }

    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  private getMockPosts(): Post[] {
    return [
      {
        id: '1',
        user_id: 'mock-user-1',
        content: 'Welcome to SocialConnect! 🎉 This is a demo post showing how our social media platform works. Like, comment, and share your thoughts!',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        likes_count: 12,
        comments_count: 3,
        is_liked: false,
        user: {
          id: 'mock-user-1',
          email: 'demo@example.com',
          full_name: 'Demo User',
          created_at: new Date().toISOString()
        }
      },
      {
        id: '2',
        user_id: 'mock-user-2',
        content: 'Just finished building an amazing React component! The feeling when everything clicks together is incredible. What are you working on today? 💻✨',
        image_url: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes_count: 8,
        comments_count: 2,
        is_liked: true,
        user: {
          id: 'mock-user-2',
          email: 'jane@example.com',
          full_name: 'Jane Developer',
          created_at: new Date().toISOString()
        }
      },
      {
        id: '3',
        user_id: 'mock-user-3',
        content: 'Beautiful sunset from my evening walk. Sometimes you need to step away from the screen and enjoy the simple things in life. 🌅',
        image_url: 'https://images.pexels.com/photos/416978/pexels-photo-416978.jpeg?auto=compress&cs=tinysrgb&w=800',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        likes_count: 24,
        comments_count: 5,
        is_liked: false,
        user: {
          id: 'mock-user-3',
          email: 'alex@example.com',
          full_name: 'Alex Photographer',
          created_at: new Date().toISOString()
        }
      }
    ];
  }

  private getMockComments(postId: string): Comment[] {
    const comments: Record<string, Comment[]> = {
      '1': [
        {
          id: 'c1',
          post_id: '1',
          user_id: 'mock-user-2',
          content: 'This looks amazing! Great work on the platform.',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-2',
            email: 'jane@example.com',
            full_name: 'Jane Developer',
            created_at: new Date().toISOString()
          }
        }
      ],
      '2': [
        {
          id: 'c2',
          post_id: '2',
          user_id: 'mock-user-1',
          content: 'Love seeing the development process! Keep it up!',
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            email: 'demo@example.com',
            full_name: 'Demo User',
            created_at: new Date().toISOString()
          }
        }
      ],
      '3': [
        {
          id: 'c3',
          post_id: '3',
          user_id: 'mock-user-1',
          content: 'Absolutely stunning! Where was this taken?',
          created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          user: {
            id: 'mock-user-1',
            email: 'demo@example.com',
            full_name: 'Demo User',
            created_at: new Date().toISOString()
          }
        }
      ]
    };

    return comments[postId] || [];
  }
}

export const postsManager = new PostsManager();