import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaSlidersH, FaTimes, FaFilter, FaSearchPlus, FaChevronLeft, 
  FaChevronRight, FaStar, FaTags, FaUndo
} from 'react-icons/fa';
import ProductCard from '../components/ProductCard';
import './Search.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const subToParentMap = {
  laptops: 'electronics', smartphones: 'electronics', headphones: 'electronics', smartwatches: 'electronics', televisions: 'electronics', cameras: 'electronics', tablets: 'electronics', accessories: 'electronics',
  tshirts: 'fashion', shirts: 'fashion', jeans: 'fashion', jackets: 'fashion', dresses: 'fashion', activewear: 'fashion', footwear: 'fashion', watches: 'fashion',
  skincare: 'beauty', haircare: 'beauty', makeup: 'beauty', fragrances: 'beauty', bath_body: 'beauty', mens_grooming: 'beauty',
  cookware: 'home_kitchen', appliances: 'home_kitchen', home_decor: 'home_kitchen', bedding: 'home_kitchen', kitchen_tools: 'home_kitchen', dining: 'home_kitchen',
  running: 'sports', fitness_gear: 'sports', team_sports: 'sports', outdoor_recreation: 'sports', racket_sports: 'sports', swimming: 'sports',
  snacks: 'grocery', beverages: 'grocery', staples: 'grocery', dairy_eggs: 'grocery', breakfast: 'grocery', sauces_spreads: 'grocery',
  fiction: 'books', non_fiction: 'books', biographies: 'books', sci_fi_fantasy: 'books', self_help: 'books', mystery_thriller: 'books',
  car_care: 'automotive', accessories: 'automotive', parts: 'automotive', gps_electronics: 'automotive', tools: 'automotive',
  board_games: 'toys', action_figures: 'toys', dolls: 'toys', educational: 'toys', puzzles: 'toys', building_sets: 'toys',
  vitamins: 'health', personal_care: 'health', otc_medicine: 'health', wellness_devices: 'health', nutrition: 'health',
  living_room: 'furniture', bedroom: 'furniture', office: 'furniture', dining_room: 'furniture', outdoor_furniture: 'furniture',
  consoles: 'gaming', video_games: 'gaming', controllers: 'gaming', gaming_headsets: 'gaming', chair_desks: 'gaming'
};

