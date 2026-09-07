/**
 * KisanConnect Grounded Platform Knowledge & Language Prompt Mapping
 * SIH26033 - Theme: Agriculture, FoodTech & Rural Development
 */

const LANGUAGE_CONFIGS = {
  en: {
    name: 'English',
    nativeName: 'English',
    instruction: 'You MUST respond strictly in clear, simple, farmer-friendly English.'
  },
  hi: {
    name: 'Hindi',
    nativeName: 'हिंदी',
    instruction: 'You MUST respond strictly in natural, polite Hindi using Devanagari script (हिन्दी). Avoid complex vocabulary.'
  },
  hinglish: {
    name: 'Hinglish',
    nativeName: 'Hinglish',
    instruction: 'You MUST respond strictly in friendly, natural conversational Hinglish (Roman Hindi script, e.g., "Marketplace par jaakar crop search karein...").'
  },
  pa: {
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    instruction: 'You MUST respond strictly in natural Punjabi using Gurmukhi script (ਪੰਜਾਬੀ). Example: "ਕਿਸਾਨ ਕਨੈਕਟ ਤੇ ਆਪਣੀ ਫਸਲ ਲਿਸਟ ਕਰਨ ਲਈ..."'
  },
  haryanvi: {
    name: 'Haryanvi',
    nativeName: 'हरियाणवी',
    instruction: 'You MUST respond strictly in natural, friendly Haryanvi dialect (Devanagari script).'
  },
  ta: {
    name: 'Tamil',
    nativeName: 'தமிழ்',
    instruction: 'You MUST respond strictly in natural, polite Tamil script (தமிழ்).'
  },
  te: {
    name: 'Telugu',
    nativeName: 'తెలుగు',
    instruction: 'You MUST respond strictly in natural, polite Telugu script (తెలుగు).'
  },
  mr: {
    name: 'Marathi',
    nativeName: 'मराठी',
    instruction: 'You MUST respond strictly in natural, polite Marathi script (मराठी).'
  },
  bn: {
    name: 'Bengali',
    nativeName: 'বাংলা',
    instruction: 'You MUST respond strictly in natural, polite Bengali script (বাংলা).'
  },
  gu: {
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    instruction: 'You MUST respond strictly in natural, polite Gujarati script (ગુજરાતી).'
  },
  kn: {
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    instruction: 'You MUST respond strictly in natural, polite Kannada script (ಕನ್ನಡ).'
  },
  ml: {
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    instruction: 'You MUST respond strictly in natural, polite Malayalam script (മലയാളം).'
  },
  or: {
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    instruction: 'You MUST respond strictly in natural, polite Odia script (ଓଡ଼ିଆ).'
  },
  as: {
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    instruction: 'You MUST respond strictly in natural, polite Assamese script (অসমীয়া).'
  }
};

