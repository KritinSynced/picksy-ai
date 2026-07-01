# Picksy: Intelligent E-Commerce Recommendation Platform

Picksy is a premium, production-ready e-commerce platform built to demonstrate the integration of user-centric interactions with real-time database-driven recommendations. Rather than relying on heavy, offline machine learning models or static recommendation files, Picksy utilizes responsive MongoDB aggregation pipelines that calculate personalized suggestion scores on-the-fly.

The primary objective of the project is to showcase how a standard shopping experience (browsing products, adjusting profile settings, writing reviews, and placing orders) can dynamically reshape product suggestions in real time.

---

## System Architecture

The application is structured as a monorepo containing two decoupled subsystems:

* **Frontend**: A React application utilizing the Context API for state management (auth session and shopping cart). It is styled with Vanilla CSS and implements a modern design language centered on glassmorphism, responsive content grids, smooth snap-scroll carousels, and custom micro-interactions.
* **Backend**: A Node.js and Express REST API connected to MongoDB. The backend manages products, user accounts, and recommendations, and features a seeding pipeline that populates the database with detailed, market-relevant listings.

---

## How the Recommendation Engine Works

At the core of Picksy is a multi-factor recommendation algorithm written as MongoDB aggregation queries. It scores and ranks items based on several dynamic data streams:

### User Interest Profiling
When a user interacts with the platform, the backend analyzes their browsing history and purchase records. It extracts the categories and brands of interest, calculating frequency weights. Explicit preferences configured on the dashboard—such as target departments or favored brands—are injected directly into the user profile with high-priority scoring multipliers.

### Aggregation and Scoring Pipeline
The backend runs a query that excludes items the user has already browsed or purchased, scoring the remaining catalog using a weighted scoring model:
* **Department Match**: Adds points if the product falls into the user's top categories.
* **Brand Alignment**: Awards points if the brand matches the user's explicitly preferred brands.
* **Budget Proximity**: Evaluates product prices against the user's maximum price limit, awarding points based on price tiers.
* **Social Engagement**: Boosts items based on user ratings and the quantity of written reviews.

### Product Proximity (Similar Items)
On single product pages, a similarity algorithm displays related alternatives. It measures category matches, brand overlap, and calculates a price proximity penalty, ensuring that suggestions remain within a reasonable budget threshold while prioritizing matching categories.

---

## Key Platform Features

### Dynamic Preference Dashboard
Users can edit their preferred departments, brands, and price constraints in their profile. Saving these preferences triggers an immediate updates of their personalized suggestion carousels.

### Interactive Reviews System
Every product detail view features an interactive reviews section. Users can submit ratings and reviews, which write directly to the database, instantly recalculating the product's overall rating.

### Multi-Step Checkout Simulation
The shopping cart supports full quantity updates and features a checkout workflow. The simulation guides the user through shipping form validation, card/UPI payment options, and presents an order confirmation screen. Completing the purchase updates the database purchase history, immediately altering the user's recommended products feeds.
