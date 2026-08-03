import prisma from "@/shared/lib/prisma";
import { OrderStatus } from "@prisma/client";
import {
  NotFoundError,
  ValidationError,
} from "@/shared/lib/handle-api-error";
import type { DeliveryInfo, UpdateOrderInput } from "@/features/orders/validations/order.schema";

const detailedOrderInclude = {
  orderItems: {
    include: {
      item: {
        include: {
          images: true,
          category: true,
          brand: true,
          options: true,
        },
      },
    },
  },
  user: true,
} as const;

const userOrderInclude = {
  orderItems: {
    include: {
      item: {
        include: {
          images: true,
        },
      },
    },
  },
} as const;

const adminOrderInclude = {
  user: true,
  orderItems: {
    include: {
      item: {
        include: {
          images: true,
          category: true,
          brand: true,
        },
      },
    },
  },
} as const;

type OrderWithDetailedItems = Awaited<
  ReturnType<typeof fetchUserOrderWithInclude<typeof detailedOrderInclude>>
>;

type OrderWithUserItems = Awaited<
  ReturnType<typeof fetchUserOrderWithInclude<typeof userOrderInclude>>
>;

type OrderWithAdminItems = Awaited<
  ReturnType<typeof fetchAdminOrderWithInclude>
>;

async function fetchUserOrderWithInclude<T extends object>(
  userId: string,
  orderId: string,
  include: T
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
    include,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
}

async function fetchAdminOrderWithInclude(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: adminOrderInclude,
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  return order;
}

function formatDetailedOrder(order: OrderWithDetailedItems) {
  return {
    ...order,
    city: order.city,
    items: order.orderItems.map((orderItem) => ({
      ...orderItem.item,
      quantity: orderItem.quantity,
      price: orderItem.price,
      orderItemId: orderItem.id,
    })),
  };
}

function formatUserOrder(order: OrderWithUserItems) {
  return {
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    createdAt: order.createdAt,
    status: order.status,
    totalAmount: order.total,
    items: order.orderItems.map((orderItem) => ({
      id: orderItem.item.id,
      name: orderItem.item.name,
      price: orderItem.price,
      quantity: orderItem.quantity,
      images: orderItem.item.images,
    })),
  };
}

function formatAdminOrder(order: OrderWithAdminItems) {
  return {
    ...order,
    items: order.orderItems.map((orderItem) => ({
      ...orderItem.item,
      quantity: orderItem.quantity,
      price: orderItem.price,
    })),
  };
}

export async function createOrder(userId: string, deliveryInfo: DeliveryInfo) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: { item: true },
      },
    },
  });

  if (!cart || cart.cartItems.length === 0) {
    throw new ValidationError("Le panier est vide");
  }

  const total = cart.cartItems.reduce(
    (sum, cartItem) => sum + cartItem.item.price * cartItem.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const createdOrder = await tx.order.create({
      data: {
        userId,
        city: deliveryInfo.city,
        firstName: deliveryInfo.firstName,
        lastName: deliveryInfo.lastName,
        phone: deliveryInfo.phone,
        address: deliveryInfo.address,
        postalCode: deliveryInfo.postalCode,
        country: deliveryInfo.country,
        total,
        status: OrderStatus.pending,
        orderItems: {
          create: cart.cartItems.map((cartItem) => ({
            itemId: cartItem.itemId,
            quantity: cartItem.quantity,
            price: cartItem.item.price,
          })),
        },
      },
      include: detailedOrderInclude,
    });

    for (const cartItem of cart.cartItems) {
      await tx.item.update({
        where: { id: cartItem.itemId },
        data: {
          quantity: Math.max(0, cartItem.item.quantity - cartItem.quantity),
          topSelling: cartItem.item.topSelling + cartItem.quantity,
        },
      });
    }

    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return createdOrder;
  });

  return formatDetailedOrder(order);
}

export async function getOrderById(userId: string, orderId: string) {
  const order = await fetchUserOrderWithInclude(
    userId,
    orderId,
    detailedOrderInclude
  );

  return formatDetailedOrder(order);
}

