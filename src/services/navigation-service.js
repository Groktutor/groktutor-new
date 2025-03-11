// navigationService.js - Cross-linking and navigation system for Groktutor platform
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Site map - defines hierarchical structure and relationships between sections
 */
const SITE_MAP = {
  home: {
    title: "Home",
    path: "/",
    children: ["skills", "live-data", "industries", "programs", "contests", "trending", "crypto", "trading", "bugbash"]
  },
  skills: {
    title: "Prompt Engineering Skills",
    path: "/skills",
    children: ["reasoning", "data-analysis", "creative-writing", "coding", "summarization", "personalization"],
    related: ["live-data", "programs"]
  },
  "live-data": {
    title: "Real-Time Data",
    path: "/live-data",
    children: ["reddit-data", "twitter-data", "github-data", "huggingface-data"],
    related: ["trending", "skills"]
  },
  industries: {
    title: "Industry Applications",
    path: "/industries",
    children: ["healthcare", "finance", "legal", "education", "marketing", "research"],
    related: ["skills", "programs"]
  },
  programs: {
    title: "Learning Programs",
    path: "/programs",
    children: ["beginner", "intermediate", "advanced", "certification"],
    related: ["skills", "industries"]
  },
  contests: {
    title: "Prompt Engineering Contests",
    path: "/contests",
    children: ["active", "upcoming", "past", "leaderboard"],
    related: ["bugbash", "trending"]
  },
  trending: {
    title: "Trending Techniques",
    path: "/trending",
    children: ["daily", "weekly", "monthly"],
    related: ["live-data", "skills"]
  },
  crypto: {
    title: "Crypto Prompt Engineering",
    path: "/crypto",
    children: ["analysis", "trading", "fundamentals"],
    related: ["trading", "skills"]
  },
  trading: {
    title: "Trading Strategies",
    path: "/trading",
    children: ["technical", "sentiment", "fundamental"],
    related: ["crypto", "skills"]
  },
  bugbash: {
    title: "Bug Bash Challenges",
    path: "/bugbash",
    children: ["current", "submissions", "rewards"],
    related: ["contests"]
  },
  // Skill subcategories
  reasoning: {
    title: "Reasoning & Logic",
    path: "/skills/reasoning",
    parent: "skills",
    children: ["chain-of-thought", "tree-of-thought", "react", "socratic", "icl"],
    related: ["data-analysis", "coding"]
  },
  "data-analysis": {
    title: "Data Analysis",
    path: "/skills/data-analysis",
    parent: "skills",
    children: ["data-formatting", "exploratory-analysis", "data-cleaning", "insight-generation", "visualization"],
    related: ["reasoning", "coding"]
  },
  "creative-writing": {
    title: "Creative Writing",
    path: "/skills/creative-writing",
    parent: "skills",
    children: ["storytelling", "character-development", "plot-structure", "dialogue"],
    related: ["personalization", "summarization"]
  },
  coding: {
    title: "Code Generation",
    path: "/skills/coding",
    parent: "skills",
    children: ["python", "javascript", "sql", "algorithms", "debugging"],
    related: ["reasoning", "data-analysis"]
  },
  summarization: {
    title: "Summarization Techniques",
    path: "/skills/summarization",
    parent: "skills",
    children: ["extractive", "abstractive", "length-control", "focus-control"],
    related: ["creative-writing", "personalization"]
  },
  personalization: {
    title: "Personalization",
    path: "/skills/personalization",
    parent: "skills",
    children: ["tone-adjustment", "complexity-control", "audience-adaptation"],
    related: ["creative-writing", "summarization"]
  },
  // Live data subcategories
  "reddit-data": {
    title: "Reddit Discussions",
    path: "/live-data/reddit",
    parent: "live-data",
    related: ["twitter-data", "trending"]
  },
  "twitter-data": {
    title: "Twitter Insights",
    path: "/live-data/twitter",
    parent: "live-data",
    related: ["reddit-data", "trending"]
  },
  "github-data": {
    title: "GitHub Projects",
    path: "/live-data/github",
    parent: "live-data",
    related: ["huggingface-data", "coding"]
  },
  "huggingface-data": {
    title: "HuggingFace Models",
    path: "/live-data/huggingface",
    parent: "live-data",
    related: ["github-data", "trending"]
  },
  // Reasoning techniques
  "chain-of-thought": {
    title: "Chain-of-Thought Prompting",
    path: "/skills/reasoning/chain-of-thought",
    parent: "reasoning",
    related: ["tree-of-thought", "react", "socratic"]
  },
  "tree-of-thought": {
    title: "Tree-of-Thought Prompting",
    path: "/skills/reasoning/tree-of-thought",
    parent: "reasoning",
    related: ["chain-of-thought", "react"]
  },
  "react": {
    title: "ReAct Framework",
    path: "/skills/reasoning/react",
    parent: "reasoning",
    related: ["chain-of-thought", "tree-of-thought"]
  },
  "socratic": {
    title: "Socratic Method",
    path: "/skills/reasoning/socratic",
    parent: "reasoning",
    related: ["chain-of-thought", "icl"]
  },
  "icl": {
    title: "In-Context Learning",
    path: "/skills/reasoning/icl",
    parent: "reasoning",
    related: ["chain-of-thought", "socratic"]
  },
  // Industries
  "healthcare": {
    title: "Healthcare",
    path: "/industries/healthcare",
    parent: "industries",
    related: ["research", "education"]
  },
  "finance": {
    title: "Finance",
    path: "/industries/finance",
    parent: "industries",
    related: ["trading", "crypto"]
  },
  "legal": {
    title: "Legal",
    path: "/industries/legal",
    parent: "industries",
    related: ["research", "summarization"]
  },
  "education": {
    title: "Education",
    path: "/industries/education",
    parent: "industries",
    related: ["creative-writing", "personalization"]
  },
  "marketing": {
    title: "Marketing",
    path: "/industries/marketing",
    parent: "industries",
    related: ["creative-writing", "personalization"]
  },
  "research": {
    title: "Research",
    path: "/industries/research",
    parent: "industries",
    related: ["data-analysis", "summarization"]
  }
};

