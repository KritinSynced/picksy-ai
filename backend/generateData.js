const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const Product = require('./models/Product');
const User = require('./models/User');
const Interaction = require('./models/Interaction');

// 12 Required Categories
const CATEGORIES = [
  'electronics', 'fashion', 'beauty', 'home_kitchen', 'sports', 
  'grocery', 'books', 'automotive', 'toys', 'health', 'furniture', 'gaming'
];

// Subcategories per Category
const SUBCATEGORIES = {
  electronics: ['laptops', 'smartphones', 'headphones', 'smartwatches', 'televisions', 'cameras', 'tablets', 'accessories'],
  fashion: ['tshirts', 'shirts', 'jeans', 'jackets', 'dresses', 'activewear', 'footwear', 'watches'],
  beauty: ['skincare', 'haircare', 'makeup', 'fragrances', 'bath_body', 'mens_grooming'],
  home_kitchen: ['cookware', 'appliances', 'home_decor', 'bedding', 'kitchen_tools', 'dining'],
  sports: ['running', 'fitness_gear', 'team_sports', 'outdoor_recreation', 'racket_sports', 'swimming'],
  grocery: ['snacks', 'beverages', 'staples', 'dairy_eggs', 'breakfast', 'sauces_spreads'],
  books: ['fiction', 'non_fiction', 'biographies', 'sci_fi_fantasy', 'self_help', 'mystery_thriller'],
  automotive: ['car_care', 'accessories', 'parts', 'gps_electronics', 'tools'],
  toys: ['board_games', 'action_figures', 'dolls', 'educational', 'puzzles', 'building_sets'],
  health: ['vitamins', 'personal_care', 'otc_medicine', 'wellness_devices', 'nutrition'],
  furniture: ['living_room', 'bedroom', 'office', 'dining_room', 'outdoor_furniture'],
  gaming: ['consoles', 'video_games', 'controllers', 'gaming_headsets', 'accessories', 'chair_desks']
};

// Brands per Category
const BRANDS = {
  electronics: ['Apple', 'Sony', 'Samsung', 'Dell', 'HP', 'ASUS', 'Lenovo', 'Bose', 'Sennheiser', 'OnePlus', 'JBL', 'LG', 'Logitech'],
  fashion: ['Nike', 'Adidas', 'Zara', 'H&M', 'Levis', 'Tommy Hilfiger', 'Calvin Klein', 'Puma', 'Under Armour', 'Ralph Lauren'],
  beauty: ["L'Oreal", 'Estee Lauder', 'Clinique', 'Maybelline', 'Nivea', 'The Body Shop', 'Mac', 'Cetaphil', 'Neutrogena'],
  home_kitchen: ['Philips', 'Prestige', 'Cuisinart', 'Instant Pot', 'Dyson', 'KitchenAid', 'Hamilton Beach', 'T-fal'],
  sports: ['Decathlon', 'Wilson', 'Spalding', 'Yonex', 'Garmin', 'Speedo', 'Everlast', 'Nike Sports', 'Under Armour Sports'],
  grocery: ['Nestle', 'Kraft', 'Kelloggs', 'Cadbury', 'Heinz', 'Tata', 'Amul', 'PepsiCo', 'Coca-Cola', 'Britannia'],
  books: ['Penguin Books', 'HarperCollins', 'Simon & Schuster', 'Hachette', 'Macmillan', 'Scholastic', 'Random House'],
  automotive: ['Bosch', 'Michelin', 'Castrol', '3M', 'Meguiars', 'Pioneer', 'Garmin Auto', 'WD-40'],
  toys: ['LEGO', 'Hasbro', 'Mattel', 'Fisher-Price', 'Ravensburger', 'Nerf', 'Funko', 'Monopoly'],
  health: ['Optimum Nutrition', 'Centrum', 'Dettol', 'Colgate', 'Gillette', 'Oral-B', 'Omron', 'MuscleBlaze'],
  furniture: ['IKEA', 'Godrej Interio', 'Ashley Furniture', 'Home Centre', 'Pepperfry', 'Urban Ladder', 'La-Z-Boy'],
  gaming: ['Sony PlayStation', 'Microsoft Xbox', 'Nintendo', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'ASUS ROG', 'MSI']
};

// Demographic structures for realistic user generation
const INTERESTS = ['tech', 'fashion', 'gaming', 'sports', 'reading', 'cooking', 'decor', 'wellness', 'toys', 'cars'];
const LOCATIONS = [
  'Mumbai, MH', 'Bangalore, KA', 'Delhi, DL', 'Hyderabad, TG', 'Pune, MH', 
  'Chennai, TN', 'Kolkata, WB', 'Ahmedabad, GJ', 'Jaipur, RJ', 'Kochi, KL',
  'Chandigarh, CH', 'Lucknow, UP', 'Gurugram, HR', 'Noida, UP', 'Goa, GA'
];

