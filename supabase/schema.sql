-- ====================================================================
-- KisanConnect (SIH26033) - Supabase PostgreSQL Production Schema
-- Theme: Agriculture, FoodTech & Rural Development
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Drop existing tables if re-running migration (in reverse dependency order)
DROP TABLE IF EXISTS order_timeline CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS offer_messages CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS listings CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. Profiles Table (Linked to Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('farmer', 'buyer', 'admin')) DEFAULT 'buyer',
    address TEXT DEFAULT '',
    village TEXT DEFAULT '',
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    farm_details JSONB DEFAULT '{}'::jsonb,
    buyer_details JSONB DEFAULT '{}'::jsonb,
    trust_score NUMERIC(3, 2) DEFAULT 4.80,
    is_verified BOOLEAN DEFAULT true,
    avatar TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Listings Table (Produce Marketplace)
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    crop_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cereals & Grains', 'Pulses', 'Vegetables', 'Fruits', 'Spices', 'Oilseeds', 'Other')),
    variety TEXT DEFAULT 'Standard / Desi',
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    min_order_quantity NUMERIC(10, 2) DEFAULT 1,
    unit TEXT NOT NULL CHECK (unit IN ('kg', 'quintal', 'ton')) DEFAULT 'quintal',
    price_per_unit NUMERIC(10, 2) NOT NULL CHECK (price_per_unit > 0),
    quality_grade TEXT NOT NULL CHECK (quality_grade IN ('Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair)')) DEFAULT 'Grade A (Premium)',
    village TEXT DEFAULT '',
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    harvest_date DATE DEFAULT CURRENT_DATE,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT DEFAULT '',
    is_organic BOOLEAN DEFAULT false,
    status TEXT NOT NULL CHECK (status IN ('active', 'sold_out', 'inactive')) DEFAULT 'active',
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Offers Table (Price Negotiation Desk)
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    offered_price_per_unit NUMERIC(10, 2) NOT NULL,
    offered_quantity NUMERIC(10, 2) NOT NULL,
    unit TEXT DEFAULT 'quintal',
    total_offered_amount NUMERIC(12, 2) NOT NULL,
    original_listing_price NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected', 'countered', 'converted_to_order', 'cancelled')) DEFAULT 'pending',
    last_action_by TEXT NOT NULL CHECK (last_action_by IN ('buyer', 'farmer')) DEFAULT 'buyer',
    current_agreed_price NUMERIC(10, 2),
    current_agreed_quantity NUMERIC(10, 2),
    converted_order_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Offer Messages Table (Normalized Negotiation History)
CREATE TABLE offer_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('buyer', 'farmer')),
    sender_name TEXT DEFAULT '',
    message TEXT DEFAULT '',
    action_type TEXT NOT NULL CHECK (action_type IN ('initial_offer', 'counter_offer', 'accept', 'reject', 'chat')) DEFAULT 'initial_offer',
    counter_price NUMERIC(10, 2),
    counter_quantity NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    buyer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    listing_id UUID NOT NULL REFERENCES listings(id),
    crop_name TEXT NOT NULL,
    variety TEXT DEFAULT '',
    quality_grade TEXT DEFAULT 'Grade A (Premium)',
    quantity NUMERIC(10, 2) NOT NULL,
    unit TEXT NOT NULL,
    price_per_unit NUMERIC(10, 2) NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    from_offer_id UUID REFERENCES offers(id),
    delivery_address JSONB NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'Direct Settlement / UPI on Delivery',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('Pending', 'Completed', 'Refunded')) DEFAULT 'Pending',
    order_status TEXT NOT NULL CHECK (order_status IN ('Placed', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled')) DEFAULT 'Placed',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Order Timeline Table (Normalized Event Stepper)
CREATE TABLE order_timeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status TEXT NOT NULL,
    note TEXT DEFAULT '',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key back-reference for converted_order_id in offers
ALTER TABLE offers 
    ADD CONSTRAINT fk_offers_converted_order 
    FOREIGN KEY (converted_order_id) REFERENCES orders(id) ON DELETE SET NULL;

-- 9. Performance Indexes
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_state ON listings(state);
CREATE INDEX idx_listings_farmer ON listings(farmer_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_farmer ON offers(farmer_id);
CREATE INDEX idx_offers_listing ON offers(listing_id);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_farmer ON orders(farmer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- 10. Automatic UpdatedAt Trigger Function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_listings_modtime BEFORE UPDATE ON listings FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_offers_modtime BEFORE UPDATE ON offers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- 11. Automatic Profile Creation Trigger from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    name, 
    email, 
    phone, 
    role, 
    district, 
    state, 
    pincode,
    farm_details,
    buyer_details,
    is_verified,
    trust_score
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
    COALESCE(NEW.raw_user_meta_data->>'district', 'Central'),
    COALESCE(NEW.raw_user_meta_data->>'state', 'Delhi'),
    COALESCE(NEW.raw_user_meta_data->>'pincode', '110001'),
    COALESCE(NEW.raw_user_meta_data->'farm_details', '{}'::jsonb),
    COALESCE(NEW.raw_user_meta_data->'buyer_details', '{}'::jsonb),
    true,
    4.80
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 12. Row Level Security (RLS) Configuration
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Listings: Public read for active listings, farmers manage own listings
CREATE POLICY "Listings viewable by everyone" ON listings FOR SELECT USING (true);
CREATE POLICY "Farmers can insert own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update own listings" ON listings FOR UPDATE USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete own listings" ON listings FOR DELETE USING (auth.uid() = farmer_id);

-- Offers: Buyers & Farmers involved can view/update
CREATE POLICY "Parties involved can view offers" ON offers FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Buyers can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Parties can update offers" ON offers FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- Offer Messages:
CREATE POLICY "Parties can view offer messages" ON offer_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_messages.offer_id AND (offers.buyer_id = auth.uid() OR offers.farmer_id = auth.uid()))
);
CREATE POLICY "Parties can insert offer messages" ON offer_messages FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM offers WHERE offers.id = offer_messages.offer_id AND (offers.buyer_id = auth.uid() OR offers.farmer_id = auth.uid()))
);

-- Orders: Buyers & Farmers involved can view
CREATE POLICY "Parties can view orders" ON orders FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Parties can update orders" ON orders FOR UPDATE USING (auth.uid() = buyer_id OR auth.uid() = farmer_id);

-- Order Timeline:
CREATE POLICY "Parties can view order timeline" ON order_timeline FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_timeline.order_id AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid()))
);
CREATE POLICY "Parties can insert order timeline" ON order_timeline FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_timeline.order_id AND (orders.buyer_id = auth.uid() OR orders.farmer_id = auth.uid()))
);
