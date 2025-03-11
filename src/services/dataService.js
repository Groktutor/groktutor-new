// dataService.js - Handles all external API integrations and live data fetching
import axios from 'axios';

// Configuration for API endpoints and authentication
const API_CONFIG = {
  reddit: {
    baseUrl: 'https://oauth.reddit.com',
    subreddits: ['PromptEngineering', 'MachineLearning', 'artificial', 'LocalLLaMA', 'OpenAI', 'AnthropicClaude'],
    clientId: process.env.REACT_APP_REDDIT_CLIENT_ID,
    clientSecret: process.env.REACT_APP_REDDIT_CLIENT_SECRET
  },
  twitter: {
    baseUrl: 'https://api.twitter.com/2',
    bearerToken: process.env.REACT_APP_TWITTER_BEARER_TOKEN,
    searchQueries: ['prompt engineering', 'LLM prompting', 'AI prompts', 'ChatGPT prompts', 'Claude prompts']
  },
  github: {
    baseUrl: 'https://api.github.com',
    token: process.env.REACT_APP_GITHUB_TOKEN,
    topics: ['prompt-engineering', 'llm', 'ai-prompts', 'langchain', 'llama-index']
  },
  huggingface: {
    baseUrl: 'https://huggingface.co/api',
    token: process.env.REACT_APP_HUGGINGFACE_TOKEN
  }
};

