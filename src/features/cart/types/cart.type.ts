export type CartItemOption = {
  name: string;
  values: string[];
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  options?: CartItemOption[];
};

export type CartResponse = {
  items: CartItem[];
};

export type CartCountResponse = {
  count: number;
};

export type CreateOrderResponse = {
  success: boolean;
  order: { id: string };
  error?: string;
};
