import API from './api';

/**
 * Fetches live Agmarknet / eNAM Mandi Reference Price from backend API
 */
export const getMandiPrice = async ({ commodity, state, district, market }) => {
  if (!commodity || !commodity.trim()) {
    return { success: false, available: false, message: 'Crop name is required' };
  }

  try {
    const params = { commodity: commodity.trim() };
    if (state && state !== 'All') params.state = state.trim();
    if (district && district !== 'All') params.district = district.trim();
    if (market && market !== 'All') params.market = market.trim();

    const res = await API.get('/mandi/price', { params });
    return res.data;
  } catch (error) {
    console.error('[Mandi Price Service Error]', error);
    return {
      success: false,
      available: false,
      message: error.response?.data?.message || 'Unable to connect to Mandi pricing service'
    };
  }
};
