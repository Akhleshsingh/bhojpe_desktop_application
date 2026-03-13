export type Customer = {
  id: number;
  name: string;
  phone: number | null;
  email: string | null;
  delivery_address: string | null;
  orders_count: number;
};
