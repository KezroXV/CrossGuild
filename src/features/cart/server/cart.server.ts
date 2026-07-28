import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";

const cartItemInclude = {
  item: {
    include: {
      images: true,
      options: true,
    },
  },
} as const;

export type CartLineItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  images: { url: string }[];
  options: Array<{
    id: string;
    name: string;
    values: string[];
    itemId: string;
  }>;
  city: string | null;
};

async function getOrCreateCart(userId: string) {
  const existingCart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (existingCart) {
    return existingCart;
  }

  return prisma.cart.create({
    data: { userId },
  });
}

async function getUserCartItem(userId: string, itemId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    throw new NotFoundError("Cart not found");
  }

  const cartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_itemId: {
        cartId: cart.id,
        itemId,
      },
    },
  });

  if (!cartItem) {
    throw new NotFoundError("Item not found in cart");
  }

  return { cart, cartItem };
}

export async function getCart(userId: string): Promise<CartLineItem[]> {
  const [cart, user] = await Promise.all([
    prisma.cart.findUnique({
      where: { userId },
      include: {
        cartItems: {
          include: cartItemInclude,
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { city: true },
    }),
  ]);

  if (!cart) {
    return [];
  }

  return cart.cartItems.map(({ item, quantity }) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity,
    images: item.images,
    options: item.options,
    city: user?.city ?? null,
  }));
}

export async function addToCart(
  userId: string,
  itemId: string,
  quantity = 1
) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new NotFoundError("Item not found");
  }

  const cart = await getOrCreateCart(userId);

  const existingCartItem = await prisma.cartItem.findUnique({
    where: {
      cartId_itemId: {
        cartId: cart.id,
        itemId,
      },
    },
  });

  if (existingCartItem) {
    await prisma.cartItem.update({
      where: { id: existingCartItem.id },
      data: { quantity: existingCartItem.quantity + quantity },
    });
    return;
  }

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      itemId,
      quantity,
    },
  });
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number
) {
  const { cartItem } = await getUserCartItem(userId, itemId);

  await prisma.cartItem.update({
    where: { id: cartItem.id },
    data: { quantity },
  });
}

export async function removeFromCart(userId: string, itemId: string) {
  const { cartItem } = await getUserCartItem(userId, itemId);

  await prisma.cartItem.delete({
    where: { id: cartItem.id },
  });
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    return;
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}

export async function getCartCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { cartItems: true },
  });

  if (!cart) {
    return 0;
  }

  return cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
}