export async function getUserOrderById(userId: string, orderId: string) {
  const order = await fetchUserOrderWithInclude(
    userId,
    orderId,
    userOrderInclude
  );

  return formatUserOrder(order);
}

export async function getUserOrders(
  userId: string,
  page = 1,
  pageSize = 5
) {
  const skip = (page - 1) * pageSize;

  const [totalOrders, orders] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      skip,
      take: pageSize,
      include: userOrderInclude,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    orders: orders.map(formatUserOrder),
    currentPage: page,
    totalPages: Math.ceil(totalOrders / pageSize),
    totalOrders,
  };
}

export async function cancelOrder(userId: string, orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId },
  });

  if (!order) {
    throw new NotFoundError("Order not found");
  }

  if (
    order.status !== OrderStatus.pending &&
    order.status !== OrderStatus.processing
  ) {
    throw new ValidationError("This order cannot be cancelled anymore");
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.cancelled },
  });
}

export async function getAdminOrders(page = 1, pageSize = 10) {
  const skip = (page - 1) * pageSize;

  const [totalOrders, orders] = await Promise.all([
    prisma.order.count(),
    prisma.order.findMany({
      skip,
      take: pageSize,
      include: {
        user: true,
        orderItems: {
          include: {
            item: {
              include: { images: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    orders: orders.map((order) => ({
      ...order,
      items: order.orderItems.map((orderItem) => ({
        ...orderItem.item,
        quantity: orderItem.quantity,
        price: orderItem.price,
      })),
    })),
    currentPage: page,
    totalPages: Math.ceil(totalOrders / pageSize),
    totalOrders,
  };
}

export async function getAdminOrderById(orderId: string) {
  const order = await fetchAdminOrderWithInclude(orderId);
  return formatAdminOrder(order);
}

async function getOrderStatus(orderId: string): Promise<OrderStatus | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });

  return order?.status ?? null;
}

async function updateProductStock(
  orderItems: Array<{ quantity: number; item: { id: string; name: string; quantity: number; topSelling: number } | null }>
) {
  for (const orderItem of orderItems) {
    const item = orderItem.item;

    if (!item) {
      continue;
    }

    await prisma.item.update({
      where: { id: item.id },
      data: {
        quantity: Math.max(0, item.quantity - orderItem.quantity),
        topSelling: item.topSelling + orderItem.quantity,
        isPublished: item.quantity - orderItem.quantity > 0,
      },
    });
  }
}

async function restoreProductStock(
  orderItems: Array<{ quantity: number; item: { id: string; quantity: number; topSelling: number } | null }>
) {
  for (const orderItem of orderItems) {
    const item = orderItem.item;

    if (!item) {
      continue;
    }

    await prisma.item.update({
      where: { id: item.id },
      data: {
        quantity: item.quantity + orderItem.quantity,
        topSelling: Math.max(0, item.topSelling - orderItem.quantity),
        isPublished: true,
      },
    });
  }
}

export async function updateAdminOrder(
  orderId: string,
  data: UpdateOrderInput
) {
  const prevStatus = await getOrderStatus(orderId);

  const order = await prisma.order.update({
    where: { id: orderId },
    data: {
      ...(data.status !== undefined && { status: data.status }),
      ...(data.isPaid !== undefined && { isPaid: data.isPaid }),
    },
    include: {
      orderItems: {
        include: { item: true },
      },
    },
  });

  if (data.status === OrderStatus.delivered && prevStatus !== OrderStatus.delivered) {
    await updateProductStock(order.orderItems);
  }

  if (
    data.status === OrderStatus.cancelled &&
    prevStatus !== OrderStatus.cancelled &&
    prevStatus !== OrderStatus.pending
  ) {
    await restoreProductStock(order.orderItems);
  }

  return getAdminOrderById(orderId);
}

export async function deleteAdminOrder(orderId: string) {
  await prisma.order.delete({
    where: { id: orderId },
  });
}