/**
 * Content-based relationships to dynamically link related content across the platform
 * Maps content IDs to related content by category and relevance score
 */
const CONTENT_RELATIONSHIPS = {
  // Content relationships for reasoning techniques
  "chain-of-thought-guide": {
    type: "tutorial",
    category: "chain-of-thought",
    relatedContent: [
      { id: "tree-of-thought-comparison", relevance: 0.95 },
      { id: "reasoning-benchmark-results", relevance: 0.9 },
      { id: "cot-reddit-discussion", relevance: 0.85 },
      { id: "step-by-step-prompt-template", relevance: 0.8 }
    ]
  },
  "tree-of-thought-comparison": {
    type: "comparison",
    category: "tree-of-thought",
    relatedContent: [
      { id: "chain-of-thought-guide", relevance: 0.95 },
      { id: "reasoning-benchmark-results", relevance: 0.9 },
      { id: "tot-implementation-code", relevance: 0.85 }
    ]
  },
  "reasoning-benchmark-results": {
    type: "research",
    category: "reasoning",
    relatedContent: [
      { id: "chain-of-thought-guide", relevance: 0.9 },
      { id: "tree-of-thought-comparison", relevance: 0.9 },
      { id: "react-framework-tutorial", relevance: 0.8 }
    ]
  },
  "react-framework-tutorial": {
    type: "tutorial",
    category: "react",
    relatedContent: [
      { id: "chain-of-thought-guide", relevance: 0.85 },
      { id: "tree-of-thought-comparison", relevance: 0.85 },
      { id: "reasoning-benchmark-results", relevance: 0.8 },
      { id: "tot-implementation-code", relevance: 0.75 }
    ]
  },
  "tot-implementation-code": {
    type: "code",
    category: "tree-of-thought",
    relatedContent: [
      { id: "tree-of-thought-comparison", relevance: 0.95 },
      { id: "react-framework-tutorial", relevance: 0.8 },
      { id: "github-prompt-patterns-repo", relevance: 0.75 }
    ]
  },
  "step-by-step-prompt-template": {
    type: "template",
    category: "chain-of-thought",
    relatedContent: [
      { id: "chain-of-thought-guide", relevance: 0.9 },
      { id: "cot-reddit-discussion", relevance: 0.8 },
      { id: "exploratory-data-prompt-guide", relevance: 0.7 }
    ]
  },
  
  // Content relationships for data analysis
  "exploratory-data-prompt-guide": {
    type: "tutorial",
    category: "data-analysis",
    relatedContent: [
      { id: "data-formatting-templates", relevance: 0.9 },
      { id: "visualization-prompt-techniques", relevance: 0.85 },
      { id: "github-data-analysis-repo", relevance: 0.8 }
    ]
  },
  "data-formatting-templates": {
    type: "template",
    category: "data-formatting",
    relatedContent: [
      { id: "exploratory-data-prompt-guide", relevance: 0.9 },
      { id: "visualization-prompt-techniques", relevance: 0.8 },
      { id: "data-cleaning-techniques", relevance: 0.85 }
    ]
  },
  "visualization-prompt-techniques": {
    type: "tutorial",
    category: "visualization",
    relatedContent: [
      { id: "exploratory-data-prompt-guide", relevance: 0.85 },
      { id: "data-formatting-templates", relevance: 0.8 },
      { id: "github-data-analysis-repo", relevance: 0.75 }
    ]
  },
  "data-cleaning-techniques": {
    type: "tutorial",
    category: "data-cleaning",
    relatedContent: [
      { id: "data-formatting-templates", relevance: 0.85 },
      { id: "exploratory-data-prompt-guide", relevance: 0.8 },
      { id: "step-by-step-prompt-template", relevance: 0.7 }
    ]
  },
  
  // Content relationships for real-time data
  "cot-reddit-discussion": {
    type: "reddit",
    category: "reddit-data",
    relatedContent: [
      { id: "chain-of-thought-guide", relevance: 0.85 },
      { id: "prompt-engineer-twitter-thread", relevance: 0.75 },
      { id: "reasoning-benchmark-results", relevance: 0.7 }
    ]
  },
  "prompt-engineer-twitter-thread": {
    type: "twitter",
    category: "twitter-data",
    relatedContent: [
      { id: "github-prompt-patterns-repo", relevance: 0.8 },
      { id: "cot-reddit-discussion", relevance: 0.75 }
    ]
  },
  "github-prompt-patterns-repo": {
    type: "github",
    category: "github-data",
    relatedContent: [
      { id: "prompt-engineer-twitter-thread", relevance: 0.8 },
      { id: "prompt-tuning-toolkit-model", relevance: 0.85 },
      { id: "tot-implementation-code", relevance: 0.7 }
    ]
  },
  "prompt-tuning-toolkit-model": {
    type: "huggingface",
    category: "huggingface-data",
    relatedContent: [
      { id: "github-prompt-patterns-repo", relevance: 0.85 },
      { id: "llama-model-card", relevance: 0.75 }
    ]
  },
  "llama-model-card": {
    type: "huggingface",
    category: "huggingface-data",
    relatedContent: [
      { id: "prompt-tuning-toolkit-model", relevance: 0.75 },
      { id: "github-prompt-patterns-repo", relevance: 0.7 },
      { id: "github-data-analysis-repo", relevance: 0.65 }
    ]
  },
  "github-data-analysis-repo": {
    type: "github",
    category: "github-data",
    relatedContent: [
      { id: "visualization-prompt-techniques", relevance: 0.8 },
      { id: "exploratory-data-prompt-guide", relevance: 0.75 },
      { id: "llama-model-card", relevance: 0.65 }
    ]
  }
};

