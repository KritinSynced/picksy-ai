import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaStar, FaShoppingCart, FaHeart, FaArrowLeft, FaCheck, 
  FaBoxOpen, FaShieldAlt, FaTruck, FaSlidersH, FaTags, FaInfoCircle, FaPlus
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Recommendation from '../components/Recommendation';
import './Product.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [fbtProducts, setFbtProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCartState, setAddingToCartState] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Frequently Bought Together Bundle checked states
  const [fbtChecked, setFbtChecked] = useState({});
  const [fbtAddedState, setFbtAddedState] = useState(false);

  // Accordion Toggle
  const [activeTab, setActiveTab] = useState('specs');

  // Magnifier Zoom style
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center' });

  // Review Form state
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchProduct();
    fetchSimilarProducts();
    fetchFbtProducts();
  }, [id]);

  useEffect(() => {
    if (product && user) {
      recordBrowseHistory();
    }
  }, [product, user]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/products/${id}`);
      setProduct(response.data);
      setSelectedImage(0);
    } catch (err) {
      console.error('Failed to load product:', err);
      setError('Failed to load product details. The item may no longer exist.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      const response = await axios.post(`${API_URL}/recommendations/similar`, { productId: id });
      setSimilarProducts(response.data || []);
    } catch (err) {
      console.error('Failed to load similar products:', err);
      setSimilarProducts([]);
    }
  };

  const fetchFbtProducts = async () => {
    try {
      const response = await axios.post(`${API_URL}/recommendations/frequently-bought`, { productId: id });
      const items = response.data || [];
      setFbtProducts(items);
      
      // Select all FBT items by default
      const defaultChecked = {};
      items.forEach(item => {
        defaultChecked[item._id] = true;
      });
      setFbtChecked(defaultChecked);
    } catch (err) {
      console.error('Failed to load FBT products:', err);
      setFbtProducts([]);
    }
  };

  const recordBrowseHistory = async () => {
    try {
      const userId = user ? user._id : 'guest';
      await axios.post(`${API_URL}/users/${userId}/browse`, { productId: id });
    } catch (err) {
      console.error('Failed to write to browsing history:', err);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      setAddingToCartState(true);
      const success = await addToCart(product, 1);
      setAddingToCartState(false);
      
      if (success) {
        setAddedToCart(true);
        setTimeout(() => {
          setAddedToCart(false);
        }, 1500);
      }
    }
  };

  // Add FBT items to cart
  const handleFbtBundleAddToCart = async () => {
    if (!product) return;
    setFbtAddedState(true);
    
    // Add current product
    await addToCart(product, 1);
    
    // Add checked FBT items
    for (const item of fbtProducts) {
      if (fbtChecked[item._id]) {
        await addToCart(item, 1);
      }
    }
    
    setFbtAddedState(false);
    alert('Bundle successfully added to your cart!');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    const reviewerName = isAuthenticated 
      ? (user.fullName || user.username) 
      : (reviewName.trim() || 'Anonymous Customer');

    try {
      setSubmittingReview(true);
      setReviewError('');

      const response = await axios.post(`${API_URL}/products/${id}/reviews`, {
        userId: isAuthenticated ? user._id : null,
        rating: reviewRating,
        comment: reviewComment,
        username: reviewerName
      });

      setProduct(response.data.product);
      setReviewComment('');
      setReviewName('');
      setReviewRating(5);
    } catch (err) {
      console.error('Failed to add review:', err);
      setReviewError('Failed to post review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Hover Zoom Logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center', transform: 'scale(1)' });
  };

  // Calculate review stats
  const getRatingBreakdown = () => {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!product || !product.reviews || product.reviews.length === 0) return breakdown;
    
    product.reviews.forEach(r => {
      const rate = Math.round(r.rating);
      if (breakdown[rate] !== undefined) breakdown[rate]++;
    });

    // Convert to percentages
    const total = product.reviews.length;
    Object.keys(breakdown).forEach(key => {
      breakdown[key] = Math.round((breakdown[key] / total) * 100);
    });

    return breakdown;
  };

  const formatPrice = (p) => {
    if (!p) return '0';
    return new Intl.NumberFormat('en-IN').format(p);
  };

  if (loading) {
    return (
      <div className="container product-page-premium animate-fade-in" style={{ marginTop: '110px' }}>
        <div className="skeleton-grid" style={{ gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
          <div className="skeleton-card skeleton" style={{ height: '450px' }}></div>
          <div className="skeleton-card skeleton" style={{ height: '450px' }}></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-page" style={{ marginTop: '110px' }}>
        <div className="container text-center">
          <div className="error-message glass-panel">{error || 'Product not found'}</div>
          <button onClick={() => navigate('/search')} className="btn-premium">
            <FaArrowLeft /> Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&h=500&fit=crop'];

  // Ratings Stats
  const ratingStats = getRatingBreakdown();
  const totalReviewsCount = product.reviews?.length || 0;

  // Calculate bundle total price
  let bundleTotal = product.price;
  fbtProducts.forEach(item => {
    if (fbtChecked[item._id]) bundleTotal += item.price;
  });

  return (
    <div className="container product-page-premium animate-fade-in" style={{ marginTop: '110px' }}>
      
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="back-link-btn" style={{ marginBottom: '20px' }}>
        <FaArrowLeft /> Back to Catalog
      </button>

      {/* Main product specs split layout */}
      <div className="product-layout-grid">
        
        {/* Gallery column with custom magnifier zoom */}
        <div className="product-media-column">
          <div 
            className="main-preview-box glass-panel"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img 
              src={displayImages[selectedImage]} 
              alt={product.name} 
              className="main-preview-img"
              style={zoomStyle}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500&h=500&fit=crop';
              }}
            />
          </div>
          
          {displayImages.length > 1 && (
            <div className="gallery-thumbnails">
              {displayImages.map((img, index) => (
                <div 
                  key={index} 
                  className={`gallery-thumb-item glass-card ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Details column */}
        <div className="product-details-column">
          <div className="product-meta-header">
            <span className="cat-badge">{product.category.replace('_', ' ')}</span>
            <span className="brand-label">{product.brand}</span>
          </div>

          <h1 className="product-name-title">{product.name}</h1>

          {/* Aggregate Rating */}
          <div className="product-aggregate-rating">
            <div className="stars-row">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index} 
                  className={index < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'} 
                />
              ))}
            </div>
            <span className="rating-text-bold">{(product.rating || 0).toFixed(1)}</span>
            <span className="reviews-count-muted">({totalReviewsCount} customer reviews)</span>
          </div>

          {/* Pricing Box */}
          <div className="product-pricing-card">
            <div className="pricing-row">
              <span className="price-tag">₹{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="old-price-tag">₹{formatPrice(product.oldPrice)}</span>
              )}
            </div>
            <span className="tax-inclusion-label">Inclusive of shipping and all tax calculations</span>
          </div>

          <p className="product-main-description">{product.description}</p>

          {/* Interactive Accordion specifications tabs */}
          <div className="product-accordion-wrapper">
            <div className="accordion-headers">
              <button 
                className={`accordion-btn ${activeTab === 'specs' ? 'active' : ''}`}
                onClick={() => setActiveTab('specs')}
              >
                Specifications
              </button>
              <button 
                className={`accordion-btn ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                Key Features
              </button>
            </div>
            <div className="accordion-content glass-panel">
              {activeTab === 'specs' ? (
                <table className="specs-table">
                  <tbody>
                    <tr>
                      <td>Brand Owner</td>
                      <td>{product.brand}</td>
                    </tr>
                    <tr>
                      <td>Authorized Seller</td>
                      <td>{product.seller || 'Picksy Retail'}</td>
                    </tr>
                    {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ul className="features-list">
                  {product.features?.map((f, i) => <li key={i}>{f}</li>) || <li>High-grade standard materials</li>}
                </ul>
              )}
            </div>
          </div>

          {/* Purchase details */}
          <div className="purchase-controls-box glass-panel">
            <div className="stock-status-wrapper">
              {product.stock > 0 ? (
                <span className="stock-badge in-stock">✓ Stock Active ({product.stock} items remaining)</span>
              ) : (
                <span className="stock-badge out-of-stock">✗ Currently Out of Stock</span>
              )}
            </div>

            <div className="action-buttons-row">
              <button 
                className={`btn-premium add-to-cart-premium-btn ${addedToCart ? 'success-added' : ''} ${addingToCartState ? 'loading' : ''}`}
                onClick={handleAddToCart}
                disabled={addedToCart || addingToCartState || product.stock === 0}
              >
                {addingToCartState ? (
                  <div className="btn-spinner"></div>
                ) : addedToCart ? (
                  <><FaCheck /> <span>Added!</span></>
                ) : (
                  <><FaShoppingCart /> <span>Add to Cart</span></>
                )}
              </button>
              <button 
                className={`wishlist-premium-btn ${isWishlisted ? 'active' : ''}`} 
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Add to wishlist"
              >
                <FaHeart />
              </button>
            </div>
          </div>

          {/* Logistic Trust Factors */}
          <div className="trust-factors-grid">
            <div className="trust-item"><FaTruck /><span>Free Shipping</span></div>
            <div className="trust-item"><FaShieldAlt /><span>Safe Transactions</span></div>
            <div className="trust-item"><FaBoxOpen /><span>7-Day Return policy</span></div>
          </div>

        </div>
      </div>

      {/* Frequently Bought Together COMBO BUNDLE BUILDER */}
      {fbtProducts.length > 0 && (
        <div className="fbt-combo-container glass-panel animate-fade-in" style={{ marginTop: '50px' }}>
          <h3>Frequently Bought Together Combo Deal</h3>
          <p className="fbt-subtitle">Purchase these matching items together and optimize your checkout experience.</p>
          
          <div className="fbt-flex-row">
            
            {/* Products Combo chain */}
            <div className="fbt-combo-chain">
              <div className="fbt-chain-item">
                <img src={displayImages[0]} alt="" className="fbt-thumb" />
                <div className="fbt-item-info">
                  <strong>This Item</strong>
                  <span>₹{formatPrice(product.price)}</span>
                </div>
              </div>

              {fbtProducts.map(item => (
                <React.Fragment key={item._id}>
                  <div className="fbt-chain-plus"><FaPlus /></div>
                  <div className={`fbt-chain-item ${fbtChecked[item._id] ? '' : 'unchecked'}`}>
                    <input 
                      type="checkbox" 
                      checked={!!fbtChecked[item._id]}
                      onChange={(e) => setFbtChecked({
                        ...fbtChecked,
                        [item._id]: e.target.checked
                      })}
                      id={`fbt-chk-${item._id}`}
                    />
                    <label htmlFor={`fbt-chk-${item._id}`} className="fbt-thumb-wrap">
                      <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt="" className="fbt-thumb" />
                    </label>
                    <div className="fbt-item-info">
                      <Link to={`/product/${item._id}`} className="fbt-item-link">{item.name}</Link>
                      <span>₹{formatPrice(item.price)}</span>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Total price box & CTA */}
            <div className="fbt-combo-action-card glass-card">
              <div className="fbt-total-price-row">
                <span>Total Price:</span>
                <strong>₹{formatPrice(bundleTotal)}</strong>
              </div>
              <button 
                onClick={handleFbtBundleAddToCart}
                disabled={fbtAddedState}
                className="btn-premium"
                style={{ width: '100%', marginTop: '14px' }}
              >
                {fbtAddedState ? <div className="btn-spinner"></div> : 'Add Bundle to Cart'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Reviews rating bars and review list */}
      <section className="reviews-section-panel glass-panel" style={{ marginTop: '50px' }}>
        <div className="reviews-panel-header">
          <h2>Customer Reviews & Breakdown</h2>
          <span className="title-decorator"></span>
        </div>

        <div className="reviews-section-layout">
          
          {/* Reviews Rating Breakdown Bars */}
          <div className="reviews-breakdown-card glass-card">
            <h3>Rating Summary</h3>
            <div className="breakdown-aggregate-score">
              <h2>{(product.rating || 0).toFixed(1)}</h2>
              <div className="stars-row">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.rating || 0) ? 'star-filled' : 'star-empty'} />
                ))}
              </div>
              <span>{totalReviewsCount} Ratings</span>
            </div>
            
            <div className="rating-progress-bar-list">
              {[5, 4, 3, 2, 1].map(stars => (
                <div key={stars} className="rating-progress-row">
                  <span className="row-star-label">{stars} Star</span>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${ratingStats[stars] || 0}%` }}></div>
                  </div>
                  <span className="row-star-percent">{ratingStats[stars] || 0}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* List of comments */}
          <div className="reviews-list-block">
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev, index) => (
                <div key={index} className="review-comment-card glass-card">
                  <div className="review-card-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {rev.username ? rev.username[0].toUpperCase() : 'C'}
                      </div>
                      <div>
                        <h4>{rev.username || 'Verified Customer'}</h4>
                        <span className="review-date">
                          {new Date(rev.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="reviewer-rating">
                      {[...Array(5)].map((_, i) => (
                        <FaStar 
                          key={i} 
                          className={i < rev.rating ? 'star-filled' : 'star-empty'} 
                        />
                      ))}
                    </div>
                  </div>
                  <p className="review-comment-text">{rev.comment}</p>
                </div>
              ))
            ) : (
              <div className="empty-reviews-state">
                <FaInfoCircle className="info-icon" style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }} />
                <p>No user reviews written for this product yet. Share your shopping experience below!</p>
              </div>
            )}

            {/* Write a review form */}
            <div className="write-review-form-block glass-card" style={{ marginTop: '24px' }}>
              <h3>Write a Customer Review</h3>
              {reviewError && <div className="error-message">{reviewError}</div>}
              
              <form onSubmit={handleReviewSubmit} className="review-form">
                {!isAuthenticated && (
                  <div className="form-group">
                    <label htmlFor="reviewer-name">Your Full Name</label>
                    <input 
                      type="text" 
                      id="reviewer-name"
                      placeholder="Enter your name"
                      value={reviewName}
                      onChange={(e) => setReviewName(e.target.value)}
                      required
                    />
                  </div>
                )}
                
                <div className="form-group">
                  <label>Overall Rating</label>
                  <div className="interactive-stars-row">
                    {[...Array(5)].map((_, i) => {
                      const starVal = i + 1;
                      return (
                        <button
                          type="button"
                          key={i}
                          className="star-trigger-btn"
                          onClick={() => setReviewRating(starVal)}
                          onMouseEnter={() => setReviewHoverRating(starVal)}
                          onMouseLeave={() => setReviewHoverRating(0)}
                        >
                          <FaStar className={starVal <= (reviewHoverRating || reviewRating) ? 'star-filled' : 'star-empty'} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Review Description</label>
                  <textarea 
                    id="review-comment"
                    rows="3"
                    placeholder="Provide details about specs quality, build quality, and delivery speed..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-premium"
                  disabled={submittingReview}
                >
                  {submittingReview ? <div className="btn-spinner"></div> : 'Submit Review'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>

      {/* Similar products catalog scroll carousel */}
      {similarProducts.length > 0 && (
        <Recommendation 
          title="Similar Products You May Like" 
          products={similarProducts}
          loading={false}
        />
      )}

    </div>
  );
};

export default Product;