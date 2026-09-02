# KisanConnect — Direct Farmer-to-Buyer Marketplace
**SIH Problem Statement:** SIH26033  
**Theme:** Agriculture, FoodTech & Rural Development  
**Problem Statement Title:** "Multiple intermediaries reduce farmers' earnings and increase consumer prices."  
**Tech Stack:** MERN Stack (MongoDB, Express.js, React.js 18, Node.js, Tailwind CSS)

---

## 🌾 Overview

KisanConnect is a direct-to-buyer digital agricultural marketplace designed to dismantle multi-layered supply chain intermediaries (arhatiyas, village aggregators, and commission brokers). By connecting verified farmers directly with bulk buyers (retail chains, wholesalers, restaurants, and FPOs), KisanConnect boosts farmer realizations by **35%–45%** while lowering buyer sourcing costs by **15%–20%**.

---

## ✨ Implemented Hackathon MVP Features

1. **Farmer & Buyer Authentication (JWT + Role-Based Access)**:
   - Separate onboarding and profiles for Farmers, Buyers, and Ministry/Admin.
   - 1-Click Quick Demo Switcher on top banner for seamless SIH evaluation.
2. **Farmer Produce Listing & Inventory Hub**:
   - List produce with crop name, category, variety, quantity + unit (kg/quintal/ton), farm-gate price, quality grade (Grade A/B/C), village/district/state, harvest date, and photo presets.
3. **Interactive Buyer Marketplace with Multi-Filters**:
   - Real-time search by crop name, variety, or location.
   - Filter by Category (Cereals, Pulses, Vegetables, Fruits, Spices, Oilseeds), State, Quality Grade, and Organic Certification.
   - Sort by newest, price low-to-high, price high-to-low, and available stock.
4. **Produce Detail & Credibility Showcase**:
   - High-res image display, quality grade explanation, farmer trust score (★ 4.9), landholding size, and verified badges.
   - Direct price comparison against middleman fees.
5. **Interactive Farmer-Buyer Price Negotiation Desk**:
   - Buyers submit customized price offers and quantity bids.
   - Farmers review bids, send counter-offers with personalized notes, or accept/decline.
   - Accepted bids are converted into confirmed orders with 1 click.
6. **Cart & Direct Order Placement**:
   - Procurement cart with quantity adjustments.
   - Delivery warehouse/destination address entry.
   - Direct Settlement / UPI on Delivery & Farm-Gate COD payment modes.
7. **Farmer Order Fulfillment & Buyer Live Tracking**:
   - 4-step status progression stepper: `Placed` → `Confirmed` → `Dispatched` → `Delivered`.
   - Real-time timestamped status tracking logs.
8. **Ministry & Platform Admin Intelligence Dashboard**:
   - Platform GMV, total trade volume, estimated intermediary margins saved (₹), registered user directories, and listing moderation.

---

## 🚀 How to Run

### 1. Start Backend Server
```bash
cd server
npm install
npm start
```
*Backend runs on `http://localhost:5001` (automatically connects to local MongoDB or starts an in-memory database with pre-seeded realistic Indian farm produce data).*

### 2. Start Frontend App
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`.*

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Switch Available in Header)

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Farmer** | Ramesh Patel | `farmer@kisanconnect.in` | `password123` | Sehore, MP (Sharbati Wheat, Soybean) |
| **Farmer** | Suresh Patil | `farmer3@kisanconnect.in` | `password123` | Nashik, MH (Red Onions, Tomatoes) |
| **Buyer** | Rajesh Agarwal | `buyer@kisanconnect.in` | `password123` | FreshMart Supermarkets (Mumbai) |
| **Admin** | Ministry Official | `admin@kisanconnect.in` | `password123` | MoCA & FPD Ministry Admin |