// Sample data for development (used when API keys are not available)
const SAMPLE_DATA = {
  reddit: [
    {
      id: 'rd1',
      title: 'How to use chain-of-thought with GPT-4 Turbo',
      subreddit: 'PromptEngineering',
      author: 'prompt_master',
      score: 524,
      num_comments: 78,
      created: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      selftext: "I've been experimenting with chain-of-thought prompting in GPT-4 Turbo and found some interesting patterns. The key is to explicitly ask the model to think step by step before giving its final answer. Here's what worked best for me:\n\n1. Start with a clear problem statement\n2. Add 'Let's think through this step by step'\n3. For math problems, add 'Let's calculate this carefully'\n4. For logic puzzles, add 'Let's analyze each possibility'\n\nI've found that this approach reduces errors by about 30% on complex reasoning tasks."
    },
    {
      id: 'rd2',
      title: 'I built a tool that automatically generates semantic search prompts',
      subreddit: 'MachineLearning',
      author: 'ai_dev42',
      score: 412,
      num_comments: 53,
      created: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
      selftext: "After months of fine-tuning, I've created a system that can generate optimal embedding prompts for semantic search. Here's how it works:\n\n- The system analyzes your document corpus to identify key terminology and concepts\n- It then generates multiple candidate prompts for embedding generation\n- Each candidate is evaluated against a validation set of known relevant pairs\n- The best performing prompt is selected and used for production\n\nIn our benchmarks, this approach improved semantic search accuracy by 18% compared to standard prompts."
    },
    {
      id: 'rd3',
      title: 'Prompt template library for specialized medical queries',
      subreddit: 'artificial',
      author: 'health_ai_researcher',
      score: 367,
      num_comments: 42,
      created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      selftext: "I've compiled a library of 50+ prompt templates specifically designed for medical research and diagnostic assistance. Each template has been validated by healthcare professionals and optimized for different medical specialties. The templates include:\n\n- Differential diagnosis frameworks\n- Medical literature search optimizers\n- Patient symptom analyzers\n- Treatment plan generators\n- Medical image description enhancers\n\nAll templates are available on GitHub under an MIT license. They're designed to be used with major LLMs including Claude, GPT-4, and Llama 3."
    },
    {
      id: 'rd4',
      title: 'The effectiveness of Tree-of-Thought vs Chain-of-Thought',
      subreddit: 'LocalLLaMA',
      author: 'reasoning_researcher',
      score: 289,
      num_comments: 34,
      created: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      selftext: "I ran a comprehensive benchmark comparing Tree-of-Thought (ToT) versus Chain-of-Thought (CoT) prompting across several open-source models. Here's what I found:\n\n- For simple reasoning problems, CoT is sufficient and more efficient\n- For complex problems with multiple possible approaches, ToT significantly outperforms CoT\n- The performance gap increases with model size (larger models benefit more from ToT)\n- ToT requires approximately 3x more tokens, but delivers up to 2x accuracy on complex problems\n\nInterestingly, for models below 13B parameters, the benefits of ToT diminish substantially."
    },
    {
      id: 'rd5',
      title: 'Persona-based prompting improved my creative writing results',
      subreddit: 'PromptEngineering',
      author: 'novel_writer',
      score: 311,
      num_comments: 47,
      created: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      selftext: "I've been struggling to get high-quality creative writing from LLMs until I discovered persona-based prompting. By explicitly defining the 'character' of the AI, I've seen dramatic improvements. Here's my approach:\n\n1. Create a detailed persona (e.g., 'You are an award-winning science fiction author known for vivid world-building and complex characters')\n2. Define the persona's writing style specifically ('Your prose is lyrical but concise, with an emphasis on sensory details')\n3. Provide example passages that match the desired style\n4. Specify the output format and length\n\nThe difference in quality is remarkable - the writing has a consistent voice and style throughout."
    }
  ],
  twitter: [
    {
      id: 'tw1',
      content: "Just published my research on using multi-shot prompting for cross-lingual knowledge transfer. Results show 43% improvement over zero-shot baselines across 12 languages. #PromptEngineering #NLP",
      username: "@ai_researcher",
      displayName: "Dr. Sarah Chen | AI Research",
      likes: 284,
      retweets: 92,
      created: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      url: "https://twitter.com/ai_researcher/status/1"
    },
    {
      id: 'tw2',
      content: "The secret to good prompting isn't complexity, it's clarity. I've had better results with simple, direct prompts that clearly define the task, context, and desired output format. Don't overthink it! #LLM #GPT4",
      username: "@prompt_engineer",
      displayName: "Mark Johnson",
      likes: 342,
      retweets: 118,
      created: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      url: "https://twitter.com/prompt_engineer/status/1"
    },
    {
      id: 'tw3',
      content: "🧵 1/5 Let's talk about the ReAct framework and how it's changing agent design. ReAct combines reasoning and action - allowing LLMs to generate both thoughts AND actions in an interleaved manner. This enables complex planning and tool use...",
      username: "@llm_agents",
      displayName: "Alex | Building AI Agents",
      likes: 512,
      retweets: 203,
      created: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
      url: "https://twitter.com/llm_agents/status/1"
    },
    {
      id: 'tw4',
      content: "New blog post: 'Advanced Prompt Engineering Patterns for Claude 3' - I cover techniques specifically optimized for Claude's reasoning capabilities, including structured XML outputs, multi-persona debates, and specialized knowledge elicitation. Link in bio!",
      username: "@claude_expert",
      displayName: "Claude Techniques",
      likes: 276,
      retweets: 87,
      created: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
      url: "https://twitter.com/claude_expert/status/1"
    },
    {
      id: 'tw5',
      content: "We're seeing a 35% reduction in hallucinations by using a simple prompt prefix that enforces citation of sources and explicit uncertainty marking. Will share the full technique at next week's #PromptEngineering conference.",
      username: "@ai_safety_lab",
      displayName: "AI Safety Research Lab",
      likes: 428,
      retweets: 156,
      created: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      url: "https://twitter.com/ai_safety_lab/status/1"
    }
  ],
  github: [
    {
      id: 'gh1',
      repo: 'prompt-engineering-guide',
      author: 'dair-ai',
      stars: 35420,
      forks: 3180,
      description: 'A comprehensive guide on prompt engineering for large language models, including techniques, examples and resources.',
      updated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/dair-ai/prompt-engineering-guide',
      language: 'Python',
      issues: 42
    },
    {
      id: 'gh2',
      repo: 'langchain',
      author: 'langchain-ai',
      stars: 72450,
      forks: 10780,
      description: 'Building applications with LLMs through composability',
      updated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/langchain-ai/langchain',
      language: 'Python',
      issues: 156
    },
    {
      id: 'gh3',
      repo: 'react-patterns',
      author: 'kevinzg',
      stars: 8320,
      forks: 1240,
      description: 'Implementation of the ReAct (Reasoning + Acting) framework for LLM agents with examples and best practices',
      updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/kevinzg/react-patterns',
      language: 'TypeScript',
      issues: 28
    },
    {
      id: 'gh4',
      repo: 'awesome-prompt-engineering',
      author: 'promptslab',
      stars: 21340,
      forks: 2150,
      description: 'A curated list of awesome prompt engineering tools, papers, tutorials, and resources',
      updated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/promptslab/awesome-prompt-engineering',
      language: 'Markdown',
      issues: 15
    },
    {
      id: 'gh5',
      repo: 'tree-of-thought-llm',
      author: 'kyegomez',
      stars: 5830,
      forks: 780,
      description: 'Implementation of Tree of Thought (ToT) prompting for enhanced problem-solving in LLMs',
      updated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://github.com/kyegomez/tree-of-thought-llm',
      language: 'Python',
      issues: 23
    }
  ],
  huggingface: [
    {
      id: 'hf1',
      model: 'prompt-tuning-toolkit',
      author: 'promptengineering',
      downloads: 12450,
      description: 'A comprehensive toolkit for prompt tuning with various LLMs',
      updated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://huggingface.co/promptengineering/prompt-tuning-toolkit',
      tags: ['prompt-tuning', 'llm', 'optimization']
    },
    {
      id: 'hf2',
      model: 'react-prompting-model',
      author: 'ai-research',
      downloads: 9875,
      description: 'Implementation of ReAct framework for enhanced reasoning capabilities',
      updated: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://huggingface.co/ai-research/react-prompting-model',
      tags: ['react', 'reasoning', 'llm']
    },
    {
      id: 'hf3',
      model: 'chain-of-thought-llama',
      author: 'llama-labs',
      downloads: 8732,
      description: 'Fine-tuned Llama model for chain-of-thought prompting',
      updated: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://huggingface.co/llama-labs/chain-of-thought-llama',
      tags: ['chain-of-thought', 'llama', 'reasoning']
    },
    {
      id: 'hf4',
      model: 'prompt-engineering-dataset',
      author: 'openai-community',
      downloads: 15280,
      description: 'Large dataset of optimized prompts for various tasks and domains',
      updated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://huggingface.co/datasets/openai-community/prompt-engineering-dataset',
      tags: ['dataset', 'prompt-engineering', 'examples']
    },
    {
      id: 'hf5',
      model: 'medical-prompt-tuning',
      author: 'healthcare-ai',
      downloads: 7340,
      description: 'Specialized prompt tuning models for healthcare and medical applications',
      updated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      url: 'https://huggingface.co/healthcare-ai/medical-prompt-tuning',
      tags: ['healthcare', 'medical', 'prompt-tuning']
    }
  ]
};

