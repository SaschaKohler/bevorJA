import type {
  Product,
  Order,
  OrderCreateData,
  HomeContent,
  OrderLookupData,
  ProductImage,
  CustomSection,
  // NEW: Flexible Framework
  Occasion,
  OccasionDetail,
  BoxType,
  CardPackage,
  ProductVariant,
  ProductVariantListItem,
  ProductVariantImage,
  ConfiguratorData,
  // Admin extended types
  AdminOccasion,
  AdminSiteContent,
  AdminCustomer,
  AdminCustomerDetail,
  AdminMedia,
  AdminSettings,
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

// NEW: Flexible Framework APIs
export async function getOccasions(): Promise<Occasion[]> {
  const data = await fetchApi<PaginatedResponse<Occasion>>("/api/products/occasions/");
  return data.results;
}

export async function getOccasion(slug: string): Promise<OccasionDetail> {
  return fetchApi<OccasionDetail>(`/api/products/occasions/${slug}/`);
}

export async function getBoxTypes(): Promise<BoxType[]> {
  const data = await fetchApi<PaginatedResponse<BoxType>>("/api/products/box-types/");
  return data.results;
}

export async function getCardPackages(occasionSlug?: string): Promise<CardPackage[]> {
  const url = occasionSlug
    ? `/api/products/card-packages/?occasion=${occasionSlug}`
    : "/api/products/card-packages/";
  const data = await fetchApi<PaginatedResponse<CardPackage>>(url);
  return data.results;
}

export async function getProductVariants(
  filters?: {
    occasion?: string;
    box_type?: string;
    card_count?: number;
    is_default?: boolean;
  }
): Promise<ProductVariantListItem[]> {
  const params = new URLSearchParams();
  if (filters?.occasion) params.append("occasion", filters.occasion);
  if (filters?.box_type) params.append("box_type", filters.box_type);
  if (filters?.card_count) params.append("card_count", filters.card_count.toString());
  if (filters?.is_default) params.append("is_default", "true");

  const query = params.toString();
  const url = query ? `/api/products/variants/?${query}` : "/api/products/variants/";

  const data = await fetchApi<PaginatedResponse<ProductVariantListItem>>(url);
  return data.results;
}

export async function getProductVariant(slug: string): Promise<ProductVariant> {
  return fetchApi<ProductVariant>(`/api/products/variants/${slug}/`);
}

export async function getConfiguratorData(): Promise<ConfiguratorData> {
  return fetchApi<ConfiguratorData>("/api/products/configurator/");
}

export async function getVariantImages(slug: string): Promise<ProductVariantImage[]> {
  return fetchApi<ProductVariantImage[]>(`/api/products/variants/${slug}/images/`);
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

// ---------------------------------------------------------------------------
// Admin helpers
// ---------------------------------------------------------------------------

function getAdminToken(): string {
  return localStorage.getItem("admin_token") || "";
}

async function adminFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${getAdminToken()}`,
      ...options?.headers,
    },
    ...options,
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// ---------------------------------------------------------------------------
// Admin BoxTypes
// ---------------------------------------------------------------------------

export async function getAdminBoxTypes(): Promise<BoxType[]> {
  const data = await adminFetch<PaginatedResponse<BoxType>>("/api/admin/box-types/");
  return data.results;
}

export async function createBoxType(data: Partial<BoxType>): Promise<BoxType> {
  return adminFetch<BoxType>("/api/admin/box-types/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBoxType(id: number, data: Partial<BoxType>): Promise<BoxType> {
  return adminFetch<BoxType>(`/api/admin/box-types/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBoxType(id: number): Promise<void> {
  await adminFetch<unknown>(`/api/admin/box-types/${id}/`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Admin CardPackages
// ---------------------------------------------------------------------------

export async function getAdminCardPackages(): Promise<CardPackage[]> {
  const data = await adminFetch<PaginatedResponse<CardPackage>>("/api/admin/card-packages/");
  return data.results;
}

export async function createCardPackage(data: Partial<CardPackage>): Promise<CardPackage> {
  return adminFetch<CardPackage>("/api/admin/card-packages/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCardPackage(
  id: number,
  data: Partial<CardPackage>
): Promise<CardPackage> {
  return adminFetch<CardPackage>(`/api/admin/card-packages/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCardPackage(id: number): Promise<void> {
  await adminFetch<unknown>(`/api/admin/card-packages/${id}/`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Admin Occasions
// ---------------------------------------------------------------------------

export async function getAdminOccasions(): Promise<AdminOccasion[]> {
  const data = await adminFetch<PaginatedResponse<AdminOccasion>>("/api/admin/occasions/");
  return data.results;
}

export async function createOccasion(data: Partial<Occasion>): Promise<Occasion> {
  return adminFetch<Occasion>("/api/admin/occasions/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateOccasion(id: number, data: Partial<Occasion>): Promise<Occasion> {
  return adminFetch<Occasion>(`/api/admin/occasions/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Admin Variants
// ---------------------------------------------------------------------------

export async function getAdminVariants(
  filters?: { occasion?: string; box_type?: string; is_active?: boolean; page?: number }
): Promise<{ results: ProductVariantListItem[]; count: number }> {
  const params = new URLSearchParams();
  if (filters?.occasion) params.append("occasion", filters.occasion);
  if (filters?.box_type) params.append("box_type", filters.box_type);
  if (filters?.is_active !== undefined) params.append("is_active", String(filters.is_active));
  if (filters?.page) params.append("page", String(filters.page));

  const query = params.toString();
  const url = query ? `/api/admin/variants/?${query}` : "/api/admin/variants/";
  const data = await adminFetch<PaginatedResponse<ProductVariantListItem>>(url);
  return { results: data.results, count: data.count };
}

export async function getAdminVariant(id: number): Promise<ProductVariant> {
  return adminFetch<ProductVariant>(`/api/admin/variants/${id}/`);
}

export async function createVariant(data: Record<string, unknown>): Promise<ProductVariant> {
  return adminFetch<ProductVariant>("/api/admin/variants/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateVariant(
  id: number,
  data: Record<string, unknown>
): Promise<ProductVariant> {
  return adminFetch<ProductVariant>(`/api/admin/variants/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteVariant(id: number): Promise<void> {
  await adminFetch<unknown>(`/api/admin/variants/${id}/`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Admin Orders
// ---------------------------------------------------------------------------

export async function getAdminOrders(
  filters?: {
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
  }
): Promise<{ results: Order[]; count: number; next: string | null; previous: string | null }> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.date_from) params.append("date_from", filters.date_from);
  if (filters?.date_to) params.append("date_to", filters.date_to);
  if (filters?.page) params.append("page", String(filters.page));

  const query = params.toString();
  const url = query ? `/api/admin/orders/?${query}` : "/api/admin/orders/";
  return adminFetch<{ results: Order[]; count: number; next: string | null; previous: string | null }>(url);
}

export async function getAdminOrder(id: number): Promise<Order> {
  return adminFetch<Order>(`/api/admin/orders/${id}/`);
}

export async function updateOrderStatus(
  id: number,
  status: string,
  comment?: string,
  tracking_number?: string
): Promise<Order> {
  return adminFetch<Order>(`/api/admin/orders/${id}/status/`, {
    method: "PATCH",
    body: JSON.stringify({ status, comment, tracking_number }),
  });
}

// ---------------------------------------------------------------------------
// Admin Sections
// ---------------------------------------------------------------------------

export async function getAdminSections(): Promise<CustomSection[]> {
  return adminFetch<CustomSection[]>("/api/admin/sections/");
}

export async function adminCreateSection(
  data: Partial<CustomSection>
): Promise<CustomSection> {
  return adminFetch<CustomSection>("/api/admin/sections/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function adminUpdateSection(
  id: number,
  data: Partial<CustomSection>
): Promise<CustomSection> {
  return adminFetch<CustomSection>(`/api/admin/sections/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function adminDeleteSection(id: number): Promise<void> {
  await adminFetch<unknown>(`/api/admin/sections/${id}/`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Admin SiteContent
// ---------------------------------------------------------------------------

export async function getAdminSiteContent(): Promise<AdminSiteContent[]> {
  const data = await adminFetch<PaginatedResponse<AdminSiteContent>>("/api/admin/site-content/");
  return data.results;
}

export async function updateSiteContent(
  id: number,
  data: { content?: string; content_en?: string }
): Promise<AdminSiteContent> {
  return adminFetch<AdminSiteContent>(`/api/admin/site-content/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Admin Customers
// ---------------------------------------------------------------------------

export async function getAdminCustomers(
  filters?: { search?: string; page?: number }
): Promise<{ results: AdminCustomer[]; count: number }> {
  const params = new URLSearchParams();
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", String(filters.page));

  const query = params.toString();
  const url = query ? `/api/admin/customers/?${query}` : "/api/admin/customers/";
  const data = await adminFetch<PaginatedResponse<AdminCustomer>>(url);
  return { results: data.results, count: data.count };
}

export async function getAdminCustomer(id: number): Promise<AdminCustomerDetail> {
  return adminFetch<AdminCustomerDetail>(`/api/admin/customers/${id}/`);
}

// ---------------------------------------------------------------------------
// Admin Settings
// ---------------------------------------------------------------------------

export async function getAdminSettings(): Promise<AdminSettings> {
  return adminFetch<AdminSettings>("/api/admin/settings/");
}

export async function updateAdminSettings(
  data: Partial<AdminSettings>
): Promise<AdminSettings> {
  return adminFetch<AdminSettings>("/api/admin/settings/", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ---------------------------------------------------------------------------
// Admin Media
// ---------------------------------------------------------------------------

export async function getAdminMedia(
  filters?: { page?: number; search?: string }
): Promise<{ results: AdminMedia[]; count: number }> {
  const params = new URLSearchParams();
  if (filters?.page) params.append("page", String(filters.page));
  if (filters?.search) params.append("search", filters.search);

  const query = params.toString();
  const url = query ? `/api/admin/media/?${query}` : "/api/admin/media/";
  const data = await adminFetch<PaginatedResponse<AdminMedia>>(url);
  return { results: data.results, count: data.count };
}

export async function uploadAdminMedia(formData: FormData): Promise<AdminMedia> {
  const response = await fetch(`${API_BASE}/api/admin/media/upload/`, {
    method: "POST",
    headers: { Authorization: `Token ${getAdminToken()}` },
    body: formData,
  });
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/admin/login";
    }
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deleteAdminMedia(id: number): Promise<void> {
  await adminFetch<unknown>(`/api/admin/media/${id}/`, { method: "DELETE" });
}

export async function getAdminMediaUsage(
  id: number
): Promise<{ used_in: { type: string; name: string; id: number }[] }> {
  return adminFetch<{ used_in: { type: string; name: string; id: number }[] }>(
    `/api/admin/media/${id}/usage/`
  );
}
