import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaShoppingCart, FaUser, FaSearch, FaChevronDown, FaSignOutAlt, 
  FaHistory, FaShoppingBag, FaHeart, FaSun, FaMoon, FaSlidersH, 
  FaChartBar, FaTags, FaSearchPlus
} from 'react-icons/fa';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Navbar.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState({ categories: [], products: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSandboxDropdown, setShowSandboxDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // default dark
  const [simulatedPersonas, setSimulatedPersonas] = useState([]);

  const { cartCount } = useCart();
  const { user, logout, loginAsSimulatedUser, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // Load theme and simulated personas
  useEffect(() => {
    // Set initial dark theme
    document.body.classList.add('dark-theme');
    
    // Fetch simulated personas
    const loadPersonas = async () => {
      try {
        const res = await axios.get(`${API_URL}/users/simulation-personas`);
        setSimulatedPersonas(res.data);
      } catch (err) {
        console.error('Failed to load personas:', err);
      }
    };
    loadPersonas();
  }, []);

  // Handle scroll blur effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on path transition
  useEffect(() => {
    setShowUserDropdown(false);
    setShowSandboxDropdown(false);
    setShowSuggestions(false);
    setActiveCategory(null);
  }, [location]);

  // Click outside listener for suggestions panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autocomplete Live Search
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchSuggestions({ categories: [], products: [] });
        return;
      }
      try {
        const response = await axios.get(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        const items = response.data?.products || [];
        
        // Extract matching categories
        const matchedCategories = [
          ...new Set(
            items
              .map(i => i.category)
              .filter(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        ].slice(0, 3);

        setSearchSuggestions({
          categories: matchedCategories,
          products: items.slice(0, 4)
        });
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200); // 200ms debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleCategoryClick = (category, subcategory = null) => {
    if (subcategory) {
      navigate(`/search?category=${encodeURIComponent(subcategory)}`);
    } else {
      navigate(`/search?category=${encodeURIComponent(category)}`);
    }
    setActiveCategory(null);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-theme');
  };

  const selectPersona = async (personaId) => {
    const success = await loginAsSimulatedUser(personaId);
    if (success) {
      setShowSandboxDropdown(false);
      navigate('/');
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.fullName) {
      const parts = user.fullName.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase().substring(0, 2);
    }
    return user.username ? user.username.substring(0, 2).toUpperCase() : 'U';
  };

  const categories = [
    {
      name: 'Electronics & Gaming',
      key: 'electronics_gaming',
      subcategories: [
        { name: 'All Electronics', key: 'electronics' },
        { name: 'Laptops', key: 'laptops' },
        { name: 'Smartphones', key: 'smartphones' },
        { name: 'Gaming Consoles', key: 'gaming' },
        { name: 'Accessories', key: 'accessories' }
      ]
    },
    {
      name: 'Fashion & Beauty',
      key: 'fashion_beauty',
      subcategories: [
        { name: 'All Fashion', key: 'fashion' },
        { name: 'Apparel & Clothing', key: 'clothing' },
        { name: 'Footwear', key: 'footwear' },
        { name: 'Skincare & Cosmetics', key: 'beauty' }
      ]
    },
    {
      name: 'Home & Kitchen',
      key: 'home_furniture',
      subcategories: [
        { name: 'All Home & Living', key: 'home_kitchen' },
        { name: 'Kitchen Appliances', key: 'appliances' },
        { name: 'Furniture Essentials', key: 'furniture' }
      ]
    },
    {
      name: 'More Categories',
      key: 'other_categories',
      subcategories: [
        { name: 'Grocery & Staples', key: 'grocery' },
        { name: 'Books & Literature', key: 'books' },
        { name: 'Sports & Fitness', key: 'sports' },
        { name: 'Automotive Care', key: 'automotive' },
        { name: 'Toys & Board Games', key: 'toys' }
      ]
    }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Picksy</span>
        </Link>

        {/* Dynamic Category Navigation Menu */}
        <ul className="category-nav">
          {categories.map((category) => (
            <li 
              key={category.key}
              className="category-nav-item"
              onMouseEnter={() => setActiveCategory(category.key)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <span className="category-nav-link">
                {category.name} <FaChevronDown className="dropdown-icon" />
              </span>
              
              {activeCategory === category.key && (
                <div className="dropdown-menu glass-panel animate-scale-up">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.key}
                      className="dropdown-item"
                      onClick={() => handleCategoryClick(sub.key)}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Search Bar Container with Autocomplete dropdown */}
        <div className="search-bar-wrapper" ref={searchRef}>
          <form className="search-bar" onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products by brand, tag, specifications..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
            <button type="submit" aria-label="Submit Search">
              <FaSearch />
            </button>
          </form>

          {showSuggestions && (searchSuggestions.categories.length > 0 || searchSuggestions.products.length > 0) && (
            <div className="search-autocomplete-panel glass-panel">
              {searchSuggestions.categories.length > 0 && (
                <div className="autocomplete-section">
                  <div className="autocomplete-section-title">Categories</div>
                  {searchSuggestions.categories.map(cat => (
                    <div
                      key={cat}
                      className="autocomplete-item-category"
                      onClick={() => {
                        navigate(`/search?category=${encodeURIComponent(cat)}`);
                        setShowSuggestions(false);
                      }}
                    >
                      <FaTags className="autocomplete-item-icon" />
                      <span className="autocomplete-item-category-name">{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                    </div>
                  ))}
                </div>
              )}

              {searchSuggestions.products.length > 0 && (
                <div className="autocomplete-section" style={{ marginTop: '10px' }}>
                  <div className="autocomplete-section-title">Products</div>
                  {searchSuggestions.products.map(p => (
                    <Link
                      key={p._id}
                      to={`/product/${p._id}`}
                      className="autocomplete-item-product"
                      onClick={() => setShowSuggestions(false)}
                    >
                      <img 
                        src={p.images?.[0] || 'https://via.placeholder.com/30'} 
                        alt="" 
                        className="autocomplete-item-product-thumb" 
                      />
                      <div className="autocomplete-item-product-details">
                        <span className="autocomplete-item-product-name">{p.name}</span>
                        <span className="autocomplete-item-product-brand-price">{p.brand} • ₹{new Intl.NumberFormat('en-IN').format(p.price)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global actions and Auth panel */}
        <div className="nav-actions">
          {/* Dashboard Analytics Link */}
          <Link to="/dashboard" className="nav-action-btn" title="Admin Analytics" aria-label="Dashboard Analytics">
            <FaChartBar />
          </Link>

          {/* Theme Toggle Button */}
          <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme" aria-label="Toggle Light/Dark Theme">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Shopping Cart Button */}
          <Link to="/cart" className="nav-action-btn cart-btn" aria-label="Shopping Cart">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="cart-count-badge animate-bounce">{cartCount}</span>
            )}
          </Link>

          {/* Sandbox Switcher (demo switcher) */}
          <div className="sandbox-switcher-container">
            <button className="btn-sandbox" onClick={() => setShowSandboxDropdown(!showSandboxDropdown)}>
              <FaSlidersH />
              <span>Sandbox Switcher</span>
            </button>

            {showSandboxDropdown && (
              <div className="sandbox-dropdown-panel glass-panel">
                <h4>Simulate Recruiter Personas</h4>
                <p className="sandbox-subtitle">Click a simulated buyer profile to test adaptive AI recommendations instantly.</p>
                <div className="personas-list">
                  {simulatedPersonas.map(persona => (
                    <button
                      key={persona._id}
                      className={`persona-btn-item ${user?._id === persona._id ? 'active' : ''}`}
                      onClick={() => selectPersona(persona._id)}
                    >
                      <div className="persona-head">
                        <span>{persona.fullName}</span>
                        <span className="persona-tag">{persona.budgetTier} Budget</span>
                      </div>
                      <div className="persona-desc">
                        Age: {persona.age} • Likes: {persona.interests.join(', ')} • Location: {persona.location}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clerk Login Interface & Simulated profile details dropdown */}
          {CLERK_PUBLISHABLE_KEY ? (
            <>
              <SignedIn>
                <div style={{ marginLeft: '10px', display: 'flex', alignItems: 'center' }}>
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="btn-premium" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </>
          ) : null}

          {/* Simulated / Fallback Profile dropdown */}
          {(!CLERK_PUBLISHABLE_KEY || !isAuthenticated) && (
            <div 
              className="user-profile-menu"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              {isAuthenticated ? (
                <button className="avatar-btn" aria-label="Simulated Profile Avatar">
                  <div className="user-avatar">{getUserInitials()}</div>
                </button>
              ) : (
                <Link to="/profile/guest" className="nav-action-btn user-btn" aria-label="Demo login fallback">
                  <FaUser />
                </Link>
              )}

              {showUserDropdown && isAuthenticated && (
                <div className="user-dropdown-list glass-panel animate-scale-up">
                  <div className="dropdown-user-info">
                    <p className="user-name">{user.fullName || user.username}</p>
                    <p className="user-email">{user.email}</p>
                    <p className="user-demographics-desc" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Simulated Persona: {user.age} y/o • {user.location}
                    </p>
                  </div>
                  <hr className="dropdown-divider" />
                  <Link to={`/profile/${user._id}?tab=browsing`} className="user-dropdown-item">
                    <FaHistory /> Browsing History
                  </Link>
                  <Link to={`/profile/${user._id}?tab=purchases`} className="user-dropdown-item">
                    <FaShoppingBag /> Purchase History
                  </Link>
                  <Link to={`/profile/${user._id}?tab=recommendations`} className="user-dropdown-item">
                    <FaHeart /> Saved Suggestions
                  </Link>
                  <hr className="dropdown-divider" />
                  <button onClick={logout} className="user-dropdown-item logout-btn">
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;