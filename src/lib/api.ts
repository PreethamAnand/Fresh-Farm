import { clearCurrentUser, getAuthToken, getCurrentUser, type SessionUser } from "@/lib/session";

const API_BASE = "/api";

function resolveUserPath(userId?: string) {
  return encodeURIComponent(userId ?? "me");
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init?.headers ?? {}),
      },
      ...init,
    });
  } catch {
    throw new Error("Unable to reach API server. Please run `npm run api` and try again.");
  }

  const rawBody = await response.text();
  const isJsonResponse = response.headers.get("content-type")?.includes("application/json");
  const payload = (isJsonResponse
    ? (JSON.parse(rawBody) as T & { error?: string })
    : ({ error: rawBody || "Unexpected non-JSON response from server." } as T & { error?: string }));

  const normalizedError =
    !isJsonResponse && response.status >= 500
      ? "API server is unavailable or misconfigured. Please ensure backend is running with `npm run api`."
      : payload.error;

  if (!response.ok) {
    if (response.status === 401) {
      clearCurrentUser();
      throw new Error(normalizedError ?? "Session expired. Please sign in again.");
    }

    throw new Error(normalizedError ?? "Request failed");
  }

  return payload;
}

export interface CartItem {
  key: string;
  name: string;
  farm: string;
  price: number;
  unit: string;
  qty: number;
  image: string;
  isOrganic?: boolean;
}

export interface OrderItem {
  name: string;
  price: number;
  qty: number;
  image: string;
}

export interface Order {
  orderId: string;
  date: string;
  status: "processing" | "in_transit" | "delivered";
  total: number;
  items: OrderItem[];
}

export interface Conversation {
  id: string;
  name: string;
  farm: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
  isVerified?: boolean;
  online?: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "farmer";
  time: string;
}

export interface MarketplaceProduct {
  id: string;
  name: string;
  farm: string;
  price: number;
  unit: string;
  rating: number;
  image: string;
  category?: "vegetables" | "fruits" | "dairy" | "grains";
  isOrganic?: boolean;
  isVerified?: boolean;
  distance?: string;
  stock?: number;
  discount?: number;
}

interface AuthResponse {
  user: SessionUser;
  token: string;
}

function createLocalGuestAuthResponse(role: "guest" | "seller"): AuthResponse {
  if (role === "seller") {
    return {
      user: {
        userId: "seller_guest_local",
        name: "Demo Seller",
        email: "seller@freshfarm.local",
        role: "seller",
      },
      token: "seller-demo-token",
    };
  }

  return {
    user: {
      userId: "guest_local",
      name: "Guest User",
      email: "guest@freshfarm.local",
      role: "guest",
    },
    token: "guest-token",
  };
}

// Demo fallback data for deployed environments without backend
const fallbackSellerProducts: SellerProduct[] = [
  {
    id: "demo-1",
    name: "Fresh Organic Tomatoes",
    farm: "Fresh Valley Farm",
    price: 60,
    unit: "kg",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop",
    isOrganic: true,
    isVerified: true,
    stock: 120,
    status: "active",
  },
  {
    id: "demo-2",
    name: "Baby Spinach",
    farm: "Fresh Valley Farm",
    price: 45,
    unit: "250g",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
    isOrganic: true,
    isVerified: true,
    stock: 85,
    status: "active",
  },
];

const fallbackSellerStats: SellerStats = {
  totalOrders: 42,
  totalRevenue: 8500,
  activeProducts: 2,
  rating: 4.7,
  pendingOrders: 3,
  completedOrders: 39,
  totalCustomers: 28,
};

