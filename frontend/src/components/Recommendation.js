import React, { useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ProductCard from './ProductCard';
import './Recommendation.css';

const Recommendation = ({ title, products, loading, error }) => {
  const scrollContainerRef = useRef(null);

  const handleScroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Calculate scroll offset based on client width
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (loading) {
    return (
      <div className="recommendation-section">
        <div className="recommendation-header">
          <h2 className="recommendation-title">{title}</h2>
        </div>
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card skeleton animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recommendation-section">
        <div className="recommendation-header">
          <h2 className="recommendation-title">{title}</h2>
        </div>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return null; // Don't show recommendation section if empty (clean UI)
  }

  return (
    <div className="recommendation-section animate-fade-in">
      <div className="recommendation-header">
        <div className="title-left">
          <h2 className="recommendation-title">{title}</h2>
          <span className="title-decorator"></span>
        </div>
        <div className="carousel-controls">
          <button 
            className="control-btn prev-btn" 
            onClick={() => handleScroll('left')}
            aria-label="Previous items"
          >
            <FaChevronLeft />
          </button>
          <button 
            className="control-btn next-btn" 
            onClick={() => handleScroll('right')}
            aria-label="Next items"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="recommendation-scroll-outer">
        <div 
          className="recommendation-scroll-container" 
          ref={scrollContainerRef}
        >
          {products.map(product => (
            <div key={product._id} className="recommendation-card-wrapper">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Recommendation;