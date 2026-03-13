export type OrderItem = {
  id: number;
  name: string;
  qty: number;
  price: number;
  note?: string;
};

export type Order = {
  id: number;            // ✅ NUMBER ONLY (fixes your error)
  items: OrderItem[];
  customer?: any;
  orderType: string;
  paymentMethod: string;
  subtotal: number;
  total: number;
  time: string;
};
