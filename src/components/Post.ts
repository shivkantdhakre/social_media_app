import { formatDistanceToNow } from 'date-fns';
import { postsManager } from '../lib/posts';
import type { Post as PostType, Comment } from '../types';

export class Post {
  private element: HTMLElement;
  private post: PostType;
  private comments: Comment[] = [];
  private showComments = false;

  constructor(post: PostType) {
    this.post = post;
    this.element = document.createElement('article');
    this.element.className = 'post';
    this.render();
    this.setupEventListeners();
  }

  private render() {
    const timeAgo = formatDistanceToNow(new Date(this.post.created_at), { addSuffix: true });
    
    this.element.innerHTML = `
      <div class="post-header">
        <div class="user-avatar">
          ${this.post.user?.full_name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div class="post-author">
          <div class="post-author-name">${this.post.user?.full_name || 'Anonymous'}</div>
          <div class="post-time">${timeAgo}</div>
        </div>
      </div>
      
      <div class="post-content">${this.post.content}</div>
      
      ${this.post.image_url ? `
        <img src="${this.post.image_url}" alt="Post image" class="post-image">
      ` : ''}
      
      <div class="post-actions">
        <button class="action-btn ${this.post.is_liked ? 'liked' : ''}" data-action="like">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="${this.post.is_liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          ${this.post.likes_count} ${this.post.likes_count === 1 ? 'Like' : 'Likes'}
        </button>
        
        <button class="action-btn" data-action="comment">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          ${this.post.comments_count} ${this.post.comments_count === 1 ? 'Comment' : 'Comments'}
        </button>
        
        <button class="action-btn" data-action="share">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share
        </button>
      </div>
      
      <div class="comments-section" id="comments-${this.post.id}" style="display: none;">
        <div class="comments-list" id="comments-list-${this.post.id}"></div>
        <div class="comment-form">
          <div class="comment-avatar">U</div>
          <input 
            type="text" 
            class="comment-input" 
            placeholder="Write a comment..."
            id="comment-input-${this.post.id}"
          >
          <button class="btn" id="comment-btn-${this.post.id}">Post</button>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    this.element.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      const button = target.closest('button') as HTMLButtonElement;
      
      if (!button) return;
      
      const action = button.dataset.action;
      
      switch (action) {
        case 'like':
          await this.handleLike();
          break;
        case 'comment':
          await this.toggleComments();
          break;
        case 'share':
          this.handleShare();
          break;
      }
    });

    // Comment form submission
    const commentInput = this.element.querySelector(`#comment-input-${this.post.id}`) as HTMLInputElement;
    const commentBtn = this.element.querySelector(`#comment-btn-${this.post.id}`) as HTMLButtonElement;

    const submitComment = async () => {
      const content = commentInput.value.trim();
      if (!content) return;

      commentBtn.disabled = true;
      commentBtn.textContent = 'Posting...';

      try {
        await postsManager.addComment(this.post.id, content);
        commentInput.value = '';
        await this.loadComments();
      } catch (error) {
        console.error('Failed to add comment:', error);
        alert('Failed to add comment. Please try again.');
      } finally {
        commentBtn.disabled = false;
        commentBtn.textContent = 'Post';
      }
    };

    commentBtn.addEventListener('click', submitComment);
    commentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        submitComment();
      }
    });
  }

  private async handleLike() {
    try {
      if (this.post.is_liked) {
        await postsManager.unlikePost(this.post.id);
        this.post.is_liked = false;
        this.post.likes_count--;
      } else {
        await postsManager.likePost(this.post.id);
        this.post.is_liked = true;
        this.post.likes_count++;
      }
      
      this.render();
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  }

  private async toggleComments() {
    const commentsSection = this.element.querySelector(`#comments-${this.post.id}`) as HTMLElement;
    
    if (this.showComments) {
      commentsSection.style.display = 'none';
      this.showComments = false;
    } else {
      commentsSection.style.display = 'block';
      this.showComments = true;
      await this.loadComments();
    }
  }

  private async loadComments() {
    try {
      this.comments = await postsManager.getComments(this.post.id);
      this.renderComments();
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  }

  private renderComments() {
    const commentsList = this.element.querySelector(`#comments-list-${this.post.id}`) as HTMLElement;
    
    commentsList.innerHTML = this.comments.map(comment => {
      const timeAgo = formatDistanceToNow(new Date(comment.created_at), { addSuffix: true });
      
      return `
        <div class="comment">
          <div class="comment-avatar">
            ${comment.user?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div class="comment-content">
            <div class="comment-author">${comment.user?.full_name || 'Anonymous'} • ${timeAgo}</div>
            <div class="comment-text">${comment.content}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  private handleShare() {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        text: this.post.content,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }

  getElement() {
    return this.element;
  }
}