/**
 * Reddit Data Service
 * Fetches trending posts from prompt engineering related subreddits
 */
export const fetchRedditData = async (limit = 10) => {
  try {
    // Check if we're in development mode or missing API keys
    if (process.env.NODE_ENV === 'development' || !API_CONFIG.reddit.clientId) {
      console.log('Using sample Reddit data');
      return SAMPLE_DATA.reddit.slice(0, limit);
    }
    
    // In a production environment, we would implement the actual Reddit API calls
    // First, get an OAuth token
    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token', 
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${API_CONFIG.reddit.clientId}:${API_CONFIG.reddit.clientSecret}`)}`
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // Prepare subreddit queries
    const subredditQueries = API_CONFIG.reddit.subreddits.map(sub => 
      axios.get(`${API_CONFIG.reddit.baseUrl}/r/${sub}/hot?limit=${Math.ceil(limit / API_CONFIG.reddit.subreddits.length)}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Groktutor/1.0.0'
        }
      })
    );
    
    // Execute all queries in parallel
    const responses = await Promise.all(subredditQueries);
    
    // Process and normalize the data
    let allPosts = [];
    responses.forEach(response => {
      if (response.data.data && response.data.data.children) {
        const subredditPosts = response.data.data.children.map(child => ({
          id: child.data.id,
          title: child.data.title,
          score: child.data.score,
          author: child.data.author,
          subreddit: `r/${child.data.subreddit}`,
          created: new Date(child.data.created_utc * 1000).toISOString(),
          url: `https://reddit.com${child.data.permalink}`,
          num_comments: child.data.num_comments,
          selftext: child.data.selftext
        }));
        allPosts = [...allPosts, ...subredditPosts];
      }
    });
    
    // Sort by score and limit to the requested number
    return allPosts.sort((a, b) => b.score - a.score).slice(0, limit);
  } catch (error) {
    console.error('Error fetching Reddit data:', error);
    // Fallback to sample data in case of error
    return SAMPLE_DATA.reddit.slice(0, limit);
  }
};

/**
 * Twitter/X Data Service
 * Fetches tweets related to prompt engineering
 */
