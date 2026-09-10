const Groq = require("groq-sdk");

const apiKey = process.env.GROQ_API_KEY || "gsk_placeholder_demo_key_for_hackathon";

let groq = null;
try {
  groq = new Groq({ apiKey });
} catch (e) {
  console.warn('[Groq] Initialized in fallback mode without API key.');
}

module.exports = groq;