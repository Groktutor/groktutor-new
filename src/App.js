import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { fetchDataWithCache, realTimeService } from './services/dataService';
import { useNavigation } from './services/navigationService';
import TrendingVoxelVisualization from './components/TrendingVoxelVisualization';
import RealTimeDataDashboard from './components/RealTimeDataDashboard';

// Main App Component
function App() {
  return (
    <Router>
      <VoxelGlowEffect />
      <GridBackground />
      <div className="app-container">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/skills/*" element={<SkillsPage />} />
          <Route path="/live-data/*" element={<LiveDataPage />} />
          <Route path="/industries/*" element={<IndustriesPage />} />
          <Route path="/contests/*" element={<ContestsPage />} />
          <Route path="/content/:contentId" element={<ContentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

// Dynamic Grid Background
function GridBackground() {
  return (
    <div className="grid-background">
      <div className="grid-plane"></div>
      <div className="grid-plane"></div>
      <div className="grid-plane"></div>
    </div>
  );
}

// Voxel Glow Effect that follows mouse
function VoxelGlowEffect() {
  const glowRef = useRef(null);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className="voxel-glow">
      <div className="glow-source" ref={glowRef}></div>
    </div>
  );
}

// Header Component
function Header() {
  const navigation = useNavigation();
  const location = useLocation();
  
  // Extract the current section from the path
  const getCurrentSection = (path) => {
    const parts = path.split('/').filter(Boolean);
    return parts.length > 0 ? parts[0] : 'home';
  };
  
  const currentSection = getCurrentSection(location.pathname);
  
  return (
    <header>
      <div className="container">
        <div className="header-content">
          <div className="header-voxels">
            <div className="header-voxel" style={{top: '10px', left: '15px', transform: 'translateZ(15px)'}}></div>
            <div className="header-voxel" style={{top: '20px', left: '50px', transform: 'translateZ(25px)'}}></div>
            <div className="header-voxel" style={{top: '50px', left: '85px', transform: 'translateZ(10px)'}}></div>
            <div className="header-voxel" style={{top: '30px', right: '40px', transform: 'translateZ(20px)'}}></div>
            <div className="header-voxel" style={{bottom: '15px', right: '80px', transform: 'translateZ(30px)'}}></div>
          </div>
          
          <Link to="/" className="logo">
            <div className="logo-icon">G</div>
            <span>Groktutor</span>
          </Link>
        </div>
        
        <div className="nav-container">
          <NavItem section="home" currentSection={currentSection} index={0} stats="4,290 active users" />
          <NavItem section="skills" currentSection={currentSection} index={1} stats="1,250+ techniques" />
          <NavItem 
            section="live-data" 
            currentSection={currentSection} 
            index={2} 
            stats="Updated in real-time"
            live={true}
          />
          <NavItem section="industries" currentSection={currentSection} index={3} stats="24 specialized tracks" />
          <NavItem section="contests" currentSection={currentSection} index={4} stats="5 active challenges" />
        </div>
      </div>
    </header>
  );
}

// Navigation Item Component
function NavItem({ section, currentSection, index, stats, live }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(section === 'home' ? '/' : `/${section}`);
  };
  
  return (
    <div 
      className={`nav-item ${currentSection === section ? 'active' : ''}`}
      data-section={section} 
      style={{ '--index': index }}
      onClick={handleClick}
    >
      <div className="nav-text">
        {section === 'home' ? 'Home' : section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
        {live && (
          <span className="live-indicator">
            <span className="live-dot"></span>LIVE
          </span>
        )}
      </div>
      <div className="nav-stats">{stats}</div>
    </div>
  );
}

// Home Page
function HomePage() {
  const [trendingData, setTrendingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTrendingData = async () => {
      try {
        setIsLoading(true);
        // Fetch from multiple sources to build comprehensive trending data
        const [redditData, twitterData, githubData] = await Promise.all([
          fetchDataWithCache('reddit'),
          fetchDataWithCache('twitter'),
          fetchDataWithCache('github')
        ]);
        
        setTrendingData({ reddit: redditData, twitter: twitterData, github: githubData });
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching trending data:', error);
        setIsLoading(false);
      }
    };
    
    fetchTrendingData();
    
    // Set up real-time updates
    const unsubscribeReddit = realTimeService.subscribe('reddit', (data) => {
      setTrendingData(prev => ({ ...prev, reddit: data }));
    });
    
    const unsubscribeTwitter = realTimeService.subscribe('twitter', (data) => {
      setTrendingData(prev => ({ ...prev, twitter: data }));
    });
    
    return () => {
      unsubscribeReddit();
      unsubscribeTwitter();
    };
  }, []);
  
  const handleSearch = (query) => {
    console.log('Searching for:', query);
    // In a real implementation, this would navigate to search results
    // navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  
  const generateRandomVoxels = () => {
    const voxels = [];
    const colors = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'var(--tertiary)', 'var(--quaternary)'];
    
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 1000;
      const y = Math.random() * 300;
      const z = Math.random() * 70 + 20;
      const size = 15 + Math.random() * 15;
      const colorIndex = Math.floor(Math.random() * colors.length);
      const delay = Math.random() * 1.5;
      
      voxels.push(
        <div 
          key={i}
          className="positioned-voxel" 
          style={{
            '--x': x,
            '--y': y,
            '--z': z,
            '--size': size,
            '--color': colors[colorIndex],
            '--delay': `${delay}s`
          }}
        ></div>
      );
    }
    
    return voxels;
  };
  
  return (
    <main>
      <div className="container">
        <div className="hero">
          <div className="floating-voxels">
            {generateRandomVoxels()}
          </div>
          
          <div className="hero-content">
            <h1>Master Prompt Engineering in Immersive 3D</h1>
            <p>Explore our voxel-based learning environment designed to make prompt techniques visual, interactive, and easier to understand</p>
            
            <div className="search-container">
              <div className="search-metrics">
                <div className="metric">
                  <div>Total Prompts</div>
                  <div className="metric-value">12,487</div>
                </div>
                <div className="metric">
                  <div>Conversations</div>
                  <div className="metric-value">5,923</div>
                </div>
                <div className="metric">
                  <div>Active Users</div>
                  <div className="metric-value">8,742</div>
                </div>
                <div className="metric">
                  <div>LLMs Supported</div>
                  <div className="metric-value">12</div>
                </div>
              </div>
              
              <SearchBox onSearch={handleSearch} />
              
              <TrendingTags />
            </div>
          </div>
        </div>
        
        <LiveDataDashboard data={trendingData} isLoading={isLoading} />
        
        <VoxelVisualization />
        
        <TrendingTopics />
      </div>
    </main>
  );
}

// Search Box Component
function SearchBox({ onSearch }) {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };
  
  return (
    <form className="search-box" onSubmit={handleSubmit}>
      <input
        type="text"
        className="search-input"
        placeholder="Search for prompt techniques, examples, or skills..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  );
}

// Trending Tags Component
function TrendingTags() {
  const tags = [
    'Chain-of-Thought',
    'Few-Shot Learning',
    'Creative Writing',
    'Data Analysis',
    'Role Playing',
    'Code Generation'
  ];
  
  return (
    <div className="trending-tags">
      {tags.map((tag, index) => (
        <div key={index} className="trending-tag">{tag}</div>
      ))}
    </div>
  );
}

// Live Data Dashboard Component
function LiveDataDashboard({ data, isLoading }) {
  const [activeTab, setActiveTab] = useState('reddit');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  
  useEffect(() => {
    if (data) {
      setLastUpdated(new Date());
    }
  }, [data]);
  
  const handleRefresh = async () => {
    try {
      await fetchDataWithCache(activeTab, true);
      setLastUpdated(new Date());
    } catch (error) {
      console.error(`Error refreshing ${activeTab} data:`, error);
    }
  };
  
  return (
    <div className="data-dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title">
          <span>📊</span>
          <span>Real-Time Prompt Engineering Data Hub</span>
        </div>
      </div>
      
      <div className="dashboard-tabs">
        <div 
          className={`dashboard-tab tab-reddit ${activeTab === 'reddit' ? 'active' : ''}`}
          onClick={() => setActiveTab('reddit')}
        >
          Reddit Discussions
        </div>
        <div 
          className={`dashboard-tab tab-twitter ${activeTab === 'twitter' ? 'active' : ''}`}
          onClick={() => setActiveTab('twitter')}
        >
          Twitter Trends
        </div>
        <div 
          className={`dashboard-tab tab-github ${activeTab === 'github' ? 'active' : ''}`}
          onClick={() => setActiveTab('github')}
        >
          GitHub Projects
        </div>
        <div 
          className={`dashboard-tab tab-huggingface ${activeTab === 'huggingface' ? 'active' : ''}`}
          onClick={() => setActiveTab('huggingface')}
        >
          HuggingFace Models
        </div>
      </div>
      
      <div className="dashboard-content">
        {isLoading ? (
          <div className="loading-indicator">Loading data...</div>
        ) : (
          <>
            {activeTab === 'reddit' && data?.reddit && (
              <RedditContent data={data.reddit} />
            )}
            
            {activeTab === 'twitter' && data?.twitter && (
              <TwitterContent data={data.twitter} />
            )}
            
            {activeTab === 'github' && data?.github && (
              <GitHubContent data={data.github} />
            )}
            
            {activeTab === 'huggingface' && (
              <HuggingFaceContent />
            )}
          </>
        )}
      </div>
      
      <div className="refresh-controls">
        <div>Last updated: {lastUpdated.toLocaleString()}</div>
        <div className="auto-refresh">
          <span>Auto-refresh:</span>
          <input 
            type="checkbox" 
            checked={autoRefresh} 
            onChange={() => setAutoRefresh(!autoRefresh)}
          />
          <button className="refresh-button" onClick={handleRefresh}>
            Refresh Now
          </button>
        </div>
      </div>
    </div>
  );
}

// Reddit Content Component
function RedditContent({ data }) {
  return (
    <>
      {data.map((post, index) => (
        <div className="data-card" key={post.id || index}>
          <div className="card-header">
            <div className="card-title">{post.title}</div>
            <div className="card-meta">{post.subreddit}</div>
          </div>
          <div className="card-content">
            {post.selftext?.slice(0, 200) || 'Click to view the full post...'}
            {post.selftext?.length > 200 && '...'}
          </div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span>⬆️</span>
                <span>{post.score}</span>
              </div>
              <div className="card-stat">
                <span>💬</span>
                <span>{post.num_comments}</span>
              </div>
            </div>
            <div className="card-meta">Posted by u/{post.author} • {formatTimeAgo(post.created)}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// Twitter Content Component
function TwitterContent({ data }) {
  return (
    <>
      {data.map((tweet, index) => (
        <div className="data-card" key={tweet.id || index}>
          <div className="card-header">
            <div className="card-title">{tweet.displayName}</div>
            <div className="card-meta">{tweet.username}</div>
          </div>
          <div className="card-content">{tweet.content}</div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span>❤️</span>
                <span>{tweet.likes}</span>
              </div>
              <div className="card-stat">
                <span>🔁</span>
                <span>{tweet.retweets}</span>
              </div>
            </div>
            <div className="card-meta">{formatTimeAgo(tweet.created)}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// GitHub Content Component
function GitHubContent({ data }) {
  return (
    <>
      {data.map((repo, index) => (
        <div className="data-card" key={repo.id || index}>
          <div className="card-header">
            <div className="card-title">{repo.repo}</div>
            <div className="card-meta">by {repo.author}</div>
          </div>
          <div className="card-content">{repo.description}</div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span>⭐</span>
                <span>{repo.stars}</span>
              </div>
              <div className="card-stat">
                <span>🍴</span>
                <span>{repo.forks}</span>
              </div>
              <div className="card-stat">
                <span>💻</span>
                <span>{repo.language || 'Various'}</span>
              </div>
            </div>
            <div className="card-meta">Updated {formatTimeAgo(repo.updated)}</div>
          </div>
        </div>
      ))}
    </>
  );
}

// HuggingFace Content Component
function HuggingFaceContent() {
  // This would be populated with real data in a complete implementation
  const models = [
    {
      id: 'hf-1',
      name: 'prompt-tuning-toolkit',
      author: 'promptengineering',
      downloads: 12450,
      description: 'A comprehensive toolkit for prompt tuning with various LLMs',
      tags: ['prompt-tuning', 'llm', 'optimization']
    },
    {
      id: 'hf-2',
      name: 'react-prompting-model',
      author: 'ai-research',
      downloads: 9875,
      description: 'Implementation of ReAct framework for enhanced reasoning capabilities',
      tags: ['react', 'reasoning', 'llm']
    },
    {
      id: 'hf-3',
      name: 'chain-of-thought-llama',
      author: 'llama-labs',
      downloads: 8732,
      description: 'Fine-tuned Llama model for chain-of-thought prompting',
      tags: ['chain-of-thought', 'llama', 'reasoning']
    }
  ];
  
  return (
    <>
      {models.map((model) => (
        <div className="data-card" key={model.id}>
          <div className="card-header">
            <div className="card-title">{model.name}</div>
            <div className="card-meta">by {model.author}</div>
          </div>
          <div className="card-content">{model.description}</div>
          <div className="card-footer">
            <div className="card-stats">
              <div className="card-stat">
                <span>⬇️</span>
                <span>{model.downloads.toLocaleString()}</span>
              </div>
              <div className="card-stat">
                <span>🏷️</span>
                <span>{model.tags.join(', ')}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

// 3D Voxel Visualization Component
function VoxelVisualization() {
  return (
    <div className="voxel-visualization">
      <div className="voxel-container">
        {/* Chain-of-thought technique */}
        <div className="data-voxel" style={{backgroundColor: '#00ffff', height: '90px', transform: 'translate3d(100px, 100px, 0)'}}>
          <div className="data-voxel-top"></div>
          <div className="data-voxel-label">Chain-of-Thought</div>
        </div>
        
        {/* Tree-of-thought technique */}
        <div className="data-voxel" style={{backgroundColor: '#ff00ff', height: '75px', transform: 'translate3d(-100px, 100px, 0)'}}>
          <div className="data-voxel-top"></div>
          <div className="data-voxel-label">Tree-of-Thought</div>
        </div>
        
        {/* ReAct technique */}
        <div className="data-voxel" style={{backgroundColor: '#0fff0f', height: '85px', transform: 'translate3d(0, -100px, 0)'}}>
          <div className="data-voxel-top"></div>
          <div className="data-voxel-label">ReAct</div>
        </div>
        
        {/* Few-shot technique */}
        <div className="data-voxel" style={{backgroundColor: '#ffff00', height: '70px', transform: 'translate3d(-150px, -50px, 0)'}}>
          <div className="data-voxel-top"></div>
          <div className="data-voxel-label">Few-Shot</div>
        </div>
        
        {/* Zero-shot technique */}
        <div className="data-voxel" style={{backgroundColor: '#ff5500', height: '65px', transform: 'translate3d(150px, -50px, 0)'}}>
          <div className="data-voxel-top"></div>
          <div className="data-voxel-label">Zero-Shot</div>
        </div>
      </div>
    </div>
  );
}