/**
 * Popular Content - Hard-coded for demo purposes
 */
const POPULAR_CONTENT = [
  { id: "chain-of-thought-guide", popularity: 95, ...CONTENT_RELATIONSHIPS["chain-of-thought-guide"] },
  { id: "tree-of-thought-comparison", popularity: 85, ...CONTENT_RELATIONSHIPS["tree-of-thought-comparison"] },
  { id: "cot-reddit-discussion", popularity: 80, ...CONTENT_RELATIONSHIPS["cot-reddit-discussion"] },
  { id: "github-prompt-patterns-repo", popularity: 75, ...CONTENT_RELATIONSHIPS["github-prompt-patterns-repo"] },
  { id: "exploratory-data-prompt-guide", popularity: 70, ...CONTENT_RELATIONSHIPS["exploratory-data-prompt-guide"] },
];

/**
 * Navigation Service Implementation
 */
class NavigationService {
  constructor() {
    this.currentPath = "/";
    this.history = ["/"];
    this.contentViewHistory = [];
    this.eventListeners = {};
  }
  
  /**
   * Navigate to a specific path
   * @param {string} path - The path to navigate to
   * @param {boolean} addToHistory - Whether to add to browser history
   */
  navigateTo(path, addToHistory = true) {
    this.currentPath = path;
    this.history.push(path);
    this.notifyPathChange(path);
    return this.getSectionInfo(path);
  }
  
  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
    
