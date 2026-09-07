const express = require('express');
const router = express.Router();
const groq = require('../groq');
const { 
  LANGUAGE_CONFIGS, 
  PAGE_CONTEXT_DEFINITIONS, 
  getLanguageInstruction 
} = require('../services/kisanAssistantKnowledge');
const { 
  fetchMandiPrice, 
  normalizeCommodity, 
  normalizeState, 
  normalizeDistrict 
} = require('../services/mandiPriceService');

// 1. Existing Groq AI Listing Generator (Intact)
router.post('/generate-listing', async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Listing information is required'
      });
    }

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for KisanConnect, a farmer-to-buyer agricultural marketplace in India. Convert a farmer’s simple Hindi or English description into a clear marketplace product listing.'
        },
        {
          role: 'user',
          content: `Create a professional product listing from this farmer information:\n\n${input}`
        }
      ],
      temperature: 0.4,
      max_tokens: 500
    });

    const listing = response.choices[0].message.content;

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('[Groq Listing Error]', error);

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI listing'
    });
  }
});

// 2. Multilingual Chat Website Assistant (Kisan Sahayak)
router.post('/assistant', async (req, res) => {
  const { question, language = 'hinglish', currentPath = '/' } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Question is required'
    });
  }

  // Detect explicit in-chat language switch requests if present in question
  let targetLang = (language || 'hinglish').toLowerCase().trim();
  const qLower = question.toLowerCase();

  if (qLower.includes('english me') || qLower.includes('in english') || qLower.includes('explain in english')) {
    targetLang = 'en';
  } else if (qLower.includes('hindi me') || qLower.includes('shuddh hindi') || qLower.includes('हिंदी में')) {
    targetLang = 'hi';
  } else if (qLower.includes('punjabi vich') || qLower.includes('in punjabi') || qLower.includes('ਪੰਜਾਬੀ')) {
    targetLang = 'pa';
  } else if (qLower.includes('tamil la') || qLower.includes('in tamil') || qLower.includes('தமிழ்')) {
    targetLang = 'ta';
  } else if (qLower.includes('marathi madhe') || qLower.includes('in marathi') || qLower.includes('मराठीत')) {
    targetLang = 'mr';
  } else if (qLower.includes('telugu lo') || qLower.includes('in telugu') || qLower.includes('తెలుగులో')) {
    targetLang = 'te';
  } else if (qLower.includes('gujarati ma') || qLower.includes('in gujarati') || qLower.includes('ગુજરાતી')) {
    targetLang = 'gu';
  } else if (qLower.includes('bangla te') || qLower.includes('in bengali') || qLower.includes('বাংলা')) {
    targetLang = 'bn';
  }

  // Ensure targetLang is valid in LANGUAGE_CONFIGS
  const langConfig = LANGUAGE_CONFIGS[targetLang] || LANGUAGE_CONFIGS['hinglish'];
  const languageInstruction = getLanguageInstruction(targetLang);

  // Retrieve current page context
  const matchedRoute = Object.keys(PAGE_CONTEXT_DEFINITIONS).find((route) => {
    if (route === '/') return currentPath === '/';
    return currentPath.startsWith(route);
  }) || '/';
  const activePageInfo = PAGE_CONTEXT_DEFINITIONS[matchedRoute] || PAGE_CONTEXT_DEFINITIONS['/'];

  // Check if question is asking for Mandi price discovery
  let mandiContext = '';
  const isMandiQuery = /(mandi|price|bhav|rate|daam|dam|kimat|bhaav|भाव|दाम|कीमत|रेट|मंडी|किंमत|ਕੀਮਤ)/i.test(question);
  
  if (isMandiQuery) {
    // Detect commodity from question
    const matchedCommodity = normalizeCommodity(question);
    
    // Detect state / district if mentioned
    let detectedState = '';
    let detectedDistrict = '';
    if (/(maharashtra|mh|nashik|nasik|pune|pimpalgaon)/i.test(question)) {
      detectedState = 'Maharashtra';
      if (/nashik|nasik|pimpalgaon/i.test(question)) detectedDistrict = 'Nashik';
    } else if (/(madhya pradesh|mp|sehore|indore|bhopal)/i.test(question)) {
      detectedState = 'Madhya Pradesh';
      if (/sehore/i.test(question)) detectedDistrict = 'Sehore';
    } else if (/(punjab|pb|ludhiana|amritsar)/i.test(question)) {
      detectedState = 'Punjab';
      if (/ludhiana/i.test(question)) detectedDistrict = 'Ludhiana';
    }

    if (matchedCommodity && matchedCommodity !== question.trim()) {
      try {
        const liveMandi = await fetchMandiPrice({
          commodity: matchedCommodity,
          state: detectedState,
          district: detectedDistrict,
          market: /pimpalgaon/i.test(question) ? 'Pimpalgaon' : ''
        });

        if (liveMandi && liveMandi.available) {
          mandiContext = `\n\nVERIFIED OFFICIAL AGMARKNET MANDI DATA FOR THIS INQUIRY:
- Commodity: ${liveMandi.commodity}
- Modal Reference Price: ₹${liveMandi.modalPrice} / Quintal
- Market Price Range: ₹${liveMandi.minPrice} – ₹${liveMandi.maxPrice} / Quintal
- APMC Market: ${liveMandi.market}, ${liveMandi.district || liveMandi.state}
- Reference Level: ${liveMandi.referenceLabel}
- Arrival Date: ${liveMandi.arrivalDate}
- Source: Agmarknet / eNAM (Ministry of Agriculture)
INSTRUCTION: Quote these exact numbers to the farmer. Do NOT invent other numbers.`;
        } else if (liveMandi && !liveMandi.available) {
          mandiContext = `\n\nOFFICIAL MANDI DATA STATUS: Live Agmarknet reference price is currently unavailable for ${matchedCommodity} in this region. Inform the farmer honestly that official data is not currently reported, and they can set their own fair price on KisanConnect.`;
        }
      } catch (mErr) {
        console.warn('[Mandi AI Context Fetch Warning]', mErr.message);
      }
    }
  }

  const systemPrompt = `You are "Kisan Sahayak" (किसान सहायक), a warm, supportive, farmer-friendly AI Chat Guide for KisanConnect — India's Direct Farmer-to-Buyer Marketplace (SIH26033).

LANGUAGE REQUIREMENT (MANDATORY & CRITICAL):
Target Language: ${langConfig.name} (${langConfig.nativeName}).
${languageInstruction}
Do NOT respond in English or Hinglish unless the target language is English or Hinglish.
Write the entire response in ${langConfig.name} (${langConfig.nativeName}).

CURRENT PAGE CONTEXT:
- Current Page Path: ${currentPath}
- Current Page: ${activePageInfo.pageName} (${activePageInfo.hindiName})
- Page Description: ${activePageInfo.description}
- Visible Actions / Controls on this page: ${activePageInfo.featuresAvailable.join('; ')}
- Suggested Next Action: ${activePageInfo.nextSteps}

ACTUAL KISANCONNECT FEATURES (DO NOT INVENT NON-EXISTENT FEATURES):
1. Registration & Login: Farmer / Buyer role selection with phone, name, state, district. 1-click Demo Accounts (Ramesh Patel, FreshMart, Admin).
2. Farmer Listing: "+ Post New Crop Lot" on Farmer Dashboard. Supports crop name, category, quantity, unit (quintal/ton/kg), price (₹/unit), photo presets, and "Generate with AI" button.
3. Live Mandi Price Benchmark: Automatic Agmarknet / eNAM APMC reference rate comparison showing modal price, min-max range, and above/below reference indicators.
4. Marketplace Search & Filter: Search by crop/variety/district, filter by Category, State, Quality Grade (A/B/C), Organic checkbox, and Sorting.
5. Bilateral Negotiation / Bidding: Buyers click "Negotiate" on any produce to offer custom price & qty. Farmer receives bid in "Negotiations & Bids" tab and can Accept, Counter, or Decline. Once agreed, Buyer converts to order in 1 click.
6. Procurement Cart & Orders: Direct "Buy Now" or "Add to Cart", checkout with delivery address and settlement method. Live 4-step order stepper (Placed -> Confirmed -> Dispatched -> Delivered).
7. Ministry Admin Dashboard: Live national GMV, ~35% intermediary margin recovery stats, category and state distribution charts.${mandiContext}

CRITICAL INSTRUCTIONS:
- If asked about features that do not exist (e.g., escrow cryptocurrency, drone grading, automatic WhatsApp bots), clarify that this feature is not yet available and explain the real KisanConnect alternative.
- Do NOT translate database values, brand names like 'KisanConnect', crop variety identifiers like 'Pusa Basmati', button names like 'Post New Crop Lot' / 'Negotiate' / 'Buy Directly' or numeric rupee values '₹2400/quintal' unless natural.
- Format response with short, clean numbered steps for complex procedures.
- Do NOT use Markdown asterisks (**) or headings (#) in a way that creates clutter. Write clean, natural text.`;

  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const answer = response.choices[0].message.content.trim();

    res.json({
      success: true,
      answer,
      language: targetLang,
      pageContext: activePageInfo.pageName,
      fallback: false
    });
  } catch (error) {
    console.warn('[Groq Assistant Error]', error.message);

    // Fallback response in target language
    let fallbackText = `Namaste! KisanConnect par aap crop listing, live mandi rate, negotiation, aur orders track kar sakte hain.`;
    if (targetLang === 'en') {
      fallbackText = `Hello! On KisanConnect, you can create crop listings, compare live mandi prices, negotiate offers, and track direct orders.`;
    } else if (targetLang === 'hi') {
      fallbackText = `नमस्ते! किसानकनेक्ट पर आप फसल लिस्टिंग, लाइव मंडी भाव, मोल-भाव और ऑर्डर ट्रैकिंग कर सकते हैं।`;
    } else if (targetLang === 'pa') {
      fallbackText = `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਕਿਸਾਨ ਕਨੈਕਟ ਤੇ ਤੁਸੀਂ ਫਸਲ ਲਿਸਟਿੰਗ, ਮੰਡੀ ਭਾਅ, ਮੋਲ-ਭਾਵ ਅਤੇ ਆਰਡਰ ਟ੍ਰੈਕ ਕਰ ਸਕਦੇ ਹੋ।`;
    } else if (targetLang === 'ta') {
      fallbackText = `வணக்கம்! கிசான்கனெக்ட்டில் பயிர் பட்டியல், நேரடி மண்டி விலை, விலை பேரம் மற்றும் ஆர்டர் டிராக்கிங் செய்யலாம்.`;
    } else if (targetLang === 'mr') {
      fallbackText = `नमस्कार! किसानकनेक्टवर तुम्ही पीक लिस्टिंग, थेट मंडी दर, घासाघिस आणि ऑर्डर ट्रॅकिंग करू शकता.`;
    }

    res.json({
      success: true,
      answer: fallbackText,
      language: targetLang,
      pageContext: activePageInfo.pageName,
      fallback: true
    });
  }
});

module.exports = router;
