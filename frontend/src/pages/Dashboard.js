import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUsers, FaBoxOpen, FaShoppingCart, FaCoins, FaPercent, 
  FaBrain, FaMapMarkerAlt, FaCalendarAlt, FaStar, FaChartLine
} from 'react-icons/fa';
import './Dashboard.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(`${API_URL}/dashboard/stats`);
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
        setError('Failed to retrieve analytics data. Verify backend status.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container dashboard-page animate-fade-in" style={{ marginTop: '110px' }}>
        <div className="dashboard-loading-skeleton">
          <div className="skeleton-dashboard-header skeleton"></div>
          <div className="skeleton-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton-card skeleton" style={{ height: '140px' }}></div>
            ))}
          </div>
          <div className="skeleton-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '30px' }}>
            <div className="skeleton-card skeleton" style={{ height: '300px' }}></div>
            <div className="skeleton-card skeleton" style={{ height: '300px' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container dashboard-page animate-fade-in" style={{ marginTop: '110px' }}>
        <div className="error-message glass-panel" style={{ padding: '30px', textAlign: 'center', justifyContent: 'center' }}>
          <h3>Analytics Offline</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { summary, categorySales, popularProducts, ctrData, demographics } = stats;

  return (
    <div className="container dashboard-page animate-fade-in" style={{ marginTop: '110px' }}>
      
      {/* Dashboard Title */}
      <div className="dashboard-header">
        <div className="title-left">
          <h2>Picksy Analytics Dashboard</h2>
          <span className="title-decorator"></span>
        </div>
        <div className="dashboard-timeframe">
          <FaCalendarAlt />
          <span>Last 30 Days (Real-time Sync)</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-card-stat glass-panel">
          <div className="stat-icon-wrap"><FaUsers /></div>
          <div className="stat-val">{summary.totalUsers.toLocaleString()}</div>
          <div className="stat-title">Total Active Users</div>
          <div className="stat-trend up">+14.2% from last month</div>
        </div>
        <div className="dashboard-card-stat glass-panel">
          <div className="stat-icon-wrap"><FaBoxOpen /></div>
          <div className="stat-val">{summary.totalProducts.toLocaleString()}</div>
          <div className="stat-title">Products In Catalog</div>
          <div className="stat-trend up">12 Core Categories</div>
        </div>
        <div className="dashboard-card-stat glass-panel">
          <div className="stat-icon-wrap"><FaCoins /></div>
          <div className="stat-val">{formatCurrency(summary.totalRevenue)}</div>
          <div className="stat-title">Gross Revenue</div>
          <div className="stat-trend up">+24.5% conversion growth</div>
        </div>
        <div className="dashboard-card-stat glass-panel">
          <div className="stat-icon-wrap"><FaPercent /></div>
          <div className="stat-val">{summary.conversionRate}%</div>
          <div className="stat-title">Model Conversion Rate</div>
          <div className="stat-trend up">+4.1% model CTR lift</div>
        </div>
      </div>

      {/* Analytics Charts Panels */}
      <div className="chart-container-row">
        
        {/* Revenue Trends (Beautiful Custom SVG Curve) */}
        <div className="chart-panel-card glass-panel">
          <h3><FaChartLine style={{ color: 'var(--primary)' }} /> Sales & Revenue Trends</h3>
          <div className="svg-chart-wrapper">
            <svg viewBox="0 0 500 220" width="100%" height="100%" preserveAspectRatio="none">
              <defs>
                <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
              {/* Background Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="var(--border-color)" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="190" x2="500" y2="190" stroke="var(--border-color)" strokeWidth="2" />

              {/* Area Under Curve */}
              <path d="M 0 190 C 70 120, 140 160, 210 90 C 280 140, 350 70, 420 50 L 500 120 L 500 190 Z" fill="url(#area-grad)" />

              {/* Curve Line */}
              <path 
                d="M 0 190 C 70 120, 140 160, 210 90 C 280 140, 350 70, 420 50 C 460 40, 480 90, 500 120" 
                fill="none" 
                stroke="url(#line-grad)" 
                strokeWidth="4.5" 
                strokeLinecap="round"
              />
              
              {/* Interactive nodes */}
              <circle cx="210" cy="90" r="6" fill="var(--bg-surface)" stroke="var(--primary)" strokeWidth="3" />
              <circle cx="420" cy="50" r="6" fill="var(--bg-surface)" stroke="var(--accent)" strokeWidth="3" />
            </svg>
            <div className="chart-timeline-labels">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4 (Peak)</span>
            </div>
          </div>
        </div>

        {/* Model Accuracy Comparison (Horizontal Bar CTRs) */}
        <div className="chart-panel-card glass-panel">
          <h3><FaBrain style={{ color: 'var(--accent)' }} /> Model Accuracy (CTR)</h3>
          <div className="ctr-bar-chart">
            {ctrData.map(model => (
              <div key={model.model} className="ctr-row-item">
                <div className="ctr-meta-labels">
                  <span className="ctr-model-name">{model.model}</span>
                  <span className="ctr-val-percent">{model.ctr}% CTR</span>
                </div>
                <div className="ctr-bar-bg">
                  <div className="ctr-bar-fill" style={{ width: `${model.ctr * 7}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Category sales and demographics row */}
      <div className="chart-container-row" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
        
        {/* Category breakdown sales list */}
        <div className="chart-panel-card glass-panel">
          <h3>Category Sales Share</h3>
          <div className="dashboard-category-sales-list">
            {categorySales.slice(0, 5).map(c => {
              // Calculate width relative to highest sales value
              const maxSalesVal = Math.max(...categorySales.map(x => x.sales));
              const relativeWidth = (c.sales / maxSalesVal) * 100;
              return (
                <div key={c.category} className="cat-sales-item">
                  <div className="cat-sales-meta">
                    <span className="cat-sales-title">{c.category.replace('_', ' ')}</span>
                    <span className="cat-sales-amt">{c.sales.toLocaleString()} Orders</span>
                  </div>
                  <div className="cat-sales-bar-bg">
                    <div className="cat-sales-bar-fill" style={{ width: `${relativeWidth}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographics Location & Age breakdown */}
        <div className="chart-panel-card glass-panel">
          <h3>User Demographics Insights</h3>
          <div className="demographics-wrapper-row">
            
            {/* Age groups */}
            <div className="demographics-col">
              <h4 className="demographics-sub-title">Age Distributions</h4>
              <div className="age-stats-grid">
                {demographics.age.map(ageGroup => (
                  <div key={ageGroup.range} className="age-row-item">
                    <span className="age-range-lbl">{ageGroup.range}</span>
                    <div className="age-bar-track">
                      <div className="age-bar-fill" style={{ height: `${Math.min((ageGroup.count / 1500) * 100, 100)}%` }}></div>
                    </div>
                    <span className="age-count-lbl">{ageGroup.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Geographical Locations */}
            <div className="demographics-col">
              <h4 className="demographics-sub-title">Top Active Locations</h4>
              <div className="location-list">
                {demographics.location.slice(0, 5).map(loc => (
                  <div key={loc.city} className="location-item-row">
                    <div className="loc-meta">
                      <FaMapMarkerAlt className="loc-icon" />
                      <span>{loc.city.split(',')[0]}</span>
                    </div>
                    <strong className="loc-val">{loc.count} Users</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Top Performing products list */}
      <div className="chart-panel-card glass-panel" style={{ marginBottom: '50px' }}>
        <h3>Top Performing Recommendation Anchors</h3>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Rating</th>
                <th>Popularity Score</th>
              </tr>
            </thead>
            <tbody>
              {popularProducts.map(p => (
                <tr key={p._id}>
                  <td className="table-product-name-col">
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="table-category-tag">{p.category}</span>
                  </td>
                  <td>₹{p.price.toLocaleString()}</td>
                  <td>
                    <div className="rating-cell">
                      <FaStar className="rating-star-icon" /> {p.rating}
                    </div>
                  </td>
                  <td className="table-popularity-col">{p.popularityScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
