import type {
  Product,
  Order,
  OrderCreateData,
  HomeContent,
  OrderLookupData,
  ProductImage,
  CustomSection,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchApiRaw(url: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${url}`, options);
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getProducts(): Promise<Product[]> {
  const data = await fetchApi<PaginatedResponse<Product>>("/api/products/");
  return data.results;
}

export async function getProduct(slug: string): Promise<Product> {
  return fetchApi<Product>(`/api/products/${slug}/`);
}

export async function createOrder(data: OrderCreateData): Promise<Order> {
  return fetchApi<Order>("/api/orders/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getOrder(orderNumber: string): Promise<Order> {
  return fetchApi<Order>(`/api/orders/${orderNumber}/`);
}

interface CheckoutResponse {
  session_id: string;
  url: string;
}

export async function createCheckoutSession(
  orderId: number,
  items: { product_id: number; quantity: number }[]
): Promise<CheckoutResponse> {
  return fetchApi<CheckoutResponse>("/api/payments/create-checkout-session/", {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, items }),
  });
}

interface StripeConfig {
  publishable_key: string;
}

export async function getStripeConfig(): Promise<StripeConfig> {
  return fetchApi<StripeConfig>("/api/payments/config/");
}

// CMS Content API
export async function getHomeContent(): Promise<HomeContent> {
  return fetchApi<HomeContent>("/api/content/home/");
}

interface SiteContentItem {
  content: string;
  content_en?: string;
}

export async function updateContent(id: number, data: Partial<SiteContentItem>): Promise<SiteContentItem> {
  return fetchApi<SiteContentItem>(`/api/admin/content/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Order Lookup API
export async function orderLookup(data: OrderLookupData): Promise<Order> {
  return fetchApi<Order>("/api/orders/lookup/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Product Image API
export async function getProductImages(slug: string): Promise<ProductImage[]> {
  return fetchApi<ProductImage[]>(`/api/products/${slug}/images/`);
}

export async function uploadProductImage(
  slug: string,
  formData: FormData,
  token: string
): Promise<ProductImage> {
  const resp = await fetchApiRaw(`/api/admin/products/${slug}/images/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: formData,
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function deleteProductImage(
  slug: string,
  imageId: number,
  token: string
): Promise<void> {
  const resp = await fetchApiRaw(`/api/admin/products/${slug}/images/${imageId}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function updateProductImage(
  slug: string,
  imageId: number,
  data: Partial<ProductImage>,
  token: string
): Promise<ProductImage> {
  const resp = await fetchApiRaw(`/api/admin/products/${slug}/images/${imageId}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function updateProduct(
  pk: number,
  data: Partial<Product>
): Promise<Product> {
  return fetchApi<Product>(`/api/admin/products/${pk}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// Custom Sections API
export async function getSections(): Promise<CustomSection[]> {
  return fetchApi<CustomSection[]>("/api/content/sections/");
}

export async function createSection(
  data: Partial<CustomSection>,
  token: string
): Promise<CustomSection> {
  const resp = await fetchApiRaw("/api/admin/sections/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function updateSection(
  id: number,
  data: Partial<CustomSection>,
  token: string
): Promise<CustomSection> {
  const resp = await fetchApiRaw(`/api/admin/sections/${id}/`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function deleteSection(id: number, token: string): Promise<void> {
  const resp = await fetchApiRaw(`/api/admin/sections/${id}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

export async function uploadSectionImage(
  sectionId: number,
  formData: FormData,
  token: string
): Promise<unknown> {
  const resp = await fetchApiRaw(`/api/admin/sections/${sectionId}/images/`, {
    method: "POST",
    headers: { Authorization: `Token ${token}` },
    body: formData,
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export async function deleteSectionImage(
  sectionId: number,
  imageId: number,
  token: string
): Promise<void> {
  const resp = await fetchApiRaw(`/api/admin/sections/${sectionId}/images/${imageId}/`, {
    method: "DELETE",
    headers: { Authorization: `Token ${token}` },
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
}

// Admin Auth
interface LoginResponse {
  token: string;
  user: { username: string; is_staff: boolean };
}

export async function adminLogin(password: string): Promise<LoginResponse> {
  const resp = await fetchApiRaw("/api/admin/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${resp.status}`);
  }
  return resp.json();
}
