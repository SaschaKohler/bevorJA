export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  card_count: number;
  price: string;
  image: string | null;
  features: string[];
  is_active: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderCreateItem {
  product_id: number;
  quantity: number;
}

export interface OrderCreateData {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  street: string;
  zip_code: string;
  city: string;
  country?: string;
  notes?: string;
  items: OrderCreateItem[];
}

export interface OrderItem {
  id: number;
  product: number;
  product_detail: Product;
  quantity: number;
  price: string;
  subtotal: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  street: string;
  zip_code: string;
  city: string;
  country: string;
  notes: string;
  total: string;
  items: OrderItem[];
  created_at: string;
}
