import { postsManager } from '../lib/posts';
import { PostCreator } from './PostCreator';
import { Post } from './Post';
import type { Post as PostType } from '../types';

export class Feed {
  private element: HTMLElement;
  private posts: PostType[] = [];
  private loading = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'feed';
    this.render();
    this.loadPosts();
  }

  private render() {
    this.element.innerHTML = `
      <div id="post-creator-container"></div>
      <div id="posts-container">
        ${this.loading ? `
          <div class="loading">
            <div class="spinner"></div>
            Loading posts...
          </div>
        ` : ''}
      </div>
    `;

    // Add post creator
    const postCreatorContainer = this.element.querySelector('#post-creator-container') as HTMLElement;
    const postCreator = new PostCreator(() => this.loadPosts());
    postCreatorContainer.appendChild(postCreator.getElement());
  }

  private async loadPosts() {
    this.loading = true;
    this.render();

    try {
      this.posts = await postsManager.getPosts();
      this.renderPosts();
    } catch (error) {
      console.error('Failed to load posts:', error);
      this.renderError();
    } finally {
      this.loading = false;
    }
  }

  private renderPosts() {
    const postsContainer = this.element.querySelector('#posts-container') as HTMLElement;
    
    if (this.posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="loading">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = '';
    
    this.posts.forEach(postData => {
      const post = new Post(postData);
      postsContainer.appendChild(post.getElement());
    });
  }

  private renderError() {
    const postsContainer = this.element.querySelector('#posts-container') as HTMLElement;
    postsContainer.innerHTML = `
      <div class="error">
        Failed to load posts. Please try again later.
      </div>
    `;
  }

  getElement() {
    return this.element;
  }
}