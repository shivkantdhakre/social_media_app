export class Sidebar {
  private element: HTMLElement;

  constructor() {
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';
    this.render();
  }

  private render() {
    this.element.innerHTML = `
      <div class="trending">
        <h3>Trending Topics</h3>
        <div class="trending-item">
          <div class="trending-tag">#WebDevelopment</div>
          <div class="trending-count">1.2K posts</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">#React</div>
          <div class="trending-count">856 posts</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">#TypeScript</div>
          <div class="trending-count">642 posts</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">#Design</div>
          <div class="trending-count">423 posts</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">#Photography</div>
          <div class="trending-count">312 posts</div>
        </div>
      </div>

      <div class="trending">
        <h3>Suggested Users</h3>
        <div class="trending-item">
          <div class="trending-tag">@sarah_codes</div>
          <div class="trending-count">Frontend Developer</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">@mike_designs</div>
          <div class="trending-count">UI/UX Designer</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">@tech_guru</div>
          <div class="trending-count">Tech Blogger</div>
        </div>
      </div>

      <div class="trending">
        <h3>Quick Stats</h3>
        <div class="trending-item">
          <div class="trending-tag">Total Posts</div>
          <div class="trending-count">2.4K today</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">Active Users</div>
          <div class="trending-count">1.8K online</div>
        </div>
        <div class="trending-item">
          <div class="trending-tag">New Members</div>
          <div class="trending-count">156 this week</div>
        </div>
      </div>
    `;
  }

  getElement() {
    return this.element;
  }
}