export const fetchTwitterData = async (limit = 10) => {
  try {
    // Check if we're in development mode or missing API keys
    if (process.env.NODE_ENV === 'development' || !API_CONFIG.twitter.bearerToken) {
      console.log('Using sample Twitter data');
      return SAMPLE_DATA.twitter.slice(0, limit);
    }
    
    // In a production environment, we would implement the actual Twitter API calls
    // Prepare search queries with recent popular tweets
    const searchQueries = API_CONFIG.twitter.searchQueries.map(query => 
      axios.get(`${API_CONFIG.twitter.baseUrl}/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${Math.ceil(limit / API_CONFIG.twitter.searchQueries.length)}&tweet.fields=public_metrics,created_at&expansions=author_id&user.fields=name,username`, {
        headers: {
          'Authorization': `Bearer ${API_CONFIG.twitter.bearerToken}`
        }
      })
    );
    
    // Execute all queries in parallel
    const responses = await Promise.all(searchQueries);
    
    // Process and normalize the data
    let allTweets = [];
    responses.forEach(response => {
      if (response.data && response.data.data) {
        // Create a map of user data
        const users = {};
        if (response.data.includes && response.data.includes.users) {
          response.data.includes.users.forEach(user => {
            users[user.id] = {
              username: user.username,
              displayName: user.name
            };
          });
        }
        
        const tweets = response.data.data.map(tweet => ({
          id: tweet.id,
          content: tweet.text,
          username: users[tweet.author_id] ? `@${users[tweet.author_id].username}` : '@unknown',
          displayName: users[tweet.author_id] ? users[tweet.author_id].displayName : 'Unknown User',
          likes: tweet.public_metrics.like_count,
          retweets: tweet.public_metrics.retweet_count,
          created: tweet.created_at,
          url: `https://twitter.com/${users[tweet.author_id]?.username}/status/${tweet.id}`
        }));
        
        allTweets = [...allTweets, ...tweets];
      }
    });
    
    // Sort by engagement (likes + retweets) and limit to the requested number
    return allTweets
      .sort((a, b) => (b.likes + b.retweets) - (a.likes + a.retweets))
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching Twitter data:', error);
    // Fallback to sample data in case of error
    return SAMPLE_DATA.twitter.slice(0, limit);
  }
};

/**
 * GitHub Data Service
 * Fetches trending repositories related to prompt engineering
 */
