import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { FaUser, FaHistory, FaHeart, FaShoppingBag, FaSlidersH, FaSignOutAlt, FaUnlockAlt, FaEnvelope, FaPen } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, login, register, logout, updatePreferences, refreshUser } = useAuth();
  
  // State variables
  const [activeTab, setActiveTab] = useState('preferences');
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [prefSuccess, setPrefSuccess] = useState(false);

  // Forms state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regUsername, setRegUsername] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Preference Form
  const [prefCategories, setPrefCategories] = useState([]);
  const [prefBrands, setPrefBrands] = useState([]);
  const [prefMinPrice, setPrefMinPrice] = useState(0);
  const [prefMaxPrice, setPrefMaxPrice] = useState(300000);

  // Set active tab based on query param if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  // Load preferences from user object when it changes
  useEffect(() => {
    if (authUser && authUser._id !== 'guest') {
      setPrefCategories(authUser.preferences?.favoriteCategories || []);
      setPrefBrands(authUser.preferences?.preferredBrands || []);
      setPrefMinPrice(authUser.preferences?.priceRange?.min || 0);
      setPrefMaxPrice(authUser.preferences?.priceRange?.max || 300000);
      
      // Auto redirect to profile page of active user if URL has guest
      if (userId === 'guest') {
        navigate(`/profile/${authUser._id}`);
      }
    }
  }, [authUser, userId, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setFormError('Please enter email and password.');
      return;
    }
    
    setLoading(true);
    setFormError('');
    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    
    if (res.success) {
      // Login context automatically sets user and triggers rerender
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setFormError(res.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!regUsername || !regEmail || !regPassword || !regFullName) {
      setFormError('Please fill out all fields.');
      return;
    }
    if (!emailRegex.test(regEmail)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setFormError('');
    const res = await register(regUsername, regEmail, regPassword, regFullName);
    setLoading(false);

    if (res.success) {
      setRegUsername('');
      setRegEmail('');
      setRegPassword('');
      setRegFullName('');
    } else {
      setFormError(res.message);
    }
  };

  const handleCategoryCheckbox = (cat) => {
    setPrefCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleBrandCheckbox = (brand) => {
    setPrefBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrefSuccess(false);

    const payload = {
      favoriteCategories: prefCategories,
      preferredBrands: prefBrands,
      priceRange: {
        min: Number(prefMinPrice),
        max: Number(prefMaxPrice)
      }
    };

    const res = await updatePreferences(payload);
    setLoading(false);

    if (res.success) {
      setPrefSuccess(true);
      setTimeout(() => setPrefSuccess(false), 2000);
    }
  };

  const handleLogOutAction = () => {
    logout();
    navigate('/');
  };

  const formatIndianPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('en-IN').format(price);
  };

  // 1. Guest View: Login / Sign Up Card
  if (userId === 'guest' && !authUser) {
    return (
      <div className="profile-page-premium">
        <div className="container flex-center-wrapper">
          <div className="auth-form-card glass-panel animate-scale-up">
            
            {/* Sliding tab buttons */}
            <div className="auth-tabs">
              <button 
                className={`auth-tab-btn ${isLoginTab ? 'active' : ''}`}
                onClick={() => { setIsLoginTab(true); setFormError(''); }}
              >
                Sign In
              </button>
              <button 
                className={`auth-tab-btn ${!isLoginTab ? 'active' : ''}`}
                onClick={() => { setIsLoginTab(false); setFormError(''); }}
              >
                Sign Up
              </button>
            </div>

            {formError && <div className="error-message">{formError}</div>}

            {/* Login panel */}
            {isLoginTab ? (
              <form onSubmit={handleLoginSubmit} className="auth-form animate-fade-in">
                <div className="form-group">
                  <label htmlFor="login-email">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input 
                      type="email" 
                      id="login-email" 
                      placeholder="name@domain.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="login-pass">Password</label>
                  <div className="input-with-icon">
                    <FaUnlockAlt className="input-icon" />
                    <input 
                      type="password" 
                      id="login-pass" 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-premium auth-submit-btn" disabled={loading}>
                  {loading ? <div className="btn-spinner"></div> : 'Log In'}
                </button>
              </form>
            ) : (
              /* Register panel */
              <form onSubmit={handleRegisterSubmit} className="auth-form animate-fade-in">
                <div className="form-group">
                  <label htmlFor="reg-name">Full Name</label>
                  <div className="input-with-icon">
                    <FaUser className="input-icon" />
                    <input 
                      type="text" 
                      id="reg-name" 
                      placeholder="Kritin Kumar"
                      value={regFullName}
                      onChange={(e) => setRegFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-user">Username</label>
                  <div className="input-with-icon">
                    <FaPen className="input-icon" />
                    <input 
                      type="text" 
                      id="reg-user" 
                      placeholder="kritinkumar"
                      value={regUsername}
                      onChange={(e) => setRegUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-email">Email Address</label>
                  <div className="input-with-icon">
                    <FaEnvelope className="input-icon" />
                    <input 
                      type="email" 
                      id="reg-email" 
                      placeholder="name@domain.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-pass">Password</label>
                  <div className="input-with-icon">
                    <FaUnlockAlt className="input-icon" />
                    <input 
                      type="password" 
                      id="reg-pass" 
                      placeholder="At least 6 characters"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn-premium auth-submit-btn" disabled={loading}>
                  {loading ? <div className="btn-spinner"></div> : 'Create Account'}
                </button>
              </form>
            )}

            <div className="auth-footer">
              <p className="secure-badge"><FaUnlockAlt /> Safe encrypted login session</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Dashboard View
  const availableCategories = ['electronics', 'footwear', 'clothing', 'home'];
  const availableBrands = ['Apple', 'Samsung', 'OnePlus', 'Google', 'Sony', 'Bose', 'boAt', 'JBL', 'Garmin', 'Nike', 'Adidas', 'ASICS', 'Puma', 'Levi\'s', 'Zara', 'Prestige', 'Dyson', 'Wakefit'];

  const initials = authUser?.fullName 
    ? authUser.fullName.split(' ').map(p => p[0]).join('').toUpperCase().substring(0, 2)
    : authUser?.username?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="profile-page-premium animate-fade-in">
      <div className="container">
        
        {/* User profile header card */}
        <div className="profile-header-banner glass-panel">
          <div className="profile-header-identity">
            <div className="profile-circle-avatar">{initials}</div>
            <div className="profile-details-text">
              <h1>{authUser?.fullName || authUser?.username}</h1>
              <p className="profile-email-label">{authUser?.email}</p>
              <span className="member-since-badge">
                Member since {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' }) : '2026'}
              </span>
            </div>
          </div>
          <button onClick={handleLogOutAction} className="btn-premium-outline logout-action-btn">
            <FaSignOutAlt /> Sign Out
          </button>
        </div>

        {/* Dashboard layout grid */}
        <div className="profile-dashboard-grid">
          
          {/* Dashboard Left Side tabs */}
          <aside className="dashboard-tabs-sidebar glass-panel">
            <button 
              className={`dashboard-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <FaSlidersH /> Profile Preferences
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'browsing' ? 'active' : ''}`}
              onClick={() => setActiveTab('browsing')}
            >
              <FaHistory /> Browsing History
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              <FaShoppingBag /> Purchase History
            </button>
            <button 
              className={`dashboard-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
              onClick={() => setActiveTab('recommendations')}
            >
              <FaHeart /> Personal Suggestions
            </button>
          </aside>

          {/* Dashboard Right Side tab panels */}
          <main className="dashboard-content-panel">
            
            {/* Panel 1: Preferences Manager */}
            {activeTab === 'preferences' && (
              <div className="preferences-form-card glass-panel animate-fade-in">
                <h2>Recommendation Preferences</h2>
                <p className="pref-description">Configure your interests to customize the AI recommendation engine in real-time.</p>
                
                {prefSuccess && <div className="success-message">Preferences saved and recommendation engine updated!</div>}

                <form onSubmit={handleSavePreferences} className="preferences-form">
                  
                  {/* Category check grid */}
                  <div className="pref-fieldset">
                    <h3>Favorite Departments</h3>
                    <div className="pref-checkbox-grid">
                      {availableCategories.map(cat => (
                        <label key={cat} className="checkbox-label capitalize">
                          <input 
                            type="checkbox"
                            checked={prefCategories.includes(cat)}
                            onChange={() => handleCategoryCheckbox(cat)}
                          />
                          <span className="checkbox-custom"></span>
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brand check checklist */}
                  <div className="pref-fieldset">
                    <h3>Preferred Brands</h3>
                    <div className="pref-checkbox-grid brands-grid">
                      {availableBrands.map(brand => (
                        <label key={brand} className="checkbox-label">
                          <input 
                            type="checkbox"
                            checked={prefBrands.includes(brand)}
                            onChange={() => handleBrandCheckbox(brand)}
                          />
                          <span className="checkbox-custom"></span>
                          {brand}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price budget constraint */}
                  <div className="pref-fieldset">
                    <h3>Price Range Budget</h3>
                    <div className="form-grid-two">
                      <div className="form-group">
                        <label htmlFor="pref-min-p">Minimum Price (₹)</label>
                        <input 
                          type="number" 
                          id="pref-min-p"
                          value={prefMinPrice}
                          onChange={(e) => setPrefMinPrice(Number(e.target.value))}
                          min="0"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="pref-max-p">Maximum Price (₹)</label>
                        <input 
                          type="number" 
                          id="pref-max-p"
                          value={prefMaxPrice}
                          onChange={(e) => setPrefMaxPrice(Number(e.target.value))}
                          min="1000"
                        />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn-premium save-preferences-btn" disabled={loading}>
                    {loading ? <div className="btn-spinner"></div> : 'Save Preferences'}
                  </button>
                </form>
              </div>
            )}

            {/* Panel 2: Browsing History */}
            {activeTab === 'browsing' && (
              <div className="history-list-view animate-fade-in">
                <div className="view-title">
                  <h2>Browsing History</h2>
                  <p>Your 50 most recently viewed products. The recommendation model uses these to identify similar items.</p>
                </div>
                {authUser?.browsingHistory && authUser.browsingHistory.length > 0 ? (
                  <div className="products-grid">
                    {authUser.browsingHistory.map((item, index) => (
                      item.productId && (
                        <ProductCard key={`${item.productId._id}-${index}`} product={item.productId} />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="empty-history-state glass-panel">
                    <FaHistory size={40} className="empty-icon" />
                    <p>No recently viewed products recorded yet. Explore items on our home catalog page to build your history.</p>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: Purchase History */}
            {activeTab === 'purchases' && (
              <div className="history-list-view animate-fade-in">
                <div className="view-title">
                  <h2>Purchase History</h2>
                  <p>Completed orders. Items purchased here are strongly weighted in personal suggestion profiles.</p>
                </div>
                {authUser?.purchaseHistory && authUser.purchaseHistory.length > 0 ? (
                  <div className="purchase-orders-list">
                    {authUser.purchaseHistory.map((item, index) => (
                      item.productId && (
                        <div key={index} className="purchase-history-card glass-panel">
                          <div className="purchase-img-wrapper">
                            <img 
                              src={item.productId.images?.[0]} 
                              alt={item.productId.name} 
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=100&h=100&fit=crop';
                              }}
                            />
                          </div>
                          <div className="purchase-details-card">
                            <h3>{item.productId.name}</h3>
                            <p className="purchase-card-brand">{item.productId.brand}</p>
                            <span className="purchase-card-date">
                              Ordered on {new Date(item.purchasedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </span>
                          </div>
                          <div className="purchase-card-totals">
                            <p className="purchase-qty-label">Qty: {item.quantity || 1}</p>
                            <p className="purchase-total-price">₹{formatIndianPrice((item.price || item.productId.price) * (item.quantity || 1))}</p>
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                ) : (
                  <div className="empty-history-state glass-panel">
                    <FaShoppingBag size={40} className="empty-icon" />
                    <p>You haven't completed any orders yet. Place items in your cart and complete checkout to view history.</p>
                  </div>
                )}
              </div>
            )}

            {/* Panel 4: Personal Suggestions */}
            {activeTab === 'recommendations' && (
              <div className="history-list-view animate-fade-in">
                <div className="view-title">
                  <h2>Personalized Suggestions</h2>
                  <p>Custom tailored items powered by the AI recommendations processor, matching your categories, brand preferences, and view history.</p>
                </div>
                {authUser?.savedRecommendations && authUser.savedRecommendations.length > 0 ? (
                  <div className="products-grid">
                    {authUser.savedRecommendations.map((item, index) => (
                      item.productId && (
                        <ProductCard key={`${item.productId._id}-${index}`} product={item.productId} />
                      )
                    ))}
                  </div>
                ) : (
                  <div className="empty-history-state glass-panel">
                    <FaHeart size={40} className="empty-icon" />
                    <p>No dynamic recommendation listings calculated yet. Update your Department Preferences or view products to prompt the recommendation engine.</p>
                  </div>
                )}
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;