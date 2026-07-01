const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const products = [
  // --- ELECTRONICS / LAPTOPS ---
  {
    name: "Apple MacBook Pro 16-inch",
    description: "The ultimate pro laptop, supercharged by the M3 Max chip. Features a stunning 16.2-inch Liquid Retina XDR display, up to 22 hours of battery life, and an advanced thermal system to handle heavy developer workloads and 8K video editing with ease.",
    price: 249900,
    category: "electronics",
    subcategory: "laptops",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 15,
    features: [
      "Apple M3 Max chip with 16-core CPU and 40-core GPU",
      "16.2-inch Liquid Retina XDR display with ProMotion (120Hz)",
      "48GB Unified Memory and 1TB superfast SSD storage",
      "Up to 22 hours of battery life with 140W USB-C fast charging"
    ],
    tags: ["macbook", "apple", "laptop", "developer", "m3 max"],
    reviews: [
      { rating: 5, comment: "Absolutely incredible performance. Compiles huge codebases in seconds.", date: new Date("2026-02-15") },
      { rating: 4, comment: "Extremely fast, but very expensive. The screen is the best I've ever seen.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "Dell XPS 13 Plus",
    description: "A futuristic 13-inch laptop crafted from CNC-machined aluminum. Features a seamless glass haptic touchpad, borderless infinity edge display, and capacitive touch function row. Supercharged by 13th Gen Intel Core i7.",
    price: 189990,
    category: "electronics",
    subcategory: "laptops",
    brand: "Dell",
    images: [
      "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 20,
    features: [
      "13th Gen Intel Core i7-1360P Processor (Up to 5.0 GHz)",
      "13.4-inch UHD+ (3840x2400) InfinityEdge Touch display",
      "32GB LPDDR5 RAM and 1TB M.2 PCIe NVMe SSD",
      "Zero-lattice keyboard with capacitive touch function keys"
    ],
    tags: ["dell", "xps", "ultrabook", "windows", "intel"],
    reviews: [
      { rating: 5, comment: "Beautiful design, looks like a spaceship. Touchpad works seamlessly.", date: new Date("2026-01-20") },
      { rating: 4, comment: "Great screen and build, but battery life is just decent.", date: new Date("2026-02-10") }
    ]
  },
  {
    name: "Lenovo Legion Pro 5 Gen 8",
    description: "Unleash ultimate gaming capabilities with the AI-tuned Legion Pro 5. Packed with AMD Ryzen 7 and NVIDIA GeForce RTX 4070, it delivers maximum frames and buttery smooth gaming performance with Legion Coldfront 5.0 cooling.",
    price: 145990,
    category: "electronics",
    subcategory: "laptops",
    brand: "Lenovo",
    images: [
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 12,
    features: [
      "AMD Ryzen 7 7745HX Processor (8 Cores / 16 Threads)",
      "NVIDIA GeForce RTX 4070 8GB GDDR6 Graphics (140W TGP)",
      "16-inch WQXGA (2560x1600) IPS Display, 240Hz, G-Sync",
      "16GB DDR5 RAM (Upgradable) and 1TB PCIe Gen4 SSD"
    ],
    tags: ["gaming", "lenovo", "legion", "rtx4070", "ryzen"],
    reviews: [
      { rating: 5, comment: "Plays everything at Ultra settings. Thermals are very well controlled.", date: new Date("2026-03-05") }
    ]
  },
  {
    name: "ASUS ROG Zephyrus G14",
    description: "The ultimate compact gaming machine. Offers a gorgeous 14-inch Nebula OLED display, premium all-metal chassis, and a customizable AniMe Matrix LED lid, all while weighing only 1.5kg.",
    price: 164990,
    category: "electronics",
    subcategory: "laptops",
    brand: "ASUS",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 8,
    features: [
      "AMD Ryzen 9 8945HS Processor with Ryzen AI",
      "NVIDIA GeForce RTX 4060 8GB GDDR6 Laptop GPU",
      "14-inch 3K (2880x1800) 120Hz ROG Nebula OLED display",
      "16GB LPDDR5X RAM and 1TB PCIe 4.0 NVMe SSD"
    ],
    tags: ["asus", "rog", "zephyrus", "gaming-laptop", "oled"],
    reviews: [
      { rating: 5, comment: "The OLED display is jaw-dropping. Perfect mix of portability and power.", date: new Date("2026-03-12") }
    ]
  },
  {
    name: "HP Spectre x360 2-in-1",
    description: "A luxury convertible laptop designed for creators. Rotate the 360-degree hinge to transition between laptop, tablet, and tent modes. Features a stunning 14-inch 2.8K OLED touch screen and a bundled HP Rechargeable MPP 2.0 Tilt Pen.",
    price: 159990,
    category: "electronics",
    subcategory: "laptops",
    brand: "HP",
    images: [
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 10,
    features: [
      "Intel Core Ultra 7 155H (16 Cores, Up to 4.8 GHz)",
      "14-inch 2.8K (2880x1800) OLED Touchscreen display, 120Hz",
      "32GB LPDDR5x RAM and 1TB PCIe NVMe Gen4 SSD",
      "9MP AI Camera with Auto Frame and Low Light adjustment"
    ],
    tags: ["hp", "spectre", "convertible", "touchscreen", "stylus"],
    reviews: [
      { rating: 4, comment: "Very elegant build. The stylus is highly responsive for digital art.", date: new Date("2026-02-18") }
    ]
  },

  // --- ELECTRONICS / SMARTPHONES ---
  {
    name: "iPhone 15 Pro Max",
    description: "Forged in titanium, featuring the groundbreaking A17 Pro chip, a customizable Action button, and the most powerful iPhone camera system ever with 5x telephoto optical zoom.",
    price: 159900,
    category: "electronics",
    subcategory: "smartphones",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 25,
    features: [
      "Titanium design with textured matte glass back",
      "A17 Pro chip with 6-core GPU for console-level gaming",
      "Pro camera system: 48MP Main, 12MP Ultra Wide, and 12MP 5x Telephoto",
      "USB-C connector with support for USB 3 speeds up to 10Gbps"
    ],
    tags: ["iphone", "apple", "smartphone", "ios", "titanium"],
    reviews: [
      { rating: 5, comment: "Camera details are insane. Action button is highly useful.", date: new Date("2026-01-10") },
      { rating: 4, comment: "Excellent phone but price is extremely premium.", date: new Date("2026-02-28") }
    ]
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Welcome to the era of mobile AI. Galaxy S24 Ultra unlocks new levels of creativity and productivity. Includes the integrated S Pen, a titanium frameset, and a 200MP camera system.",
    price: 129999,
    category: "electronics",
    subcategory: "smartphones",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 30,
    features: [
      "Galaxy AI: Live Translate, Circle to Search, Photo Assist",
      "Snapdragon 8 Gen 3 for Galaxy with optimized thermal chamber",
      "Quad Telephoto System with 50MP 5x optical zoom camera",
      "Built-in S Pen for writing, drawing, and remote navigation"
    ],
    tags: ["samsung", "galaxy", "s24", "ultra", "android", "ai"],
    reviews: [
      { rating: 5, comment: "Galaxy AI features like Circle to Search are actually game changers.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "OnePlus 12",
    description: "Define the new smooth. OnePlus 12 combines elite hardware with software optimizations to deliver the fast and smooth flagship experience. Features 100W SuperVOOC fast charging.",
    price: 64999,
    category: "electronics",
    subcategory: "smartphones",
    brand: "OnePlus",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 40,
    features: [
      "Snapdragon 8 Gen 3 Mobile Platform",
      "4th Gen Hasselblad Camera for Mobile (50MP + 64MP + 48MP)",
      "2K 120Hz ProXDR display with Aqua Touch",
      "5400mAh battery with 100W SUPERVOOC wired charging"
    ],
    tags: ["oneplus", "flagship", "fastcharge", "android"],
    reviews: [
      { rating: 5, comment: "Charges from zero to full in 25 minutes. Extremely smooth display.", date: new Date("2026-02-14") }
    ]
  },
  {
    name: "Google Pixel 8 Pro",
    description: "The all-pro phone engineered by Google. Offers Pixel's best-ever camera, Google AI integration, and the Google Tensor G3 chip for custom performance and audio eraser features.",
    price: 109999,
    category: "electronics",
    subcategory: "smartphones",
    brand: "Google",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 18,
    features: [
      "Google Tensor G3 chip with Titan M2 security coprocessor",
      "6.7-inch Super Actua display (1Hz - 120Hz dynamic refresh)",
      "Pro Camera system: 50MP Main, 48MP Ultra Wide, 48MP Telephoto",
      "Best-in-class AI photo editing: Magic Editor, Best Take"
    ],
    tags: ["google", "pixel", "android", "camera", "pixel-ai"],
    reviews: [
      { rating: 5, comment: "The photo processing is unmatched. Magic Editor works like wizardry.", date: new Date("2026-03-08") }
    ]
  },
  {
    name: "Nothing Phone (2)",
    description: "A unique design featuring the Glyph Interface. Nothing Phone (2) brings a clean, custom OS, a premium dual rear camera setup, and a transparent glass aesthetic that turns heads.",
    price: 44999,
    category: "electronics",
    subcategory: "smartphones",
    brand: "Nothing",
    images: [
      "https://images.unsplash.com/photo-1565849906661-09a6c7216146?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 22,
    features: [
      "Unique transparent design with customizable Glyph lights",
      "Nothing OS 2.0 with custom widgets and animations",
      "Snapdragon 8+ Gen 1 Processor",
      "Dual 50MP rear cameras and 32MP front camera"
    ],
    tags: ["nothing", "phone2", "glyph", "android", "transparent"],
    reviews: [
      { rating: 4, comment: "Software is clean and bloatware free. Glyph lights are fun to use.", date: new Date("2026-02-25") }
    ]
  },

  // --- ELECTRONICS / AUDIO ---
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading active noise canceling wireless headphones. Features two processors controlling 8 microphones, Auto NC Optimizer, and exceptional call quality with precise voice pickup.",
    price: 29990,
    category: "electronics",
    subcategory: "audio",
    brand: "Sony",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 35,
    features: [
      "Industry Leading Noise Canceling with HD Noise Canceling Processor QN1",
      "Up to 30 hours of battery life with quick charging (3 min for 3 hours)",
      "Speak-to-chat technology automatically pauses music when you talk",
      "Ultra-comfortable, lightweight design with soft fit leather"
    ],
    tags: ["sony", "headphones", "anc", "audio", "wireless"],
    reviews: [
      { rating: 5, comment: "ANC block out literally everything. Perfect for office environments.", date: new Date("2026-02-10") },
      { rating: 4, comment: "Sound quality is amazing, but doesn't fold flat like the XM4.", date: new Date("2026-03-03") }
    ]
  },
  {
    name: "Bose QuietComfort Ultra",
    description: "Bose's flagship wireless headphones with breakthrough spatialized audio for more immersive listening. QuietComfort Ultra offers custom-tailored sound and world-class noise cancellation.",
    price: 35900,
    category: "electronics",
    subcategory: "audio",
    brand: "Bose",
    images: [
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 20,
    features: [
      "CustomTune technology calibrates audio to your ears",
      "Bose Immersive Audio pushes boundaries of spatial sound",
      "Up to 24 hours of battery life per charge",
      "World-class Quiet Mode, Aware Mode, and Immersion Mode"
    ],
    tags: ["bose", "headphones", "anc", "spatial-audio"],
    reviews: [
      { rating: 5, comment: "Unbelievable comfort, I can wear these all day. Noise canceling is stellar.", date: new Date("2026-02-28") }
    ]
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    description: "Re-engineered with up to 2x more Active Noise Cancellation. Features Adaptive Audio, Personalized Spatial Audio, and a MagSafe Charging Case with Speaker and Precision Finding.",
    price: 24900,
    category: "electronics",
    subcategory: "audio",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1588449668365-d15e397f6787?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 50,
    features: [
      "Apple H2 chip, driving custom audio performance",
      "Adaptive Audio dynamically blends ANC and Transparency modes",
      "Up to 6 hours of listening time with ANC enabled",
      "Dust, sweat, and water resistant (IP54) earbuds and case"
    ],
    tags: ["airpods", "apple", "earbuds", "wireless", "ios"],
    reviews: [
      { rating: 5, comment: "The integration with iPhone is flawless. Soundstage is surprisingly wide.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "boAt Nirvana Ion",
    description: "Affordable true wireless earbuds that punch way above their price. Boasts a massive 120 hours of total playback time, crystal clear calls with quad mics, and boAt Signature Sound.",
    price: 2499,
    category: "electronics",
    subcategory: "audio",
    brand: "boAt",
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop"
    ],
    rating: 4.2,
    stock: 120,
    features: [
      "Up to 24 hours of playback per earbud; 120 hours total with case",
      "Dual EQ modes: boAt Balanced Sound and boAt Signature Sound",
      "ENx Quad Mics for crystal clear voice calls",
      "Beast Mode with low latency (60ms) for mobile gaming"
    ],
    tags: ["boat", "earbuds", "cheap", "bass", "longbattery"],
    reviews: [
      { rating: 4, comment: "Battery life literally lasts forever. Bass is very punchy.", date: new Date("2026-03-05") }
    ]
  },
  {
    name: "JBL Tour One M2",
    description: "Smart over-ear wireless headphones with True Adaptive Noise Canceling. JBL Tour One M2 uses JBL Pro Sound to deliver high-resolution audio with custom curves via Personi-Fi 2.0.",
    price: 21999,
    category: "electronics",
    subcategory: "audio",
    brand: "JBL",
    images: [
      "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 15,
    features: [
      "True Adaptive Noise Canceling with Smart Ambient features",
      "4-mic superior calls with voice control technology",
      "Up to 50 hours of playback, or 30 hours with ANC turned on",
      "Personi-Fi 2.0 customize your sound profile to match your hearing"
    ],
    tags: ["jbl", "headphones", "anc", "highres"],
    reviews: [
      { rating: 4, comment: "JBL sound signature is very lively. Solid noise canceling.", date: new Date("2026-01-15") }
    ]
  },

  // --- ELECTRONICS / WEARABLES ---
  {
    name: "Apple Watch Ultra 2",
    description: "The most rugged and capable Apple Watch. Powered by the S9 SIP, featuring a ridiculously bright display, custom Action button, and up to 36 hours of battery life for outdoor endurance athletes.",
    price: 89900,
    category: "electronics",
    subcategory: "wearables",
    brand: "Apple",
    images: [
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 10,
    features: [
      "Corrosion-resistant titanium case with 100m water resistance",
      "Double tap gesture: interact with your watch without touching the screen",
      "Precision dual-frequency GPS coordinates for advanced maps",
      "Always-On Retina display with up to 3000 nits peak brightness"
    ],
    tags: ["applewatch", "ultra", "smartwatch", "fitness", "titanium"],
    reviews: [
      { rating: 5, comment: "The screen is readable in blinding sunlight. Battery lasts 3 days easily.", date: new Date("2026-02-28") }
    ]
  },
  {
    name: "Samsung Galaxy Watch 6 Classic",
    description: "The classic returns with a rotating bezel. Galaxy Watch 6 Classic provides personalized heart rate zone monitoring, sleep coaching, and bioelectrical impedance analysis (BIA) body composition readings.",
    price: 36999,
    category: "electronics",
    subcategory: "wearables",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 25,
    features: [
      "Iconic physical rotating bezel for quick menu navigation",
      "Advanced sleep coaching and detailed heart health monitoring",
      "BIA Sensor: measure body fat, skeletal muscle, and body water",
      "Seamless integration with Samsung Galaxy Android ecosystem"
    ],
    tags: ["samsung", "watch6", "smartwatch", "wearos", "android"],
    reviews: [
      { rating: 5, comment: "The rotating bezel feels so satisfying. Sleep tracking is very accurate.", date: new Date("2026-03-10") }
    ]
  },
  {
    name: "Garmin Forerunner 965",
    description: "Premium GPS running and triathlon smartwatch with a brilliant AMOLED touchscreen display. Loaded with training metrics, recovery insights, and preloaded color mapping features.",
    price: 67490,
    category: "electronics",
    subcategory: "wearables",
    brand: "Garmin",
    images: [
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 8,
    features: [
      "1.4-inch colorful AMOLED display with titanium bezel",
      "Up to 23 days of battery life in smartwatch mode",
      "Advanced training readiness score and training load metrics",
      "Full-color built-in maps and turn-by-turn navigation guidance"
    ],
    tags: ["garmin", "running", "gpswatch", "fitness", "triathlon"],
    reviews: [
      { rating: 5, comment: "Unbeatable metrics for athletes. The AMOLED screen makes a huge difference.", date: new Date("2026-02-22") }
    ]
  },
  {
    name: "Fitbit Charge 6",
    description: "Advanced health and fitness tracker with built-in GPS, active zone minutes, EDA stress management sensors, and direct Google Maps & YouTube Music controls on your wrist.",
    price: 14999,
    category: "electronics",
    subcategory: "wearables",
    brand: "Fitbit",
    images: [
      "https://images.unsplash.com/photo-1557438159-51eec7a6c9e8?w=600&auto=format&fit=crop"
    ],
    rating: 4.3,
    stock: 30,
    features: [
      "Built-in GPS to track pace and distance without your phone",
      "EDA Scan sensor for stress response and skin temperature tracking",
      "Heart rate tracking with ECG app to check for atrial fibrillation",
      "7-day battery life with water resistance up to 50 meters"
    ],
    tags: ["fitbit", "tracker", "fitness", "heartrate", "sleep"],
    reviews: [
      { rating: 4, comment: "Compact and light. Perfect if you don't want a bulky smartwatch.", date: new Date("2026-03-05") }
    ]
  },
  {
    name: "Noise ColorFit Pro 5",
    description: "Popular budget smartwatch featuring a large AMOLED screen, bluetooth calling, extensive health tracking suite, and multiple customizable watch faces with quick straps.",
    price: 3499,
    category: "electronics",
    subcategory: "wearables",
    brand: "Noise",
    images: [
      "https://images.unsplash.com/photo-1517502884422-41eaaced0168?w=600&auto=format&fit=crop"
    ],
    rating: 4.1,
    stock: 150,
    features: [
      "1.96-inch AMOLED display with Always-On display feature",
      "TruSync Bluetooth Calling: instant connection and stable calls",
      "Noise Health Suite: SpO2 tracker, 24/7 Heart Rate, Stress monitor",
      "100+ Sports modes and customizable watch faces"
    ],
    tags: ["noise", "smartwatch", "budget", "calling", "amoled"],
    reviews: [
      { rating: 4, comment: "Exceptional value for money. Screen is bright and calls are clear.", date: new Date("2026-03-09") }
    ]
  },

  // --- ELECTRONICS / TELEVISIONS ---
  {
    name: "Sony Bravia XR 65-inch OLED",
    description: "Premium OLED 4K TV powered by the Cognitive Processor XR. Delivers deep blacks and lifelike brightness with pure OLED contrast, accompanied by acoustic surface audio sound direct from the screen.",
    price: 219900,
    category: "electronics",
    subcategory: "televisions",
    brand: "Sony",
    images: [
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593789198777-f29bc259780e?w=600&auto=format&fit=crop"
    ],
    rating: 4.9,
    stock: 5,
    features: [
      "Cognitive Processor XR mimics human vision and hearing",
      "XR OLED Contrast Pro for vibrant colors and absolute blacks",
      "Acoustic Surface Audio+: the screen IS the speaker",
      "Google TV with Google Assistant search and hands-free voice control"
    ],
    tags: ["sony", "bravia", "oled", "tv", "smarttv", "4k"],
    reviews: [
      { rating: 5, comment: "Picture quality is jaw-dropping. Movie night will never be the same.", date: new Date("2026-02-18") }
    ]
  },
  {
    name: "LG C3 55-inch 4K OLED",
    description: "The gaming TV of choice. Packed with OLED evo technology, the advanced a9 AI Processor Gen6, 120Hz refresh rates, Dolby Vision, G-Sync, and FreeSync compatibility for unmatched responsive gameplay.",
    price: 139990,
    category: "electronics",
    subcategory: "televisions",
    brand: "LG",
    images: [
      "https://images.unsplash.com/photo-1552975084-6e027cd345c2?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 8,
    features: [
      "LG OLED evo: self-lit pixels with increased brightness boosters",
      "a9 AI Processor Gen6 for optimized image and sound filters",
      "Ultra gaming support: 0.1ms response time, 4x HDMI 2.1 inputs",
      "Dolby Vision IQ and Dolby Atmos spatial audio"
    ],
    tags: ["lg", "c3", "oled", "gamingtv", "smarttv", "120hz"],
    reviews: [
      { rating: 5, comment: "Amazing for PS5. Low latency and gorgeous colors.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "Samsung Neo QLED 65-inch 4K",
    description: "Brilliant 4K TV utilizing Quantum Mini LEDs for ultra-precise light control. Features Neo Quantum Processor 4K, anti-glare screen filters, and Dolby Atmos audio.",
    price: 174990,
    category: "electronics",
    subcategory: "televisions",
    brand: "Samsung",
    images: [
      "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 6,
    features: [
      "Quantum Matrix Technology: micro-LED light control",
      "Neo Quantum Processor 4K with deep learning upscaling",
      "Dolby Atmos and Object Tracking Sound (OTS) audio",
      "Sleek NeoSlim design that looks stunning from any angle"
    ],
    tags: ["samsung", "qled", "smarttv", "4ktv", "neoqled"],
    reviews: [
      { rating: 4, comment: "Gets incredibly bright, perfect for my brightly lit living room.", date: new Date("2026-01-28") }
    ]
  },
  {
    name: "Xiaomi Smart TV X 55-inch",
    description: "Budget-friendly 55-inch 4K HDR smart TV featuring a bezelless design, Dolby Vision, PatchWall integration, and powerful 30W speakers with DTS-Virtual:X.",
    price: 37999,
    category: "electronics",
    subcategory: "televisions",
    brand: "Xiaomi",
    images: [
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600&auto=format&fit=crop"
    ],
    rating: 4.3,
    stock: 20,
    features: [
      "4K Ultra HD resolution with Dolby Vision and HDR10 support",
      "PatchWall with Android TV: massive content curation and apps",
      "30W Speaker Output with Dolby Audio and DTS-HD",
      "Dual-band Wi-Fi and 3x HDMI ports"
    ],
    tags: ["xiaomi", "mitv", "budgettv", "4k", "smarttv"],
    reviews: [
      { rating: 5, comment: "Absolutely value for money. Interface is fast and picture is clean.", date: new Date("2026-03-02") }
    ]
  },

  // --- FOOTWEAR / RUNNING ---
  {
    name: "Nike Air Zoom Pegasus 40",
    description: "A springy ride for every run, the Peg's familiar, just-for-you feel returns to help you accomplish your goals. Features React foam and dual Zoom Air units to cushion impact.",
    price: 11995,
    category: "footwear",
    subcategory: "running",
    brand: "Nike",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 45,
    features: [
      "Nike React technology is a lightweight, durable foam for a smooth ride",
      "2 Zoom Air units (at forefoot and heel) provide an energized takeoff",
      "Highly tuned single-layer mesh upper for breathable comfort",
      "Waffle-inspired rubber outsole delivers traction on road runs"
    ],
    tags: ["nike", "pegasus", "running", "shoes", "sneakers"],
    reviews: [
      { rating: 5, comment: "My go-to running shoe. Fits perfectly, excellent cushion.", date: new Date("2026-02-20") },
      { rating: 4, comment: "Solid daily trainer. A bit warm during summer runs.", date: new Date("2026-03-05") }
    ]
  },
  {
    name: "Adidas Ultraboost Light",
    description: "Experience epic energy with the lightest Ultraboost ever. The secret is the new generation of Adidas Light BOOST midsole cushioning that returns massive energy on road runs.",
    price: 18999,
    category: "footwear",
    subcategory: "running",
    brand: "Adidas",
    images: [
      "https://images.unsplash.com/photo-1587563871167-1ee9c131a9eb?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 30,
    features: [
      "Lightweight BOOST cushioning midsole for maximum shock absorption",
      "Primeknit+ textile upper fits like a sock, conforming to your foot",
      "Continental Better Rubber outsole provides elite wet and dry grip",
      "Linear Energy Push system increases forefoot and midfoot stiffness"
    ],
    tags: ["adidas", "ultraboost", "running", "cushion", "sneakers"],
    reviews: [
      { rating: 5, comment: "Walking on clouds. The best lifestyle/running hybrid shoe.", date: new Date("2026-03-12") }
    ]
  },
  {
    name: "ASICS Gel-Kayano 30",
    description: "From 5Ks to full marathons, the GEL-KAYANO 30 shoe is designed to provide advanced stability and softer cushioning. Features 4D Guidance System stability tech.",
    price: 15999,
    category: "footwear",
    subcategory: "running",
    brand: "ASICS",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 25,
    features: [
      "4D Guidance System provides adaptive stability for overpronation",
      "PureGEL technology under heel gives lightweight impact absorption",
      "FF BLAST PLUS ECO cushioning delivers plush cloud-like comfort",
      "OrthoLite X-55 sockliner offers breathable step-in comfort"
    ],
    tags: ["asics", "kayano", "stability", "running", "marathon"],
    reviews: [
      { rating: 5, comment: "Cured my knee pain. Excellent guidance shoe for flat feet.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "Puma Velocity Nitro 3",
    description: "A lightweight daily trainer offering high cushion, grip, and responsivity. Infused with Puma's NITRO foam for explosive energy response.",
    price: 10999,
    category: "footwear",
    subcategory: "running",
    brand: "Puma",
    images: [
      "https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 35,
    features: [
      "NITRO foam: Advanced nitrogen-injected foam for response",
      "PUMAGRIP: Durable performance rubber compound for traction",
      "Engineered mesh upper with targeted PWRTAPE reinforcements",
      "TPU heel spoiler for stability and support"
    ],
    tags: ["puma", "nitro", "running", "budget-trainer"],
    reviews: [
      { rating: 5, comment: "PUMAGRIP has the best grip on wet roads. Highly responsive.", date: new Date("2026-02-14") }
    ]
  },

  // --- FOOTWEAR / CASUAL ---
  {
    name: "Converse Chuck Taylor All Star",
    description: "The iconic, timeless sneaker. Featuring a durable canvas upper, rubber sole, and the signature ankle patch. A staple for casual wardrobes since 1917.",
    price: 4299,
    category: "footwear",
    subcategory: "casual",
    brand: "Converse",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=600&auto=format&fit=crop"
    ],
    rating: 4.3,
    stock: 60,
    features: [
      "High-top canvas sneaker silhouette",
      "Durable rubber outsole for everyday traction",
      "Medial eyelets enhance airflow to keep feet cool",
      "Timeless design matches with jeans, shorts, and skirts"
    ],
    tags: ["converse", "canvas", "classic", "casual", "sneakers"],
    reviews: [
      { rating: 5, comment: "Classic. Goes with literally any outfit.", date: new Date("2026-01-15") }
    ]
  },
  {
    name: "Adidas Originals Superstar",
    description: "The legendary shell-toe shoe. Originally built for basketball courts in the 70s, it has evolved into a street style legend. Features full grain leather and serrated 3-stripes.",
    price: 8999,
    category: "footwear",
    subcategory: "casual",
    brand: "Adidas",
    images: [
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 40,
    features: [
      "Full grain leather upper for comfort and soft feel",
      "Iconic rubber shell toe for heritage style and protection",
      "Serrated leather 3-stripes and Trefoil logo details",
      "Herringbone-pattern rubber cupsole for durable traction"
    ],
    tags: ["adidas", "superstar", "retro", "leather", "casual"],
    reviews: [
      { rating: 5, comment: "Timeless sneakers. Durable build, leather holds up well.", date: new Date("2026-02-18") }
    ]
  },
  {
    name: "Puma Suede Classic",
    description: "The shoe that defined generations. Suede has been hitting the streets since 1968. Features a premium suede upper, metallic branding, and the famous Puma Formstrip.",
    price: 6999,
    category: "footwear",
    subcategory: "casual",
    brand: "Puma",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 30,
    features: [
      "Classic low-top silhouette with full suede upper",
      "Synthetic leather lining for added interior comfort",
      "Rubber cupsole for maximum traction and grip",
      "Contrast leather PUMA Formstrip at lateral sides"
    ],
    tags: ["puma", "suede", "classic", "streetwear", "sneakers"],
    reviews: [
      { rating: 4, comment: "Looks incredibly clean. Make sure to buy a suede cleaner!", date: new Date("2026-03-04") }
    ]
  },
  {
    name: "Reebok Club C 85",
    description: "Clean minimalist tennis-style sneakers. A soft leather upper gives a heritage court look, while a lightweight EVA midsole cushions every step.",
    price: 6599,
    category: "footwear",
    subcategory: "casual",
    brand: "Reebok",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 25,
    features: [
      "Premium soft leather upper for supportive comfort",
      "Low-cut design for freedom of motion at the ankles",
      "Molded sockliner and die-cut EVA midsole cushioning",
      "High-abrasion rubber outsole adds durable responsiveness"
    ],
    tags: ["reebok", "clubc", "minimalist", "white-sneakers", "leather"],
    reviews: [
      { rating: 5, comment: "The perfect white sneaker. Super comfortable out of the box.", date: new Date("2026-02-26") }
    ]
  },

  // --- FOOTWEAR / SPORTS ---
  {
    name: "Under Armour Hovr Phantom 3",
    description: "High-performance sports shoes featuring UA HOVR cushioning that returns energy, a breathable knit collar, and a molded midfoot panel for structure.",
    price: 14999,
    category: "footwear",
    subcategory: "sports",
    brand: "Under Armour",
    images: [
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 20,
    features: [
      "UA IntelliKnit upper for a breathable, sock-like fit",
      "Responsive UA HOVR cushioning reduces impact and returns energy",
      "Ultra-breathable SpeedForm 2.0 sockliner provides soft support",
      "Full rubber outsole with strategic pattern for elevated traction"
    ],
    tags: ["underarmour", "hovr", "sports", "training", "gym"],
    reviews: [
      { rating: 5, comment: "Excellent lock down for gym workouts and short runs.", date: new Date("2026-03-11") }
    ]
  },
  {
    name: "Decathlon Kalenji Run Active",
    description: "Simple, comfortable, and affordable sports shoes. Perfect for beginners starting their fitness or walking journey.",
    price: 1999,
    category: "footwear",
    subcategory: "sports",
    brand: "Decathlon",
    images: [
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=600&auto=format&fit=crop"
    ],
    rating: 4.1,
    stock: 80,
    features: [
      "CS technology in the heel absorbs shock during runs",
      "Very lightweight shoe weighing only 240g",
      "Synthetic bands to hold your foot secure while running",
      "Breathable mesh upper keeps feet dry"
    ],
    tags: ["decathlon", "kalenji", "budget", "sports", "beginners"],
    reviews: [
      { rating: 4, comment: "Good entry level shoe. Lightweight and soft.", date: new Date("2026-03-01") }
    ]
  },

  // --- CLOTHING / JEANS ---
  {
    name: "Levi's 511 Slim Fit Jeans",
    description: "A modern slim with room to move. The 511 Slim Fit Jeans are a classic since day one, cut close but not too close. Features a zip fly and classic 5-pocket styling.",
    price: 3599,
    category: "clothing",
    subcategory: "jeans",
    brand: "Levi's",
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 50,
    features: [
      "Slim through the seat and thigh, with a slim leg",
      "Premium denim with a hint of stretch for comfort",
      "Classic 5-pocket design with signature Arcuate stitching",
      "Made with Water Less techniques to reduce environmental impact"
    ],
    tags: ["levis", "jeans", "slimfit", "denim", "clothing"],
    reviews: [
      { rating: 5, comment: "Best fit ever. Stretching makes it comfortable to wear all day.", date: new Date("2026-02-15") }
    ]
  },
  {
    name: "Pepe Jeans Regular Fit",
    description: "Classic straight-cut denim jeans from Pepe. Designed with durable cotton blend denim and washed style details for a vintage look.",
    price: 2799,
    category: "clothing",
    subcategory: "jeans",
    brand: "Pepe Jeans",
    images: [
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=600&auto=format&fit=crop"
    ],
    rating: 4.2,
    stock: 45,
    features: [
      "Regular fit through waist and legs",
      "Durable 98% cotton, 2% elastane blend",
      "Medium wash style with hand-sanded highlights",
      "Machine washable with fade resistance"
    ],
    tags: ["pepe", "jeans", "regularfit", "denim"],
    reviews: [
      { rating: 4, comment: "Nice quality denim, straight fit is very comfortable.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "Tommy Hilfiger Slim Jeans",
    description: "Premium designer slim-fit jeans featuring Tommy Hilfiger signature tape branding on the coin pocket and leather flag logo on the rear waistband.",
    price: 6999,
    category: "clothing",
    subcategory: "jeans",
    brand: "Tommy Hilfiger",
    images: [
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 20,
    features: [
      "Premium stretch cotton denim with recycling contents",
      "Slim fit with tapered legs",
      "Hilfiger flag patch and coin pocket detailing",
      "Button closures with branded metal hardware"
    ],
    tags: ["tommy", "jeans", "premium", "slim", "designer"],
    reviews: [
      { rating: 5, comment: "High quality material. Soft and fits like a glove.", date: new Date("2026-02-20") }
    ]
  },

  // --- CLOTHING / T-SHIRTS ---
  {
    name: "Peter England Polo T-Shirt",
    description: "Smart casual polo shirt crafted from premium honeycomb cotton. Featuring a ribbed collar, two-button placket, and embroidered brand logo on the chest.",
    price: 999,
    category: "clothing",
    subcategory: "tshirts",
    brand: "Peter England",
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&auto=format&fit=crop"
    ],
    rating: 4.2,
    stock: 80,
    features: [
      "100% Premium Honeycomb Cotton fabric",
      "Regular fit with ribbed collar and cuffs",
      "Embroidery detail on the left chest",
      "Available in multiple solid classic colors"
    ],
    tags: ["peterengland", "polo", "tshirt", "casual", "cotton"],
    reviews: [
      { rating: 4, comment: "Good quality polo for formal/casual office days.", date: new Date("2026-02-27") }
    ]
  },
  {
    name: "Adidas Graphic Tee",
    description: "Sporty cotton crewneck tee featuring the bold Adidas Badge of Sport graphic. Perfect for training sessions or everyday streetwear.",
    price: 1499,
    category: "clothing",
    subcategory: "tshirts",
    brand: "Adidas",
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 60,
    features: [
      "100% Cotton Single Jersey fabric",
      "Ribbed crewneck holds shape after washing",
      "Adidas partner with Better Cotton Initiative",
      "Bold rubber print graphic on chest"
    ],
    tags: ["adidas", "tshirt", "graphictee", "sports", "streetwear"],
    reviews: [
      { rating: 5, comment: "Very soft cotton. Graphic print is premium and doesn't crack.", date: new Date("2026-03-02") }
    ]
  },
  {
    name: "Jack & Jones Crew Neck",
    description: "Classic solid crewneck tee. Extremely soft, lightweight, and breathable, making it a perfect base layer for any casual outfit.",
    price: 899,
    category: "clothing",
    subcategory: "tshirts",
    brand: "Jack & Jones",
    images: [
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop"
    ],
    rating: 4.1,
    stock: 100,
    features: [
      "100% Combed Cotton fabric for soft hand feel",
      "Slim fit silhouette that hugs the shoulders",
      "Reinforced neck tape for durability",
      "Minimalist brand tag on the hem"
    ],
    tags: ["jackjones", "tshirt", "basics", "crewneck"],
    reviews: [
      { rating: 4, comment: "Comfortable basic t-shirt. True to size.", date: new Date("2026-02-28") }
    ]
  },

  // --- CLOTHING / SHIRTS ---
  {
    name: "Allen Solly Casual Shirt",
    description: "Trendy checkered casual shirt crafted from breathable cotton. Features a button-down collar, curved hem, and patch pocket on the chest.",
    price: 2199,
    category: "clothing",
    subcategory: "shirts",
    brand: "Allen Solly",
    images: [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop"
    ],
    rating: 4.3,
    stock: 35,
    features: [
      "100% Cotton woven fabric with breathable weave",
      "Slim fit structure with button-down collar",
      "Chest pocket with embroidered Solly logo",
      "Curved hem looks great tucked in or out"
    ],
    tags: ["allensolly", "shirt", "casualshirt", "checkered", "cotton"],
    reviews: [
      { rating: 4, comment: "Great fit. The cotton is thin and comfortable for summers.", date: new Date("2026-01-20") }
    ]
  },
  {
    name: "US Polo Assn. Linen Shirt",
    description: "Premium pure linen shirt for ultimate summer style. Offers a lightweight feel, patch pocket, and signature USPA double horseman embroidery.",
    price: 2999,
    category: "clothing",
    subcategory: "shirts",
    brand: "US Polo Assn.",
    images: [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?w=600&auto=format&fit=crop"
    ],
    rating: 4.5,
    stock: 25,
    features: [
      "100% Premium Linen fabric",
      "Custom fit, slightly relaxed through body",
      "Embroidered signature logo on chest",
      "Naturally cooling and highly breathable weave"
    ],
    tags: ["uspa", "shirt", "linen", "summer", "premium"],
    reviews: [
      { rating: 5, comment: "Top class linen. Keeps you cool, looks very premium.", date: new Date("2026-03-08") }
    ]
  },
  {
    name: "Zara Oxford Shirt",
    description: "Minimalist Oxford cotton button-down shirt. Offers a structured regular fit, classic collar, and clean styling details suited for smart-casual wear.",
    price: 3290,
    category: "clothing",
    subcategory: "shirts",
    brand: "Zara",
    images: [
      "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 18,
    features: [
      "Heavyweight Oxford weave cotton",
      "Regular fit silhouette",
      "Clean front button placket with tonal buttons",
      "Button-down collar points"
    ],
    tags: ["zara", "shirt", "oxford", "minimalist", "clothing"],
    reviews: [
      { rating: 4, comment: "Zara quality is good. Structured material that holds shape well.", date: new Date("2026-02-14") }
    ]
  },

  // --- CLOTHING / JACKETS ---
  {
    name: "Columbia Powder Lite Jacket",
    description: "Stay warm in chilly weather. This jacket features water-resistant fabric, synthetic insulation, and an Omni-Heat reflective lining to trap body heat.",
    price: 8999,
    category: "clothing",
    subcategory: "jackets",
    brand: "Columbia",
    images: [
      "https://images.unsplash.com/photo-1544923246-77307dd654cb?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 12,
    features: [
      "Omni-Heat thermal reflective lining traps body heat",
      "Water-resistant Storm-Lite shell fabric",
      "Thermarator synthetic down insulation",
      "Zippered hand pockets and drawcord adjustable hem"
    ],
    tags: ["columbia", "jacket", "winterwear", "thermal", "hiking"],
    reviews: [
      { rating: 5, comment: "Extremely warm and lightweight. Perfect for winter trips.", date: new Date("2026-01-10") }
    ]
  },
  {
    name: "Wildcraft Hooded Windcheater",
    description: "Designed for monsoons and high winds, this breathable windcheater is water-resistant, features a packable hood, and reflective safety decals.",
    price: 2499,
    category: "clothing",
    subcategory: "jackets",
    brand: "Wildcraft",
    images: [
      "https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop"
    ],
    rating: 4.2,
    stock: 40,
    features: [
      "Water-resistant and windproof polyester shell",
      "Packable design with adjustable hood drawstring",
      "Reflective prints for low-light safety visibility",
      "Elasticated cuffs to block cold winds and rain"
    ],
    tags: ["wildcraft", "windcheater", "rainjacket", "outdoor"],
    reviews: [
      { rating: 4, comment: "Works great in light rains and bike riding. Good wind blockage.", date: new Date("2026-02-28") }
    ]
  },
  {
    name: "Superdry Classic Leather Jacket",
    description: "Premium cowhide leather jacket. Offers a classic biker look, zip pockets, quilted lining, and metal accents. A statement piece designed to last.",
    price: 24999,
    category: "clothing",
    subcategory: "jackets",
    brand: "Superdry",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 5,
    features: [
      "100% Genuine premium cowhide leather",
      "Quilted satin interior lining for comfort",
      "Heavy duty metal zips and buckle details",
      "Interior storage pockets for phone and wallet"
    ],
    tags: ["superdry", "leatherjacket", "biker", "premium", "designer"],
    reviews: [
      { rating: 5, comment: "Absolutely stunning. Leather is heavy and premium.", date: new Date("2026-02-22") }
    ]
  },

  // --- HOME & KITCHEN / KITCHEN ---
  {
    name: "Prestige Tri-Ply Tasra/Kadai",
    description: "Premium tri-ply stainless steel kadai. Features an aluminum core between food-grade steel layers for rapid heat distribution and oil-free cooking.",
    price: 2499,
    category: "home",
    subcategory: "kitchen",
    brand: "Prestige",
    images: [
      "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 50,
    features: [
      "Three-layer steel construct: fast and uniform heat",
      "Food-grade 18/10 Stainless Steel interior layer",
      "Induction and Gas stovetop compatible base",
      "Sturdy riveted stay-cool handles"
    ],
    tags: ["prestige", "kadai", "cookware", "kitchen"],
    reviews: [
      { rating: 5, comment: "Heats evenly, doesn't burn the food. Very heavy duty.", date: new Date("2026-03-01") }
    ]
  },
  {
    name: "Philips Air Fryer HD9200",
    description: "Healthy frying with Rapid Air technology. Philips brings the air fryer to your home, cooking crispy food with up to 90% less fat. Includes manual temperature and timer controls.",
    price: 7999,
    category: "home",
    subcategory: "kitchen",
    brand: "Philips",
    images: [
      "https://images.unsplash.com/photo-1621972750749-0fbb1abb7736?w=600&auto=format&fit=crop"
    ],
    rating: 4.6,
    stock: 25,
    features: [
      "Rapid Air Technology: unique starfish design cooks evenly",
      "Adjustable time (up to 60 mins) and temperature controls (up to 200°C)",
      "Non-stick, dishwasher safe removable drawer pan",
      "Recipe book app integration containing 500+ air fryer meals"
    ],
    tags: ["philips", "airfryer", "kitchen", "healthy", "appliances"],
    reviews: [
      { rating: 5, comment: "Great for making oil-free samosas and french fries. Works great.", date: new Date("2026-02-18") }
    ]
  },

  // --- HOME & KITCHEN / APPLIANCES ---
  {
    name: "Dyson V15 Detect Vacuum",
    description: "Dyson's most powerful, intelligent cordless vacuum cleaner. Features laser illumination that reveals invisible dust on hard floors, piezo sensor counting dust particles, and auto suction adjustment.",
    price: 65900,
    category: "home",
    subcategory: "appliances",
    brand: "Dyson",
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop"
    ],
    rating: 4.8,
    stock: 12,
    features: [
      "Laser reveals microscopic dust particles on hard floors",
      "Piezo sensor continuously measures and counts dust sizes",
      "Dyson Hyperdymium motor spins up to 125,000rpm",
      "Up to 60 minutes of fade-free runtime with click-in battery"
    ],
    tags: ["dyson", "vacuum", "appliances", "cleaning", "cordless"],
    reviews: [
      { rating: 5, comment: "The laser light reveals dirt you didn't even know existed. Mind blown.", date: new Date("2026-03-05") }
    ]
  },

  // --- HOME & KITCHEN / FURNITURE ---
  {
    name: "Wakefit Orthopedic Mattress",
    description: "India's highest rated memory foam mattress. Offers advanced orthopedic support that aligns the spine, reduces motion transfer, and includes a removable washable outer cover.",
    price: 14499,
    category: "home",
    subcategory: "furniture",
    brand: "Wakefit",
    images: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&auto=format&fit=crop"
    ],
    rating: 4.7,
    stock: 15,
    features: [
      "Orthopedic memory foam conforms to your body contours",
      "Zero Partner Disturbance: motion absorbing foam layers",
      "Breathable fabric cover ensures cooling sleep temperature",
      "10-year manufacturer warranty coverage"
    ],
    tags: ["wakefit", "mattress", "orthopedic", "furniture", "bedroom"],
    reviews: [
      { rating: 5, comment: "Incredibly comfortable. My back pain has significantly reduced.", date: new Date("2026-02-12") }
    ]
  },
  {
    name: "Sleepyhead 3-Seater Sofa",
    description: "Modern minimalist 3-seater sofa upholstered in premium breathable fabric. Sturdy solid wood frame structure with high density foam cushions that retain shape.",
    price: 18999,
    category: "home",
    subcategory: "furniture",
    brand: "Sleepyhead",
    images: [
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=600&auto=format&fit=crop"
    ],
    rating: 4.4,
    stock: 8,
    features: [
      "Solid neem wood internal frame structure",
      "Premium, high-density foam core seating comfort",
      "Tear-resistant, breathable custom fabric upholstery",
      "Elegant solid wood legs for modern visual accent"
    ],
    tags: ["sleepyhead", "sofa", "furniture", "livingroom"],
    reviews: [
      { rating: 5, comment: "Spacious and very comfortable. Cushioning is firm but soft.", date: new Date("2026-03-09") }
    ]
  }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/picksy';
    console.log(`Connecting to MongoDB at: ${mongoUri}`);
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    console.log('Clearing existing products...');
    const deleteRes = await Product.deleteMany({});
    console.log(`Deleted ${deleteRes.deletedCount} products`);

    console.log(`Inserting ${products.length} products...`);
    const insertRes = await Product.insertMany(products);
    console.log(`✅ Successfully seeded ${insertRes.length} products!`);

  } catch (err) {
    console.error('❌ Error during seeding:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();
