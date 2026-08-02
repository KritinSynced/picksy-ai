import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaLaptop, FaMobileAlt, FaHeadphones, FaTshirt, FaHome, FaRunning, 
  FaClock, FaArrowRight, FaStore, FaShieldAlt, FaTruck, FaAward, FaStar
} from 'react-icons/fa';
import Recommendation from '../components/Recommendation';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Home = () => {
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [historyBased, setHistoryBased] = useState([]);
  
  const [loading, setLoading] = useState({
    recommendations: true,
    trending: true,
    bestSellers: true,
    newArrivals: true,
    historyBased: true
  });

  const { user } = useAuth();
  const navigate = useNavigate();

  // Flash Sale Timer State
  const [timeLeft, setTimeLeft] = useState(14400); // 4 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 14400));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Fetch all categories carousels on mount and when user persona changes
  useEffect(() => {
    const userId = user ? user._id : 'guest';

    const fetchRecommendations = async () => {
      try {
        setLoading(prev => ({ ...prev, recommendations: true }));
        const response = await axios.get(`${API_URL}/recommendations/user/${userId}`);
        setRecommendedProducts(response.data || []);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(prev => ({ ...prev, recommendations: false }));
      }
    };

    const fetchTrending = async () => {
      try {
        setLoading(prev => ({ ...prev, trending: true }));
        const response = await axios.get(`${API_URL}/recommendations/trending`);
        setTrendingProducts(response.data || []);
      } catch (err) {
        console.error('Failed to load trending products:', err);
      } finally {
        setLoading(prev => ({ ...prev, trending: false }));
      }
    };

    const fetchBestSellers = async () => {
      try {
        setLoading(prev => ({ ...prev, bestSellers: true }));
        const response = await axios.get(`${API_URL}/products?sortBy=rating&limit=8`);
        setBestSellers(response.data?.products || response.data || []);
      } catch (err) {
        console.error('Failed to load best sellers:', err);
      } finally {
        setLoading(prev => ({ ...prev, bestSellers: false }));
      }
    };

    const fetchNewArrivals = async () => {
      try {
        setLoading(prev => ({ ...prev, newArrivals: true }));
        const response = await axios.get(`${API_URL}/products?sortBy=newest&limit=8`);
        setNewArrivals(response.data?.products || response.data || []);
      } catch (err) {
        console.error('Failed to load new arrivals:', err);
      } finally {
        setLoading(prev => ({ ...prev, newArrivals: false }));
      }
    };

    const fetchHistoryBased = async () => {
      try {
        setLoading(prev => ({ ...prev, historyBased: true }));
        const response = await axios.get(`${API_URL}/recommendations/history-based/${userId}`);
        setHistoryBased(response.data || []);
      } catch (err) {
        console.error('Failed to load history based recommendations:', err);
      } finally {
        setLoading(prev => ({ ...prev, historyBased: false }));
      }
    };

    fetchRecommendations();
    fetchTrending();
    fetchBestSellers();
    fetchNewArrivals();
    fetchHistoryBased();
  }, [user]);

  const featuredCategories = [
    { name: 'Laptops', key: 'laptops', icon: <FaLaptop /> },
    { name: 'Smartphones', key: 'smartphones', icon: <FaMobileAlt /> },
    { name: 'Audio Gear', key: 'headphones', icon: <FaHeadphones /> },
    { name: 'Apparel', key: 'clothing', icon: <FaTshirt /> },
    { name: 'Sports Gear', key: 'sports', icon: <FaRunning /> },
    { name: 'Home Accents', key: 'furniture', icon: <FaHome /> }
  ];

  return (
    <div className="home-page animate-fade-in">
      {/* Modern Mesh Hero Banner */}
      <div className="hero-banner-premium">
        <video 
          className="hero-video-bg" 
          autoPlay 
          loop 
          muted 
          playsInline
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-network-connection-lines-and-dots-loop-40439-large.mp4" type="video/mp4" />
        </video>
        <div className="hero-video-overlay"></div>
        <div className="hero-glow-1"></div>
        <div className="hero-glow-2"></div>
        <div className="container hero-container">
          <div className="hero-text-content">
            <span className="hero-badge">AI-Powered Personalized E-Commerce</span>
            <h1>Catering E-Commerce to Your Preferences</h1>
            <p>
              Picksy leverages 8-dimensional latent preference vectors and content tag models to tailor our catalog. Toggle simulated recruiter personas in the Navbar to see recommendations update in real time.
            </p>
            <div className="hero-ctas">
              <Link to="/search" className="btn-premium">
                Explore Catalog <FaArrowRight />
              </Link>
              <a href="#featured-categories" className="btn-premium-outline">
                Browse Categories
              </a>
            </div>
          </div>
          <div className="hero-graphic">
            <div className="glass-showcase-panel">
              <div className="glass-showcase-header">
                <span className="bullet red"></span>
                <span className="bullet yellow"></span>
                <span className="bullet green"></span>
              </div>
              <div className="glass-showcase-body">
                <h4 className="pref-tag">Model Matrix Accuracy</h4>
                <div className="mock-rec-card">
                  <div className="mock-img"></div>
                  <div className="mock-lines">
                    <div className="line-h"></div>
                    <div className="line-s"></div>
                  </div>
                </div>
                <div className="mock-metrics">
                  <div className="metric">
                    <h5>98.4%</h5>
                    <p>Match Score</p>
                  </div>
                  <div className="metric">
                    <h5>12.4%</h5>
                    <p>Collaborative CTR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Value Grid */}
      <section className="container value-propositions-section">
        <div className="value-grid">
          <div className="value-card glass-panel">
            <FaAward className="val-icon" />
            <h3>Curated Premium Quality</h3>
            <p>100k+ handpicked e-commerce items verified by Picksy Quality Assurance.</p>
          </div>
          <div className="value-card glass-panel">
            <FaTruck className="val-icon" />
            <h3>Hyper-Fast Shipping</h3>
            <p>Enjoy free 2-day delivery across 15 major logistical hubs nationwide.</p>
          </div>
          <div className="value-card glass-panel">
            <FaShieldAlt className="val-icon" />
            <h3>Safe & Secure Checkout</h3>
            <p>Top-tier encrypted transactions backed by secure Clerk authentication.</p>
          </div>
        </div>
      </section>

      {/* Featured Categories Panel */}
      <section className="container category-section" id="featured-categories">
        <div className="section-head">
          <h2>Shop by Category</h2>
          <span className="title-decorator"></span>
        </div>
        <div className="category-grid-layouts">
          {featuredCategories.map(cat => (
            <div 
              key={cat.key}
              className="category-badge-card glass-panel"
              onClick={() => navigate(`/search?category=${encodeURIComponent(cat.key)}`)}
            >
              <div className="cat-icon-container">{cat.icon}</div>
              <h3>{cat.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* Personal AI recommendations section */}
      <section className="container recommendations-wrapper">
        <Recommendation 
          title={user ? `Tailored Recommendations for ${user.fullName.split(' ')[0]}` : "Personalized Recommendations"}
          products={recommendedProducts}
          loading={loading.recommendations}
        />
      </section>

      {/* Flash Sale Banner with countdown clock */}
      <section className="container flash-sale-wrapper">
        <div className="flash-sale-card glass-panel">
          <div className="flash-sale-left">
            <span className="sale-badge">Limited Time Offer</span>
            <h2>Mid-Summer Flash Sale</h2>
            <p>Up to 50% discount on best-selling smart electronics, gaming gear, and athletic footwear.</p>
            <div className="countdown-timer-box">
              <FaClock className="clock-icon" />
              <span>Ending In: <strong className="timer-text">{formatTimer(timeLeft)}</strong></span>
            </div>
            <Link to="/search?discount=true" className="btn-premium sale-cta">
              View Flash Deals
            </Link>
          </div>
          <div className="flash-sale-right">
            <div className="glow-circle"></div>
            <div className="sale-percent-bubble">
              <h3>50%</h3>
              <p>OFF</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products scroll section */}
      <section className="container recommendations-wrapper">
        <Recommendation 
          title="Trending Products"
          products={trendingProducts}
          loading={loading.trending}
        />
      </section>

      {/* Best Sellers & New Arrivals */}
      <section className="container recommendations-wrapper">
        <Recommendation 
          title="Best Sellers"
          products={bestSellers}
          loading={loading.bestSellers}
        />
      </section>

      {/* History-based recommendations (recently viewed) */}
      {historyBased.length > 0 && (
        <section className="container recommendations-wrapper">
          <Recommendation 
            title="Inspired by Your Browsing"
            products={historyBased}
            loading={loading.historyBased}
          />
        </section>
      )}

      <section className="container recommendations-wrapper">
        <Recommendation 
          title="New Arrivals"
          products={newArrivals}
          loading={loading.newArrivals}
        />
      </section>

      {/* Customer Testimonials Grid */}
      <section className="container testimonials-section">
        <div className="section-head text-center">
          <h2>What Our Customers Say</h2>
          <span className="title-decorator"></span>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card glass-panel">
            <div className="stars">
              <FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" />
            </div>
            <p>"The AI recommendations on this site are scary accurate. I switched the persona to tech enthusiast and it showed me exactly the gaming keyboard I was looking for!"</p>
            <div className="customer-info">
              <strong>Preeti Sharma</strong>
              <span>Verified Buyer • Pune, MH</span>
            </div>
          </div>
          <div className="testimonial-card glass-panel">
            <div className="stars">
              <FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" /><FaStar className="star" />
            </div>
            <p>"Stunning design, glassmorphic filters, and fast response times. It feels like shopping on Apple or Stripe. Plus, Clerk auth sign-in works seamlessly."</p>
            <div className="customer-info">
              <strong>Amit Verma</strong>
              <span>Verified Buyer • Bangalore, KA</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup Form */}
      <section className="container newsletter-section">
        <div className="newsletter-card glass-panel text-center">
          <h2>Join the Picksy Club</h2>
          <p>Subscribe to receive customized recommendations, flash sale notifications, and new arrival alerts.</p>
          <form onSubmit={(e) => { e.preventDefault(); alert('Subscribed successfully!'); }} className="newsletter-form">
            <input type="email" placeholder="Enter your email address" required />
            <button type="submit" className="btn-premium">Subscribe</button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-panel">
        <div className="container footer-content-wrapper">
          <div className="footer-brand-column">
            <Link to="/" className="navbar-logo">
              <span className="logo-text">Picksy</span>
              <span className="logo-ai">AI</span>
            </Link>
            <p>The next-generation AI e-commerce recommendation system powered by latent embeddings and real-time collaborative matching.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-links-col">
              <h4>Browse</h4>
              <Link to="/search">Explore All</Link>
              <Link to="/search?category=electronics">Electronics</Link>
              <Link to="/search?category=fashion">Fashion</Link>
              <Link to="/search?category=furniture">Furniture</Link>
            </div>
            <div className="footer-links-col">
              <h4>System</h4>
              <Link to="/dashboard">Admin Analytics</Link>
              <Link to="/">ML Model Specs</Link>
              <Link to="/profile/guest">Simulations</Link>
            </div>
          </div>
        </div>
        <div className="footer-credits text-center">
          <p>© {new Date().getFullYear()} Picksy AI Inc. Crafted with pure CSS & React. Built for Portfolio Showcase.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;