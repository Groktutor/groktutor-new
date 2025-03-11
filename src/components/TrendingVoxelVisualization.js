import React, { useState, useEffect, useRef } from 'react';
import { fetchDataWithCache, realTimeService } from '../services/dataService';
import { useNavigation } from '../services/navigationService';

const TrendingVoxelVisualization = () => {
  const [trendingData, setTrendingData] = useState([
    { technique: 'Chain-of-Thought', popularity: 90, growth: 18, color: '#00ffff' },
    { technique: 'Tree-of-Thought', popularity: 75, growth: 42, color: '#ff00ff' },
    { technique: 'ReAct', popularity: 85, growth: 28, color: '#0fff0f' },
    { technique: 'Few-Shot', popularity: 70, growth: 12, color: '#ffff00' },
    { technique: 'Zero-Shot', popularity: 65, growth: 8, color: '#ff5500' },
  ]);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const isDragging = useRef(false);
  const lastX = useRef(0);
  const autoRotate = useRef(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        // In a full implementation, we would fetch real trending data
        // const data = await fetchDataWithCache('trends');
        // if (data) setTrendingData(data);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      }
    };

    fetchTrends();

    // Handle animation
    const animate = () => {
      if (autoRotate.current) {
        setRotation(prev => (prev + 0.2) % 360);
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Mouse interaction handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastX.current = e.clientX;
    autoRotate.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    
    const deltaX = e.clientX - lastX.current;
    setRotation(prev => (prev + deltaX * 0.5) % 360);
    lastX.current = e.clientX;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseLeave = () => {
    if (isDragging.current) {
      isDragging.current = false;
      // Resume auto-rotation after 2 seconds
      setTimeout(() => {
        autoRotate.current = true;
      }, 2000);
    }
  };

  const handleDoubleClick = () => {
    autoRotate.current = !autoRotate.current;
  };

  return (
    <div className="voxel-visualization">
      <div className="voxel-intro">
        <h2>Technique Popularity Visualization</h2>
        <p>Explore the most popular prompt engineering techniques visualized in 3D space. Drag to rotate, double-click to toggle auto-rotation.</p>
      </div>
      
      <div 
        className="voxel-container"
        ref={containerRef}
        style={{ transform: `rotateX(60deg) rotateZ(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      >
        {trendingData.map((item, index) => {
          // Calculate position in a circle
          const angle = (index / trendingData.length) * Math.PI * 2;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          // Height is based on popularity (0-100)
          const height = (item.popularity / 100) * 120 + 30;
          
          return (
            <div 
              key={item.technique}
              className="data-voxel-wrapper"
              style={{ 
                transform: `translate3d(${x}px, ${y}px, 0)`,
                zIndex: Math.round(y + 1000) // Give proper stacking based on y position
              }}
            >
              <div 
                className="data-voxel" 
                style={{ 
                  backgroundColor: item.color,
                  height: `${height}px`,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div 
                  className="data-voxel-top" 
                  style={{ backgroundColor: item.color }}
                />
                <div 
                  className="data-voxel-label"
                  style={{ fontWeight: item.growth > 20 ? 'bold' : 'normal' }}
                >
                  {item.technique}
                  <span className="voxel-growth">{item.growth > 0 ? `+${item.growth}%` : `${item.growth}%`}</span>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Reference grid for better visual orientation */}
        <div className="voxel-grid">
          {[...Array(5)].map((_, i) => (
            <div 
              key={`grid-x-${i}`} 
              className="grid-line x-line"
              style={{ transform: `translateZ(0) translateX(${i * 80 - 160}px)` }}
            />
          ))}
          {[...Array(5)].map((_, i) => (
            <div 
              key={`grid-y-${i}`} 
              className="grid-line y-line"
              style={{ transform: `translateZ(0) translateY(${i * 80 - 160}px)` }}
            />
          ))}
        </div>
      </div>
      
      <div className="voxel-legend">
        {trendingData.map(item => (
          <div key={item.technique} className="legend-item">
            <div className="legend-color" style={{ backgroundColor: item.color }}></div>
            <div className="legend-text">
              <div className="legend-name">{item.technique}</div>
              <div className="legend-stats">Popularity: {item.popularity}% | Growth: {item.growth > 0 ? `+${item.growth}%` : `${item.growth}%`}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrendingVoxelVisualization;
