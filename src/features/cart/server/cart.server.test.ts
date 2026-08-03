import prisma from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/lib/handle-api-error";
import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  removeFromCart,
  updateCartItem,
} from "./cart.server";

vi.mock("@/shared/lib/prisma", () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    item: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma);

describe("getCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when user has no cart", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue(null);
    mockedPrisma.user.findUnique.mockResolvedValue({ city: "Paris" } as never);

    const result = await getCart("user-1");

    expect(result).toEqual([]);
  });

  it("maps cart items with user city", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
      cartItems: [
        {
          quantity: 2,
          item: {
            id: "item-1",
            name: "Sword",
            price: 100,
            images: [{ url: "/sword.jpg" }],
            options: [],
          },
        },
      ],
    } as never);
    mockedPrisma.user.findUnique.mockResolvedValue({ city: "Paris" } as never);

    const result = await getCart("user-1");

    expect(result).toEqual([
      {
        id: "item-1",
        name: "Sword",
        price: 100,
        quantity: 2,
        images: [{ url: "/sword.jpg" }],
        options: [],
        city: "Paris",
      },
    ]);
  });
});

describe("addToCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when item does not exist", async () => {
    mockedPrisma.item.findUnique.mockResolvedValue(null);

    await expect(addToCart("user-1", "missing-item")).rejects.toThrow(
      NotFoundError
    );
    await expect(addToCart("user-1", "missing-item")).rejects.toThrow(
      "Item not found"
    );
  });

  it("creates cart and cart item when cart does not exist", async () => {
    mockedPrisma.item.findUnique.mockResolvedValue({ id: "item-1" } as never);
    mockedPrisma.cart.findUnique.mockResolvedValue(null);
    mockedPrisma.cart.create.mockResolvedValue({ id: "cart-1" } as never);
    mockedPrisma.cartItem.findUnique.mockResolvedValue(null);
    mockedPrisma.cartItem.create.mockResolvedValue({} as never);

    await addToCart("user-1", "item-1", 3);

    expect(mockedPrisma.cart.create).toHaveBeenCalledWith({
      data: { userId: "user-1" },
    });
    expect(mockedPrisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: "cart-1",
        itemId: "item-1",
        quantity: 3,
      },
    });
  });

  it("increments quantity when item already exists in cart", async () => {
    mockedPrisma.item.findUnique.mockResolvedValue({ id: "item-1" } as never);
    mockedPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1" } as never);
    mockedPrisma.cartItem.findUnique.mockResolvedValue({
      id: "cart-item-1",
      quantity: 2,
    } as never);
    mockedPrisma.cartItem.update.mockResolvedValue({} as never);

    await addToCart("user-1", "item-1", 1);

    expect(mockedPrisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: "cart-item-1" },
      data: { quantity: 3 },
    });
    expect(mockedPrisma.cartItem.create).not.toHaveBeenCalled();
  });
});

describe("updateCartItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when cart does not exist", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue(null);

    await expect(updateCartItem("user-1", "item-1", 5)).rejects.toThrow(
      "Cart not found"
    );
  });

  it("updates cart item quantity", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1" } as never);
    mockedPrisma.cartItem.findUnique.mockResolvedValue({
      id: "cart-item-1",
    } as never);
    mockedPrisma.cartItem.update.mockResolvedValue({} as never);

    await updateCartItem("user-1", "item-1", 5);

    expect(mockedPrisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: "cart-item-1" },
      data: { quantity: 5 },
    });
  });
});

describe("removeFromCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes cart item", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1" } as never);
    mockedPrisma.cartItem.findUnique.mockResolvedValue({
      id: "cart-item-1",
    } as never);
    mockedPrisma.cartItem.delete.mockResolvedValue({} as never);

    await removeFromCart("user-1", "item-1");

    expect(mockedPrisma.cartItem.delete).toHaveBeenCalledWith({
      where: { id: "cart-item-1" },
    });
  });
});

describe("clearCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when cart does not exist", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue(null);

    await clearCart("user-1");

    expect(mockedPrisma.cartItem.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes all cart items", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({ id: "cart-1" } as never);
    mockedPrisma.cartItem.deleteMany.mockResolvedValue({ count: 2 } as never);

    await clearCart("user-1");

    expect(mockedPrisma.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { cartId: "cart-1" },
    });
  });
});

describe("getCartCount", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 0 when cart does not exist", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue(null);

    await expect(getCartCount("user-1")).resolves.toBe(0);
  });

  it("sums item quantities", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({
      cartItems: [{ quantity: 2 }, { quantity: 3 }],
    } as never);

    await expect(getCartCount("user-1")).resolves.toBe(5);
  });
});
