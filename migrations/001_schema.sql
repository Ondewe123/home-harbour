-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Households table
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Brands table
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, name)
);

-- Shops table
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(household_id, name)
);

-- Pantry items table
CREATE TABLE pantry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit TEXT NOT NULL DEFAULT 'piece' CHECK (unit IN ('piece','ml','l','g','kg','oz','lb','cup','tbsp','tsp','package')),
  photo_url TEXT,
  photo_storage_path TEXT,
  typical_shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  notes TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_pantry_items_household_id ON pantry_items(household_id);
CREATE INDEX idx_pantry_items_category ON pantry_items(household_id, category);
CREATE INDEX idx_pantry_items_archived ON pantry_items(household_id, is_archived);

-- Usage logs table
CREATE TABLE usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pantry_item_id UUID NOT NULL REFERENCES pantry_items(id) ON DELETE CASCADE,
  quantity_used DECIMAL(10, 2) NOT NULL CHECK (quantity_used > 0),
  unit TEXT NOT NULL,
  logged_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

CREATE INDEX idx_usage_logs_item_date ON usage_logs(pantry_item_id, logged_at DESC);
CREATE INDEX idx_usage_logs_logged_by ON usage_logs(logged_by, logged_at DESC);

-- Shopping lists table
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','completed','archived')),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_shopping_lists_household_status ON shopping_lists(household_id, status);
CREATE INDEX idx_shopping_lists_created_at ON shopping_lists(created_at DESC);

-- Shopping list items table
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  pantry_item_id UUID REFERENCES pantry_items(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit TEXT,
  is_checked BOOLEAN DEFAULT FALSE,
  checked_by UUID REFERENCES users(id) ON DELETE SET NULL,
  checked_at TIMESTAMP WITH TIME ZONE,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  shop_id UUID REFERENCES shops(id) ON DELETE SET NULL,
  notes TEXT,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  source TEXT CHECK (source IN ('auto-generated','manual','edited'))
);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_checked ON shopping_list_items(shopping_list_id, is_checked);

-- Item requests table
CREATE TABLE item_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fulfilled_by UUID REFERENCES users(id) ON DELETE SET NULL,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  is_fulfilled BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_item_requests_list ON item_requests(shopping_list_id);
CREATE INDEX idx_item_requests_fulfilled ON item_requests(household_id, is_fulfilled);

-- Shopping list history table
CREATE TABLE shopping_list_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
  action TEXT,
  details JSONB,
  performed_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_shopping_list_history_list ON shopping_list_history(shopping_list_id);

-- Enable RLS on all tables
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for households
CREATE POLICY "Users access their household" ON households
  FOR SELECT USING (
    id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for users
CREATE POLICY "Users see household members" ON users
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for brands
CREATE POLICY "Users access household brands" ON brands
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for shops
CREATE POLICY "Users access household shops" ON shops
  FOR ALL USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for pantry_items
CREATE POLICY "Users access household pantry items" ON pantry_items
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Admins can modify pantry items" ON pantry_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update pantry items" ON pantry_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete pantry items" ON pantry_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for usage_logs
CREATE POLICY "Users access household usage logs" ON usage_logs
  FOR SELECT USING (
    pantry_item_id IN (
      SELECT id FROM pantry_items WHERE household_id IN (
        SELECT household_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can log usage" ON usage_logs
  FOR INSERT WITH CHECK (
    logged_by IN (
      SELECT id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for shopping_lists
CREATE POLICY "Users access household shopping lists" ON shopping_lists
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can create shopping lists" ON shopping_lists
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify their household shopping lists" ON shopping_lists
  FOR UPDATE USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for shopping_list_items
CREATE POLICY "Users access household list items" ON shopping_list_items
  FOR SELECT USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage shopping list items" ON shopping_list_items
  FOR ALL USING (
    shopping_list_id IN (
      SELECT id FROM shopping_lists WHERE household_id IN (
        SELECT household_id FROM users WHERE auth_id = auth.uid()
      )
    )
  );

-- RLS Policies for item_requests
CREATE POLICY "Users access household item requests" ON item_requests
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can request items" ON item_requests
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage item requests" ON item_requests
  FOR UPDATE USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

-- RLS Policies for shopping_list_history
CREATE POLICY "Users access household history" ON shopping_list_history
  FOR SELECT USING (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Users can create history records" ON shopping_list_history
  FOR INSERT WITH CHECK (
    household_id IN (
      SELECT household_id FROM users WHERE auth_id = auth.uid()
    )
  );