    // Return unsubscribe function
    return () => {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    };
  }
  
  /**
   * Notify event listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  notifyListeners(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => {
        callback(data);
      });
    }
  }
  
  /**
   * Notify subscribers that the path has changed
   * @param {string} path - The new path
   */
  notifyPathChange(path) {
    this.notifyListeners('pathChanged', { path });
    
    // Dispatch custom event for React components
    const event = new CustomEvent('navigation:pathChanged', { detail: { path } });
    document.dispatchEvent(event);
    
    // Track page view for analytics
    this.trackPageView(path);
  }
  
  /**
   * Track page view for analytics
   * @param {string} path - The path being viewed
   */
  trackPageView(path) {
    // In a real implementation, this would send data to an analytics service
    console.log(`Analytics: Page view tracked for ${path}`);
  }
  
  /**
   * Record content view history for personalization
   * @param {string} contentId - The ID of the viewed content
   * @param {string} contentType - The type of content viewed
   * @param {string} category - The category of the content
   */
  recordContentView(contentId, contentType, category) {
    this.contentViewHistory.push({
      contentId,
      contentType,
      category,
      timestamp: new Date().toISOString()
    });
    
    // Limit history length to prevent memory issues
    if (this.contentViewHistory.length > 100) {
      this.contentViewHistory.shift();
    }
    
    // Notify event listeners
    this.notifyListeners('contentViewed', { contentId, contentType, category });
  }
  
  /**
   * Get information about a section by its path
   * @param {string} path - The path of the section
   * @returns {Object|null} The section information or null if not found
   */
  getSectionInfo(path) {
    // Find the section with the matching path
    const key = Object.keys(SITE_MAP).find(key => SITE_MAP[key].path === path);
    return key ? { id: key, ...SITE_MAP[key] } : null;
  }
  
  /**
   * Get information about a section by its ID
   * @param {string} id - The ID of the section
   * @returns {Object|null} The section information or null if not found
   */
  getSectionById(id) {
    return SITE_MAP[id] ? { id, ...SITE_MAP[id] } : null;
  }
  
  /**
   * Generate breadcrumbs for a given path
   * @param {string} path - The path to generate breadcrumbs for
   * @returns {Array<Object>} Array of breadcrumb objects
   */
  generateBreadcrumbs(path) {
    const section = this.getSectionInfo(path);
    if (!section) return [{ id: 'home', title: 'Home', path: '/' }];
    
    const breadcrumbs = [{ id: 'home', title: 'Home', path: '/' }];
    
    if (section.parent) {
      const parent = this.getSectionById(section.parent);
      
      // Check for grandparent
      if (parent.parent) {
        const grandparent = this.getSectionById(parent.parent);
        breadcrumbs.push({ id: grandparent.id, title: grandparent.title, path: grandparent.path });
      }
      
      breadcrumbs.push({ id: parent.id, title: parent.title, path: parent.path });
    }
    
    // Add current section
    if (section.id !== 'home') {
      breadcrumbs.push({ id: section.id, title: section.title, path: section.path });
    }
    
    return breadcrumbs;
  }
  
  /**
   * Get child sections for a given section ID
   * @param {string} sectionId - The ID of the parent section
   * @returns {Array<Object>} Array of child section objects
   */
  getChildSections(sectionId) {
    const section = this.getSectionById(sectionId);
    if (!section || !section.children) return [];
    
    return section.children
      .map(childId => this.getSectionById(childId))
      .filter(Boolean);
  }
  
  /**
   * Get related sections for a given section ID
   * @param {string} sectionId - The ID of the section
   * @returns {Array<Object>} Array of related section objects
   */
  getRelatedSections(sectionId) {
    const section = this.getSectionById(sectionId);
    if (!section || !section.related) return [];
    
    return section.related
      .map(relatedId => this.getSectionById(relatedId))
      .filter(Boolean);
  }
  
  /**
   * Get related content for a specific content item
   * @param {string} contentId - The ID of the content
   * @param {number} limit - Maximum number of related items to return
   * @returns {Array<Object>} Array of related content objects
   */
  getRelatedContent(contentId, limit = 5) {
    const contentItem = CONTENT_RELATIONSHIPS[contentId];
    if (!contentItem || !contentItem.relatedContent) return [];
    
    // Sort by relevance and limit results
    return contentItem.relatedContent
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit)
      .map(related => ({
        ...related,
        ...CONTENT_RELATIONSHIPS[related.id]
      }))
      .filter(Boolean);
  }
  
  /**
   * Get recommended content based on user's viewing history
   * @param {number} limit - Maximum number of recommendations to return
   * @returns {Array<Object>} Array of recommended content objects
   */
  getPersonalizedRecommendations(limit = 5) {
    if (this.contentViewHistory.length === 0) {
      // No history, return generic popular content
      return this.getPopularContent(limit);
    }
    
    // Get categories from recent history (last 10 items)
    const recentCategories = this.contentViewHistory
      .slice(-10)
      .map(item => item.category);
    
    // Count category occurrences
    const categoryCounts = recentCategories.reduce((counts, category) => {
      counts[category] = (counts[category] || 0) + 1;
      return counts;
    }, {});
    
    // Sort categories by count
    const topCategories = Object.keys(categoryCounts)
      .sort((a, b) => categoryCounts[b] - categoryCounts[a])
      .slice(0, 3);
    
    // Get content related to top categories
    const recommendations = Object.keys(CONTENT_RELATIONSHIPS)
      .filter(contentId => {
        const content = CONTENT_RELATIONSHIPS[contentId];
        return topCategories.includes(content.category);
      })
      // Filter out recently viewed content
      .filter(contentId => !this.contentViewHistory
        .slice(-10)
        .some(item => item.contentId === contentId))
      .slice(0, limit)
      .map(contentId => ({
        id: contentId,
        ...CONTENT_RELATIONSHIPS[contentId]
      }));
    
    return recommendations.length > 0 ? recommendations : this.getPopularContent(limit);
  }
  
  /**
   * Get popular content across the platform
   * @param {number} limit - Maximum number of items to return
   * @returns {Array<Object>} Array of popular content objects
   */
  getPopularContent(limit = 5) {
    // In a real implementation, this would query a database or analytics service
    return POPULAR_CONTENT.slice(0, limit);
  }
  
  /**
   * Search for content and sections matching a query
   * @param {string} query - The search query
   * @returns {Object} Object with sections and content arrays
   */
  search(query) {
    if (!query || query.trim() === '') {
      return { sections: [], content: [] };
    }
    
    const lowerQuery = query.toLowerCase().trim();
    
    // Search sections
    const matchingSections = Object.keys(SITE_MAP)
      .filter(key => {
        const section = SITE_MAP[key];
        return section.title.toLowerCase().includes(lowerQuery) ||
               key.toLowerCase().includes(lowerQuery);
      })
      .map(key => ({ id: key, ...SITE_MAP[key] }));
    
    // Search content
    const matchingContent = Object.keys(CONTENT_RELATIONSHIPS)
      .filter(key => {
        const content = CONTENT_RELATIONSHIPS[key];
        return key.toLowerCase().includes(lowerQuery) ||
               content.category.toLowerCase().includes(lowerQuery) ||
               content.type.toLowerCase().includes(lowerQuery);
      })
      .map(key => ({ id: key, ...CONTENT_RELATIONSHIPS[key] }));
    
    return {
      sections: matchingSections,
      content: matchingContent
    };
  }
  
  /**
   * Generate navigation links for a specific section
   * @param {string} sectionId - The ID of the section
   * @returns {Object} Navigation links for the section
   */
  getNavigationLinks(sectionId) {
    const section = this.getSectionById(sectionId);
    if (!section) return { parent: null, siblings: [], children: [], related: [] };
    
    // Get parent
    const parent = section.parent ? this.getSectionById(section.parent) : null;
    
    // Get siblings (other sections with the same parent)
    let siblings = [];
    if (parent && parent.children) {
      siblings = parent.children
        .filter(id => id !== sectionId)
        .map(id => this.getSectionById(id))
        .filter(Boolean);
    } else if (sectionId !== 'home') {
      // If no parent (top-level section), siblings are other top-level sections
      siblings = SITE_MAP.home.children
        .filter(id => id !== sectionId)
        .map(id => this.getSectionById(id))
        .filter(Boolean);
    }
    
    // Get children
    const children = section.children ? 
      section.children.map(id => this.getSectionById(id)).filter(Boolean) : [];
    
    // Get related sections
    const related = section.related ?
      section.related.map(id => this.getSectionById(id)).filter(Boolean) : [];
    
    return {
      parent: parent ? { id: section.parent, ...parent } : null,
      siblings,
      children,
      related
    };
  }
}

