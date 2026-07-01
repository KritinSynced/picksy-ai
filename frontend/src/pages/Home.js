import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaSlidersH, FaSearch, FaTimes, FaFilter, FaLaptop, FaMobileAlt, FaHeadphones, FaTshirt, FaHome, FaRunning } from 'react-icons/fa';
import Recommendation from '../components/Recommendation';
import ProductCard from '../components/ProductCard';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  // Recommendations and trending lists
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  
  // Search / Category raw items list
  const [rawResults, setRawResults] = useState([]);
  // Filtered items displayed in grid
  const [filteredResults, setFilteredResults] = useState([]);
  
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState({
    recommendations: true,
    trending: true,
    search: false,
    category: false
  });
  const [error, setError] = useState({
    recommendations: null,
    trending: null,
    search: null,
    category: null
  });

  // Client side filter configurations
  const [brandsList, setBrandsList] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPriceLimit, setMaxPriceLimit] = useState(300000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState(300000);
  const [sortByOption, setSortByOption] = useState('newest');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const categoryQuery = searchParams.get('category');

  // Load carousels on mount
  useEffect(() => {
    fetchRecommendations();
    fetchTrending();
  }, []);

  // Fetch recommendations
  const fetchRecommendations = async () => {
    try {
      setLoading(prev => ({ ...prev, recommendations: true }));
      setError(prev => ({ ...prev, recommendations: null }));
      
      const savedUser = localStorage.getItem('user');
      const userId = savedUser ? JSON.parse(savedUser)._id : 'guest';
      
      const response = await axios.get(`${API_URL}/recommendations/user/${userId}`);
      setRecommendedProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError(prev => ({ 
        ...prev, 
        recommendations: 'Failed to load recommendations. Please check server connection.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, recommendations: false }));
    }
  };

  // Fetch trending
  const fetchTrending = async () => {
    try {
      setLoading(prev => ({ ...prev, trending: true }));
      setError(prev => ({ ...prev, trending: null }));
      
      const response = await axios.get(`${API_URL}/recommendations/trending`);
      setTrendingProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load trending products:', err);
      setError(prev => ({ 
        ...prev, 
        trending: 'Failed to load trending products. Please try again later.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, trending: false }));
    }
  };

  // Load searches or categories
  useEffect(() => {
    if (searchQuery) {
      searchProducts(searchQuery);
    } else if (categoryQuery) {
      setSelectedCategory(categoryQuery);
      fetchProductsByCategory(categoryQuery);
    } else {
      setRawResults([]);
      setSelectedCategory('');
    }
  }, [searchQuery, categoryQuery]);

  // Execute Search query
  const searchProducts = async (query) => {
    try {
      setLoading(prev => ({ ...prev, search: true }));
      setError(prev => ({ ...prev, search: null }));
      
      const response = await axios.get(`${API_URL}/products?search=${encodeURIComponent(query)}`);
      const items = response.data?.products || response.data || [];
      
      setRawResults(items);
      initializeFilters(items);
    } catch (err) {
      console.error('Search failed:', err);
      setError(prev => ({ 
        ...prev, 
        search: 'Failed to fetch search results. Check connection.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  };

  // Fetch Category items
  const fetchProductsByCategory = async (category) => {
    try {
      setLoading(prev => ({ ...prev, category: true }));
      setError(prev => ({ ...prev, category: null }));
      
      const response = await axios.get(`${API_URL}/products?category=${encodeURIComponent(category)}`);
      const items = response.data?.products || response.data || [];
      
      setRawResults(items);
      initializeFilters(items);
    } catch (err) {
      console.error('Category load failed:', err);
      setError(prev => ({ 
        ...prev, 
        category: 'Failed to load category products.' 
      }));
    } finally {
      setLoading(prev => ({ ...prev, category: false }));
    }
  };

  // Initialize filter limits dynamically based on retrieved dataset
  const initializeFilters = (items) => {
    if (items.length === 0) return;
    
    // Extract unique brands list
    const brands = [...new Set(items.map(item => item.brand).filter(Boolean))];
    setBrandsList(brands);
    setSelectedBrands([]);

    // Extract maximum price boundary
    const prices = items.map(item => item.price).filter(p => !isNaN(p));
    const highestPrice = prices.length > 0 ? Math.max(...prices) : 300000;
    
    setMaxPriceLimit(highestPrice);
    setCurrentMaxPrice(highestPrice);
    setSortByOption('newest');
  };

  // Filter application pipeline
  useEffect(() => {
    let result = [...rawResults];

    // 1. Filter by price range
    result = result.filter(item => item.price <= currentMaxPrice);

    // 2. Filter by brands selected
    if (selectedBrands.length > 0) {
      result = result.filter(item => selectedBrands.includes(item.brand));
    }

    // 3. Apply sorting options
    switch (sortByOption) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredResults(result);
  }, [rawResults, currentMaxPrice, selectedBrands, sortByOption]);

  const handleBrandChange = (brandName) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandName)) {
        return prev.filter(b => b !== brandName);
      } else {
        return [...prev, brandName];
      }
    });
  };

  const resetFilters = () => {
    setCurrentMaxPrice(maxPriceLimit);
    setSelectedBrands([]);
    setSortByOption('newest');
  };

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      'electronics': 'Electronics',
      'laptops': 'Laptops',
      'smartphones': 'Smartphones',
      'audio': 'Audio',
      'wearables': 'Wearables',
      'televisions': 'Televisions',
      'footwear': 'Footwear',
      'running': 'Running Shoes',
      'casual': 'Casual Shoes',
      'sports': 'Sports Shoes',
      'clothing': 'Clothing',
      'jeans': 'Jeans',
      'tshirts': 'T-Shirts',
      'shirts': 'Shirts',
      'jackets': 'Jackets',
      'home': 'Home & Kitchen',
      'kitchen': 'Kitchen',
      'appliances': 'Appliances',
      'furniture': 'Furniture'
    };
    return categoryNames[category] || category?.charAt(0).toUpperCase() + category?.slice(1) || 'Category';
  };

  // Modern category grid assets
  const categoryHighlights = [
    { name: 'Laptops', key: 'laptops', icon: <FaLaptop /> },
    { name: 'Smartphones', key: 'smartphones', icon: <FaMobileAlt /> },
    { name: 'Audio Gear', key: 'audio', icon: <FaHeadphones /> },
    { name: 'Wearables', key: 'wearables', icon: <FaSlidersH /> },
    { name: 'Running', key: 'running', icon: <FaRunning /> },
    { name: 'Apparel', key: 'clothing', icon: <FaTshirt /> },
    { name: 'Home Living', key: 'home', icon: <FaHome /> }
  ];

  return (
    <div className="home-page">
      {/* Hero Banner Showcase */}
      {!searchQuery && !categoryQuery && (
        <div className="hero-banner-premium">
          <div className="hero-glow-1"></div>
          <div className="hero-glow-2"></div>
          <div className="container hero-container">
            <div className="hero-text-content">
              <span className="hero-badge animate-slide-up">Next-Gen E-Commerce</span>
              <h1 className="animate-slide-up">Discover Products Curated for You</h1>
              <p className="animate-slide-up">
                Picksy employs intelligent AI recommendations aligned with your shopping history, preferences, and browsing habits. Discover premium products instantly.
              </p>
              <div className="hero-ctas animate-slide-up">
                <button onClick={() => navigate('/profile/guest')} className="btn-premium">
                  Personalize Experience
                </button>
                <a href="#browse-sections" className="btn-premium-outline">
                  Browse Popular
                </a>
              </div>
            </div>
            <div className="hero-graphic animate-scale-up">
              <div className="glass-showcase-panel">
                <div className="glass-showcase-header">
                  <span className="bullet red"></span>
                  <span className="bullet yellow"></span>
                  <span className="bullet green"></span>
                </div>
                <div className="glass-showcase-body">
                  <h4 className="pref-tag">AI recommendation engine</h4>
                  <div className="mock-rec-card">
                    <div className="mock-img"></div>
                    <div className="mock-lines">
                      <div className="line-h"></div>
                      <div className="line-s"></div>
                    </div>
                  </div>
                  <div className="mock-metrics">
                    <div className="metric">
                      <h5>98%</h5>
                      <p>Personal Match</p>
                    </div>
                    <div className="metric">
                      <h5>40+</h5>
                      <p>Top Brands</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container" id="browse-sections">
        {/* Global errors banner */}
        {Object.values(error).some(e => e) && (
          <div className="error-banner">
            {Object.entries(error).map(([key, msg]) => msg && (
              <div key={key} className="error-message">{msg}</div>
            ))}
          </div>
        )}

        {/* Search Results / Category filters view */}
        {(searchQuery || categoryQuery) ? (
          <div className="catalog-layout">
            
            {/* Filter Toggle for Mobile */}
            <button className="mobile-filter-toggle-btn" onClick={() => setShowMobileFilters(true)}>
              <FaFilter /> Filters & Sort
            </button>

            {/* Sidebar Filters panel */}
            <aside className={`catalog-sidebar glass-panel ${showMobileFilters ? 'mobile-visible' : ''}`}>
              <div className="sidebar-header">
                <h3>Refine Catalog</h3>
                <button className="close-filters-btn" onClick={() => setShowMobileFilters(false)}>
                  <FaTimes />
                </button>
              </div>

              {/* Price range filter */}
              <div className="filter-group">
                <h4>Max Price</h4>
                <div className="price-slider-container">
                  <input 
                    type="range" 
                    min="500" 
                    max={maxPriceLimit} 
                    value={currentMaxPrice}
                    onChange={(e) => setCurrentMaxPrice(Number(e.target.value))}
                    className="price-slider"
                  />
                  <div className="price-labels">
                    <span>₹500</span>
                    <span className="current-max-label">₹{new Intl.NumberFormat('en-IN').format(currentMaxPrice)}</span>
                  </div>
                </div>
              </div>

              {/* Brand filter list */}
              {brandsList.length > 0 && (
                <div className="filter-group">
                  <h4>Filter by Brand</h4>
                  <div className="brand-checklist">
                    {brandsList.map(brand => (
                      <label key={brand} className="checkbox-label">
                        <input 
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => handleBrandChange(brand)}
                        />
                        <span className="checkbox-custom"></span>
                        {brand}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Sorting Filter */}
              <div className="filter-group">
                <h4>Sort By</h4>
                <select 
                  className="filter-select"
                  value={sortByOption}
                  onChange={(e) => setSortByOption(e.target.value)}
                >
                  <option value="newest">New Releases</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>

              <button className="btn-premium-outline reset-filters-btn" onClick={resetFilters}>
                Clear All Filters
              </button>
            </aside>

            {/* Catalog Grid View */}
            <main className="catalog-content">
              <div className="catalog-results-header">
                <h2>{searchQuery ? `Search results for "${searchQuery}"` : getCategoryDisplayName(selectedCategory)}</h2>
                <p className="results-count">{filteredResults.length} premium listings found</p>
              </div>

              {(loading.search || loading.category) ? (
                <div className="loading-spinner">
                  <div className="spinner"></div>
                </div>
              ) : (
                <div className="products-grid animate-fade-in">
                  {filteredResults.length > 0 ? (
                    filteredResults.map(product => (
                      <ProductCard key={product._id} product={product} />
                    ))
                  ) : (
                    <div className="no-results glass-panel">
                      <FaTimes size={40} className="no-results-icon" />
                      <h3>No Matches Found</h3>
                      <p>We couldn't find any products matching your current price slider or brand parameters. Reset filters to continue.</p>
                      <button onClick={resetFilters} className="btn-premium">
                        Reset Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        ) : (
          /* Normal Homepage Feed */
          <div className="homepage-feed">
            {/* Category selection bar */}
            <section className="categories-highlights-section">
              <div className="section-title-wrap">
                <h2>Popular Departments</h2>
                <span className="title-decorator"></span>
              </div>
              <div className="categories-h-grid">
                {categoryHighlights.map(cat => (
                  <div 
                    key={cat.key} 
                    className="category-h-card glass-card"
                    onClick={() => navigate(`/?category=${cat.key}`)}
                  >
                    <div className="cat-h-icon">{cat.icon}</div>
                    <h3>{cat.name}</h3>
                  </div>
                ))}
              </div>
            </section>

            {/* AI Recommendations */}
            <Recommendation 
              title="Personalized Recommendations" 
              products={recommendedProducts}
              loading={loading.recommendations}
              error={error.recommendations}
            />
            
            {/* Trending Products */}
            <Recommendation 
              title="Trending Now" 
              products={trendingProducts}
              loading={loading.trending}
              error={error.trending}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;