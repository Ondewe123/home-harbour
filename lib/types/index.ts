export type UserRole = 'admin' | 'user';

export interface Household {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  auth_id: string;
  email: string;
  display_name: string;
  household_id: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Brand {
  id: string;
  household_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Shop {
  id: string;
  household_id: string;
  name: string;
  location?: string;
  notes?: string;
  created_at: string;
}

export interface PantryItem {
  id: string;
  household_id: string;
  name: string;
  category: string;
  brand_id?: string;
  quantity: number;
  unit: string;
  photo_url?: string;
  photo_storage_path?: string;
  typical_shop_id?: string;
  notes?: string;
  is_archived: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface UsageLog {
  id: string;
  pantry_item_id: string;
  quantity_used: number;
  unit: string;
  logged_by: string;
  logged_at: string;
  notes?: string;
}

export interface ShoppingList {
  id: string;
  household_id: string;
  name: string;
  status: 'active' | 'completed' | 'archived';
  created_by: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  pantry_item_id?: string;
  name: string;
  quantity: number;
  unit?: string;
  is_checked: boolean;
  checked_by?: string;
  checked_at?: string;
  brand_id?: string;
  shop_id?: string;
  notes?: string;
  added_by: string;
  added_at: string;
  source: 'auto-generated' | 'manual' | 'edited';
}

export interface ItemRequest {
  id: string;
  shopping_list_id: string;
  household_id: string;
  item_name: string;
  quantity?: number;
  unit?: string;
  requested_by: string;
  requested_at: string;
  fulfilled_by?: string;
  fulfilled_at?: string;
  is_fulfilled: boolean;
}

export interface AuthContextType {
  user: User | null;
  household: Household | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signOut: () => Promise<void>;
}
