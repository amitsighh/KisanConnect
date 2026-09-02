const supabase = require('../config/supabase');

// Helper to format user profile for response
const formatUserProfile = (profile) => ({
  _id: profile.id,
  id: profile.id,
  name: profile.name,
  email: profile.email,
  phone: profile.phone,
  role: profile.role,
  location: {
    address: profile.address || '',
    village: profile.village || '',
    district: profile.district,
    state: profile.state,
    pincode: profile.pincode
  },
  farmDetails: profile.farm_details || {},
  buyerDetails: profile.buyer_details || {},
  trustScore: Number(profile.trust_score) || 4.8,
  isVerified: Boolean(profile.is_verified)
});

// @desc    Register a new user (Farmer, Buyer) with Supabase Auth
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      password, 
      role = 'buyer', 
      location = {}, 
      farmDetails = {}, 
      buyerDetails = {} 
    } = req.body;

    const userMetadata = {
      name,
      phone,
      role,
      district: location.district || 'Central',
      state: location.state || 'Delhi',
      pincode: location.pincode || '110001',
      address: location.address || '',
      village: location.village || '',
      farm_details: role === 'farmer' ? farmDetails : {},
      buyer_details: role === 'buyer' ? buyerDetails : {}
    };

    // 1. Sign up user via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: userMetadata
      }
    });

    if (authError || !authData.user) {
      return res.status(400).json({
        success: false,
        message: authError?.message || 'Registration failed'
      });
    }

    const userId = authData.user.id;

    // 2. Upsert profile in Supabase profiles table
    const profilePayload = {
      id: userId,
      name,
      email: email.toLowerCase(),
      phone,
      role,
      district: location.district || 'Central',
      state: location.state || 'Delhi',
      pincode: location.pincode || '110001',
      address: location.address || '',
      village: location.village || '',
      farm_details: role === 'farmer' ? farmDetails : {},
      buyer_details: role === 'buyer' ? buyerDetails : {},
      trust_score: 4.8,
      is_verified: true
    };

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .upsert(profilePayload)
      .select('*')
      .single();

    const token = authData.session?.access_token || `sb_token_${userId}`;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully with Supabase Auth',
      token,
      user: formatUserProfile(profile || profilePayload)
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration'
    });
  }
};

// @desc    Login user via Supabase Auth
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/phone and password'
      });
    }

    let loginEmail = emailOrPhone.toLowerCase();

    // If phone provided, lookup email from profiles table first
    if (!emailOrPhone.includes('@')) {
      const { data: phoneProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', emailOrPhone)
        .single();
      
      if (phoneProfile) {
        loginEmail = phoneProfile.email;
      }
    }

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password
    });

    if (authError || !authData.user) {
      return res.status(401).json({
        success: false,
        message: authError?.message || 'Invalid login credentials'
      });
    }

    // 2. Fetch full profile from Supabase profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    const userProfile = profile || {
      id: authData.user.id,
      name: authData.user.user_metadata?.name || 'User',
      email: authData.user.email,
      phone: authData.user.user_metadata?.phone || '',
      role: authData.user.user_metadata?.role || 'buyer',
      district: authData.user.user_metadata?.district || 'Central',
      state: authData.user.user_metadata?.state || 'Delhi',
      pincode: authData.user.user_metadata?.pincode || '110001'
    };

    const token = authData.session?.access_token || `sb_token_${authData.user.id}`;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: formatUserProfile(userProfile)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current authenticated user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      user: formatUserProfile(profile)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};
