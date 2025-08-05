import { postsManager } from '../lib/posts';

export class PostCreator {
  private element: HTMLElement;
  private onPostCreated: () => void;

  constructor(onPostCreated: () => void) {
    this.onPostCreated = onPostCreated;
    this.element = document.createElement('div');
    this.element.className = 'post-creator';
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.element.innerHTML = `
      <div class="post-creator-header">
        <div class="user-avatar">U</div>
        <textarea 
          class="post-textarea" 
          placeholder="What's on your mind?"
          id="post-content"
        ></textarea>
      </div>
      
      <div class="post-creator-actions">
        <div class="post-options">
          <button class="option-btn" type="button" title="Add Photo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
            Photo
          </button>
          
          <button class="option-btn" type="button" title="Add Emoji">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
            Feeling
          </button>
        </div>
        
        <button class="btn" id="post-btn" disabled>Post</button>
      </div>
    `;
  }

  private setupEventListeners() {
    const textarea = this.element.querySelector('#post-content') as HTMLTextAreaElement;
    const postBtn = this.element.querySelector('#post-btn') as HTMLButtonElement;

    textarea.addEventListener('input', () => {
      const hasContent = textarea.value.trim().length > 0;
      postBtn.disabled = !hasContent;
    });

    postBtn.addEventListener('click', async () => {
      const content = textarea.value.trim();
      if (!content) return;

      postBtn.disabled = true;
      postBtn.textContent = 'Posting...';

      try {
        await postsManager.createPost(content);
        textarea.value = '';
        postBtn.textContent = 'Post';
        this.onPostCreated();
      } catch (error) {
        console.error('Failed to create post:', error);
        alert('Failed to create post. Please try again.');
      } finally {
        postBtn.disabled = true;
        postBtn.textContent = 'Post';
      }
    });
  }

  getElement() {
    return this.element;
  }
}