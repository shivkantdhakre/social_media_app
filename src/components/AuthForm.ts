import { authManager } from '../lib/auth';

export class AuthForm {
  private element: HTMLElement;
  private isSignUp = false;

  constructor() {
    this.element = document.createElement('div');
    this.element.className = 'auth-container';
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.element.innerHTML = `
      <form class="auth-form" id="auth-form">
        <h2 class="auth-title">${this.isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        
        <div id="auth-error" class="error" style="display: none;"></div>
        
        ${this.isSignUp ? `
          <div class="form-group">
            <label class="form-label" for="fullName">Full Name</label>
            <input type="text" id="fullName" class="form-input" required>
          </div>
        ` : ''}
        
        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input type="email" id="email" class="form-input" required>
        </div>
        
        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input type="password" id="password" class="form-input" required minlength="6">
        </div>
        
        <div class="auth-actions">
          <button type="submit" class="btn" id="submit-btn">
            ${this.isSignUp ? 'Create Account' : 'Sign In'}
          </button>
          
          <div class="auth-switch">
            ${this.isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" id="switch-mode">
              ${this.isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </form>
    `;
  }

  private setupEventListeners() {
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      
      if (target.id === 'switch-mode') {
        e.preventDefault();
        this.isSignUp = !this.isSignUp;
        this.render();
        this.setupEventListeners();
      }
    });

    this.element.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      const email = (form.querySelector('#email') as HTMLInputElement).value;
      const password = (form.querySelector('#password') as HTMLInputElement).value;
      const fullName = this.isSignUp ? (form.querySelector('#fullName') as HTMLInputElement).value : '';
      
      const submitBtn = form.querySelector('#submit-btn') as HTMLButtonElement;
      const errorDiv = form.querySelector('#auth-error') as HTMLElement;
      
      submitBtn.disabled = true;
      submitBtn.textContent = 'Loading...';
      errorDiv.style.display = 'none';
      
      try {
        if (this.isSignUp) {
          await authManager.signUp(email, password, fullName);
        } else {
          await authManager.signIn(email, password);
        }
        
        // Success - the auth state change will be handled by the main app
      } catch (error) {
        errorDiv.textContent = error instanceof Error ? error.message : 'Authentication failed';
        errorDiv.style.display = 'block';
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = this.isSignUp ? 'Create Account' : 'Sign In';
      }
    });
  }

  getElement() {
    return this.element;
  }
}