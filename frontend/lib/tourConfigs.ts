export interface TourStep {
  target: string;
  title: string;
  description: string;
}

export interface TourConfig {
  module: string;
  steps: TourStep[];
}

export const globalTourConfig: TourConfig = {
  module: 'global',
  steps: [
    { target: 'sidebar', title: 'Welcome to WonderMedia', description: "Your AI-powered social media command center. Let's take a quick tour of everything you can do." },
    { target: 'nav-dashboard', title: 'Dashboard', description: 'Your home base. See performance at a glance, track engagement, and monitor your content pipeline.' },
    { target: 'nav-posts', title: 'Posts', description: 'Create, edit, and schedule your social media content. AI helps write captions and suggests the best times to post.' },
    { target: 'nav-products', title: 'Products', description: 'Manage your product catalog. AI uses product information to generate better content and images.' },
    { target: 'nav-ai', title: 'AI Studio', description: 'Generate images, videos, and content ideas with AI. Create combo offers from multiple products.' },
    { target: 'nav-calendar', title: 'Calendar', description: 'Visualize your content schedule. See planned posts, content gaps, and AI recommendations for each day.' },
  ],
};

export const moduleTourConfigs: Record<string, TourConfig> = {
  dashboard: {
    module: 'dashboard',
    steps: [
      { target: 'stats', title: 'Key Metrics', description: 'Track your most important social media metrics at a glance — engagement, reach, followers, and growth.' },
      { target: 'recent-posts', title: 'Recent Posts', description: "See your latest content and how it's performing. Click any post to view details or make edits." },
      { target: 'quick-actions', title: 'Quick Actions', description: 'Jump straight into creating posts, generating AI content, or managing your products.' },
      { target: 'performance', title: 'Performance Chart', description: 'Visualize your growth over time. Spot trends and optimize your content strategy.' },
    ],
  },
  posts: {
    module: 'posts',
    steps: [
      { target: 'create-post', title: 'Create Post', description: 'Start creating a new social media post. AI can help write captions, suggest hashtags, and more.' },
      { target: 'post-filters', title: 'Filters', description: 'Filter posts by status (draft, scheduled, published) or by platform to find exactly what you need.' },
      { target: 'post-card', title: 'Post Actions', description: 'Each post has quick actions — edit content, duplicate for reuse, or delete. Hover to reveal them.' },
      { target: 'post-schedule', title: 'Schedule Posts', description: "Set a date and time for your post to go live. The calendar will show your schedule at a glance." },
      { target: 'ai-assist', title: 'AI Content Assistant', description: 'Let AI generate captions, hashtags, and content ideas based on your products and brand voice.' },
    ],
  },
  products: {
    module: 'products',
    steps: [
      { target: 'add-product', title: 'Add Product', description: 'Add products to your catalog. The more detail you provide, the better AI can use them for content.' },
      { target: 'product-card', title: 'Product Info', description: 'Each product card shows key details — name, description, price, images, and category.' },
      { target: 'product-actions', title: 'Content Actions', description: 'Generate posts, images, videos, or content ideas directly from any product with one click.' },
      { target: 'combo-offer', title: 'Combo Offers', description: 'Select multiple products to create bundle offers. AI generates promotional images featuring all products together.' },
    ],
  },
  calendar: {
    module: 'calendar',
    steps: [
      { target: 'calendar-grid', title: 'Calendar View', description: 'See your entire content schedule on a monthly grid. Color-coded indicators show post status at a glance.' },
      { target: 'content-gaps', title: 'Content Gaps', description: 'The AI identifies days with no content planned and suggests when to post for maximum engagement.' },
      { target: 'daily-recommendations', title: 'Daily Recommendations', description: 'Get AI-powered content suggestions for any day. One click to generate a post idea.' },
      { target: 'create-for-date', title: 'Create for Date', description: 'Click any date to create a post scheduled for that day. No need to manually set the date.' },
    ],
  },
  aiStudio: {
    module: 'aiStudio',
    steps: [
      { target: 'content-prompt', title: 'Content Tab', description: 'Generate social media captions, hashtags, and text content. Select a platform and content type, then let AI write for you.' },
      { target: 'product-selector', title: 'Product Context', description: 'Select a product to give AI context. The product\'s details help generate more relevant, branded images and videos.' },
      { target: 'prompt-input', title: 'Image Prompt', description: 'AI generates a detailed prompt from your product info, or write your own. Edit freely before generating.' },
      { target: 'style-options', title: 'Style & Settings', description: 'Choose visual style, dimensions, and model. Different styles suit different products and platforms.' },
      { target: 'result-actions', title: 'Generated Result', description: 'Download your image, attach it to a post, or view the source traceability. Regenerate with different settings anytime.' },
      { target: 'video-prompt', title: 'Video Prompt', description: 'Describe the video you want. AI can suggest prompts based on your product details.' },
      { target: 'video-settings', title: 'Duration & Model', description: 'Set video duration and choose an AI model. Shorter videos generate faster.' },
      { target: 'video-result', title: 'Video Result', description: 'Preview and download your generated video. Attach it to a post or regenerate with different settings.' },
    ],
  },
};