const subcategoriesMap = {
  electronics: [
    { name: 'Laptops', key: 'laptops' },
    { name: 'Smartphones', key: 'smartphones' },
    { name: 'Headphones', key: 'headphones' },
    { name: 'Smartwatches', key: 'smartwatches' },
    { name: 'Televisions', key: 'televisions' },
    { name: 'Cameras', key: 'cameras' },
    { name: 'Tablets', key: 'tablets' },
    { name: 'Accessories', key: 'accessories' }
  ],
  fashion: [
    { name: 'T-Shirts', key: 'tshirts' },
    { name: 'Shirts', key: 'shirts' },
    { name: 'Jeans', key: 'jeans' },
    { name: 'Jackets', key: 'jackets' },
    { name: 'Dresses', key: 'dresses' },
    { name: 'Activewear', key: 'activewear' },
    { name: 'Footwear', key: 'footwear' },
    { name: 'Watches', key: 'watches' }
  ],
  beauty: [
    { name: 'Skincare', key: 'skincare' },
    { name: 'Haircare', key: 'haircare' },
    { name: 'Makeup', key: 'makeup' },
    { name: 'Fragrances', key: 'fragrances' },
    { name: 'Bath & Body', key: 'bath_body' },
    { name: 'Men\'s Grooming', key: 'mens_grooming' }
  ],
  home_kitchen: [
    { name: 'Cookware', key: 'cookware' },
    { name: 'Appliances', key: 'appliances' },
    { name: 'Home Decor', key: 'home_decor' },
    { name: 'Bedding', key: 'bedding' },
    { name: 'Kitchen Tools', key: 'kitchen_tools' },
    { name: 'Dining', key: 'dining' }
  ],
  sports: [
    { name: 'Running', key: 'running' },
    { name: 'Fitness Gear', key: 'fitness_gear' },
    { name: 'Team Sports', key: 'team_sports' },
    { name: 'Outdoor', key: 'outdoor_recreation' },
    { name: 'Racket Sports', key: 'racket_sports' },
    { name: 'Swimming', key: 'swimming' }
  ],
  grocery: [
    { name: 'Snacks', key: 'snacks' },
    { name: 'Beverages', key: 'beverages' },
    { name: 'Staples', key: 'staples' },
    { name: 'Dairy & Eggs', key: 'dairy_eggs' },
    { name: 'Breakfast', key: 'breakfast' },
    { name: 'Sauces & Spreads', key: 'sauces_spreads' }
  ],
  books: [
    { name: 'Fiction', key: 'fiction' },
    { name: 'Non-Fiction', key: 'non_fiction' },
    { name: 'Biographies', key: 'biographies' },
    { name: 'Sci-Fi & Fantasy', key: 'sci_fi_fantasy' },
    { name: 'Self-Help', key: 'self_help' },
    { name: 'Mystery & Thriller', key: 'mystery_thriller' }
  ],
  automotive: [
    { name: 'Car Care', key: 'car_care' },
    { name: 'Accessories', key: 'accessories' },
    { name: 'Parts', key: 'parts' },
    { name: 'GPS & Electronics', key: 'gps_electronics' },
    { name: 'Tools', key: 'tools' }
  ],
  toys: [
    { name: 'Board Games', key: 'board_games' },
    { name: 'Action Figures', key: 'action_figures' },
    { name: 'Dolls', key: 'dolls' },
    { name: 'Educational', key: 'educational' },
    { name: 'Puzzles', key: 'puzzles' },
    { name: 'Building Sets', key: 'building_sets' }
  ],
  health: [
    { name: 'Vitamins', key: 'vitamins' },
    { name: 'Personal Care', key: 'personal_care' },
    { name: 'OTC Medicine', key: 'otc_medicine' },
    { name: 'Wellness Devices', key: 'wellness_devices' },
    { name: 'Nutrition', key: 'nutrition' }
  ],
  furniture: [
    { name: 'Living Room', key: 'living_room' },
    { name: 'Bedroom', key: 'bedroom' },
    { name: 'Office', key: 'office' },
    { name: 'Dining Room', key: 'dining_room' },
    { name: 'Outdoor Furniture', key: 'outdoor_furniture' }
  ],
  gaming: [
    { name: 'Consoles', key: 'consoles' },
    { name: 'Video Games', key: 'video_games' },
    { name: 'Controllers', key: 'controllers' },
    { name: 'Gaming Headsets', key: 'gaming_headsets' },
    { name: 'Chairs & Desks', key: 'chair_desks' }
  ]
};

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const discountParam = searchParams.get('discount') || '';

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  
  // Stored lists for filtering
  const [brandsList, setBrandsList] = useState([]);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest');
  
  // Mobile drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Common typo suggestion keywords
  const [searchSuggestion, setSearchSuggestion] = useState('');

  // Update filter selections when URL params change
  useEffect(() => {
    setSelectedCategory(categoryParam);
    setCurrentPage(1);
  }, [categoryParam]);

  // Main Product Fetching Pipeline
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        let url = `${API_URL}/products?page=${currentPage}&limit=16&sortBy=${sortBy}`;
        
        if (queryParam) url += `&search=${encodeURIComponent(queryParam)}`;
        if (selectedCategory) url += `&category=${encodeURIComponent(selectedCategory)}`;
        if (maxPrice < 300000) url += `&maxPrice=${maxPrice}`;
        if (discountParam === 'true') url += `&discount=true`;
        
        // Brand filter handling: backend takes one brand query or we filter in memory/join query
        if (selectedBrands.length > 0) {
          // If multiple brands selected, we'll fetch them, or backend handles it.
          // Since our backend router matches single brand in req.query, we pass the first selected brand
          // and filter the rest in memory, or handle it sequentially. For simplicity, we query and pass the brand.
          url += `&brand=${encodeURIComponent(selectedBrands[0])}`;
        }

        const response = await axios.get(url);
        let items = response.data?.products || response.data || [];
        let pagination = response.data?.pagination || { total: items.length, pages: 1 };
        
        // Client side filtering for ratings and extra brands (if multiple brands are checked)
        if (minRating > 0) {
          items = items.filter(p => p.rating >= minRating);
        }
        if (selectedBrands.length > 1) {
          items = items.filter(p => selectedBrands.includes(p.brand));
        }

        setProducts(items);
        setTotalProducts(pagination.total);
        setTotalPages(pagination.pages);
        
        // Static listing of all brands to choose from based on category
        let categoryBrands = [];
        if (selectedCategory) {
          // Categories brands lookup
          const categoryBrandsMap = {
            electronics: ['Apple', 'Sony', 'Samsung', 'Dell', 'HP', 'ASUS', 'Lenovo', 'Bose', 'Sennheiser', 'OnePlus', 'JBL', 'LG', 'Logitech'],
            gaming: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'ASUS ROG', 'MSI'],
            fashion: ['Nike', 'Adidas', 'Zara', 'H&M', 'Levis', 'Tommy Hilfiger', 'Calvin Klein', 'Puma', 'Under Armour', 'Ralph Lauren'],
            beauty: ["L'Oreal", 'Estee Lauder', 'Clinique', 'Maybelline', 'Nivea', 'The Body Shop', 'Mac', 'Cetaphil', 'Neutrogena'],
            home_kitchen: ['Philips', 'Prestige', 'Cuisinart', 'Instant Pot', 'Dyson', 'KitchenAid', 'Hamilton Beach', 'T-fal'],
            sports: ['Decathlon', 'Wilson', 'Spalding', 'Yonex', 'Garmin', 'Speedo', 'Everlast', 'Nike Sports', 'Under Armour Sports'],
            grocery: ['Nestle', 'Kraft', 'Kelloggs', 'Cadbury', 'Heinz', 'Tata', 'Amul', 'PepsiCo', 'Coca-Cola', 'Britannia'],
            books: ['Penguin Books', 'HarperCollins', 'Simon & Schuster', 'Hachette', 'Macmillan', 'Scholastic', 'Random House'],
            automotive: ['Bosch', 'Michelin', 'Castrol', '3M', 'Meguiars', 'Pioneer', 'Garmin Auto', 'WD-40'],
            toys: ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Ravensburger', 'Nerf', 'Funko', 'Monopoly'],
            health: ['Optimum Nutrition', 'Centrum', 'Dettol', 'Colgate', 'Gillette', 'Oral-B', 'Omron', 'MuscleBlaze'],
            furniture: ['IKEA', 'Godrej Interio', 'Ashley Furniture', 'Home Centre', 'Pepperfry', 'Urban Ladder', 'La-Z-Boy']
          };
          const subToParentMap = {
            laptops: 'electronics', smartphones: 'electronics', headphones: 'electronics', smartwatches: 'electronics', televisions: 'electronics', cameras: 'electronics', tablets: 'electronics', accessories: 'electronics',
            tshirts: 'fashion', shirts: 'fashion', jeans: 'fashion', jackets: 'fashion', dresses: 'fashion', activewear: 'fashion', footwear: 'fashion', watches: 'fashion',
            skincare: 'beauty', haircare: 'beauty', makeup: 'beauty', fragrances: 'beauty', bath_body: 'beauty', mens_grooming: 'beauty',
            cookware: 'home_kitchen', appliances: 'home_kitchen', home_decor: 'home_kitchen', bedding: 'home_kitchen', kitchen_tools: 'home_kitchen', dining: 'home_kitchen',
            running: 'sports', fitness_gear: 'sports', team_sports: 'sports', outdoor_recreation: 'sports', racket_sports: 'sports', swimming: 'sports',
            snacks: 'grocery', beverages: 'grocery', staples: 'grocery', dairy_eggs: 'grocery', breakfast: 'grocery', sauces_spreads: 'grocery',
            fiction: 'books', non_fiction: 'books', biographies: 'books', sci_fi_fantasy: 'books', self_help: 'books', mystery_thriller: 'books',
            car_care: 'automotive', parts: 'automotive', gps_electronics: 'automotive', tools: 'automotive',
            board_games: 'toys', action_figures: 'toys', dolls: 'toys', educational: 'toys', puzzles: 'toys', building_sets: 'toys',
            vitamins: 'health', personal_care: 'health', otc_medicine: 'health', wellness_devices: 'health', nutrition: 'health',
            living_room: 'furniture', bedroom: 'furniture', office: 'furniture', dining_room: 'furniture', outdoor_furniture: 'furniture',
            consoles: 'gaming', video_games: 'gaming', controllers: 'gaming', gaming_headsets: 'gaming', chair_desks: 'gaming'
          };
          const parentKey = subToParentMap[selectedCategory] || selectedCategory;
          categoryBrands = categoryBrandsMap[parentKey] || [];
        } else {
          categoryBrands = ['Apple', 'Samsung', 'Sony', 'Nike', 'Adidas', 'IKEA', 'Philips', 'LEGO', 'Bosch'];
        }
        setBrandsList(categoryBrands);

        // Check for typo search suggestions
        if (items.length === 0 && queryParam) {
          const q = queryParam.toLowerCase();
          if (q.includes('lap') || q.includes('lpt')) setSearchSuggestion('laptops');
          else if (q.includes('pho') || q.includes('cel') || q.includes('mob')) setSearchSuggestion('smartphones');
          else if (q.includes('gam') || q.includes('play') || q.includes('xbo') || q.includes('con')) setSearchSuggestion('gaming');
          else if (q.includes('sho') || q.includes('sne') || q.includes('run')) setSearchSuggestion('sports');
          else if (q.includes('clot') || q.includes('shir') || q.includes('pant')) setSearchSuggestion('clothing');
          else if (q.includes('boo') || q.includes('nov') || q.includes('read')) setSearchSuggestion('books');
          else setSearchSuggestion('');
        } else {
          setSearchSuggestion('');
        }

      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [currentPage, queryParam, selectedCategory, selectedBrands, maxPrice, minRating, sortBy, discountParam]);

  const handleBrandChange = (brandName) => {
    setSelectedBrands(prev => {
      if (prev.includes(brandName)) {
        return prev.filter(b => b !== brandName);
      } else {
        return [brandName, ...prev]; // prioritizes latest checked brand for backend routing
      }
    });
    setCurrentPage(1);
  };

  const handleCategoryReset = (cat) => {
    setSelectedCategory(cat);
    setSelectedBrands([]);
    setCurrentPage(1);
    navigate(`/search?category=${encodeURIComponent(cat)}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setMaxPrice(300000);
    setMinRating(0);
    setSortBy('newest');
    setCurrentPage(1);
    navigate('/search');
  };

  const allCategories = [
    { name: 'Electronics', key: 'electronics' },
    { name: 'Fashion & Apparel', key: 'fashion' },
    { name: 'Beauty & Cosmetics', key: 'beauty' },
    { name: 'Home & Kitchen', key: 'home_kitchen' },
    { name: 'Sports & Fitness', key: 'sports' },
    { name: 'Grocery Foods', key: 'grocery' },
    { name: 'Books & Fiction', key: 'books' },
    { name: 'Automotive Care', key: 'automotive' },
    { name: 'Toys & Boardgames', key: 'toys' },
    { name: 'Health & Wellness', key: 'health' },
    { name: 'Furniture Essentials', key: 'furniture' },
    { name: 'Gaming Consoles', key: 'gaming' }
  ];

  const activeParentCategory = subToParentMap[selectedCategory] || selectedCategory;

  return (
    <div className="container search-catalog-page animate-fade-in" style={{ marginTop: '110px' }}>
      
      {/* Search Header Banner */}
      <div className="catalog-header-banner">
        {queryParam ? (
          <h2>Search Results for <span>"{queryParam}"</span></h2>
        ) : selectedCategory ? (
          <h2>Browsing <span>{selectedCategory.replace('_', ' ')}</span></h2>
        ) : (
          <h2>Explore <span>All Products</span></h2>
        )}
        <span className="results-count">{totalProducts} premium items found</span>
      </div>

      {/* Suggestion typo block */}
      {searchSuggestion && (
        <div className="typo-suggestion-box glass-panel">
          <p>
            No exact matches found. Did you mean to browse in 
            <button 
              className="suggestion-link" 
              onClick={() => handleCategoryReset(searchSuggestion)}
            >
              {searchSuggestion.charAt(0).toUpperCase() + searchSuggestion.slice(1)}
            </button>?
          </p>
        </div>
      )}

      {/* Catalog Layout Grid */}
      <div className="catalog-layout">
        
        {/* Mobile filter drawer trigger */}
        <button className="mobile-filter-toggle-btn btn-premium-outline" onClick={() => setShowMobileFilters(true)}>
          <FaFilter /> Filter & Sort
        </button>

        {/* Sidebar Filters */}
        <aside className={`catalog-sidebar glass-panel ${showMobileFilters ? 'mobile-visible' : ''}`}>
          <div className="sidebar-header">
            <h3>Refine Results</h3>
            <button className="close-filters-btn" onClick={() => setShowMobileFilters(false)}>
              <FaTimes />
            </button>
          </div>

          {/* Categories select list */}
          <div className="filter-group">
            <h4>Category</h4>
            <div className="category-links-list">
              <button 
                className={`cat-link-btn ${!selectedCategory ? 'active' : ''}`}
                onClick={() => handleCategoryReset('')}
              >
                All Categories
              </button>
              {allCategories.map(cat => {
                const isParentActive = activeParentCategory === cat.key;
                return (
                  <div key={cat.key} className="category-group-item" style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <button
                      className={`cat-link-btn ${selectedCategory === cat.key ? 'active' : ''}`}
                      onClick={() => handleCategoryReset(cat.key)}
                      style={{ width: '100%' }}
                    >
                      {cat.name}
                    </button>
                    {isParentActive && subcategoriesMap[cat.key] && (
                      <div className="subcategory-links-list" style={{ paddingLeft: '14px', margin: '4px 0 8px 0', display: 'flex', flexDirection: 'column', gap: '4px', borderLeft: '1px solid var(--border-color)' }}>
                        {subcategoriesMap[cat.key].map(sub => (
                          <button
                            key={sub.key}
                            className={`cat-link-btn ${selectedCategory === sub.key ? 'active' : ''}`}
                            style={{ fontSize: '0.82rem', padding: '6px 10px', width: '100%', opacity: selectedCategory === sub.key ? 1 : 0.85 }}
                            onClick={() => handleCategoryReset(sub.key)}
                          >
                            • {sub.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Range max limit slider */}
          <div className="filter-group">
            <h4>Max Price</h4>
            <div className="price-slider-container">
              <input 
                type="range"
                min="50"
                max="300000"
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="price-slider"
              />
              <div className="price-labels">
                <span>₹50</span>
                <span className="current-max-label">₹{new Intl.NumberFormat('en-IN').format(maxPrice)}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Brands checklists */}
          {brandsList.length > 0 && (
            <div className="filter-group">
              <h4>Filter by Brand</h4>
              <div className="brand-checklist">
                {brandsList.map(brand => (
                  <label key={brand} className="checkbox-label">
                    <input 
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                    />
                    <span className="checkbox-custom"></span>
                    {brand}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Rating filter select buttons */}
          <div className="filter-group">
            <h4>Customer Review</h4>
            <div className="rating-filter-options">
              {[4, 3, 2].map(stars => (
                <button
                  key={stars}
                  className={`rating-filter-row ${minRating === stars ? 'active' : ''}`}
                  onClick={() => {
                    setMinRating(minRating === stars ? 0 : stars);
                    setCurrentPage(1);
                  }}
                >
                  <div className="stars-row">
                    {[...Array(5)].map((_, i) => (
                      <FaStar key={i} className={i < stars ? 'star-filled' : 'star-empty'} />
                    ))}
                  </div>
                  <span>& Up</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sorting Filters */}
          <div className="filter-group">
            <h4>Sort By</h4>
            <select 
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Average Rating</option>
            </select>
          </div>

          <button className="btn-premium-outline reset-filters-btn" onClick={clearAllFilters}>
            <FaUndo style={{ fontSize: '0.8rem' }} /> Clear Filters
          </button>
        </aside>

        {/* Content Display list */}
        <main className="catalog-content">
          {loading ? (
            <div className="skeleton-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card skeleton"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="no-results glass-panel">
              <FaSearchPlus className="no-results-icon" style={{ fontSize: '3rem' }} />
              <h3>No matched products found</h3>
              <p>We couldn't find any items matching your exact filters. Adjust your budget, categories, or clear checkmarks to explore.</p>
              <button className="btn-premium" onClick={clearAllFilters}>
                Reset Filter Choices
              </button>
            </div>
          ) : (
            <>
              <div className="products-grid">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Paginated Navigation controls */}
              {totalPages > 1 && (
                <div className="pagination-wrapper glass-panel">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="pagination-btn"
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  <span className="page-count-text">Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="pagination-btn"
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
};

export default Search;