const FIRST_NAMES = [
  'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Saisha', 'Aditya', 'Sai', 'Arjun', 'Kiara',
  'Rohan', 'Kabir', 'Ishaan', 'Aanya', 'Myra', 'Kavya', 'Rahul', 'Neha', 'Pooja', 'Amit',
  'Siddharth', 'Varun', 'Rhea', 'Karan', 'Simran', 'Tanvi', 'Abhishek', 'Priya', 'Deepak', 'Aisha',
  'Vikram', 'Divya', 'Sanjay', 'Meera', 'Ravi', 'Anjali', 'Vijay', 'Shreya', 'Raj', 'Sneha',
  'John', 'Sarah', 'Michael', 'Emily', 'David', 'Jessica', 'James', 'Ashley', 'Robert', 'Amanda'
];

const LAST_NAMES = [
  'Sharma', 'Verma', 'Gupta', 'Mehta', 'Sen', 'Das', 'Joshi', 'Patel', 'Reddy', 'Nair',
  'Rao', 'Kumar', 'Singh', 'Mishra', 'Choudhury', 'Bose', 'Chatterjee', 'Dubey', 'Trivedi', 'Shah',
  'Bahl', 'Kapoor', 'Malhotra', 'Khanna', 'Gill', 'Sandhu', 'Menon', 'Pillai', 'Raza', 'Khan',
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor'
];

// Product description Adjectives and Nouns for naming
const ADJECTIVES = {
  electronics: ['Ultra-Slim', 'Pro-Grade', 'Next-Gen', 'Smart', 'High-Fidelity', 'Noise-Cancelling', 'Wireless', '4K UHD', 'Waterproof', 'Compact', 'Ergonomic', 'Vibrant'],
  fashion: ['Classic Fit', 'Breathable', 'Stretch', 'Tailored', 'Vintage-Wash', 'Water-Resistant', 'Eco-Friendly', 'Casual', 'Elegant', 'Premium', 'Streetwear', 'Athletic'],
  beauty: ['Hydrating', 'Organic', 'Anti-Aging', 'Matte Finish', 'Soothing', 'Nourishing', 'Long-Lasting', 'Glowing', 'Gentle', 'Vegan', 'Exfoliating', 'Revitalizing'],
  home_kitchen: ['Non-Stick', 'Heavy-Duty', 'Space-Saving', 'Stainless Steel', 'Smart Control', 'Double-Walled', 'Chef Grade', 'Minimalist', 'Retro-Style', 'Multi-Purpose'],
  sports: ['High-Performance', 'Lightweight', 'Heavy-Tension', 'Shock-Absorbing', 'All-Weather', 'Ergonomic', 'Professional', 'Portable', 'Pro-Traction', 'Aerodynamic'],
  grocery: ['Organic', 'Gluten-Free', 'Roasted', 'Whole Grain', 'Spicy', 'Sugar-Free', 'Rich-Aroma', 'Natural', 'Gourmet', 'Artisanal', 'Cold-Press', 'Sweet & Sour'],
  books: ['Bestselling', 'Award-Winning', 'Illustrated', 'Hardcover', 'Collector\'s', 'Unabridged', 'Action-Packed', 'Inspiring', 'Dark & Gripping', 'Thought-Provoking'],
  automotive: ['Heavy-Duty', 'High-Gloss', 'Precision-Fit', 'Synthetic', 'All-Weather', 'Anti-Scratch', 'Quick-Dry', 'Universal', 'Premium-Shield', 'Heavy-Grip'],
  toys: ['Interactive', 'Educational', 'Eco-Friendly', 'Mind-Bending', 'Collectable', 'Action-Packed', 'Deluxe', 'Creative', 'Family-Friendly', 'Glow-in-the-Dark'],
  health: ['Extra-Strength', 'Daily Multi', 'Fast-Absorbing', 'Natural-Source', 'Sugar-Free', 'Clinically-Proven', 'Premium-Blend', 'High-Potency', 'Vegan'],
  furniture: ['Solid Wood', 'Mid-Century Modern', 'Ergonomic', 'Tufted', 'Space-Saving', 'Modular', 'Rustic', 'Plush', 'Hand-Crafted', 'Weatherproof'],
  gaming: ['Mechanical', 'Surround Sound', 'RGB Backlit', 'High-Refresh', 'Low-Latency', 'Ergonomic', 'Customizable', 'Wireless Pro', 'Haptic Touch', 'Ultra-Response']
};

