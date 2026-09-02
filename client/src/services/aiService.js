const API_BASE_URL = '/api';

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