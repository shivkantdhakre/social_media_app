import { authManager } from '../lib/auth';
import type { User } from '../types';

export class Header {
  private element: HTMLElement;
  private user: User | null = null;

  constructor() {
    this.element = document.createElement('header');
    this.element.className = 'header';
    this.render();
    this.setupEventListeners();

    // Subscribe to auth changes
    authManager.subscribe((state) => {
      this.user = state.user;
      this.render();
    });
  }

  private render() {
    this.element.innerHTML = `
      <div class="header-content">
        <a href="#" class="logo">SocialConnect</a>
        
        ${this.user ? `
          <nav class="nav">
            <a href="#" class="nav-link" data-page="feed">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
              Home
            </a>
            <a href="#" class="nav-link" data-page="explore">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Explore
            </a>
          </nav>
          
          <div class="user-menu">
            <div class="user-avatar" title="${this.user.full_name}">
              ${this.user.full_name.charAt(0).toUpperCase()}
            </div>
            <button class="btn btn-secondary" id="signout-btn">Sign Out</button>
          </div>
        ` : `
          <div class="nav">
            <button class="btn" id="signin-btn">Sign In</button>
          </div>
        `}
      </div>
    `;
  }

  private setupEventListeners() {
    this.element.addEventListener('click', async (e) => {
      const target = e.target as HTMLElement;
      
      if (target.id === 'signout-btn') {
        e.preventDefault();
        try {
          await authManager.signOut();
        } catch (error) {
          console.error('Sign out error:', error);
        }
      }
      
      if (target.id === 'signin-btn') {
        e.preventDefault();
        // This will be handled by the main app to show auth form
        window.dispatchEvent(new CustomEvent('show-auth'));
      }
    });
  }

  getElement() {
    return this.element;
  }
}