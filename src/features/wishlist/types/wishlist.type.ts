export type WishlistItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  description?: string;
  wishlistItemId?: string;
};

export type WishlistResponse = {
  items: WishlistItem[];
};

export type WishlistCountResponse = {
  count: number;
};

export type WishlistCheckResponse = {
  inWishlist: boolean;
};

export type WishlistActionResponse = {
  success: boolean;
  message?: string;
  error?: string;
};
