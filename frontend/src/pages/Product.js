import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaStar, FaShoppingCart, FaHeart, FaArrowLeft, FaCheck, FaBoxOpen, FaShieldAlt, FaTruck } from 'react-icons/fa';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCartState, setAddingToCartState] = useState(false);

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
  }, [id]);

  // Record browsing history when user views product
  useEffect(() => {
    if (product && user && user._id !== 'guest') {
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

  const recordBrowseHistory = async () => {
    try {
      await axios.post(`${API_URL}/users/${user._id}/browse`, { productId: id });
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

      // Post review
      const response = await axios.post(`${API_URL}/products/${id}/reviews`, {
        userId: isAuthenticated ? user._id : null,
        rating: reviewRating,
        comment: reviewComment,
        username: reviewerName // For rendering fallback
      });

      // Update local state with updated product data
      setProduct(response.data.product);
      
      // Clear inputs
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

  const formatIndianPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('en-IN').format(price);
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-page">
        <div className="container">
          <div className="error-message">{error || 'Product not found'}</div>
          <button onClick={() => navigate('/')} className="btn-premium">
            <FaArrowLeft /> Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  const displayImages = product.images && product.images.length > 0 
    ? product.images 
    : ['https://via.placeholder.com/500x500?text=No+Image'];

  return (
    <div className="product-page-premium animate-fade-in">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-link-btn">
          <FaArrowLeft /> Back
        </button>

        <div className="product-layout-grid">
          {/* Left Column: Image Gallery */}
          <div className="product-media-column">
            <div className="main-preview-box glass-panel">
              <img 
                src={displayImages[selectedImage]} 
                alt={product.name || 'Product'} 
                className="main-preview-img"
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
                    <img 
                      src={img} 
                      alt={`Product thumb ${index + 1}`}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Error';
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs and Details */}
          <div className="product-details-column">
            <div className="product-meta-header">
              {product.category && <span className="cat-badge">{product.category}</span>}
              {product.brand && <span className="brand-label">{product.brand}</span>}
            </div>

            <h1 className="product-name-title">{product.name}</h1>

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
              <span className="reviews-count-muted">({product.reviews?.length || 0} customer reviews)</span>
            </div>

            <div className="product-pricing-card">
              <div className="pricing-row">
                <span className="price-tag">₹{formatIndianPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="old-price-tag">₹{formatIndianPrice(product.oldPrice)}</span>
                )}
              </div>
              <span className="tax-inclusion-label">Inclusive of all taxes</span>
            </div>

            <p className="product-main-description">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <div className="product-features-panel">
                <h3>Technical Details</h3>
                <ul className="features-list">
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Product Purchase Actions */}
            <div className="purchase-controls-box">
              <div className="stock-status-wrapper">
                {product.stock > 0 ? (
                  <span className="stock-badge in-stock">✓ In Stock ({product.stock} available)</span>
                ) : (
                  <span className="stock-badge out-of-stock">✗ Out of Stock</span>
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
                    <><FaCheck /> <span>Added to Cart!</span></>
                  ) : (
                    <><FaShoppingCart /> <span>Add to Cart</span></>
                  )}
                </button>
                <button className="wishlist-premium-btn" aria-label="Add to wishlist">
                  <FaHeart />
                </button>
              </div>
            </div>

            {/* Trust and Delivery Info */}
            <div className="trust-factors-grid">
              <div className="trust-item">
                <FaTruck />
                <div>
                  <h4>Free Delivery</h4>
                  <p>Orders above ₹500</p>
                </div>
              </div>
              <div className="trust-item">
                <FaShieldAlt />
                <div>
                  <h4>Secure Payment</h4>
                  <p>100% Secure Checkout</p>
                </div>
              </div>
              <div className="trust-item">
                <FaBoxOpen />
                <div>
                  <h4>Easy Returns</h4>
                  <p>7 Days No-Questions Policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="reviews-section-panel glass-panel">
          <div className="reviews-panel-header">
            <h2>Customer Reviews</h2>
            <span className="title-decorator"></span>
          </div>

          <div className="reviews-section-layout">
            
            {/* Reviews display list */}
            <div className="reviews-list-block">
              {product.reviews && product.reviews.length > 0 ? (
                product.reviews.map((rev, index) => (
                  <div key={index} className="review-comment-card">
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
                  <p>No reviews have been written for this product yet. Share your experience!</p>
                </div>
              )}
            </div>

            {/* Review form block */}
            <div className="write-review-form-block glass-card">
              <h3>Submit a Review</h3>
              
              {reviewError && <div className="error-message">{reviewError}</div>}

              <form onSubmit={handleReviewSubmit} className="review-form">
                {!isAuthenticated && (
                  <div className="form-group">
                    <label htmlFor="reviewer-name">Your Name</label>
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
                  <label>Your Rating</label>
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
                          aria-label={`Rate ${starVal} stars`}
                        >
                          <FaStar 
                            className={
                              starVal <= (reviewHoverRating || reviewRating) 
                                ? 'star-filled' 
                                : 'star-empty'
                            } 
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Your Comments</label>
                  <textarea 
                    id="review-comment"
                    rows="4" 
                    placeholder="Write details about the product's quality, fit, and delivery..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn-premium submit-review-btn"
                  disabled={submittingReview}
                >
                  {submittingReview ? <div className="btn-spinner"></div> : 'Post Review'}
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Similar Items Carousel */}
        {similarProducts.length > 0 && (
          <Recommendation 
            title="You Might Also Like" 
            products={similarProducts}
            loading={false}
          />
        )}
      </div>
    </div>
  );
};

export default Product;