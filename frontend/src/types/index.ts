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

// NEW: Flexible Framework Types
export interface Occasion {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color_primary: string;
  color_secondary: string;
  sort_order: number;
  is_active: boolean;
  is_default: boolean;
}

export interface OccasionContent {
  id: number;
  key: string;
  key_display: string;
  content: string;
  content_en?: string;
  image?: string;
}

export interface OccasionDetail extends Occasion {
  contents: OccasionContent[];
}

export interface BoxType {
  id: number;
  name: string;
  slug: string;
  description: string;
  box_type: 'audio' | 'wood' | 'hybrid';
  box_type_display: string;
  base_price: string;
  features: string[];
  weight_grams: number;
  dimensions: { length: number; width: number; height: number };
  is_active: boolean;
  sort_order: number;
}

export interface CardPackage {
  id: number;
  name: string;
  slug: string;
  card_count: number;
  price: string;
  available_designs: string[];
  occasion_slugs: string[];
  is_active: boolean;
  sort_order: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  slug: string;
  description: string;
  box_type: BoxType;
  card_package: CardPackage;
  occasion: Occasion | null;
  calculated_price: string;
  card_count: number;
  is_active: boolean;
  is_default: boolean;
  image: string | null;
  gallery_images: ProductVariantImage[];
  customization_options: {
    engraving?: boolean;
    color_choice?: string[];
    message_card?: boolean;
    occasion_designs?: string[];
  };
  created_at: string;
}

export interface ProductVariantImage {
  id: number;
  image: string;
  image_url: string | null;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

export interface ProductVariantListItem {
  id: number;
  slug: string;
  name: string;
  box_type_name: string;
  box_type_slug: string;
  card_count: number;
  occasion_name: string | null;
  occasion_slug: string | null;
  calculated_price: string;
  is_active: boolean;
  is_default: boolean;
  image: string | null;
}

export interface ConfiguratorData {
  occasions: Occasion[];
  box_types: BoxType[];
  card_packages: CardPackage[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  // NEW: Flexible Framework
  variant?: ProductVariant;
  box_type?: BoxType;
  card_package?: CardPackage;
  occasion?: Occasion;
  customization?: {
    engraving_text?: string;
    box_color?: string;
    selected_design?: string;
    message_card_text?: string;
  };
}

export interface OrderCreateItem {
  product_id: number;
  quantity: number;
  // NEW: Flexible Framework
  variant_id?: number;
  customization?: {
    engraving_text?: string;
    box_color?: string;
    selected_design?: string;
    message_card_text?: string;
  };
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
  // NEW: Flexible Framework
  occasion?: Occasion;
  customization_details?: {
    engraving?: string;
    box_color?: string;
    selected_design?: string;
  };
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

// Admin Dashboard Types
export interface DashboardStats {
  revenue: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    trend: number;
  };
  orders: {
    pending: number;
    processing: number;
    shipped: number;
    totalToday: number;
  };
  products: {
    activeVariants: number;
    totalOccasions: number;
    totalBoxTypes: number;
  };
  customers: {
    total: number;
    newThisMonth: number;
  };
  recentOrders?: {
    id: number;
    order_number: string;
    customer_name: string;
    total: string;
    status: string;
    created_at: string;
  }[];
}

export interface ChartData {
  revenue: {
    date: string;
    amount: number;
  }[];
  orderStatus: {
    name: string;
    value: number;
    color?: string;
  }[];
}

// Admin API Types
export interface AdminUser {
  id: number;
  username: string;
  email: string;
  is_staff: boolean;
  role?: "superadmin" | "content_manager" | "product_manager" | "order_manager";
}
