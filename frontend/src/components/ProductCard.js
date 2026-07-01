import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaCheck } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { _id, name, price, oldPrice, images, rating, category, brand } = product;
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Format price with Indian numbering system
  const formatIndianPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const handleAddToCart = async (e) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation(); // Stop event bubbling
    
    setLoading(true);
    const success = await addToCart(product, 1);
    setLoading(false);
    
    if (success) {
      setIsAdded(true);
      
      // Show feedback for 1.5 seconds
      setTimeout(() => {
        setIsAdded(false);
      }, 1500);
    }
  };

  // Safe rating value
  const safeRating = rating || 0;
  const displayImage = images && images.length > 0 
    ? images[0] 
    : 'https://via.placeholder.com/300x200?text=No+Image';

  // Calculate discount percentage if oldPrice exists
  const discountPercent = oldPrice 
    ? Math.round(((oldPrice - price) / oldPrice) * 100) 
    : null;

  return (
    <div className="product-card glass-card">
      <Link to={`/product/${_id}`} className="product-link">
        <div className="product-image-container">
          <img 
            src={displayImage} 
            alt={name || 'Product'} 
            className="product-card-img"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=300&h=200&fit=crop';
            }}
          />
          {category && <span className="product-badge">{category}</span>}
          {discountPercent > 0 && <span className="discount-badge">-{discountPercent}%</span>}
        </div>
        
        <div className="product-card-info">
          {brand && <p className="product-card-brand">{brand}</p>}
          <h3 className="product-card-name">{name || 'Unnamed Product'}</h3>
          
          <div className="product-card-rating">
            <div className="stars-row">
              {[...Array(5)].map((_, index) => (
                <FaStar 
                  key={index} 
                  className={index < Math.floor(safeRating) ? 'star-filled' : 'star-empty'} 
                />
              ))}
            </div>
            <span className="rating-val">{safeRating.toFixed(1)}</span>
          </div>
          
          <div className="product-card-pricing">
            <span className="price-val">₹{formatIndianPrice(price)}</span>
            {oldPrice && (
              <span className="price-old-val">₹{formatIndianPrice(oldPrice)}</span>
            )}
          </div>
        </div>
      </Link>
      
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