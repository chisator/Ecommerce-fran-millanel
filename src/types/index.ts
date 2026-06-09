export type UserRole = "customer" | "admin";

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  images: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export type OrderStatus = "pending" | "paid" | "preparing" | "ready" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "approved" | "rejected" | "refunded";
export type DeliveryMethod = "pickup" | "sarmiento";

export interface Order {
  id: string;
  userId: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  deliveryMethod: DeliveryMethod;
  deliveryDetails?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerImage?: string;
  aboutText?: string;
  contactEmail?: string;
  contactPhone?: string;
  instagramUrl?: string;
}
