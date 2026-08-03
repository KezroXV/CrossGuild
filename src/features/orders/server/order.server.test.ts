import { OrderStatus } from "@prisma/client";
import prisma from "@/shared/lib/prisma";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/lib/handle-api-error";
import {
  cancelOrder,
  createOrder,
} from "./order.server";

vi.mock("@/shared/lib/prisma", () => ({
  default: {
    cart: {
      findUnique: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

const mockedPrisma = vi.mocked(prisma);

const deliveryInfo = {
  firstName: "Jane",
  lastName: "Doe",
  phone: "0612345678",
  address: "123 Main Street",
  city: "Paris",
  postalCode: "75001",
  country: "France",
};

describe("createOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws ValidationError when cart is empty", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue(null);

    await expect(createOrder("user-1", deliveryInfo)).rejects.toThrow(
      ValidationError
    );
    await expect(createOrder("user-1", deliveryInfo)).rejects.toThrow(
      "Le panier est vide"
    );
  });

  it("throws ValidationError when cart has no items", async () => {
    mockedPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      cartItems: [],
    } as never);

    await expect(createOrder("user-1", deliveryInfo)).rejects.toThrow(
      "Le panier est vide"
    );
  });

  it("creates order in transaction, updates stock, and clears cart", async () => {
    const cartItems = [
      {
        itemId: "item-1",
        quantity: 2,
        item: { id: "item-1", price: 50, quantity: 10, topSelling: 0 },
      },
      {
        itemId: "item-2",
        quantity: 1,
        item: { id: "item-2", price: 30, quantity: 5, topSelling: 3 },
      },
    ];

    mockedPrisma.cart.findUnique.mockResolvedValue({
      id: "cart-1",
      cartItems,
    } as never);

    const createdOrder = {
      id: "order-12345678",
      userId: "user-1",
      city: deliveryInfo.city,
      firstName: deliveryInfo.firstName,
      lastName: deliveryInfo.lastName,
      phone: deliveryInfo.phone,
      address: deliveryInfo.address,
      postalCode: deliveryInfo.postalCode,
      country: deliveryInfo.country,
      total: 130,
      status: OrderStatus.pending,
      orderItems: cartItems.map((cartItem) => ({
        id: `order-item-${cartItem.itemId}`,
        quantity: cartItem.quantity,
        price: cartItem.item.price,
        item: {
          ...cartItem.item,
          name: `Item ${cartItem.itemId}`,
          images: [],
          category: null,
          brand: null,
          options: [],
        },
      })),
    };

    const txOrderCreate = vi.fn().mockResolvedValue(createdOrder);
    const txItemUpdate = vi.fn().mockResolvedValue({});
    const txCartItemDeleteMany = vi.fn().mockResolvedValue({ count: 2 });

    mockedPrisma.$transaction.mockImplementation(async (callback) =>
      callback({
        order: { create: txOrderCreate },
        item: { update: txItemUpdate },
        cartItem: { deleteMany: txCartItemDeleteMany },
      } as never)
    );

    const result = await createOrder("user-1", deliveryInfo);

    expect(mockedPrisma.$transaction).toHaveBeenCalledOnce();
    expect(txOrderCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "user-1",
          total: 130,
          status: OrderStatus.pending,
          orderItems: {
            create: [
              { itemId: "item-1", quantity: 2, price: 50 },
              { itemId: "item-2", quantity: 1, price: 30 },
            ],
          },
        }),
      })
    );

    expect(txItemUpdate).toHaveBeenCalledTimes(2);
    expect(txItemUpdate).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { quantity: 8, topSelling: 2 },
    });
    expect(txItemUpdate).toHaveBeenCalledWith({
      where: { id: "item-2" },
      data: { quantity: 4, topSelling: 4 },
    });

    expect(txCartItemDeleteMany).toHaveBeenCalledWith({
      where: { cartId: "cart-1" },
    });

    expect(result.total).toBe(130);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toMatchObject({
      id: "item-1",
      quantity: 2,
      price: 50,
    });
  });
});

describe("cancelOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NotFoundError when order does not exist", async () => {
    mockedPrisma.order.findUnique.mockResolvedValue(null);

    await expect(cancelOrder("user-1", "order-1")).rejects.toThrow(
      NotFoundError
    );
  });

  it("throws ValidationError when order cannot be cancelled", async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({
      id: "order-1",
      status: OrderStatus.shipped,
    } as never);

    await expect(cancelOrder("user-1", "order-1")).rejects.toThrow(
      ValidationError
    );
    await expect(cancelOrder("user-1", "order-1")).rejects.toThrow(
      "This order cannot be cancelled anymore"
    );
  });

  it("cancels pending order", async () => {
    mockedPrisma.order.findUnique.mockResolvedValue({
      id: "order-1",
      status: OrderStatus.pending,
    } as never);
    mockedPrisma.order.update.mockResolvedValue({
      id: "order-1",
      status: OrderStatus.cancelled,
    } as never);

    const result = await cancelOrder("user-1", "order-1");

    expect(mockedPrisma.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: OrderStatus.cancelled },
    });
    expect(result.status).toBe(OrderStatus.cancelled);
  });
});
