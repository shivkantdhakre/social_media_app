import './style.css';
import { authManager } from './lib/auth';
import { isSupabaseConfigured } from './lib/supabase';
import { Header } from './components/Header';
import { AuthForm } from './components/AuthForm';
import { Feed } from './components/Feed';
import { Sidebar } from './components/Sidebar';

class SocialMediaApp {
  private app: HTMLElement;
  private header: Header;
  private currentView: HTMLElement | null = null;

  constructor() {
    this.app = document.querySelector<HTMLDivElement>('#app')!;
    this.app.className = 'app';
    
    this.header = new Header();
    this.app.appendChild(this.header.getElement());

    this.setupEventListeners();
    this.init();
  }

  private setupEventListeners() {
    // Listen for auth state changes
    authManager.subscribe((state) => {
      if (state.user) {
        this.showMainApp();
      } else if (!state.loading) {
        this.showAuthForm();
      }
    });

    // Listen for show auth event
    window.addEventListener('show-auth', () => {
      this.showAuthForm();
    });
  }

  private init() {
    // Show loading initially
    this.showLoading();

    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      this.showSupabaseSetup();
      return;
    }

    // Auth manager will handle the initial state
  }

  private showLoading() {
    this.clearCurrentView();
    
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.style.minHeight = '50vh';
    loading.innerHTML = `
      <div class="spinner"></div>
      Loading...
    `;
    
    this.currentView = loading;
    this.app.appendChild(loading);
  }

  private showSupabaseSetup() {
    this.clearCurrentView();
    
    const setup = document.createElement('div');
    setup.className = 'auth-container';
    setup.innerHTML = `
      <div class="auth-form">
        <h2 class="auth-title">Welcome to SocialConnect</h2>
        <div class="success">
          <p><strong>Demo Mode Active</strong></p>
          <p>You're currently viewing SocialConnect in demo mode with sample data.</p>
          <p>To enable full functionality including user authentication, posts, and real-time features, please connect to Supabase using the button in the top right corner.</p>
        </div>
        <button class="btn" onclick="window.location.reload()">Continue in Demo Mode</button>
      </div>
    `;
    
    this.currentView = setup;
    this.app.appendChild(setup);

    // Auto-continue to demo mode after 3 seconds
    setTimeout(() => {
      this.showMainApp();
    }, 3000);
  }

  private showAuthForm() {
    this.clearCurrentView();
    
    const authForm = new AuthForm();
    this.currentView = authForm.getElement();
    this.app.appendChild(this.currentView);
  }

  private showMainApp() {
    this.clearCurrentView();
    
    const main = document.createElement('main');
    main.className = 'main';
    
    const feedContainer = document.createElement('div');
    feedContainer.className = 'feed-container';
    
    const feed = new Feed();
    const sidebar = new Sidebar();
    
    feedContainer.appendChild(feed.getElement());
    feedContainer.appendChild(sidebar.getElement());
    
    main.appendChild(feedContainer);
    
    this.currentView = main;
    this.app.appendChild(main);
  }

  private clearCurrentView() {
    if (this.currentView) {
      this.currentView.remove();
      this.currentView = null;
    }
  }
}

// Initialize the app
new SocialMediaApp();