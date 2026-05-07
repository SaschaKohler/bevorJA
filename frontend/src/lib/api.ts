import type { Product, Order, OrderCreateData } from "@/types";

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