// Trending Topics Component
function TrendingTopics() {
  const trendingTopics = [
    {
      id: 'cot',
      title: 'Chain-of-Thought',
      subtitle: 'Reasoning technique',
      stats: {
        mentions: 1243,
        growth: '+18%',
        implementations: 324
      },
      chart: [90, 85, 95, 100]
    },
    {
      id: 'tot',
      title: 'Tree-of-Thought',
      subtitle: 'Advanced reasoning',
      stats: {
        mentions: 875,
        growth: '+42%',
        implementations: 189
      },
      chart: [60, 70, 80, 85]
    },
    {
      id: 'react',
      title: 'ReAct Framework',
      subtitle: 'Reasoning + Acting',
      stats: {
        mentions: 731,
        growth: '+28%',
        implementations: 215
      },
      chart: [50, 60, 65, 75]
    },
    {
      id: 'func',
      title: 'Function Calling',
      subtitle: 'Tool integration',
      stats: {
        mentions: 652,
        growth: '+55%',
        implementations: 187
      },
      chart: [30, 45, 55, 70]
    }
  ];
  
  return (
    <div className="trending-visualization">
      <div className="trending-header">
        <h2 className="trending-title">Trending Prompt Engineering Topics</h2>
        <p className="trending-subtitle">Visualizing the most discussed and implemented prompt engineering techniques based on real-time data analysis</p>
      </div>
      
      <div className="trending-grid">
        {trendingTopics.map((topic, index) => (
          <div className="trend-card" key={topic.id} style={{'--index': index}}>
            <div className="trend-header">
              <div className="trend-title">{topic.title}</div>
              <div className="trend-subtitle">{topic.subtitle}</div>
            </div>
            <div className="trend-chart">
              {topic.chart.map((height, i) => (
                <div 
                  key={i}
                  className="trend-bar" 
                  style={{
                    left: `${20 + i * 40}px`,
                    height: `${height}%`,
                    background: i % 2 === 0 
                      ? 'linear-gradient(to top, #00ffff, #ff00ff)'
                      : 'linear-gradient(to top, #ff00ff, #ffff00)'
                  }}
                ></div>
              ))}
            </div>
            <div className="trend-data">
              <div className="trend-stat">
                <div className="trend-label">Mentions</div>
                <div className="trend-value">{topic.stats.mentions}</div>
              </div>
              <div className="trend-stat">
                <div className="trend-label">Growth</div>
                <div className="trend-value">{topic.stats.growth}</div>
              </div>
              <div className="trend-stat">
                <div className="trend-label">Implementations</div>
                <div className="trend-value">{topic.stats.implementations}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skills Page Component
function SkillsPage() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  
  // Get skills section information based on the current path
  const getCurrentSkillSection = () => {
    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length === 1) {
      return 'skills';
    }
    
    return parts[1];
  };
  
  const currentSkillSection = getCurrentSkillSection();
  const sectionInfo = navigation.getSectionById(currentSkillSection);
  const navigationLinks = navigation.getNavigationLinks(currentSkillSection);
  
  return (
    <div className="container">
      <BreadcrumbNav />
      
      <div className="skills-container">
        <h1 className="section-title">{sectionInfo?.title || 'Prompt Engineering Skills'}</h1>
        
        <div className="skills-content">
          <div className="skills-sidebar">
            <h3>Topics</h3>
            <ul className="skills-nav">
              {navigationLinks.children.map(child => (
                <li key={child.id}>
                  <Link 
                    to={child.path}
                    className={pathname === child.path ? 'active' : ''}
                  >
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3>Related Areas</h3>
            <ul className="skills-related">
              {navigationLinks.related.map(related => (
                <li key={related.id}>
                  <Link to={related.path}>
                    {related.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="skills-main">
            <SkillContent section={currentSkillSection} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Breadcrumb Navigation Component
function BreadcrumbNav() {
  const location = useLocation();
  const navigation = useNavigation();
  
  const breadcrumbs = navigation.getBreadcrumbs(location.pathname);
  
  return (
    <div className="breadcrumbs">
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.id}>
          {index > 0 && <span className="separator"> / </span>}
          <Link 
            to={crumb.path}
            className={location.pathname === crumb.path ? 'active' : ''}
          >
            {crumb.title}
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}

// Skill Content Component
function SkillContent({ section }) {
  // This would be populated with real content in a complete implementation
  const contentMap = {
    'reasoning': (
      <>
        <h2>Reasoning & Logic Techniques</h2>
        <p>Explore advanced techniques for improving reasoning and logical analysis in large language models. These techniques help LLMs think through complex problems step by step, improving accuracy and explainability.</p>
        
        <div className="skill-cards">
          <div className="skill-card">
            <h3>Chain-of-Thought</h3>
            <p>Chain-of-thought prompting encourages the model to break down complex reasoning tasks into a sequence of intermediate steps, similar to human reasoning processes.</p>
            <Link to="/skills/reasoning/chain-of-thought" className="skill-link">Learn more</Link>
          </div>
          
          <div className="skill-card">
            <h3>Tree-of-Thought</h3>
            <p>Extending chain-of-thought, tree-of-thought explores multiple reasoning paths simultaneously, allowing the model to consider different approaches to a problem.</p>
            <Link to="/skills/reasoning/tree-of-thought" className="skill-link">Learn more</Link>
          </div>
          
          <div className="skill-card">
            <h3>ReAct Framework</h3>
            <p>Combining reasoning and acting, ReAct interleaves thought generation with action execution, allowing models to interact with external tools and environments.</p>
            <Link to="/skills/reasoning/react" className="skill-link">Learn more</Link>
          </div>
        </div>
      </>
    ),
    'chain-of-thought': (
      <>
        <h2>Chain-of-Thought Prompting</h2>
        <p>Chain-of-Thought (CoT) is a prompting technique that encourages language models to break down complex problems into a series of intermediate steps. By showing the model how to "think through" a problem step by step, it achieves significantly better performance on tasks requiring logical reasoning.</p>
        
        <div className="technique-details">
          <div className="technique-overview">
            <h3>Key Benefits</h3>
            <ul>
              <li>Improved reasoning capabilities on complex problems</li>
              <li>Greater transparency in the model's thought process</li>
              <li>Better accuracy on mathematical and logical tasks</li>
              <li>Enhanced problem-solving through structured thinking</li>
            </ul>
          </div>
          
          <div className="technique-example">
            <h3>Example Prompt</h3>
            <div className="code-block">
              <pre>
{`Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. 
Each can has 3 tennis balls. How many tennis balls does he have now?

A: Let me think step by step.
- Roger starts with 5 tennis balls
- He buys 2 cans of tennis balls
- Each can has 3 tennis balls
- So he gets 2 x 3 = 6 more tennis balls
- In total, he has 5 + 6 = 11 tennis balls
The answer is 11 tennis balls.`}
              </pre>
            </div>
          </div>
        </div>
        
        <div className="related-content">
          <h3>Related Techniques</h3>
          <div className="related-links">
            <Link to="/skills/reasoning/tree-of-thought">Tree-of-Thought</Link>
            <Link to="/skills/reasoning/react">ReAct Framework</Link>
            <Link to="/skills/reasoning/socratic">Socratic Method</Link>
          </div>
        </div>
      </>
    ),
    'data-analysis': (
      <>
        <h2>Data Analysis Techniques</h2>
        <p>Effective data analysis prompting allows language models to extract insights, identify patterns, and generate meaningful visualizations from structured data. These techniques are essential for using LLMs with datasets and databases.</p>
        
        <div className="skill-cards">
          <div className="skill-card">
            <h3>Data Formatting</h3>
            <p>Learn how to prepare and present data in formats that LLMs can effectively parse and understand.</p>
            <Link to="/skills/data-analysis/data-formatting" className="skill-link">Learn more</Link>
          </div>
          
          <div className="skill-card">
            <h3>Exploratory Analysis</h3>
            <p>Guide LLMs through the process of examining datasets to discover patterns, anomalies, and relationships.</p>
            <Link to="/skills/data-analysis/exploratory-analysis" className="skill-link">Learn more</Link>
          </div>
          
          <div className="skill-card">
            <h3>Insight Generation</h3>
            <p>Techniques to prompt models to extract meaningful business insights and actionable recommendations from data.</p>
            <Link to="/skills/data-analysis/insight-generation" className="skill-link">Learn more</Link>
          </div>
        </div>
      </>
    )
  };
  
  return contentMap[section] || (
    <div className="generic-content">
      <h2>Prompt Engineering Skills</h2>
      <p>Explore our comprehensive library of prompt engineering techniques to master the art of communicating with language models. Each section provides in-depth explanations, examples, and interactive exercises.</p>
      
      <div className="skills-overview">
        <div className="skills-category">
          <h3>Reasoning & Logic</h3>
          <p>Techniques that enhance a model's ability to solve complex problems through structured thinking processes.</p>
          <Link to="/skills/reasoning" className="category-link">Explore reasoning techniques</Link>
        </div>
        
        <div className="skills-category">
          <h3>Data Analysis</h3>
          <p>Methods for working with structured data, extracting insights, and generating visualizations.</p>
          <Link to="/skills/data-analysis" className="category-link">Explore data techniques</Link>
        </div>
        
        <div className="skills-category">
          <h3>Creative Writing</h3>
          <p>Approaches for generating original, engaging creative content across various formats and styles.</p>
          <Link to="/skills/creative-writing" className="category-link">Explore creative techniques</Link>
        </div>
        
        <div className="skills-category">
          <h3>Code Generation</h3>
          <p>Techniques for producing accurate, efficient code in multiple programming languages.</p>
          <Link to="/skills/coding" className="category-link">Explore coding techniques</Link>
        </div>
      </div>
    </div>
  );
}

// Live Data Page Component
function LiveDataPage() {
  const [allData, setAllData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchAllPlatformsData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDataWithCache('all');
        setAllData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching all platforms data:', error);
        setIsLoading(false);
      }
    };
    
    fetchAllPlatformsData();
    
    // Subscribe to real-time updates
    const platforms = ['reddit', 'twitter', 'github', 'huggingface'];
    const unsubscribers = platforms.map(platform => 
      realTimeService.subscribe(platform, (data) => {
        setAllData(prev => prev ? { ...prev, [platform]: data } : prev);
      })
    );
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, []);
  
  return (
    <div className="container">
      <BreadcrumbNav />
      
      <div className="live-data-container">
        <h1 className="section-title">Real-Time Data</h1>
        <p className="section-description">
          Stay updated with the latest discussions, projects, and models in the prompt engineering community.
          Our live data hub collects and analyzes information from multiple platforms in real-time.
        </p>
        
        {isLoading ? (
          <div className="loading-indicator">Loading live data from all platforms...</div>
        ) : (
          <div className="platforms-grid">
            <div className="platform-card">
              <div className="platform-header reddit-header">
                <h2>Reddit</h2>
                <span className="platform-stats">{allData?.reddit?.length || 0} discussions</span>
              </div>
              <div className="platform-content">
                {allData?.reddit?.slice(0, 3).map((post, index) => (
                  <div className="platform-item" key={post.id || index}>
                    <div className="item-title">{post.title}</div>
                    <div className="item-meta">r/{post.subreddit} • {post.score} upvotes</div>
                  </div>
                ))}
              </div>
              <Link to="/live-data/reddit" className="platform-link">View all Reddit data</Link>
            </div>
            
            <div className="platform-card">
              <div className="platform-header twitter-header">
                <h2>Twitter</h2>
                <span className="platform-stats">{allData?.twitter?.length || 0} tweets</span>
              </div>
              <div className="platform-content">
                {allData?.twitter?.slice(0, 3).map((tweet, index) => (
                  <div className="platform-item" key={tweet.id || index}>
                    <div className="item-title">{tweet.content.slice(0, 100)}{tweet.content.length > 100 ? '...' : ''}</div>
                    <div className="item-meta">{tweet.username} • {tweet.likes} likes</div>
                  </div>
                ))}
              </div>
              <Link to="/live-data/twitter" className="platform-link">View all Twitter data</Link>
            </div>
            
            <div className="platform-card">
              <div className="platform-header github-header">
                <h2>GitHub</h2>
                <span className="platform-stats">{allData?.github?.length || 0} repositories</span>
              </div>
              <div className="platform-content">
                {allData?.github?.slice(0, 3).map((repo, index) => (
                  <div className="platform-item" key={repo.id || index}>
                    <div className="item-title">{repo.repo}</div>
                    <div className="item-meta">{repo.author} • {repo.stars} stars</div>
                  </div>
                ))}
              </div>
              <Link to="/live-data/github" className="platform-link">View all GitHub projects</Link>
            </div>
            
            <div className="platform-card">
              <div className="platform-header huggingface-header">
                <h2>HuggingFace</h2>
                <span className="platform-stats">{allData?.huggingface?.length || 0} models</span>
              </div>
              <div className="platform-content">
                {allData?.huggingface?.slice(0, 3).map((model, index) => (
                  <div className="platform-item" key={model.id || index}>
                    <div className="item-title">{model.model}</div>
                    <div className="item-meta">{model.author} • {model.downloads} downloads</div>
                  </div>
                ))}
              </div>
              <Link to="/live-data/huggingface" className="platform-link">View all HuggingFace models</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Industries Page Component
function IndustriesPage() {
  const industries = [
    {
      id: 'healthcare',
      title: 'Healthcare',
      icon: '🏥',
      description: 'Specialized prompt engineering techniques for medical research, clinical applications, and healthcare documentation.',
      skills: ['Medical Terminology Enhancement', 'Diagnostic Assistance', 'Research Paper Analysis'],
      caseStudies: 2
    },
    {
      id: 'finance',
      title: 'Finance',
      icon: '💹',
      description: 'Prompt techniques for financial analysis, risk assessment, market trends, and investment research.',
      skills: ['Sentiment Analysis', 'Market Research', 'Risk Evaluation'],
      caseStudies: 3
    },
    {
      id: 'legal',
      title: 'Legal',
      icon: '⚖️',
      description: 'Approaches for legal document analysis, contract review, case research, and compliance checking.',
      skills: ['Contract Analysis', 'Legal Research', 'Citation Formatting'],
      caseStudies: 2
    },
    {
      id: 'education',
      title: 'Education',
      icon: '🎓',
      description: 'Techniques for creating educational content, assessment design, and personalized learning experiences.',
      skills: ['Curriculum Design', 'Assessment Generation', 'Explanation Techniques'],
      caseStudies: 4
    },
    {
      id: 'marketing',
      title: 'Marketing',
      icon: '📊',
      description: 'Methods for content creation, audience analysis, campaign design, and engagement optimization.',
      skills: ['Audience-Targeted Content', 'A/B Test Design', 'Brand Voice Consistency'],
      caseStudies: 3
    },
    {
      id: 'research',
      title: 'Research',
      icon: '🔬',
      description: 'Advanced prompting for literature review, experimental design, data analysis, and research writing.',
      skills: ['Research Question Formulation', 'Literature Synthesis', 'Methodology Design'],
      caseStudies: 2
    }
  ];
  
  return (
    <div className="container">
      <BreadcrumbNav />
      
      <div className="industries-container">
        <h1 className="section-title">Industry Applications</h1>
        <p className="section-description">
          Discover how prompt engineering techniques can be applied to specific industries and domains.
          Each industry track provides specialized techniques, case studies, and best practices.
        </p>
        
        <div className="industries-grid">
          {industries.map(industry => (
            <div className="industry-card" key={industry.id}>
              <div className="industry-icon">{industry.icon}</div>
              <h2 className="industry-title">{industry.title}</h2>
              <p className="industry-description">{industry.description}</p>
              
              <div className="industry-skills">
                <h3>Key Skills</h3>
                <ul>
                  {industry.skills.map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))}
                </ul>
              </div>
              
              <div className="industry-meta">
                <span>{industry.caseStudies} Case Studies</span>
              </div>
              
              <Link to={`/industries/${industry.id}`} className="industry-link">
                Explore {industry.title} Track
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Contests Page Component
function ContestsPage() {
  const activeContests = [
    {
      id: 'contest-1',
      title: 'ReAct Champion Challenge',
      deadline: 'March 20, 2025',
      participants: 187,
      prize: '$1,500',
      description: 'Design a prompt that effectively uses the ReAct framework to solve complex multi-step problems with external tool usage.'
    },
    {
      id: 'contest-2',
      title: 'Creative Storytelling Showdown',
      deadline: 'March 25, 2025',
      participants: 235,
      prize: '$1,200',
      description: 'Create prompts that generate cohesive, engaging short stories with compelling characters and plot twists.'
    },
    {
      id: 'contest-3',
      title: 'Data Analysis Prompt-Off',
      deadline: 'April 2, 2025',
      participants: 143,
      prize: '$1,800',
      description: 'Design prompts that can extract insights, generate visualizations, and provide meaningful analysis from structured datasets.'
    },
    {
      id: 'contest-4',
      title: 'Code Generation Challenge',
      deadline: 'April 10, 2025',
      participants: 198,
      prize: '$2,000',
      description: 'Create prompts that generate efficient, correct, and well-documented code solutions for programming problems.'
    },
    {
      id: 'contest-5',
      title: 'Few-Shot Learning Contest',
      deadline: 'April 15, 2025',
      participants: 162,
      prize: '$1,500',
      description: 'Design prompts that maximize the effectiveness of few-shot learning for domain-specific tasks with minimal examples.'
    }
  ];
  
  return (
    <div className="container">
      <BreadcrumbNav />
      
      <div className="contests-container">
        <h1 className="section-title">Prompt Engineering Contests</h1>
        <p className="section-description">
          Put your prompt engineering skills to the test in our competitive challenges.
          Win prizes, gain recognition, and contribute to the advancement of prompt engineering techniques.
        </p>
        
        <div className="contests-header">
          <h2>Active Challenges</h2>
          <button className="contest-button">View Past Contests</button>
        </div>
        
        <div className="contests-list">
          {activeContests.map(contest => (
            <div className="contest-card" key={contest.id}>
              <div className="contest-info">
                <h3 className="contest-title">{contest.title}</h3>
                <p className="contest-description">{contest.description}</p>
              </div>
              
              <div className="contest-meta">
                <div className="meta-item">
                  <span className="meta-label">Deadline</span>
                  <span className="meta-value">{contest.deadline}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Participants</span>
                  <span className="meta-value">{contest.participants}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Prize</span>
                  <span className="meta-value">{contest.prize}</span>
                </div>
              </div>
              
              <div className="contest-actions">
                <button className="primary-button">Enter Challenge</button>
                <button className="secondary-button">View Details</button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="leaderboard-preview">
          <h2>Top Contenders</h2>
          <p>See who's leading our prompt engineering challenges this month.</p>
          <button className="secondary-button">View Full Leaderboard</button>
        </div>
      </div>
    </div>
  );
}

// Content Page Component
function ContentPage() {
  const { contentId } = useParams();
  const navigation = useNavigation();
  const [content, setContent] = useState(null);
  const [relatedContent, setRelatedContent] = useState([]);
  
  useEffect(() => {
    // This would fetch content from a real API in a complete implementation
    const fetchContent = async () => {
      // Record the content view for personalization
      navigation.recordContentView(contentId, 'tutorial', contentId.split('-')[0]);
      
      // Get related content
      const related = navigation.getRelatedContent(contentId);
      setRelatedContent(related);
      
      // Simulate content fetch
      setContent({
        id: contentId,
        title: contentId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
        content: `Detailed content for ${contentId} would be loaded here in a complete implementation.`
      });
    };
    
    fetchContent();
  }, [contentId, navigation]);
  
  if (!content) {
    return <div className="loading-indicator">Loading content...</div>;
  }
  
  return (
    <div className="container">
      <BreadcrumbNav />
      
      <div className="content-page">
        <h1 className="content-title">{content.title}</h1>
        
        <div className="content-layout">
          <div className="content-main">
            {content.content}
          </div>
          
          <div className="content-sidebar">
            <div className="related-content">
              <h3>Related Content</h3>
              <ul>
                {relatedContent.map((item, index) => (
                  <li key={index}>
                    <Link to={`/content/${item.id}`}>
                      {item.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Not Found Page Component
function NotFoundPage() {
  return (
    <div className="container">
      <div className="not-found">
        <h1>404 - Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="back-button">Return to Home</Link>
      </div>
    </div>
  );
}

// Footer Component
function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-column">
            <h3>Prompt Techniques</h3>
            <Link to="/skills/reasoning/chain-of-thought" className="footer-link">Chain-of-Thought</Link>
            <Link to="/skills/reasoning/tree-of-thought" className="footer-link">Tree-of-Thought</Link>
            <Link to="/skills/reasoning/react" className="footer-link">ReAct Framework</Link>
            <Link to="/skills/reasoning/few-shot" className="footer-link">Few-Shot Learning</Link>
            <Link to="/skills/creative-writing/role-based" className="footer-link">Role-based Prompting</Link>
          </div>
          
          <div className="footer-column">
            <h3>LLM Models</h3>
            <a href="#" className="footer-link">Claude 3</a>
            <a href="#" className="footer-link">GPT-4 Turbo</a>
            <a href="#" className="footer-link">Gemini Pro</a>
            <a href="#" className="footer-link">Llama 3</a>
            <a href="#" className="footer-link">Mistral 8x7B</a>
          </div>
          
          <div className="footer-column">
            <h3>Learning Resources</h3>
            <Link to="/programs/tutorials" className="footer-link">Interactive Tutorials</Link>
            <Link to="/programs/videos" className="footer-link">Video Courses</Link>
            <Link to="/documentation" className="footer-link">Documentation</Link>
            <Link to="/community" className="footer-link">Community Forum</Link>
            <a href="#" className="footer-link">Research Papers</a>
          </div>
          
          <div className="footer-column">
            <h3>About Us</h3>
            <Link to="/about" className="footer-link">Our Mission</Link>
            <Link to="/team" className="footer-link">Team</Link>
            <Link to="/contact" className="footer-link">Contact</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
          </div>
        </div>
        
        <div className="copyright">
          © 2025 Groktutor. All rights reserved. The ultimate platform for prompt engineering mastery.
        </div>
      </div>
    </footer>
  );
}

// Utility function to format time ago
function formatTimeAgo(dateString) {
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

export default App;
