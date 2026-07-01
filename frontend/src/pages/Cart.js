import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaTrash, FaShoppingBag, FaArrowLeft, FaPlus, FaMinus, FaCreditCard, FaLock, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, isAuthenticated, refreshUser } = useAuth();

  // Checkout modal state
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [submittingCheckout, setSubmittingCheckout] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [checkoutError, setCheckoutError] = useState('');

  // Shipping Form
  const [shippingForm, setShippingForm] = useState({
    fullName: user?.fullName || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  // Payment Form
  const [paymentForm, setPaymentForm] = useState({
    method: 'card', // 'card' or 'upi'
    cardNumber: '',
    expiry: '',
    cvv: '',
    upiId: ''
  });

  const formatIndianPrice = (price) => {
    if (!price) return '0';
    return new Intl.NumberFormat('en-IN').format(price);
  };

  const calculateShipping = () => {
    return cartTotal > 500 ? 0 : 49;
  };

  const calculateFinalTotal = () => {
    return cartTotal + calculateShipping();
  };

  const handleShippingChange = (e) => {
    setShippingForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePaymentChange = (e) => {
    setPaymentForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Validate Shipping form details
  const handleProceedToPayment = (e) => {
    e.preventDefault();
    const { fullName, address, city, state, zipCode, phone } = shippingForm;
    if (!fullName || !address || !city || !state || !zipCode || !phone) {
      setCheckoutError('Please populate all shipping fields.');
      return;
    }
    if (phone.length < 10) {
      setCheckoutError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setCheckoutError('');
    setCheckoutStep(2);
  };

  // Complete checkout process
  const handleCompleteOrder = async (e) => {
    e.preventDefault();
    if (paymentForm.method === 'card') {
      const { cardNumber, expiry, cvv } = paymentForm;
      if (!cardNumber || !expiry || !cvv) {
        setCheckoutError('Please populate all card payment details.');
        return;
      }
    } else {
      if (!paymentForm.upiId) {
        setCheckoutError('Please enter your UPI ID.');
        return;
      }
    }

    setCheckoutError('');
    setSubmittingCheckout(true);

    // Simulate network delay
    setTimeout(async () => {
      try {
        const simulatedOrderNum = `PK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        
        if (isAuthenticated && user._id !== 'guest') {
          // Structure items for order API
          const itemsPayload = cartItems.map(item => ({
            productId: item._id,
            price: item.price,
            quantity: item.quantity || 1
          }));

          // Send purchase history record to backend
          await axios.post(`${API_URL}/users/${user._id}/purchase`, {
            items: itemsPayload
          });

          // Sync auth state (reloads purchases and updates recommendations)
          await refreshUser();
        }

        // Clear cart globally
        await clearCart();
        
        setOrderNumber(simulatedOrderNum);
        setCheckoutStep(3);
      } catch (err) {
        console.error('Checkout failed:', err);
        setCheckoutError('Failed to record transaction. Please try again.');
      } finally {
        setSubmittingCheckout(false);
      }
    }, 1500);
  };

  const handleCloseCheckout = () => {
    setShowCheckoutModal(false);
    setCheckoutStep(1);
    setCheckoutError('');
    if (checkoutStep === 3) {
      navigate('/');
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="cart-page-premium">
        <div className="container">
          <div className="empty-cart-view glass-panel animate-scale-up">
            <FaShoppingBag className="empty-cart-icon" />
            <h2>Your Shopping Cart is Empty</h2>
            <p>We have loaded the latest releases and recommendations for you. Explore our home catalog to add items.</p>
            <Link to="/" className="btn-premium">
              <FaArrowLeft /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-premium animate-fade-in">
      <div className="container">
        <h1 className="cart-page-title">Shopping Cart <span>({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span></h1>
        
        <div className="cart-layout-grid">
          {/* Cart Items list */}
          <div className="cart-items-panel">
            {cartItems.map((item) => (
              <div key={item._id} className="cart-item-row glass-card">
                <div className="cart-item-image">
                  <img 
                    src={item.images?.[0] || 'https://via.placeholder.com/120x120?text=Product'} 
                    alt={item.name || 'Product'} 
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=120&h=120&fit=crop';
                    }}
                  />
                </div>
                
                <div className="cart-item-info">
                  <Link to={`/product/${item._id}`} className="cart-item-name-link">
                    {item.name || 'Unnamed Product'}
                  </Link>
                  <p className="cart-item-brand">{item.brand || 'Premium Brand'}</p>
                  <p className="cart-item-unit-price">₹{formatIndianPrice(item.price)}</p>
                </div>
                
                <div className="cart-item-quantity-controls">
                  <button 
                    className="qty-btn-circle"
                    onClick={() => updateQuantity(item._id, (item.quantity || 1) - 1)}
                    aria-label="Reduce quantity"
                  >
                    <FaMinus />
                  </button>
                  <span className="qty-count-label">{item.quantity || 1}</span>
                  <button 
                    className="qty-btn-circle"
                    onClick={() => updateQuantity(item._id, (item.quantity || 1) + 1)}
                    aria-label="Increase quantity"
                  >
                    <FaPlus />
                  </button>
                </div>
                
                <div className="cart-item-subtotal-price">
                  <p>₹{formatIndianPrice((item.price || 0) * (item.quantity || 1))}</p>
                </div>
                
                <button 
                  className="cart-remove-item-btn"
                  onClick={() => removeFromCart(item._id)}
                  aria-label="Delete item from cart"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
            
            <div className="cart-left-footer">
              <Link to="/" className="back-shopping-link">
                <FaArrowLeft /> Back to Catalog
              </Link>
              <button className="clear-cart-text-btn" onClick={clearCart}>
                Clear Cart
              </button>
            </div>
          </div>
          
          {/* Order Summary box */}
          <div className="cart-summary-panel">
            <div className="summary-sticky-card glass-panel">
              <h3>Order Summary</h3>
              
              <div className="summary-pricing-rows">
                <div className="summary-pricing-row">
                  <span>Cart Subtotal</span>
                  <span>₹{formatIndianPrice(cartTotal)}</span>
                </div>
                
                <div className="summary-pricing-row">
                  <span>Shipping Fee</span>
                  <span>{calculateShipping() === 0 ? 'FREE' : `₹${formatIndianPrice(calculateShipping())}`}</span>
                </div>
                
                {calculateShipping() > 0 && (
                  <div className="free-shipping-helper-note">
                    Add <strong>₹{formatIndianPrice(500 - cartTotal)}</strong> more to unlock <strong>FREE SHIPPING</strong>.
                  </div>
                )}
              </div>
              
              <hr className="summary-pricing-divider" />
              
              <div className="summary-total-row">
                <span>Total Amount</span>
                <span className="total-amount-val">₹{formatIndianPrice(calculateFinalTotal())}</span>
              </div>
              
              <button className="btn-premium checkout-action-btn" onClick={() => setShowCheckoutModal(true)}>
                Secure Checkout
              </button>
              
              <span className="secure-badge">
                <FaLock /> 256-bit SSL encrypted connection
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-step Checkout Modal overlay */}
      {showCheckoutModal && (
        <div className="checkout-modal-overlay">
          <div className="checkout-modal-box glass-panel animate-scale-up">
            
            {/* Modal Header */}
            <div className="checkout-modal-header">
              <h2>Secure Checkout</h2>
              {checkoutStep < 3 && (
                <button className="close-checkout-modal-btn" onClick={handleCloseCheckout} aria-label="Close Checkout">
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Modal Steps Indicator */}
            {checkoutStep < 3 && (
              <div className="checkout-steps-bar">
                <div className={`step-dot ${checkoutStep >= 1 ? 'active' : ''}`}>
                  <span className="dot-num">1</span>
                  <span className="dot-label">Shipping</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step-dot ${checkoutStep >= 2 ? 'active' : ''}`}>
                  <span className="dot-num">2</span>
                  <span className="dot-label">Payment</span>
                </div>
              </div>
            )}

            {checkoutError && <div className="error-message">{checkoutError}</div>}

            {/* Modal Step 1: Shipping Details */}
            {checkoutStep === 1 && (
              <form onSubmit={handleProceedToPayment} className="checkout-modal-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name</label>
                  <input 
                    type="text" 
                    id="fullName"
                    name="fullName"
                    placeholder="Enter your full name"
                    value={shippingForm.fullName}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Street Address</label>
                  <input 
                    type="text" 
                    id="address"
                    name="address"
                    placeholder="Flat/House no, Street area"
                    value={shippingForm.address}
                    onChange={handleShippingChange}
                    required
                  />
                </div>
                <div className="form-grid-two">
                  <div className="form-group">
                    <label htmlFor="city">City</label>
                    <input 
                      type="text" 
                      id="city"
                      name="city"
                      placeholder="Mumbai"
                      value={shippingForm.city}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="state">State</label>
                    <input 
                      type="text" 
                      id="state"
                      name="state"
                      placeholder="Maharashtra"
                      value={shippingForm.state}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-grid-two">
                  <div className="form-group">
                    <label htmlFor="zipCode">ZIP Code</label>
                    <input 
                      type="text" 
                      id="zipCode"
                      name="zipCode"
                      placeholder="400001"
                      value={shippingForm.zipCode}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Mobile Number</label>
                    <input 
                      type="tel" 
                      id="phone"
                      name="phone"
                      placeholder="9876543210"
                      value={shippingForm.phone}
                      onChange={handleShippingChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="modal-actions-row">
                  <button type="button" className="btn-premium-outline" onClick={handleCloseCheckout}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-premium">
                    Proceed to Payment
                  </button>
                </div>
              </form>
            )}

            {/* Modal Step 2: Payment Details */}
            {checkoutStep === 2 && (
              <form onSubmit={handleCompleteOrder} className="checkout-modal-form">
                <div className="payment-method-selector-tabs">
                  <button 
                    type="button"
                    className={`method-tab-btn ${paymentForm.method === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentForm(prev => ({ ...prev, method: 'card' }))}
                  >
                    <FaCreditCard /> Credit/Debit Card
                  </button>
                  <button 
                    type="button"
                    className={`method-tab-btn ${paymentForm.method === 'upi' ? 'active' : ''}`}
                    onClick={() => setPaymentForm(prev => ({ ...prev, method: 'upi' }))}
                  >
                    UPI Payment
                  </button>
                </div>

                {paymentForm.method === 'card' ? (
                  <div className="payment-method-inputs animate-fade-in">
                    <div className="form-group">
                      <label htmlFor="cardNumber">Card Number</label>
                      <input 
                        type="text" 
                        id="cardNumber"
                        name="cardNumber"
                        placeholder="4532 •••• •••• 1827"
                        value={paymentForm.cardNumber}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <div className="form-grid-two">
                      <div className="form-group">
                        <label htmlFor="expiry">Expiry Date</label>
                        <input 
                          type="text" 
                          id="expiry"
                          name="expiry"
                          placeholder="MM/YY"
                          value={paymentForm.expiry}
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="cvv">CVV</label>
                        <input 
                          type="password" 
                          id="cvv"
                          name="cvv"
                          placeholder="•••"
                          value={paymentForm.cvv}
                          maxLength="3"
                          onChange={handlePaymentChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="payment-method-inputs animate-fade-in">
                    <div className="form-group">
                      <label htmlFor="upiId">UPI ID</label>
                      <input 
                        type="text" 
                        id="upiId"
                        name="upiId"
                        placeholder="username@okaxis"
                        value={paymentForm.upiId}
                        onChange={handlePaymentChange}
                        required
                      />
                    </div>
                    <p className="payment-upi-note">You will receive a payment request on your linked UPI app to approve the transaction.</p>
                  </div>
                )}

                <div className="checkout-summary-review-box">
                  <p>Paying: <strong>₹{formatIndianPrice(calculateFinalTotal())}</strong></p>
                  <span className="secure-badge"><FaLock /> Encrypted Transaction</span>
                </div>

                <div className="modal-actions-row">
                  <button type="button" className="btn-premium-outline" onClick={() => setCheckoutStep(1)}>
                    Back
                  </button>
                  <button type="submit" className="btn-premium checkout-complete-btn" disabled={submittingCheckout}>
                    {submittingCheckout ? <div className="btn-spinner"></div> : `Pay ₹${formatIndianPrice(calculateFinalTotal())}`}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Step 3: Success Screen */}
            {checkoutStep === 3 && (
              <div className="checkout-success-container animate-scale-up">
                {/* CSS simulated confetti elements */}
                <div className="confetti-particles">
                  <span className="particle c1"></span>
                  <span className="particle c2"></span>
                  <span className="particle c3"></span>
                  <span className="particle c4"></span>
                  <span className="particle c5"></span>
                  <span className="particle c6"></span>
                </div>

                <FaCheckCircle className="success-icon-animated" />
                <h2>Order Placed Successfully!</h2>
                <p className="success-order-msg">Thank you for your purchase. Your order has been placed and is currently being processed.</p>
                
                <div className="order-details-summary-card">
                  <div className="order-summary-line">
                    <span>Order Number:</span>
                    <strong>{orderNumber}</strong>
                  </div>
                  <div className="order-summary-line">
                    <span>Shipment Address:</span>
                    <span>{shippingForm.address}, {shippingForm.city}</span>
                  </div>
                  <div className="order-summary-line">
                    <span>Total Charged:</span>
                    <strong>₹{formatIndianPrice(calculateFinalTotal())}</strong>
                  </div>
                </div>

                <button className="btn-premium success-btn-cta" onClick={handleCloseCheckout}>
                  Continue Shopping
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

// SVG Times component
const FaTimes = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 352 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
    <path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.19 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.19 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
  </svg>
);

export default Cart;