const fallbackSellerOrders: SellerOrder[] = [
  {
    orderId: "ORD-001",
    buyerName: "Rajesh Kumar",
    buyerEmail: "rajesh@example.com",
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "delivered",
    total: 450,
    items: [
      { name: "Fresh Organic Tomatoes", price: 60, qty: 3, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop" },
      { name: "Baby Spinach", price: 45, qty: 2, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop" },
    ],
  },
  {
    orderId: "ORD-002",
    buyerName: "Priya Singh",
    buyerEmail: "priya@example.com",
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "in_transit",
    total: 320,
    items: [
      { name: "Fresh Organic Tomatoes", price: 60, qty: 2, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=400&fit=crop" },
    ],
  },
];

const fallbackConversations: Conversation[] = [
  {
    id: "conv-1",
    name: "Rajesh Kumar",
    farm: "Green Valley Farm",
    avatar: "🧑‍🌾",
    lastMessage: "When can you deliver next batch?",
    time: "2:30 PM",
    unread: 0,
    isVerified: true,
    online: true,
  },
  {
    id: "conv-2",
    name: "Priya Singh",
    farm: "Sunrise Organics",
    avatar: "👩‍🌾",
    lastMessage: "Product quality is great!",
    time: "1:15 PM",
    unread: 1,
    isVerified: true,
    online: false,
  },
];

export async function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signup(name: string, email: string, password: string) {
  return request<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function guestLogin() {
  try {
    return await request<AuthResponse>("/auth/guest", {
      method: "POST",
    });
  } catch {
    return createLocalGuestAuthResponse("guest");
  }
}

export async function sellerGuestLogin() {
  try {
    return await request<AuthResponse>("/auth/seller-guest", {
      method: "POST",
    });
  } catch {
    return createLocalGuestAuthResponse("seller");
  }
}

export async function getCart(userId?: string) {
  return request<{ items: CartItem[] }>(`/cart/${resolveUserPath(userId)}`);
}

export async function addToCart(product: Omit<CartItem, "qty">, userId?: string) {
  return request<{ items: CartItem[] }>(`/cart/${resolveUserPath(userId)}/items`, {
    method: "POST",
    body: JSON.stringify({ product }),
  });
}

export async function updateCartItemQty(itemKey: string, delta: number, userId?: string) {
  return request<{ items: CartItem[] }>(
    `/cart/${resolveUserPath(userId)}/items/${encodeURIComponent(itemKey)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ delta }),
    }
  );
}

export async function removeCartItem(itemKey: string, userId?: string) {
  return request<{ items: CartItem[] }>(
    `/cart/${resolveUserPath(userId)}/items/${encodeURIComponent(itemKey)}`,
    {
      method: "DELETE",
    }
  );
}

export async function checkout(userId?: string) {
  return request<{ order: Order }>(`/cart/${resolveUserPath(userId)}/checkout`, {
    method: "POST",
  });
}

export async function getOrders(userId?: string) {
  return request<{ orders: Order[] }>(`/orders/${resolveUserPath(userId)}`);
}

export async function getFavorites(userId?: string) {
  return request<{ productKeys: string[] }>(`/favorites/${resolveUserPath(userId)}`);
}

export async function toggleFavorite(productKey: string, userId?: string) {
  return request<{ productKeys: string[]; isFavorite: boolean }>(
    `/favorites/${resolveUserPath(userId)}/toggle`,
    {
      method: "POST",
      body: JSON.stringify({ productKey }),
    }
  );
}

export async function getConversations(userId?: string) {
  try {
    return await request<{ conversations: Conversation[] }>(`/chat/conversations/${resolveUserPath(userId)}`);
  } catch {
    // Return demo conversations when backend unavailable (deployed environments)
    return { conversations: fallbackConversations };
  }
}

export async function getMessages(conversationId: string) {
  return request<{ messages: ChatMessage[] }>(`/chat/messages/${encodeURIComponent(conversationId)}`);
}

export async function sendMessage(conversationId: string, text: string) {
  return request<{ message: ChatMessage }>("/chat/messages", {
    method: "POST",
    body: JSON.stringify({ conversationId, sender: "user", text }),
  });
}

export async function getMarketplaceProducts() {
  return request<{ products: MarketplaceProduct[] }>("/products");
}

// ===== SELLER API FUNCTIONS =====

export interface SellerProduct {
  id: string;
  name: string;
  farm: string;
  price: number;
  unit: string;
  rating: number;
  image: string;
  isOrganic?: boolean;
  isVerified?: boolean;
  stock: number;
  status: "active" | "inactive" | "out_of_stock";
}

export interface SellerOrder {
  orderId: string;
  buyerName: string;
  buyerEmail?: string;
  buyerUserId?: string;
  date: string;
  status: "processing" | "in_transit" | "delivered" | "cancelled";
  total: number;
  items: OrderItem[];
}

export interface CreateSellerProductPayload {
  name: string;
  price: number;
  unit: string;
  stock: number;
  image?: string;
}

export interface SellerStats {
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
  rating: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers: number;
}

export interface SellerProfile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  farmName: string;
  location: string;
  bio: string;
  since: string;
  isVerified: boolean;
  avatar: string;
}

export interface SellerMessage {
  customerId: string;
  customerName: string;
  lastMessage: string;
  unread: number;
  time: string;
}

export async function getSellerProducts(userId?: string) {
  try {
    return await request<{ products: SellerProduct[] }>(`/seller/${resolveUserPath(userId)}/products`);
  } catch {
    // Return demo products when backend unavailable (deployed environments)
    return { products: fallbackSellerProducts };
  }
}

export async function addSellerProduct(payload: CreateSellerProductPayload, userId?: string) {
  return request<{ product: SellerProduct }>(`/seller/${resolveUserPath(userId)}/products`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function removeSellerProduct(productId: string, userId?: string) {
  return request<{ success: boolean }>(
    `/seller/${resolveUserPath(userId)}/products/${encodeURIComponent(productId)}`,
    {
      method: "DELETE",
    }
  );
}

export async function getSellerOrders(userId?: string) {
  try {
    return await request<{ orders: SellerOrder[] }>(`/seller/${resolveUserPath(userId)}/orders`);
  } catch {
    // Return demo orders when backend unavailable (deployed environments)
    return { orders: fallbackSellerOrders };
  }
}

export async function updateSellerOrderStatus(orderId: string, status: string, userId?: string) {
  return request<{ success: boolean; message: string }>(
    `/seller/${resolveUserPath(userId)}/orders/${orderId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }
  );
}

export async function getSellerStats(userId?: string) {
  try {
    return await request<SellerStats>(`/seller/${resolveUserPath(userId)}/stats`);
  } catch {
    // Return demo stats when backend unavailable (deployed environments)
    return fallbackSellerStats;
  }
}

export async function getSellerProfile(userId?: string) {
  return request<SellerProfile>(`/seller/${resolveUserPath(userId)}/profile`);
}

export async function getSellerMessages(userId?: string) {
  return request<{ messages: SellerMessage[] }>(`/seller/${resolveUserPath(userId)}/messages`);
}