const PAGE_CONTEXT_DEFINITIONS = {
  '/': {
    pageName: 'Home Page / Landing Overview',
    hindiName: 'होम पेज (मुख्य पृष्ठ)',
    description: 'Overview of KisanConnect, middleman margin calculator, platform benefits, and direct farm trade workflow.',
    featuresAvailable: [
      'Middleman margin & realization calculator (compare traditional Mandi vs KisanConnect direct farm-gate payout)',
      '3-Step workflow explanation (1. Farmer Lists Harvest, 2. Direct Negotiation Desk, 3. Fulfillment & Settlement)',
      'Direct links to Marketplace Catalog and Farm Registration'
    ],
    nextSteps: 'Click "Explore Marketplace" to browse produce, or click "Register Your Farm" to create a seller account.'
  },
  '/marketplace': {
    pageName: 'Marketplace Produce Catalog',
    hindiName: 'मार्केटप्लेस / फसल खोज',
    description: 'Browse, search and filter all active verified farm produce lots across India.',
    featuresAvailable: [
      'Search bar for crop name, variety, district, or state',
      'Category filter (Cereals & Grains, Pulses, Vegetables, Fruits, Spices, Oilseeds, Other)',
      'State & Region filter (e.g. Madhya Pradesh, Punjab, Maharashtra)',
      'Quality Grade filter (Grade A Premium, Grade B Standard, Grade C Fair)',
      'Organic Certified filter checkbox',
      'Sort by Newest, Price (Low to High / High to Low), or Stock volume',
      '"Negotiate" button to open Direct Price Negotiation Desk with the farmer',
      '"View Lot" button to see full produce specifications and farm details'
    ],
    nextSteps: 'Click "View Lot" on any crop card to view full lot specifications, or click "Negotiate" to propose a custom counter-offer.'
  },
  '/produce': {
    pageName: 'Produce Detail Page',
    hindiName: 'फसल विवरण और खरीद पेज',
    description: 'Detailed crop specifications, farm location, photo, farmer trust profile, live APMC Mandi reference rate comparison, and purchase actions.',
    featuresAvailable: [
      'Direct Farm Gate price in ₹/unit and available lot quantity',
      'Live Agmarknet / APMC Mandi Benchmark rate comparison with above/below reference badges',
      'Procurement quantity selector',
      '"Add to Cart" button for direct checkout',
      '"Buy Directly" button for instant checkout',
      '"Negotiate Price / Make Counter Offer" button to send a bid to the farmer',
      'Verified Farmer profile with landholding, trust score, and contact verification'
    ],
    nextSteps: 'Click "Buy Directly" for instant checkout or "Negotiate Price" to propose your own price/quantity to the farmer.'
  },
  '/farmer/dashboard': {
    pageName: 'Farmer Dashboard & Control Center',
    hindiName: 'किसान डैशबोर्ड (आपका खाता)',
    description: 'Farmer inventory management, produce listing creation, negotiation counter-bids, and order fulfillment tracking.',
    featuresAvailable: [
      '"Post New Crop Lot" (+ button) to list harvest with live Mandi price discovery and AI listing description',
      '"My Produce Listings" tab to view all active crop listings and stock',
      '"Negotiations & Bids" tab to view buyer counter-offers, accept bids, send counter rates, or decline',
      '"Fulfillment Orders" tab with 4-step live order status stepper (Placed -> Confirmed -> Dispatched -> Delivered)'
    ],
    nextSteps: 'Click "+ Post New Crop Lot" to list new harvest, or open "Negotiations & Bids" to review buyer offers.'
  },
  '/buyer/dashboard': {
    pageName: 'Buyer Procurement Desk',
    hindiName: 'खरीदार / व्यापारी डैशबोर्ड',
    description: 'Buyer bilateral negotiations tracker and live procurement order stepper.',
    featuresAvailable: [
      '"Bilateral Negotiations & Bids" tab to track submitted counter-offers, review farmer counter-bids, and 1-Click convert accepted offers into orders',
      '"Fulfillment Orders & Live Tracking" tab with live tracking stepper for dispatched produce'
    ],
    nextSteps: 'Click "Confirm & Convert to Order" on accepted bids to proceed to settlement.'
  },
  '/checkout': {
    pageName: 'Checkout & Settlement Page',
    hindiName: 'चेकआउट और डिलीवरी पेज',
    description: 'Procurement cart review, warehouse delivery address confirmation, and direct settlement selection.',
    featuresAvailable: [
      'Review items in procurement cart with quantity adjust and remove options',
      'Destination warehouse street, city/district, state, and pincode form',
      'Settlement method selection (Direct Settlement / UPI on Delivery, Cash on Delivery at APMC, RTGS/NEFT on Verification)',
      '"Place Direct Order to Farmer" button'
    ],
    nextSteps: 'Fill in destination warehouse details, choose settlement method, and click "Place Direct Order to Farmer".'
  },
  '/login': {
    pageName: 'Sign In Page',
    hindiName: 'लॉगिन / साइन इन पेज',
    description: 'Authentication page with email/phone and password, plus 1-click Demo Account selectors for testing.',
    featuresAvailable: [
      'Email / mobile number and password sign in',
      'Demo Mode Quick Login buttons (Farmer Ramesh, Buyer FreshMart, Ministry Admin)',
      'Link to Register if not already registered'
    ],
    nextSteps: 'Enter your credentials or click any Demo Account button for quick access.'
  },
  '/register': {
    pageName: 'Account Registration Page',
    hindiName: 'नया खाता पंजीकरण (रजिस्ट्रेशन)',
    description: 'Create a free Farmer/FPO or Buyer/Retailer account.',
    featuresAvailable: [
      'Role selection tab: "I am a Farmer / FPO" or "I am a Buyer / Retailer"',
      'Personal details: Full name, mobile number, email, password',
      'Location: District, State, Pincode',
      'Farmer-specific: Farm / Enterprise name, landholding size (acres)',
      'Buyer-specific: Business name, buyer type (Retailer, Wholesaler, Restaurant, Consumer)'
    ],
    nextSteps: 'Select Farmer or Buyer, fill in details, and click "Complete Registration".'
  },
  '/admin': {
    pageName: 'Ministry / National Admin Analytics',
    hindiName: 'मंत्रालय / राष्ट्रीय एडमिन डैशबोर्ड',
    description: 'National trade GMV monitoring, intermediary margin recovery, and supply distribution audits for Ministry of Consumer Affairs, Food & Public Distribution.',
    featuresAvailable: [
      'Gross Merchandise Value (GMV) metric',
      'Estimated ~35% middleman margin savings retained at farm gate',
      'Commodity category breakdown and state sourcing volume stats',
      'Platform user audits'
    ],
    nextSteps: 'Review national trade metrics, commodity volume distributions, and margin recovery charts.'
  }
};

function getLanguageInstruction(languageCode) {
  const code = (languageCode || 'hinglish').toLowerCase().trim();
  const config = LANGUAGE_CONFIGS[code] || LANGUAGE_CONFIGS['hinglish'];
  return config.instruction;
}

module.exports = {
  LANGUAGE_CONFIGS,
  PAGE_CONTEXT_DEFINITIONS,
  getLanguageInstruction
};