// Create a singleton instance
const navigationService = new NavigationService();

/**
 * React hook for using the navigation service in components
 */
export function useNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  
  useEffect(() => {
    // Update current path when location changes
    setCurrentPath(location.pathname);
    navigationService.currentPath = location.pathname;
  }, [location.pathname]);
  
  useEffect(() => {
    // Subscribe to path changes
    const handlePathChange = (e) => {
      setCurrentPath(e.detail.path);
    };
    
    // Add event listener for path changes
    document.addEventListener('navigation:pathChanged', handlePathChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('navigation:pathChanged', handlePathChange);
    };
  }, []);
  
  return {
    currentPath,
    navigateTo: (path) => {
      navigate(path);
      navigationService.navigateTo(path);
    },
    getSectionInfo: (path) => navigationService.getSectionInfo(path || currentPath),
    getSectionById: (id) => navigationService.getSectionById(id),
    getBreadcrumbs: (path) => navigationService.generateBreadcrumbs(path || currentPath),
    getChildSections: (sectionId) => navigationService.getChildSections(sectionId),
    getRelatedSections: (sectionId) => navigationService.getRelatedSections(sectionId),
    getRelatedContent: (contentId, limit) => navigationService.getRelatedContent(contentId, limit),
    getRecommendations: (limit) => navigationService.getPersonalizedRecommendations(limit),
    recordContentView: (contentId, contentType, category) => 
      navigationService.recordContentView(contentId, contentType, category),
    search: (query) => navigationService.search(query),
    getNavigationLinks: (sectionId) => navigationService.getNavigationLinks(sectionId)
  };
}

export default navigationService;
