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

// CMS Content Types
export interface SiteContentItem {
  content: string;
  content_en?: string;
  image?: string;
}

export interface SiteContentSection {
  [key: string]: SiteContentItem;
}

export interface HomeFeature {
  id: number;
  icon: string;
  title: string;
  description: string;
  order: number;
  is_active: boolean;
}

export interface HomeContent {
  sections: {
    [section: string]: SiteContentSection;
  };
  hero_features: HomeFeature[];
}

// Product Image Gallery
export interface ProductImage {
  id: number;
  image: string;
  image_url: string | null;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

// Custom Sections
export type TemplatType =
  | "hero"
  | "text_image_left"
  | "text_image_right"
  | "features_grid"
  | "testimonials"
  | "faq"
  | "gallery"
  | "timeline"
  | "countdown"
  | "video"
  | "pricing"
  | "contact";

export interface SectionImage {
  id: number;
  image: string;
  image_url: string | null;
  alt_text: string;
  order: number;
}

export interface CustomSection {
  id: number;
  title: string;
  anchor: string;
  template_type: TemplatType;
  template_type_display: string;
  content: Record<string, unknown>;
  order: number;
  is_active: boolean;
  images: SectionImage[];
  created_at: string;
}

// Order Lookup
export interface OrderLookupData {
  email: string;
  order_number: string;
}