const NOUNS = {
  electronics: ['Laptop', 'Smartphone', 'Earbuds', 'Smartwatch', 'LED TV', 'Mirrorless Camera', 'Tablet', 'USB-C Hub', 'IPS Monitor', 'Keyboard', 'Mouse', 'Power Bank'],
  fashion: ['Crewneck T-Shirt', 'Button-Down Shirt', 'Slim-Fit Jeans', 'Windbreaker Jacket', 'A-Line Dress', 'Jogger Pants', 'Sneakers', 'Quartz Watch', 'Hoodie', 'Loafers'],
  beauty: ['Serum', 'Shampoo', 'Lipstick', 'Eau de Parfum', 'Body Wash', 'Face Cream', 'Foundation', 'Conditioner', 'Clay Mask', 'Shaving Gel', 'Sunscreen', 'Cleanser'],
  home_kitchen: ['Frying Pan', 'Air Fryer', 'Table Lamp', 'Bedsheet Set', 'Knife Block', 'Coffee Maker', 'Blender', 'Serving Bowls', 'Storage Container', 'Toaster Oven'],
  sports: ['Running Shoes', 'Dumbbell Set', 'Soccer Ball', 'Sleeping Bag', 'Tennis Racket', 'Goggles', 'Yoga Mat', 'Resistance Bands', 'Hydration Flask', 'Backpack'],
  grocery: ['Potato Chips', 'Green Tea Bag', 'Basmati Rice', 'Greek Yogurt', 'Oatmeal Box', 'Pasta Sauce', 'Almond Nuts', 'Dark Chocolate', 'Olive Oil', 'Honey Jar'],
  books: ['Novel', 'Guidebook', 'Biography', 'Fantasy Epic', 'Self-Help Manual', 'Thriller', 'Short Stories', 'Encyclopedia', 'History Chronology', 'Poetry Collection'],
  automotive: ['Car Wax', 'Seat Cover', 'Spark Plug', 'GPS Navigator', 'Socket Wrench Set', 'Microfiber Cloth', 'Engine Oil', 'Windshield Wiper', 'Air Freshener'],
  toys: ['Strategy Game', 'Action Figure', 'Fashion Doll', 'Science Experiment Kit', '1000-Piece Puzzle', 'Building Block Set', 'Blaster Toy', 'Vinyl Figure'],
  health: ['Multivitamin', 'Hand Sanitizer', 'Pain Relief Gel', 'Blood Pressure Monitor', 'Whey Protein', 'Fish Oil Capsule', 'First Aid Kit', 'Sleep Support', 'Probiotics'],
  furniture: ['Sofa Couch', 'Platform Bed', 'Office Desk', 'Dining Table Set', 'Adirondack Chair', 'Bookshelf Cabinet', 'Coffee Table', 'Recliner Chair', 'Wardrobe Closet'],
  gaming: ['Console Console', 'Game Disc', 'Wireless Controller', 'Gaming Headset', 'Mouse Pad', 'Gaming Chair', 'Desk Table', 'Streaming Microphone', 'Capture Card']
};

// 8 Latent Dimensions
// 0: Tech-Savvy, 1: Style/Fashion, 2: Sports/Fitness, 3: Home/Cooking, 4: Budget-Conscious, 5: Premium/Luxury, 6: Wellness/Health, 7: Entertainment/Gaming
const getProductEmbedding = (category, subcategory, price) => {
  const emb = Array(8).fill(0.05); // Baseline score

  switch (category) {
    case 'electronics':
      emb[0] = 0.8;
      if (['laptops', 'smartphones', 'tablets'].includes(subcategory)) emb[0] = 0.95;
      break;
    case 'fashion':
      emb[1] = 0.85;
      if (subcategory === 'activewear') emb[2] = 0.7;
      break;
    case 'beauty':
      emb[1] = 0.6;
      emb[6] = 0.5;
      break;
    case 'home_kitchen':
      emb[3] = 0.85;
      break;
    case 'sports':
      emb[2] = 0.9;
      emb[6] = 0.4;
      break;
    case 'grocery':
      emb[3] = 0.4;
      emb[6] = 0.3;
      break;
    case 'books':
      emb[7] = 0.4;
      break;
    case 'automotive':
      emb[0] = 0.3;
      break;
    case 'toys':
      emb[7] = 0.6;
      break;
    case 'health':
      emb[6] = 0.95;
      break;
    case 'furniture':
      emb[3] = 0.7;
      break;
    case 'gaming':
      emb[7] = 0.95;
      emb[0] = 0.6;
      break;
  }

  // Price-based embeddings: Budget vs. Premium
  if (price < 1000) {
    emb[4] = 0.9; // Budget-Conscious
    emb[5] = 0.05; // Premium
  } else if (price > 25000) {
    emb[4] = 0.05;
    emb[5] = 0.95; // Premium
  } else {
    emb[4] = 0.5;
    emb[5] = 0.4;
  }

  // Normalize embedding vector to unit length
  const mag = Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0));
  return emb.map(v => Number((v / mag).toFixed(4)));
};

