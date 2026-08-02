import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaCheck, FaHeart, FaRegHeart, FaBrain } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { 
    _id, name, price, oldPrice, images, rating, category, brand, 
    matchScore, recommendationReason, reviewsCount 
  } = product;
  const { addToCart } = useCart();
  
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const formatPrice = (p) => {
    if (!p) return '0';
    return new Intl.NumberFormat('en-IN').format(p);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setLoading(true);
    const success = await addToCart(product, 1);
    setLoading(false);
    
    if (success) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1500);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const safeRating = rating || 0;
  const displayImage = images && images.length > 0 
    ? images[0] 
    : 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&h=200&fit=crop';

  const discountPercent = oldPrice 
    ? Math.round(((oldPrice - price) / oldPrice) * 100) 
    : null;

  return (
    <div className="product-card glass-card">
      <Link to={`/product/${_id}`} className="product-link">
        <div className="product-image-container">
          {/* Main Product Image */}
          <img 
            src={displayImage} 
            alt={name || 'Product'} 
            className="product-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&h=200&fit=crop';
            }}
          />
          
          {/* Category Badge */}
          {category && <span className="product-badge">{category.replace('_', ' ')}</span>}
          
          {/* Discount Badge */}
          {discountPercent > 0 && <span className="discount-badge">-{discountPercent}%</span>}

          {/* AI Recommendation Match Tag */}
          {matchScore && (
            <div className="ai-match-tag">
              <FaBrain className="brain-icon" />
              <span>{matchScore}% Match</span>
            </div>
          )}

          {/* Wishlist Heart Icon Toggle */}
          <button 
            className={`wishlist-toggle-btn ${isWishlisted ? 'active' : ''}`}
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? <FaHeart className="heart-filled" /> : <FaRegHeart />}
          </button>
        </div>
        
        <div className="product-card-info">
          {brand && <p className="product-card-brand">{brand}</p>}
          <h3 className="product-card-name" title={name}>{name || 'Unnamed Product'}</h3>
          
          {/* AI Recommendation Reason */}
          {recommendationReason && (
            <div className="ai-reason-text">
              <span>{recommendationReason}</span>
            </div>
          )}

          <div className="product-card-rating">
            <div className="stars-row">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index} 
                  className={index < Math.floor(safeRating) ? 'star-filled' : 'star-empty'} 
                />
              ))}
            </div>
            <span className="rating-val">
              {safeRating.toFixed(1)}
              {reviewsCount !== undefined && ` (${reviewsCount})`}
            </span>
          </div>
          
          <div className="product-card-pricing">
            <span className="price-val">₹{formatPrice(price)}</span>
            {oldPrice && (
              <span className="price-old-val">₹{formatPrice(oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      
      {/* Quick Add Button */}
      <button 
        className={`add-to-cart-btn ${isAdded ? 'added' : ''} ${loading ? 'loading' : ''}`} 
        onClick={handleAddToCart}
        disabled={isAdded || loading}
        aria-label="Add product to cart"
      >
        {loading ? (
          <div className="btn-spinner"></div>
        ) : isAdded ? (
          <>
            <FaCheck className="icon-check" />
            <span>Added!</span>
          </>
        ) : (
          <>
            <FaShoppingCart className="icon-cart" />
            <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
};

export default ProductCard;