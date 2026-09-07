const API_BASE_URL = '/api';

/**
 * AI Crop Listing Description Generator
 */
export const generateListing = async (input) => {
  const response = await fetch(`${API_BASE_URL}/ai/generate-listing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to generate listing');
  }

  return data.listing;
};

/**
 * Multilingual Voice & Text Website Assistant (Kisan Sahayak)
 */
export const askKisanAssistant = async ({ question, language = 'hinglish', currentPath = '/' }) => {
  const response = await fetch(`${API_BASE_URL}/ai/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, language, currentPath }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Failed to get assistant guidance');
  }

  return data;
};