// Generate User Embedding based on demographic preferences
const getUserEmbedding = (demographics) => {
  const emb = Array(8).fill(0.1);
  const { interests, budgetTier } = demographics;

  interests.forEach(interest => {
    if (interest === 'tech') emb[0] += 0.5;
    if (interest === 'fashion') emb[1] += 0.5;
    if (interest === 'sports') emb[2] += 0.5;
    if (interest === 'cooking' || interest === 'decor') emb[3] += 0.5;
    if (interest === 'wellness') emb[6] += 0.5;
    if (interest === 'gaming') emb[7] += 0.5;
    if (interest === 'toys') emb[7] += 0.3;
  });

  if (budgetTier === 'Low') {
    emb[4] += 0.7;
    emb[5] += 0.05;
  } else if (budgetTier === 'High') {
    emb[4] += 0.05;
    emb[5] += 0.8;
  } else {
    emb[4] += 0.4;
    emb[5] += 0.4;
  }

  const mag = Math.sqrt(emb.reduce((sum, val) => sum + val * val, 0));
  return emb.map(v => Number((v / mag).toFixed(4)));
};

// Main Seeding script logic
async function runSeeder() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/picksy', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected.');

    // Clear existing collections
    console.log('🧹 Clearing old collections (Products, Users, Interactions)...');
    await Product.deleteMany({});
    await User.deleteMany({});
    await Interaction.deleteMany({});
    console.log('✅ Collections cleared.');

    // ----------------------------------------
    // 1. Generate 100,000+ Products
    // ----------------------------------------
    console.log('📦 Generating 100,000+ products...');
    const productsToInsert = [];
    const totalProducts = 100100; // slightly above 100k
    
    // Categorized lists to store basic specs of inserted items in-memory for interactions simulation
    const productLookupList = [];

    // Pre-calculate brands list to guarantee category match
    const categoryIndexes = {};
    CATEGORIES.forEach(cat => categoryIndexes[cat] = 0);

    for (let i = 0; i < totalProducts; i++) {
      const category = CATEGORIES[i % CATEGORIES.length];
      const subcategories = SUBCATEGORIES[category];
      const subcategory = subcategories[i % subcategories.length];
      const brandsList = BRANDS[category];
      const brand = brandsList[i % brandsList.length];
      
      const adjList = ADJECTIVES[category];
      const nounList = NOUNS[category];
      const adj = adjList[Math.floor((i * 7) % adjList.length)];
      const noun = nounList[Math.floor((i * 13) % nounList.length)];
      
      const name = `${brand} ${adj} ${noun} ${100 + (i % 900)}`;
      
      // Price calculations
      let price = 500;
      switch (category) {
        case 'electronics': price = 2999 + (i % 40) * 4500 + (i % 3) * 15000; break;
        case 'fashion': price = 499 + (i % 30) * 250; break;
        case 'beauty': price = 199 + (i % 25) * 150; break;
        case 'home_kitchen': price = 799 + (i % 50) * 800; break;
        case 'sports': price = 599 + (i % 40) * 600; break;
        case 'grocery': price = 59 + (i % 20) * 45; break;
        case 'books': price = 149 + (i % 30) * 50; break;
        case 'automotive': price = 399 + (i % 30) * 400; break;
        case 'toys': price = 249 + (i % 40) * 180; break;
        case 'health': price = 149 + (i % 20) * 120; break;
        case 'furniture': price = 3499 + (i % 50) * 1500; break;
        case 'gaming': price = 999 + (i % 40) * 800 + (i % 4) * 8000; break;
      }
      
      const hasDiscount = (i % 5 === 0);
      const discount = hasDiscount ? (10 + (i % 9) * 5) : 0;
      const oldPrice = hasDiscount ? Math.round(price * (1 + discount / 100)) : undefined;
      const stock = (i % 17 === 0) ? 0 : 10 + (i % 120);
      const baseRating = Number((3.5 + ((i % 15) / 10)).toFixed(1)); // 3.5 - 4.9

      // Specifications generator
      const specifications = {
        Model: `PK-${2026 + (i % 3)}-${i}`,
        Origin: 'Made in India',
        Warranty: (i % 3 === 0) ? '2 Years Brand Warranty' : '1 Year Seller Warranty'
      };
      if (category === 'electronics' || category === 'gaming') {
        specifications['Power Source'] = 'AC Adapter / Battery';
        specifications['Smart Integration'] = (i % 4 === 0) ? 'Yes' : 'No';
      }

      // Image selection from pre-curated Unsplash images
      const images = [];
      const imageIndex = (i % 15) + 1;
      let unsplashId = 'photo-1523275335684-37898b6baf30'; // default product
      if (category === 'electronics') unsplashId = ['photo-1505740420928-5e560c06d30e', 'photo-1542751371-adc38448a05e', 'photo-1526738549149-8e07eca6c147'][i % 3];
      else if (category === 'fashion') unsplashId = ['photo-1542291026-7eec264c27ff', 'photo-1525507119028-ed4c629a60a3', 'photo-1595950653106-6c9ebd614d3a'][i % 3];
      else if (category === 'gaming') unsplashId = ['photo-1600861195091-690c92f1d2cc', 'photo-1538481199705-c710c4e965fc', 'photo-1592155977936-38fc6a6890f0'][i % 3];
      else if (category === 'beauty') unsplashId = ['photo-1526947425960-945c6e72858f', 'photo-1571781926291-c477ebfd024b', 'photo-1598440947619-2c35fc9aa908'][i % 3];
      else if (category === 'home_kitchen') unsplashId = ['photo-1588854337236-6889d631faa8', 'photo-1506084868230-bb9d95c24759', 'photo-1556910103-1c02745aae4d'][i % 3];
      else if (category === 'furniture') unsplashId = ['photo-1586023492125-27b2c045efd7', 'photo-1555041469-a586c61ea9bc', 'photo-1583847268964-b28dc8f51f92'][i % 3];
      else if (category === 'books') unsplashId = ['photo-1544947950-fa07a98d237f', 'photo-1512820790803-83ca734da794', 'photo-1497633762265-9d179a990aa6'][i % 3];
      
      const imageUrl = `https://images.unsplash.com/${unsplashId}?w=600&auto=format&fit=crop&q=80`;
      const thumbnailUrl = `https://images.unsplash.com/${unsplashId}?w=150&auto=format&fit=crop&q=60`;
      images.push(imageUrl);

      const features = [
        `High quality materials and craftsmanship`,
        `Premium designed by ${brand}`,
        `Designed for maximum durability and satisfaction`
      ];

      const tags = [category, subcategory, brand.toLowerCase(), adj.toLowerCase()];
      const embeddings = getProductEmbedding(category, subcategory, price);

      const productDoc = {
        name,
        description: `Experience the premium performance of our brand new ${name}. Loaded with state-of-the-art parameters in the ${subcategory} subcategory. Hand-crafted by ${brand} using the highest grade resources to fit your daily needs. Discover the elegance and durability you deserve.`,
        price,
        oldPrice,
        category,
        subcategory,
        brand,
        images,
        thumbnail: thumbnailUrl,
        rating: baseRating,
        reviews: [],
        stock,
        features,
        specifications,
        tags,
        discount,
        seller: `${brand} Official Store`,
        popularityScore: 0,
        trendingScore: 0,
        embeddings
      };

      productsToInsert.push(productDoc);
    }

    // Insert Products in batches of 5000
    console.log('💾 Saving products to MongoDB...');
    const batchSize = 5000;
    const totalBatches = Math.ceil(productsToInsert.length / batchSize);
    const savedProductIds = [];

    for (let b = 0; b < totalBatches; b++) {
      const batch = productsToInsert.slice(b * batchSize, (b + 1) * batchSize);
      const inserted = await Product.insertMany(batch);
      
      // Store lightweight items for user session lookup
      inserted.forEach(item => {
        savedProductIds.push(item._id);
        productLookupList.push({
          id: item._id,
          category: item.category,
          subcategory: item.subcategory,
          price: item.price,
          embeddings: item.embeddings
        });
      });
      if ((b + 1) % 5 === 0 || b === totalBatches - 1) {
        console.log(`💾 Processed ${savedProductIds.length} / ${productsToInsert.length} products`);
      }
    }
    console.log('✅ Products saved.');

    // ----------------------------------------
    // 2. Generate 5,000+ Users with demographics
    // ----------------------------------------
    console.log('👥 Generating 5,000+ realistic simulated user profiles...');
    const usersToInsert = [];
    const totalUsers = 5005; // slightly above 5k

    // Pre-hash a default password to avoid CPU lock hashing 5,000 passwords sequentially
    const salt = await bcrypt.genSalt(10);
    const defaultHashedPassword = await bcrypt.hash('picksy123', salt);

    for (let u = 0; u < totalUsers; u++) {
      const gender = (u % 3 === 0) ? 'Female' : (u % 3 === 1) ? 'Male' : 'Non-binary';
      const age = 18 + (u % 53); // 18 to 70
      
      // Select 2-3 interests
      const interestCount = 2 + (u % 2);
      const userInterests = [];
      for (let j = 0; j < interestCount; j++) {
        const item = INTERESTS[(u * 7 + j) % INTERESTS.length];
        if (!userInterests.includes(item)) userInterests.push(item);
      }
      
      const budgetTier = (u % 5 === 0) ? 'Low' : (u % 5 === 4) ? 'High' : 'Medium';
      const location = LOCATIONS[u % LOCATIONS.length];
      const shoppingFrequency = (u % 4 === 0) ? 'Daily' : (u % 4 === 1) ? 'Weekly' : (u % 4 === 2) ? 'Monthly' : 'Occasional';

      // Favorite categories based on interests
      const favCategories = [];
      userInterests.forEach(interest => {
        if (interest === 'tech') favCategories.push('electronics', 'gaming');
        if (interest === 'fashion') favCategories.push('fashion', 'beauty');
        if (interest === 'sports') favCategories.push('sports');
        if (interest === 'cooking') favCategories.push('grocery', 'home_kitchen');
        if (interest === 'decor') favCategories.push('furniture', 'home_kitchen');
        if (interest === 'wellness') favCategories.push('health', 'beauty');
        if (interest === 'toys') favCategories.push('toys');
      });
      // Fallback
      if (favCategories.length === 0) favCategories.push('electronics', 'fashion');

      const firstName = FIRST_NAMES[u % FIRST_NAMES.length];
      const lastName = LAST_NAMES[u % LAST_NAMES.length];
      const fullName = `${firstName} ${lastName}`;
      const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${u}`;
      const email = `${username}@example.com`;

      const demographics = {
        interests: userInterests,
        budgetTier
      };
      const embeddings = getUserEmbedding(demographics);

      const maxPrice = budgetTier === 'Low' ? 2500 : budgetTier === 'Medium' ? 15000 : 300000;

      usersToInsert.push({
        username,
        email,
        password: defaultHashedPassword,
        fullName,
        age,
        gender,
        interests: userInterests,
        shoppingFrequency,
        budgetTier,
        location,
        embeddings,
        preferences: {
          favoriteCategories: [...new Set(favCategories)],
          preferredBrands: [],
          priceRange: { min: 0, max: maxPrice }
        },
        browsingHistory: [],
        purchaseHistory: [],
        cart: []
      });
    }

    console.log('💾 Saving users to MongoDB...');
    const insertedUsers = await User.insertMany(usersToInsert);
    console.log(`✅ Saved ${insertedUsers.length} users.`);

    // Extract user profile stats for quick lookup
    const userLookupList = insertedUsers.map(u => ({
      id: u._id,
      budgetTier: u.budgetTier,
      favCategories: u.preferences.favoriteCategories,
      embeddings: u.embeddings
    }));

    // ----------------------------------------
    // 3. Generate 500,000+ User Interactions
    // ----------------------------------------
    console.log('⚡ Generating 500,000+ interactions & transaction conversions...');
    const interactionsToInsert = [];
    const targetInterests = 505000;

    // Fast dot product helper
    const dotProduct = (v1, v2) => v1.reduce((sum, val, idx) => sum + val * (v2[idx] || 0), 0);

    // Track purchases for frequently bought together computation
    // Structure: userPurchasedList[userId] = Set([productId])
    const userPurchases = {};
    const productCoPurchaseCount = {}; // Map of productId -> { otherProductId -> count }

    let count = 0;
    while (count < targetInterests) {
      // Pick a random user
      const user = userLookupList[count % userLookupList.length];
      const { budgetTier, favCategories, embeddings: userEmb } = user;
      
      // Determine what product they view
      // We narrow search candidates to 100 randomly sampled products to find a fit rapidly
      const candidates = [];
      const sampleSize = 100;
      for (let s = 0; s < sampleSize; s++) {
        const randItem = productLookupList[Math.floor(Math.random() * productLookupList.length)];
        candidates.push(randItem);
      }

      // Score candidates by dot product of embedding plus matching category bonus
      let bestItem = candidates[0];
      let bestScore = -1;

      candidates.forEach(item => {
        let score = dotProduct(userEmb, item.embeddings);
        // Category affinity bonus
        if (favCategories.includes(item.category)) score += 0.3;
        
        if (score > bestScore) {
          bestScore = score;
          bestItem = item;
        }
      });

      const productId = bestItem.id;
      const baseTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 3600 * 1000)); // Last 30 days
      
      // 1. View interaction (100% of cases)
      interactionsToInsert.push({
        userId: user.id,
        productId,
        type: 'view',
        timestamp: baseTime
      });
      count++;

      // 2. Click interaction (35% probability)
      const randClick = Math.random();
      if (randClick < 0.35 && count < targetInterests) {
        interactionsToInsert.push({
          userId: user.id,
          productId,
          type: 'click',
          timestamp: new Date(baseTime.getTime() + 10 * 1000) // 10 seconds later
        });
        count++;

        // 3. Cart addition (12% probability)
        if (Math.random() < 0.12 && count < targetInterests) {
          interactionsToInsert.push({
            userId: user.id,
            productId,
            type: 'cart',
            timestamp: new Date(baseTime.getTime() + 60 * 1000)
          });
          count++;

          // 4. Purchase conversion (5% probability)
          if (Math.random() < 0.05 && count < targetInterests) {
            interactionsToInsert.push({
              userId: user.id,
              productId,
              type: 'purchase',
              timestamp: new Date(baseTime.getTime() + 120 * 1000)
            });
            count++;

            // Record purchase for FBT calculations
            if (!userPurchases[user.id]) userPurchases[user.id] = new Set();
            userPurchases[user.id].add(productId.toString());

            // 5. Rating review (25% probability of rating after purchase)
            if (Math.random() < 0.25 && count < targetInterests) {
              const rating = (Math.random() < 0.8) ? (Math.random() < 0.5 ? 5 : 4) : 3;
              interactionsToInsert.push({
                userId: user.id,
                productId,
                type: 'rating',
                rating,
                timestamp: new Date(baseTime.getTime() + 2 * 3600 * 1000) // 2 hours later
              });
              count++;
            }
          }
        }
        
        // 6. Wishlist addition (4% probability)
        if (Math.random() < 0.04 && count < targetInterests) {
          interactionsToInsert.push({
            userId: user.id,
            productId,
            type: 'wishlist',
            timestamp: new Date(baseTime.getTime() + 30 * 1000)
          });
          count++;
        }
      }

      if (count % 25000 === 0) {
        console.log(`⚡ Scheduled ${count} / ${targetInterests} interaction records`);
      }
    }

    console.log('💾 Saving interactions to MongoDB...');
    const intBatchSize = 10000;
    const totalIntBatches = Math.ceil(interactionsToInsert.length / intBatchSize);
    
    for (let b = 0; b < totalIntBatches; b++) {
      const batch = interactionsToInsert.slice(b * intBatchSize, (b + 1) * intBatchSize);
      await Interaction.insertMany(batch);
      if ((b + 1) % 5 === 0 || b === totalIntBatches - 1) {
        console.log(`💾 Saved ${Math.min((b + 1) * intBatchSize, interactionsToInsert.length)} / ${interactionsToInsert.length} interactions`);
      }
    }
    console.log('✅ Interactions saved.');

    // ----------------------------------------
    // 4. Calculate Co-purchases / Market Basket Co-occurrences
    // ----------------------------------------
    console.log('📊 Calculating co-purchase matrices (Frequently Bought Together)...');
    
    // Group co-purchased items
    Object.values(userPurchases).forEach(purchasedSet => {
      const itemsArr = Array.from(purchasedSet);
      for (let i = 0; i < itemsArr.length; i++) {
        const itemA = itemsArr[i];
        if (!productCoPurchaseCount[itemA]) productCoPurchaseCount[itemA] = {};
        
        for (let j = 0; j < itemsArr.length; j++) {
          if (i === j) continue;
          const itemB = itemsArr[j];
          productCoPurchaseCount[itemA][itemB] = (productCoPurchaseCount[itemA][itemB] || 0) + 1;
        }
      }
    });

    // ----------------------------------------
    // 5. Precompute Similar Products, FBT, Popularity & Trending scores
    // ----------------------------------------
    console.log('📐 Precomputing product similarity lists and trending metrics...');
    
    // Group lookup products by category-subcategory for rapid local Cosine distance scanning
    const groupedProducts = {};
    productLookupList.forEach(p => {
      const key = `${p.category}_${p.subcategory}`;
      if (!groupedProducts[key]) groupedProducts[key] = [];
      groupedProducts[key].push(p);
    });

    // Pre-calculate action counts from interaction data in-memory
    const productViews = {};
    const productPurchases = {};
    const productRecentPurchases = {};

    interactionsToInsert.forEach(action => {
      const pidStr = action.productId.toString();
      if (action.type === 'view') {
        productViews[pidStr] = (productViews[pidStr] || 0) + 1;
      } else if (action.type === 'purchase') {
        productPurchases[pidStr] = (productPurchases[pidStr] || 0) + 1;
        // If purchase happened in the "recent" half of our simulated timeline
        if (action.timestamp.getTime() > (Date.now() - 10 * 24 * 3600 * 1000)) {
          productRecentPurchases[pidStr] = (productRecentPurchases[pidStr] || 0) + 1;
        }
      }
    });

    // Bulk write queue for updating products
    console.log('💾 Running Product updates in MongoDB...');
    const productUpdates = [];
    
    for (let i = 0; i < productLookupList.length; i++) {
      const p = productLookupList[i];
      const pidStr = p.id.toString();

      // 1. Calculate popularity and trending scores
      const views = productViews[pidStr] || 0;
      const purchases = productPurchases[pidStr] || 0;
      const recent = productRecentPurchases[pidStr] || 0;
      
      const popularityScore = Number((views * 0.1 + purchases * 2.0).toFixed(2));
      const trendingScore = Number((recent * 5.0 + (views / 30) * 0.5).toFixed(2));

      // 2. Similar Products (sample 100 siblings for fast distance sorting and minimal GC)
      const key = `${p.category}_${p.subcategory}`;
      let siblings = groupedProducts[key] || [];
      if (siblings.length > 100) {
        const offset = (i * 7) % (siblings.length - 100);
        siblings = siblings.slice(offset, offset + 100);
      }
      const simScores = siblings
        .filter(sib => sib.id.toString() !== pidStr)
        .map(sib => ({
          id: sib.id,
          sim: dotProduct(p.embeddings, sib.embeddings)
        }))
        .sort((a, b) => b.sim - a.sim)
        .slice(0, 6)
        .map(x => x.id);

      // 3. Frequently Bought Together (from co-purchase metrics, fallback to similar items if empty)
      let fbtList = [];
      const coPurchasesMap = productCoPurchaseCount[pidStr];
      if (coPurchasesMap) {
        fbtList = Object.entries(coPurchasesMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(entry => new mongoose.Types.ObjectId(entry[0]));
      }
      
      // Fallback
      if (fbtList.length === 0) {
        fbtList = simScores.slice(0, 3);
      }

      productUpdates.push({
        updateOne: {
          filter: { _id: p.id },
          update: {
            $set: {
              popularityScore,
              trendingScore,
              similarProducts: simScores,
              frequentlyBoughtTogether: fbtList
            }
          }
        }
      });

      if (productUpdates.length >= 5000) {
        await Product.bulkWrite(productUpdates);
        productUpdates.length = 0;
        console.log(`💾 Updated similar matrices for ${i + 1} / ${productLookupList.length} products`);
      }
    }

    if (productUpdates.length > 0) {
      await Product.bulkWrite(productUpdates);
    }
    console.log('✅ Similarities and scores updated.');

    // ----------------------------------------
    // 6. Sync users histories (first 10 items) for logged-in initial states
    // ----------------------------------------
    console.log('🔄 Syncing browsing and purchase histories inside user documents...');
    const userUpdates = [];
    
    // Group interactions by user
    const userHistoryMap = {};
    interactionsToInsert.forEach(action => {
      const uidStr = action.userId.toString();
      if (!userHistoryMap[uidStr]) {
        userHistoryMap[uidStr] = {
          browsing: [],
          purchased: []
        };
      }
      if (action.type === 'view') {
        userHistoryMap[uidStr].browsing.push({ productId: action.productId, viewedAt: action.timestamp });
      } else if (action.type === 'purchase') {
        // Find price of purchased product
        const pInfo = productLookupList.find(x => x.id.toString() === action.productId.toString());
        userHistoryMap[uidStr].purchased.push({
          productId: action.productId,
          price: pInfo ? pInfo.price : 999,
          quantity: 1,
          purchasedAt: action.timestamp
        });
      }
    });

    const insertedUserIds = insertedUsers.map(u => u._id.toString());
    for (let u = 0; u < insertedUserIds.length; u++) {
      const uidStr = insertedUserIds[u];
      const histories = userHistoryMap[uidStr] || { browsing: [], purchased: [] };

      // Slice last 30 items for database document sizing
      const browsingSlice = histories.browsing.sort((a, b) => b.viewedAt - a.viewedAt).slice(0, 30);
      const purchasedSlice = histories.purchased.sort((a, b) => b.purchasedAt - a.purchasedAt).slice(0, 30);

      userUpdates.push({
        updateOne: {
          filter: { _id: new mongoose.Types.ObjectId(uidStr) },
          update: {
            $set: {
              browsingHistory: browsingSlice,
              purchaseHistory: purchasedSlice
            }
          }
        }
      });

      if (userUpdates.length >= 1000) {
        await User.bulkWrite(userUpdates);
        userUpdates.length = 0;
      }
    }
    if (userUpdates.length > 0) {
      await User.bulkWrite(userUpdates);
    }
    console.log('✅ Users documents synced with history logs.');

    console.log('🏁 DATASEEDING PROCESS COMPLETED SUCCESSFULLY.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Data Seeding failed with error:', error);
    process.exit(1);
  }
}

runSeeder();
