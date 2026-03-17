/**
 * BhojPe — POS API Layer
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  Production API ready hone par sirf EP object mein URL badlein        │
 * └────────────────────────────────────────────────────────────────────────┘
 */

import client from "../client";
import dummy from "../../data/posDummyData.json";

const EP = {
  MENU_ITEMS:           "/menu-items",
  TABLES:               "/tables",
  CUSTOMERS:            "/customers",
  CUSTOMERS_SEARCH:     "/customers/search",
  WAITERS:              "/staff/waiters",
  DELIVERY_EXECUTIVES:  "/staff/delivery-executives",
  ORDERS:               "/orders",
  ORDER_BY_ID:          (id: string) => `/orders/${id}`,
  ORDER_KOT:            (id: string) => `/orders/${id}/kot`,
  ORDER_BILL:           (id: string) => `/orders/${id}/bill`,
  ORDER_CHECKOUT:       (id: string) => `/orders/${id}/checkout`,
  ORDER_HOLD:           (id: string) => `/orders/${id}/hold`,
  VALIDATE_COUPON:      "/coupons/validate",
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PosMenuItem {
  id: number;
  name: string;
  price: number;
  cat: string;
  type: "veg" | "nonveg" | "egg";
  img: string;
  active: boolean;
}

export interface PosTable {
  id: string;
  name: string;
  seats: number;
  status: "avail" | "running" | "print" | "reserved";
  kots?: number;
  time?: string;
}

export interface PosFloor {
  floor: string;
  tables: PosTable[];
}

export interface PosCustomer {
  id: number;
  name: string;
  phone: string;
  addr: string;
  orders: number;
  initials: string;
}

export interface PosStaff {
  id: string;
  name: string;
}

export interface CreateOrderPayload {
  channel: "dine" | "pickup" | "delivery";
  table_id?: string;
  customer_id?: number;
  waiter_id?: string;
  delivery_exec_id?: string;
  platform?: string;
  pax?: number;
  pickup_date?: string;
  pickup_time?: string;
  delivery_charge?: number;
  delivery_km?: number;
  order_note?: string;
  payment_mode: string;
  discount_type?: "percent" | "fixed" | "coupon";
  discount_value?: number;
  coupon_code?: string;
  discount_reason?: string;
  items: { menu_item_id: number; qty: number; note?: string; price: number }[];
}

// ─── GET Functions ─────────────────────────────────────────────────────────

export async function getPosMenuItems(): Promise<PosMenuItem[]> {
  try {
    const res = await client.get(EP.MENU_ITEMS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.menu_items.data as PosMenuItem[];
  }
}

export async function getPosTables(): Promise<PosFloor[]> {
  try {
    const res = await client.get(EP.TABLES);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.tables.data as PosFloor[];
  }
}

export async function getPosCustomers(): Promise<PosCustomer[]> {
  try {
    const res = await client.get(EP.CUSTOMERS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.customers.data as PosCustomer[];
  }
}

export async function searchPosCustomers(q: string): Promise<PosCustomer[]> {
  try {
    const res = await client.get(`${EP.CUSTOMERS_SEARCH}?q=${encodeURIComponent(q)}`);
    return res.data?.data ?? res.data;
  } catch {
    const all = dummy.customers.data as PosCustomer[];
    return all.filter(c =>
      c.name.toLowerCase().includes(q.toLowerCase()) || c.phone.includes(q)
    );
  }
}

export async function getPosWaiters(): Promise<PosStaff[]> {
  try {
    const res = await client.get(EP.WAITERS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.waiters.data as PosStaff[];
  }
}

export async function getPosDeliveryExecs(): Promise<PosStaff[]> {
  try {
    const res = await client.get(EP.DELIVERY_EXECUTIVES);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.delivery_executives.data as PosStaff[];
  }
}

export async function createPosCustomer(payload: {
  name: string; phone: string; addr?: string; email?: string; pincode?: string; note?: string;
}): Promise<PosCustomer> {
  const res = await client.post(EP.CUSTOMERS, payload);
  return res.data?.data ?? res.data;
}

// ─── Order Operations ─────────────────────────────────────────────────────

export async function createPosOrder(payload: CreateOrderPayload) {
  const res = await client.post(EP.ORDERS, payload);
  return res.data?.data ?? res.data;
}

export async function sendKot(orderId: string) {
  const res = await client.post(EP.ORDER_KOT(orderId), {});
  return res.data?.data ?? res.data;
}

export async function generateBill(orderId: string) {
  const res = await client.post(EP.ORDER_BILL(orderId), {});
  return res.data?.data ?? res.data;
}

export async function checkoutOrder(orderId: string, paymentMode: string) {
  const res = await client.post(EP.ORDER_CHECKOUT(orderId), { payment_mode: paymentMode });
  return res.data?.data ?? res.data;
}

export async function holdOrder(orderId: string) {
  const res = await client.post(EP.ORDER_HOLD(orderId), {});
  return res.data?.data ?? res.data;
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const res = await client.post(EP.VALIDATE_COUPON, { code, subtotal });
    return res.data?.data as { valid: boolean; discount_type: "percent" | "fixed"; value: number };
  } catch {
    const coupons: Record<string, { type: "percent" | "fixed"; value: number }> = {
      FLAT10: { type: "percent", value: 10 },
      SAVE50: { type: "fixed", value: 50 },
      VIP20:  { type: "percent", value: 20 },
    };
    const c = coupons[code.toUpperCase()];
    if (c) return { valid: true, discount_type: c.type, value: c.value };
    return { valid: false, discount_type: "percent" as const, value: 0 };
  }
}

// ─── Convenience: Load all POS init data ──────────────────────────────────

export async function loadPosInitData() {
  const [menuItems, tables, customers, waiters, deliveryExecs] = await Promise.allSettled([
    getPosMenuItems(),
    getPosTables(),
    getPosCustomers(),
    getPosWaiters(),
    getPosDeliveryExecs(),
  ]);
  return {
    menuItems:     menuItems.status     === "fulfilled" ? menuItems.value     : dummy.menu_items.data as PosMenuItem[],
    tables:        tables.status        === "fulfilled" ? tables.value        : dummy.tables.data as PosFloor[],
    customers:     customers.status     === "fulfilled" ? customers.value     : dummy.customers.data as PosCustomer[],
    waiters:       waiters.status       === "fulfilled" ? waiters.value       : dummy.waiters.data as PosStaff[],
    deliveryExecs: deliveryExecs.status === "fulfilled" ? deliveryExecs.value : dummy.delivery_executives.data as PosStaff[],
  };
}
