const supabase = require('../config/supabase');
const crypto = require('crypto');

const seedDB = async () => {
  try {
    console.log('[Seed] Populating initial Supabase seed data...');

    const { data: existingProfiles } = await supabase.from('profiles').select('*');
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('[Seed] Database already has profiles. Skipping duplicate seed.');
      return;
    }

    console.log('[Seed] Creating demo users in Supabase Auth & Profiles...');

    // 1. Farmer 1: Ramesh Patel
    const farmer1Auth = await supabase.auth.signUp({
      email: 'farmer@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Ramesh Patel',
          phone: '9876543210',
          role: 'farmer',
          district: 'Sehore',
          state: 'Madhya Pradesh',
          pincode: '466001',
          address: 'Gram Kothri, Near Mandi Gate',
          village: 'Kothri',
          farm_details: {
            farmName: 'Patel Krishi Farm & Agro',
            farmSizeAcres: 14,
            fpoName: 'Sehore Sharbati Wheat FPO',
            primaryCrops: ['Sharbati Wheat', 'Soybean', 'Gram / Chana']
          }
        }
      }
    });
    const farmer1Id = farmer1Auth.data?.user?.id;

    // 2. Farmer 2: Balvinder Singh
    const farmer2Auth = await supabase.auth.signUp({
      email: 'farmer2@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Sardar Balvinder Singh',
          phone: '9823456781',
          role: 'farmer',
          district: 'Ludhiana',
          state: 'Punjab',
          pincode: '141421',
          address: 'GT Road, Near Doraha',
          village: 'Doraha',
          farm_details: {
            farmName: 'Golden Sheaves Agro Farm',
            farmSizeAcres: 28,
            fpoName: 'Punjab Basmati Producers Association',
            primaryCrops: ['1121 Basmati Rice', 'Durum Wheat', 'Mustard']
          }
        }
      }
    });
    const farmer2Id = farmer2Auth.data?.user?.id;

    // 3. Farmer 3: Suresh Patil
    const farmer3Auth = await supabase.auth.signUp({
      email: 'farmer3@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Suresh Patil',
          phone: '9765432190',
          role: 'farmer',
          district: 'Nashik',
          state: 'Maharashtra',
          pincode: '422209',
          address: 'Pimpalgaon Baswant',
          village: 'Pimpalgaon',
          farm_details: {
            farmName: 'Sahyadri Organic Orchard',
            farmSizeAcres: 9,
            fpoName: 'Nashik Onion & Grape Collective',
            primaryCrops: ['Red Onion', 'Thomson Grapes', 'Tomato']
          }
        }
      }
    });
    const farmer3Id = farmer3Auth.data?.user?.id;

    // 4. Farmer 4: G. Ramanathan (Spices - Tamil Nadu)
    const farmer4Auth = await supabase.auth.signUp({
      email: 'farmer4@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'G. Ramanathan',
          phone: '9842109876',
          role: 'farmer',
          district: 'Erode',
          state: 'Tamil Nadu',
          pincode: '638001',
          address: 'Main Road, Modakkurichi',
          village: 'Modakkurichi',
          farm_details: {
            farmName: 'Kaveri Organic Spice Plantation',
            farmSizeAcres: 12,
            fpoName: 'Erode Turmeric Producers FPO',
            primaryCrops: ['Turmeric', 'Pepper', 'Ginger']
          }
        }
      }
    });
    const farmer4Id = farmer4Auth.data?.user?.id;

    // 5. Farmer 5: Santosh Sawant (Fruits - Ratnagiri, Maharashtra)
    const farmer5Auth = await supabase.auth.signUp({
      email: 'farmer5@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Santosh Sawant',
          phone: '9822334455',
          role: 'farmer',
          district: 'Ratnagiri',
          state: 'Maharashtra',
          pincode: '415612',
          address: 'Pawas Coastal Road',
          village: 'Pawas',
          farm_details: {
            farmName: 'Konkan Coastal Mango Orchards',
            farmSizeAcres: 18,
            fpoName: 'Ratnagiri Hapus GI Growers Association',
            primaryCrops: ['Alphonso Mango', 'Cashew', 'Kokum']
          }
        }
      }
    });
    const farmer5Id = farmer5Auth.data?.user?.id;

    // 6. Farmer 6: Mahadev Shinde (Other / Jaggery - Kolhapur, Maharashtra)
    const farmer6Auth = await supabase.auth.signUp({
      email: 'farmer6@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Mahadev Shinde',
          phone: '9850123456',
          role: 'farmer',
          district: 'Kolhapur',
          state: 'Maharashtra',
          pincode: '416003',
          address: 'Shirol Sugarcane Belt',
          village: 'Shirol',
          farm_details: {
            farmName: 'Panchganga Traditional Cane Jaggery Farm',
            farmSizeAcres: 15,
            fpoName: 'Kolhapur Organic Gur Producers Cooperative',
            primaryCrops: ['Sugarcane', 'Organic Jaggery']
          }
        }
      }
    });
    const farmer6Id = farmer6Auth.data?.user?.id;

    // 7. Buyer 1: FreshMart
    const buyer1Auth = await supabase.auth.signUp({
      email: 'buyer@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Rajesh Agarwal (FreshMart Retail)',
          phone: '9811223344',
          role: 'buyer',
          district: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400703',
          address: 'Warehouse No 4B, APMC Market Yard, Vashi',
          buyer_details: {
            businessName: 'FreshMart Supermarkets Pvt Ltd',
            buyerType: 'retailer',
            gstin: '27AABCF1234F1Z8'
          }
        }
      }
    });
    const buyer1Id = buyer1Auth.data?.user?.id;

    // 8. Buyer 2: Swad HORECA
    const buyer2Auth = await supabase.auth.signUp({
      email: 'buyer2@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'Vikram Sethi (Swad HORECA)',
          phone: '9899887766',
          role: 'buyer',
          district: 'North West Delhi',
          state: 'Delhi',
          pincode: '110033',
          address: 'Ring Road, Azadpur Wholesale Hub',
          buyer_details: {
            businessName: 'Swad HORECA Food Services',
            buyerType: 'wholesaler',
            gstin: '07AAACS9988C1Z2'
          }
        }
      }
    });
    const buyer2Id = buyer2Auth.data?.user?.id;

    // 9. Admin
    const adminAuth = await supabase.auth.signUp({
      email: 'admin@kisanconnect.in',
      password: 'password123',
      options: {
        data: {
          name: 'National Admin (MoCA & FPD)',
          phone: '9900011223',
          role: 'admin',
          district: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          address: 'Krishi Bhawan, Dr. Rajendra Prasad Road'
        }
      }
    });

    console.log('[Seed] Creating produce listings in Supabase...');

    const listingsPayload = [
      // 1. CEREALS & GRAINS
      {
        farmer_id: farmer1Id,
        crop_name: 'Sehore Sharbati Wheat (GI Tagged)',
        category: 'Cereals & Grains',
        variety: 'Sharbati',
        quantity: 120,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 2450,
        quality_grade: 'Grade A (Premium)',
        village: 'Kothri',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001',
        harvest_date: '2026-03-15',
        images: [
          '/images/sharbati_wheat.jpg',
          'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=70'
        ],
        description: 'Authentic pure Sharbati wheat grown in black cotton soil with natural rainwater. High protein content, golden luster, zero pesticide residue.',
        is_organic: true,
        status: 'active'
      },
      // 2. PULSES
      {
        farmer_id: farmer1Id,
        crop_name: 'Indore Green Moong',
        category: 'Pulses',
        variety: 'Moong',
        quantity: 65,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 7200,
        quality_grade: 'Grade A (Premium)',
        village: 'Sanwer',
        district: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '453551',
        harvest_date: '2026-03-22',
        images: [
          '/images/green_moong.jpg'
        ],
        description: 'Premium unpolished whole green moong beans grown organically in Malwa plateau. High protein, fast cooking, double machine sorted with zero foreign matter.',
        is_organic: true,
        status: 'active'
      },
      // 3. VEGETABLES
      {
        farmer_id: farmer3Id,
        crop_name: 'Nashik Red Quality Onions',
        category: 'Vegetables',
        variety: 'Garwa Medium-Large Bulb',
        quantity: 250,
        min_order_quantity: 20,
        unit: 'quintal',
        price_per_unit: 1650,
        quality_grade: 'Grade A (Premium)',
        village: 'Pimpalgaon',
        district: 'Nashik',
        state: 'Maharashtra',
        pincode: '422209',
        harvest_date: '2026-03-28',
        images: [
          '/images/red_onions.jpg',
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=70'
        ],
        description: 'Freshly harvested dry cured Nashik red onions with thick skin and excellent shelf life (up to 4 months in ventilated storage).',
        is_organic: false,
        status: 'active'
      },
      // 4. FRUITS
      {
        farmer_id: farmer5Id,
        crop_name: 'Ratnagiri Alphonso Mangoes',
        category: 'Fruits',
        variety: 'Alphonso',
        quantity: 40,
        min_order_quantity: 2,
        unit: 'quintal',
        price_per_unit: 8500,
        quality_grade: 'Grade A (Premium)',
        village: 'Pawas',
        district: 'Ratnagiri',
        state: 'Maharashtra',
        pincode: '415612',
        harvest_date: '2026-04-10',
        images: [
          '/images/alphonso_mangoes.jpg'
        ],
        description: 'GI-certified authentic Ratnagiri Alphonso mangoes from Konkan coastal laterite soil. Naturally tree-ripened, rich saffron pulp, irresistible aroma and sweetness.',
        is_organic: true,
        status: 'active'
      },
      // 5. SPICES
      {
        farmer_id: farmer4Id,
        crop_name: 'Erode Turmeric',
        category: 'Spices',
        variety: 'Salem/Erode Turmeric',
        quantity: 55,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 8200,
        quality_grade: 'Grade A (Premium)',
        village: 'Modakkurichi',
        district: 'Erode',
        state: 'Tamil Nadu',
        pincode: '638001',
        harvest_date: '2026-02-28',
        images: [
          '/images/erode_turmeric.jpg'
        ],
        description: 'GI-tagged authentic Erode finger turmeric rhizomes with exceptionally high curcumin content (3.8%+). Double boiled, sun-dried, deep golden hue.',
        is_organic: true,
        status: 'active'
      },
      // 6. OILSEEDS (Yellow Mustard Seeds - authentic image)
      {
        farmer_id: farmer2Id,
        crop_name: 'Yellow Mustard Seeds (Sarson)',
        category: 'Oilseeds',
        variety: 'Pusa Bold',
        quantity: 75,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 6100,
        quality_grade: 'Grade A (Premium)',
        village: 'Doraha',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141421',
        harvest_date: '2026-03-01',
        images: [
          '/images/yellow_mustard_seeds.jpg'
        ],
        description: 'Golden-yellow bold mustard seeds (Sarson) with high natural pungency and 41% cold-press oil yield. Double machine cleaned with zero admixture.',
        is_organic: true,
        status: 'active'
      },
      // 7. OTHER
      {
        farmer_id: farmer6Id,
        crop_name: 'Fresh Farm Jaggery (Gur)',
        category: 'Other',
        variety: 'Traditional Cane Jaggery',
        quantity: 50,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 4800,
        quality_grade: 'Grade A (Premium)',
        village: 'Shirol',
        district: 'Kolhapur',
        state: 'Maharashtra',
        pincode: '416003',
        harvest_date: '2026-03-25',
        images: [
          '/images/kolhapur_jaggery.jpg'
        ],
        description: 'Pure chemical-free golden Kolhapur cane jaggery prepared in traditional open pans using natural clarificants. Rich in iron, minerals, and authentic aroma.',
        is_organic: true,
        status: 'active'
      },
      // Additional Cereals & Grains
      {
        farmer_id: farmer2Id,
        crop_name: '1121 Pusa Basmati Rice',
        category: 'Cereals & Grains',
        variety: 'Extra Long Grain (Aged 1 Year)',
        quantity: 85,
        min_order_quantity: 10,
        unit: 'quintal',
        price_per_unit: 4800,
        quality_grade: 'Grade A (Premium)',
        village: 'Doraha',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141421',
        harvest_date: '2026-02-20',
        images: [
          '/images/basmati_rice.jpg',
          'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=70'
        ],
        description: 'Aged 1121 extra-long aromatic Basmati rice. Average grain length 8.4mm with delicate floral aroma. Ideal for premium export and catering.',
        is_organic: false,
        status: 'active'
      },
      // Additional Vegetables
      {
        farmer_id: farmer3Id,
        crop_name: 'Fresh Farm Tomatoes (Hybrid)',
        category: 'Vegetables',
        variety: 'Abhinav Firm Red',
        quantity: 140,
        min_order_quantity: 10,
        unit: 'quintal',
        price_per_unit: 1200,
        quality_grade: 'Grade B (Standard)',
        village: 'Pimpalgaon',
        district: 'Nashik',
        state: 'Maharashtra',
        pincode: '422209',
        harvest_date: '2026-04-01',
        images: [
          '/images/farm_tomatoes.jpg'
        ],
        description: 'Glossy red, firm skin hybrid tomatoes picked at breaker stage for safe long-distance transit. High pulp and rich acidity.',
        is_organic: false,
        status: 'active'
      },
      // Additional Oilseeds
      {
        farmer_id: farmer1Id,
        crop_name: 'Yellow Soya Bean (High Protein)',
        category: 'Oilseeds',
        variety: 'JS-9560',
        quantity: 90,
        min_order_quantity: 5,
        unit: 'quintal',
        price_per_unit: 3950,
        quality_grade: 'Grade A (Premium)',
        village: 'Kothri',
        district: 'Sehore',
        state: 'Madhya Pradesh',
        pincode: '466001',
        harvest_date: '2026-03-10',
        images: [
          '/images/yellow_soybean.jpg'
        ],
        description: 'Cleaned, graded, bold-sized yellow soybean with 39% protein and 19% oil content. Moisture content strictly maintained under 9%.',
        is_organic: true,
        status: 'active'
      }
    ];

    const { data: createdListings } = await supabase.from('listings').insert(listingsPayload);

    console.log('[Seed] Creating sample active offer / negotiation in Supabase...');

    const { data: allListings } = await supabase.from('listings').select('*');
    const wheatListing = (allListings || []).find((l) => l.crop_name.includes('Wheat')) || allListings[0];

    if (wheatListing) {
      const { data: sampleOffer } = await supabase.from('offers').insert({
        listing_id: wheatListing.id,
        buyer_id: buyer1Id,
        farmer_id: wheatListing.farmer_id,
        offered_price_per_unit: 2350,
        offered_quantity: 40,
        unit: 'quintal',
        original_listing_price: 2450,
        total_offered_amount: 94000,
        status: 'countered',
        last_action_by: 'farmer',
        current_agreed_price: 2400,
        current_agreed_quantity: 40
      }).select('*').single();

      if (sampleOffer) {
        await supabase.from('offer_messages').insert([
          {
            offer_id: sampleOffer.id,
            sender_role: 'buyer',
            sender_name: 'Rajesh Agarwal (FreshMart Retail)',
            message: 'Can we settle at ₹2,350/quintal for 40 quintals bulk pickup with next day loading?',
            action_type: 'initial_offer',
            counter_price: 2350,
            counter_quantity: 40
          },
          {
            offer_id: sampleOffer.id,
            sender_role: 'farmer',
            sender_name: 'Ramesh Patel',
            message: 'Namaste Rajesh ji. This is GI certified Grade-A Sharbati. Best I can offer is ₹2,400/quintal including bag packaging.',
            action_type: 'counter_offer',
            counter_price: 2400,
            counter_quantity: 40
          }
        ]);
      }
    }

    console.log('[Seed] Creating sample orders with status progression in Supabase...');

    const onionListing = (allListings || []).find((l) => l.crop_name.includes('Onion')) || allListings[1];
    const basmatiListing = (allListings || []).find((l) => l.crop_name.includes('Basmati')) || allListings[2];

    if (onionListing) {
      const { data: order1 } = await supabase.from('orders').insert({
        order_number: 'KC-2026-7821',
        buyer_id: buyer1Id,
        farmer_id: onionListing.farmer_id,
        listing_id: onionListing.id,
        crop_name: onionListing.crop_name,
        variety: onionListing.variety,
        quality_grade: onionListing.quality_grade,
        quantity: 50,
        unit: 'quintal',
        price_per_unit: 1650,
        total_amount: 82500,
        delivery_address: {
          street: 'Warehouse 4B, Sector 19, APMC Yard',
          city: 'Navi Mumbai',
          state: 'Maharashtra',
          pincode: '400703',
          contactPhone: '9811223344',
          receiverName: 'Rajesh Agarwal'
        },
        payment_method: 'Direct Settlement / UPI on Delivery',
        payment_status: 'Pending',
        order_status: 'Dispatched'
      }).select('*').single();

      if (order1) {
        await supabase.from('order_timeline').insert([
          { order_id: order1.id, status: 'Placed', note: 'Order placed by FreshMart Supermarkets (50 quintals @ ₹1,650/quintal)' },
          { order_id: order1.id, status: 'Confirmed', note: 'Confirmed by Farmer Suresh Patil. Packaging in progress.' },
          { order_id: order1.id, status: 'Dispatched', note: 'Loaded on Transport Vehicle (MH-15-EG-4421). En route to Navi Mumbai warehouse.' }
        ]);
      }
    }

    if (basmatiListing) {
      const { data: order2 } = await supabase.from('orders').insert({
        order_number: 'KC-2026-6419',
        buyer_id: buyer2Id,
        farmer_id: basmatiListing.farmer_id,
        listing_id: basmatiListing.id,
        crop_name: basmatiListing.crop_name,
        variety: basmatiListing.variety,
        quality_grade: basmatiListing.quality_grade,
        quantity: 25,
        unit: 'quintal',
        price_per_unit: 4800,
        total_amount: 120000,
        delivery_address: {
          street: 'Shop 84, New Grain Market, Azadpur',
          city: 'North West Delhi',
          state: 'Delhi',
          pincode: '110033',
          contactPhone: '9899887766',
          receiverName: 'Vikram Sethi'
        },
        payment_method: 'Direct Settlement / UPI on Delivery',
        payment_status: 'Completed',
        order_status: 'Delivered'
      }).select('*').single();

      if (order2) {
        await supabase.from('order_timeline').insert([
          { order_id: order2.id, status: 'Placed', note: 'Order placed for 25 quintals Basmati' },
          { order_id: order2.id, status: 'Confirmed', note: 'Confirmed by Balvinder Singh' },
          { order_id: order2.id, status: 'Dispatched', note: 'Dispatched via Northern Express Logistics' },
          { order_id: order2.id, status: 'Delivered', note: 'Delivered at Azadpur Warehouse. Produce verified & payment settled.' }
        ]);
      }
    }

    console.log('[Seed] Supabase database seeded successfully with realistic Indian agricultural marketplace data!');
  } catch (error) {
    console.error('[Seed] Error populating seed data:', error);
  }
};

module.exports = seedDB;

if (require.main === module) {
  require('dotenv').config();
  seedDB().then(() => process.exit(0));
}