export const fetchGithubData = async (limit = 10) => {
  try {
    // Check if we're in development mode or missing API keys
    if (process.env.NODE_ENV === 'development' || !API_CONFIG.github.token) {
      console.log('Using sample GitHub data');
      return SAMPLE_DATA.github.slice(0, limit);
    }
    
    // In a production environment, we would implement the actual GitHub API calls
    // Prepare topic queries to find repositories
    const topicQueries = API_CONFIG.github.topics.map(topic => 
      axios.get(`${API_CONFIG.github.baseUrl}/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=${Math.ceil(limit / API_CONFIG.github.topics.length)}`, {
        headers: {
          'Authorization': `token ${API_CONFIG.github.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
    );
    
    // Execute all queries in parallel
    const responses = await Promise.all(topicQueries);
    
    // Process and normalize the data
    let allRepos = [];
    responses.forEach(response => {
      if (response.data && response.data.items) {
        const repos = response.data.items.map(item => ({
          id: item.id.toString(),
          repo: item.name,
          author: item.owner.login,
          stars: item.stargazers_count,
          description: item.description || '',
          updated: item.updated_at,
          url: item.html_url,
          language: item.language,
          forks: item.forks_count,
          issues: item.open_issues_count
        }));
        
        allRepos = [...allRepos, ...repos];
      }
    });
    
    // Remove duplicates (same repo might be returned for different topics)
    const uniqueRepos = allRepos.reduce((acc, current) => {
      const x = acc.find(item => item.id === current.id);
      if (!x) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
    
    // Sort by stars and limit to the requested number
    return uniqueRepos.sort((a, b) => b.stars - a.stars).slice(0, limit);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    // Fallback to sample data in case of error
    return SAMPLE_DATA.github.slice(0, limit);
  }
};

/**
 * HuggingFace Data Service
 * Fetches popular models related to prompt engineering
 */
export const fetchHuggingfaceData = async (limit = 10) => {
  try {
    // Check if we're in development mode or missing API keys
    if (process.env.NODE_ENV === 'development' || !API_CONFIG.huggingface.token) {
      console.log('Using sample HuggingFace data');
      return SAMPLE_DATA.huggingface.slice(0, limit);
    }
    
    // In a production environment, we would implement the actual HuggingFace API calls
    // Query for models related to prompt engineering
    const response = await axios.get(`${API_CONFIG.huggingface.baseUrl}/models?search=prompt&sort=downloads&direction=-1&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${API_CONFIG.huggingface.token}`
      }
    });
    
    // Process and normalize the data
    const models = response.data.map(model => ({
      id: model.id,
      model: model.id.split('/').pop(),
      author: model.id.split('/')[0],
      downloads: model.downloads || 0,
      description: model.description || 'No description available',
      updated: model.lastModified,
      url: `https://huggingface.co/${model.id}`,
      tags: model.tags || []
    }));
    
    return models;
  } catch (error) {
    console.error('Error fetching HuggingFace data:', error);
    // Fallback to sample data in case of error
    return SAMPLE_DATA.huggingface.slice(0, limit);
  }
};

/**
 * Combined data service that fetches from all sources
 */
export const fetchAllData = async () => {
  try {
    const [redditData, twitterData, githubData, huggingfaceData] = await Promise.all([
      fetchRedditData(),
      fetchTwitterData(),
      fetchGithubData(),
      fetchHuggingfaceData()
    ]);
    
    return {
      reddit: redditData,
      twitter: twitterData,
      github: githubData,
      huggingface: huggingfaceData,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching all data:', error);
    return {
      reddit: SAMPLE_DATA.reddit,
      twitter: SAMPLE_DATA.twitter,
      github: SAMPLE_DATA.github,
      huggingface: SAMPLE_DATA.huggingface,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
};

/**
 * Cache service to store fetched data and reduce API calls
 */
class DataCache {
  constructor(cacheDuration = 300000) { // Default 5 minutes
    this.cache = {};
    this.cacheDuration = cacheDuration;
  }
  
  get(key) {
    const cachedData = this.cache[key];
    if (cachedData && (Date.now() - cachedData.timestamp < this.cacheDuration)) {
      return cachedData.data;
    }
    return null;
  }
  
  set(key, data) {
    this.cache[key] = {
      data,
      timestamp: Date.now()
    };
  }
  
  invalidate(key) {
    delete this.cache[key];
  }
  
  invalidateAll() {
    this.cache = {};
  }
}

// Export a singleton instance of the cache
export const dataCache = new DataCache();

/**
 * Main API service with caching for the Groktutor platform
 */
export const fetchDataWithCache = async (source, forceRefresh = false) => {
  // Define the data fetching functions for each source
  const fetchFunctions = {
    reddit: fetchRedditData,
    twitter: fetchTwitterData,
    github: fetchGithubData,
    huggingface: fetchHuggingfaceData,
    all: fetchAllData
  };
  
  // If force refresh is not required, try to get from cache first
  if (!forceRefresh) {
    const cachedData = dataCache.get(source);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // If not in cache or force refresh, fetch new data
  try {
    const fetchFunction = fetchFunctions[source];
    if (!fetchFunction) {
      throw new Error(`Invalid data source: ${source}`);
    }
    
    const data = await fetchFunction();
    
    // Cache the new data
    dataCache.set(source, data);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${source} data:`, error);
    throw error;
  }
};

/**
 * Real-time data service for live updates
 */
class RealTimeDataService {
  constructor() {
    this.subscribers = {};
    this.intervalIds = {};
    this.isRunning = false;
  }
  
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Set up periodic fetching for each source
    this.intervalIds.reddit = setInterval(async () => {
      try {
        const data = await fetchDataWithCache('reddit', true);
        this.notifySubscribers('reddit', data);
      } catch (error) {
        console.error('Error in real-time Reddit data:', error);
      }
    }, 300000); // 5 minutes
    
    this.intervalIds.twitter = setInterval(async () => {
      try {
        const data = await fetchDataWithCache('twitter', true);
        this.notifySubscribers('twitter', data);
      } catch (error) {
        console.error('Error in real-time Twitter data:', error);
      }
    }, 300000); // 5 minutes
    
    this.intervalIds.github = setInterval(async () => {
      try {
        const data = await fetchDataWithCache('github', true);
        this.notifySubscribers('github', data);
      } catch (error) {
        console.error('Error in real-time GitHub data:', error);
      }
    }, 1800000); // 30 minutes
    
    this.intervalIds.huggingface = setInterval(async () => {
      try {
        const data = await fetchDataWithCache('huggingface', true);
        this.notifySubscribers('huggingface', data);
      } catch (error) {
        console.error('Error in real-time HuggingFace data:', error);
      }
    }, 3600000); // 60 minutes
  }
  
  stop() {
    if (!this.isRunning) return;
    
    // Clear all intervals
    Object.values(this.intervalIds).forEach(intervalId => {
      clearInterval(intervalId);
    });
    
    this.intervalIds = {};
    this.isRunning = false;
  }
  
  subscribe(source, callback) {
    if (!this.subscribers[source]) {
      this.subscribers[source] = [];
    }
    
    this.subscribers[source].push(callback);
    
    // Return an unsubscribe function
    return () => {
      this.subscribers[source] = this.subscribers[source].filter(cb => cb !== callback);
    };
  }
  
  notifySubscribers(source, data) {
    if (this.subscribers[source]) {
      this.subscribers[source].forEach(callback => {
        callback(data);
      });
    }
  }
}

// Export a singleton instance of the real-time service
export const realTimeService = new RealTimeDataService();

// Initialize the real-time service on startup
realTimeService.start();
