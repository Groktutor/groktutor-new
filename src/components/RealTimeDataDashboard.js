import React, { useState, useEffect } from 'react';
import { fetchDataWithCache, realTimeService } from '../services/dataService';

const RealTimeDataDashboard = () => {
  const [activeTab, setActiveTab] = useState('reddit');
  const [data, setData] = useState({
    reddit: null,
    twitter: null,
    github: null,
    huggingface: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(300);
  
  // Handle initial data loading
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const platformData = await fetchDataWithCache(activeTab);
        setData(prev => ({ ...prev, [activeTab]: platformData }));
        setLastUpdated(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        setIsLoading(false);
      }
    };
    
    fetchInitialData();
    
    // Set up real-time updates for the current tab
    const unsubscribe = realTimeService.subscribe(activeTab, (newData) => {
      setData(prev => ({ ...prev, [activeTab]: newData }));
      setLastUpdated(new Date());
    });
    
    return () => {
      unsubscribe();
    };
  }, [activeTab]);
  
  // Set up auto-refresh timer
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(async () => {
      try {
        const platformData = await fetchDataWithCache(activeTab, true);
        setData(prev => ({ ...prev, [activeTab]: platformData }));
        setLastUpdated(new Date());
      } catch (error) {
        console.error(`Error refreshing ${activeTab} data:`, error);
      }
    }, refreshInterval * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [autoRefresh, refreshInterval, activeTab]);
  
  // Handle manual refresh
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const platformData = await fetchDataWithCache(activeTab, true);
      setData(prev => ({ ...prev, [activeTab]: platformData }));
      setLastUpdated(new Date());
      setIsLoading(false);
    } catch (error) {
      console.error(`Error refreshing ${activeTab} data:`, error);
      setIsLoading(false);
    }
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  // Get the appropriate content for the current tab
  const renderTabContent = () => {
    if (isLoading) {
      return <LoadingSpinner />;
    }
    
    switch (activeTab) {
      case 'reddit':
        return <RedditContent data={data.reddit} />;
      case 'twitter':
        return <TwitterContent data={data.twitter} />;
      case 'github':
        return <GitHubContent data={data.github} />;
      case 'huggingface':
        return <HuggingFaceContent data={data.huggingface} />;
      default:
        return <div>Select a platform to view data</div>;
    }
  };
  
  return (
    <div className="data-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>📊</span>
          <span>Real-Time Prompt Engineering Data Hub</span>
        </div>
        <div className="dashboard-controls">
          <select 
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            className="refresh-interval"
          >
            <option value="60">Refresh: 1 minute</option>
            <option value="300">Refresh: 5 minutes</option>
            <option value="600">Refresh: 10 minutes</option>
            <option value="1800">Refresh: 30 minutes</option>
          </select>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <div 
          className={`dashboard-tab tab-reddit ${activeTab === 'reddit' ? 'active' : ''}`}
          onClick={() => setActiveTab('reddit')}
        >
          <span className="tab-icon">🗣️</span>
          Reddit Discussions
        </div>
        <div 
          className={`dashboard-tab tab-twitter ${activeTab === 'twitter' ? 'active' : ''}`}
          onClick={() => setActiveTab('twitter')}
        >
          <span className="tab-icon">🐦</span>
          Twitter Trends
        </div>
        <div 
          className={`dashboard-tab tab-github ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          <span className="tab-icon">💻</span>
          GitHub Projects
        </div>
        <div 
          className={`dashboard-tab tab-huggingface ${activeTab === 'huggingface' ? 'active' : ''}`}
          onClick={() => setActiveTab('huggingface')}
        >
          <span className="tab-icon">🤗</span>
          HuggingFace Models
        </div>
      </div>
      
      <div className="dashboard-content">
        {renderTabContent()}
      </div>
      
      <div className="refresh-controls">
        <div>Last updated: {lastUpdated.toLocaleString()}</div>
        <div className="auto-refresh">
          <span>Auto-refresh:</span>
          <label className="toggle-switch">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={toggleAutoRefresh}
            />
            <span className="toggle-slider"></span>
          </label>
          <button className="refresh-button" onClick={handleRefresh} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh Now'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <div className="loading-text">Loading real-time data...</div>
  </div>
);

// Reddit content component
const RedditContent = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-message">No Reddit discussions found</div>;
  }
  
  return (
    <>
      {data.map((post, index) => (
        <div className="data-card" key={post.id || index}>
          <div className="card-header">
            <div className="card-title">{post.title}</div>
            <div className="card-meta">{post.subreddit}</div>
          </div>
          <div className="card-content">
            {post.selftext ? (
              <>
                {post.selftext.length > 200 ? 
                  `${post.selftext.substring(0, 200)}...` : 
                  post.selftext}
              </>
            ) : (
              'Click to view the full post...'
            )}
          </div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span className="stat-icon">⬆️</span>
                <span>{post.score}</span>
              </div>
              <div className="card-stat">
                <span className="stat-icon">💬</span>
                <span>{post.num_comments}</span>
              </div>
            </div>
            <div className="card-meta">Posted by u/{post.author} • {formatTimeAgo(post.created)}</div>
          </div>
          {post.url && (
            <a 
              href={post.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card-link"
            >
              View on Reddit
            </a>
          )}
        </div>
      ))}
    </>
  );
};

// Twitter content component
const TwitterContent = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-message">No Twitter trends found</div>;
  }
  
  return (
    <>
      {data.map((tweet, index) => (
        <div className="data-card twitter-card" key={tweet.id || index}>
          <div className="card-header">
            <div className="user-info">
              <div className="avatar">
                {tweet.displayName?.charAt(0) || 'U'}
              </div>
              <div>
                <div className="card-title">{tweet.displayName}</div>
                <div className="card-meta">{tweet.username}</div>
              </div>
            </div>
          </div>
          <div className="card-content twitter-content">{tweet.content}</div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span className="stat-icon">❤️</span>
                <span>{tweet.likes}</span>
              </div>
              <div className="card-stat">
                <span className="stat-icon">🔄</span>
                <span>{tweet.retweets}</span>
              </div>
            </div>
            <div className="card-meta">{formatTimeAgo(tweet.created)}</div>
          </div>
          {tweet.url && (
            <a 
              href={tweet.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card-link"
            >
              View on Twitter
            </a>
          )}
        </div>
      ))}
    </>
  );
};

// GitHub content component
const GitHubContent = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-message">No GitHub projects found</div>;
  }
  
  return (
    <>
      {data.map((repo, index) => (
        <div className="data-card github-card" key={repo.id || index}>
          <div className="card-header">
            <div className="card-title">{repo.repo}</div>
            <div className="card-meta">by {repo.author}</div>
          </div>
          <div className="card-content">
            {repo.description || 'No description available'}
          </div>
          <div className="language-tag" style={{ 
            backgroundColor: getLanguageColor(repo.language) 
          }}>
            {repo.language || 'Various'}
          </div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span className="stat-icon">⭐</span>
                <span>{repo.stars}</span>
              </div>
              <div className="card-stat">
                <span className="stat-icon">🍴</span>
                <span>{repo.forks}</span>
              </div>
              <div className="card-stat">
                <span className="stat-icon">⚠️</span>
                <span>{repo.issues}</span>
              </div>
            </div>
            <div className="card-meta">Updated {formatTimeAgo(repo.updated)}</div>
          </div>
          {repo.url && (
            <a 
              href={repo.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card-link"
            >
              View on GitHub
            </a>
          )}
        </div>
      ))}
    </>
  );
};

// HuggingFace content component
const HuggingFaceContent = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="no-data-message">No HuggingFace models found</div>;
  }
  
  return (
    <>
      {data.map((model, index) => (
        <div className="data-card huggingface-card" key={model.id || index}>
          <div className="card-header">
            <div className="card-title">{model.model}</div>
            <div className="card-meta">by {model.author}</div>
          </div>
          <div className="card-content">
            {model.description || 'No description available'}
          </div>
          <div className="card-tags">
            {model.tags?.map((tag, i) => (
              <span key={i} className="model-tag">{tag}</span>
            ))}
          </div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span className="stat-icon">⬇️</span>
                <span>{model.downloads?.toLocaleString() || 0}</span>
              </div>
            </div>
            <div className="card-meta">Updated {formatTimeAgo(model.updated)}</div>
          </div>
          {model.url && (
            <a 
              href={model.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="card-link"
            >
              View on HuggingFace
            </a>
          )}
        </div>
      ))}
    </>
  );
};

// Helper function to format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return 'Unknown time';
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) {
    return 'just now';
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
}

// Helper function to get color for programming language
function getLanguageColor(language) {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Markdown: '#083fa1',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051'
  };
  
  return colors[language] || '#6e5494';
}

export default RealTimeDataDashboard;
