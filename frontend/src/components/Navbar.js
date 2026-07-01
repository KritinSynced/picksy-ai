import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaChevronDown, FaSignOutAlt, FaHistory, FaShoppingBag, FaHeart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
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

  // Close dropdowns on route change
  useEffect(() => {
    setShowUserDropdown(false);
    setActiveCategory(null);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${searchQuery}`);
    }
  };

  const handleCategoryClick = (category, subcategory = null) => {
    if (subcategory) {
      navigate(`/?category=${subcategory}`);
    } else {
      navigate(`/?category=${category}`);
    }
    setActiveCategory(null);
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
      name: 'Electronics',
      key: 'electronics',
      subcategories: [
        { name: 'All Electronics', key: 'electronics' },
        { name: 'Laptops', key: 'laptops' },
        { name: 'Smartphones', key: 'smartphones' },
        { name: 'Audio', key: 'audio' },
        { name: 'Wearables', key: 'wearables' },
        { name: 'Televisions', key: 'televisions' }
      ]
    },
    {
      name: 'Footwear',
      key: 'footwear',
      subcategories: [
        { name: 'All Footwear', key: 'footwear' },
        { name: 'Running Shoes', key: 'running' },
        { name: 'Casual Shoes', key: 'casual' },
        { name: 'Sports Shoes', key: 'sports' }
      ]
    },
    {
      name: 'Clothing',
      key: 'clothing',
      subcategories: [
        { name: 'All Clothing', key: 'clothing' },
        { name: 'Jeans', key: 'jeans' },
        { name: 'T-Shirts', key: 'tshirts' },
        { name: 'Shirts', key: 'shirts' },
        { name: 'Jackets', key: 'jackets' }
      ]
    },
    {
      name: 'Home & Kitchen',
      key: 'home',
      subcategories: [
        { name: 'All Home', key: 'home' },
        { name: 'Kitchen', key: 'kitchen' },
        { name: 'Appliances', key: 'appliances' },
        { name: 'Furniture', key: 'furniture' }
      ]
    }
  ];

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Picksy</span>
          <span className="logo-ai">AI</span>
        </Link>

        {/* Category Navigation */}
        <ul className="category-nav">
          {categories.map((category) => (
            <li 
              key={category.key}
              className="category-nav-item"
              onMouseEnter={() => setActiveCategory(category.key)}
              onMouseLeave={() => setActiveCategory(null)}
            >
              <span className={`category-nav-link ${location.search.includes(category.key) ? 'active' : ''}`}>
                {category.name} <FaChevronDown className="dropdown-icon" />
              </span>
              
              {/* Dropdown Menu */}
              {activeCategory === category.key && (
                <div className="dropdown-menu glass-panel animate-scale-up">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.key}
                      className="dropdown-item"
                      onClick={() => handleCategoryClick(category.key, sub.key)}
                    >
                      {sub.name}
                    </div>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search premium products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" aria-label="Submit Search">
            <FaSearch />
          </button>
        </form>

        {/* Action icons */}
        <div className="nav-actions">
          <Link to="/cart" className="nav-action-btn cart-btn" aria-label="Shopping Cart">
            <FaShoppingCart />
            {cartCount > 0 && (
              <span className="cart-count-badge animate-bounce">{cartCount}</span>
            )}
          </Link>
          
          {/* User Account Section */}
          <div 
            className="user-profile-menu"
            onMouseEnter={() => setShowUserDropdown(true)}
            onMouseLeave={() => setShowUserDropdown(false)}
          >
            {isAuthenticated ? (
              <button className="avatar-btn" aria-label="User Menu">
                <div className="user-avatar">{getUserInitials()}</div>
              </button>
            ) : (
              <Link to="/profile/guest" className="nav-action-btn user-btn" aria-label="User Login">
                <FaUser />
              </Link>
            )}

            {/* Dropdown account actions */}
            {showUserDropdown && isAuthenticated && (
              <div className="user-dropdown-list glass-panel animate-scale-up">
                <div className="dropdown-user-info">
                  <p className="user-name">{user.fullName || user.username}</p>
                  <p className="user-email">{user.email}</p>
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;