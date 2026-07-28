# CrossGuild Architecture

CrossGuild follows a **feature-based architecture** inspired by [OpenSource Together (OST)](https://github.com/opensource-together/opensource-together). The codebase is organized around business domains under `src/features/`, with thin route files and shared infrastructure in `src/shared/`.

> **Status:** Phase 0 — `src/` migration is complete. Features are being introduced incrementally; legacy code may still live in `src/shared/components/` until migrated.

---

## Directory Structure

```
src/
├── app/                    # Next.js App Router — routes and thin pages only
│   ├── layout.tsx
│   ├── page.tsx
│   ├── (shop)/             # Route groups (planned)
│   ├── admin/
│   └── api/                # Thin route handlers → feature server/
│
├── features/               # Domain logic (one folder per business area)
│   ├── auth/
│   ├── cart/
│   ├── products/
│   ├── orders/
│   └── ...
│
├── shared/                 # Cross-cutting code
│   ├── components/
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/
│   ├── lib/                # prisma, auth, utils, api helpers
│   └── types/
│
├── config/
│   └── config.ts           # App constants (API_BASE_URL, protected routes)
│
└── middleware.ts           # Route protection
```

| Directory | Responsibility |
|-----------|----------------|
| `src/app/` | Routing, metadata, thin page wrappers. No business logic. |
| `src/features/` | Domain-specific components, hooks, services, server logic, validations, views, types. |
| `src/shared/` | Reusable UI, utilities, and infrastructure used across features. |
| `src/config/` | Application-wide constants and configuration. |

---

## Naming Conventions

Every file in `src/features/` uses a **suffix** that describes its role:

| Type | Suffix | Example |
|------|--------|---------|
| Page view | `.view.tsx` | `cart.view.tsx` |
| UI component | `.component.tsx` | `product-card.component.tsx` |
| React hook | `.hook.ts` | `use-cart.hook.ts` |
| Client service | `.service.ts` | `cart.service.ts` |
| Server logic | `.server.ts` | `cart.server.ts` |
| Zod validation | `.schema.ts` | `cart.schema.ts` |
| TypeScript type | `.type.ts` | `cart.type.ts` |

Use the `@/` path alias for all imports (maps to `./src/*`).

---

## Feature Structure

Each feature follows the same internal layout:

```
src/features/cart/
├── components/       # Feature-specific UI pieces
├── hooks/            # Feature-specific React hooks
├── services/         # Client-side API calls (fetch)
├── server/           # Server-side Prisma logic
├── validations/      # Zod schemas
├── views/            # Page-level view components
└── types/            # Feature-specific TypeScript types
```

---

## Pattern: Thin Page → View

Pages in `src/app/` should stay around **15 lines**. They export metadata and render a view from the corresponding feature.

**Target** (`src/app/cart/page.tsx`):

```tsx
import type { Metadata } from "next";
import CartView from "@/features/cart/views/cart.view";

export const metadata: Metadata = { title: "Cart | CrossGuild" };

export default function CartPage() {
  return <CartView />;
}
```

**View** (`src/features/cart/views/cart.view.tsx`):

```tsx
"use client";

import { CartItemsList } from "../components/cart-items-list.component";
import { CartSummary } from "../components/cart-summary.component";
import { useCart } from "../hooks/use-cart.hook";

export default function CartView() {
  const { items, isLoading } = useCart();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto">
      <CartItemsList items={items} />
      <CartSummary items={items} />
    </div>
  );
}
```

---

## Pattern: Thin Route Handler → Feature Server

Route handlers in `src/app/api/` must **not** contain Prisma queries directly. They validate input, call auth wrappers, and delegate to the feature's `server/` layer.

**Target** (`src/app/api/cart/route.ts`):

```typescript
import { NextRequest } from "next/server";
import { withAuth } from "@/shared/lib/with-auth";
import { apiSuccess } from "@/shared/lib/api-response";
import { addToCartSchema } from "@/features/cart/validations/cart.schema";
import { getCart, addToCart } from "@/features/cart/server/cart.server";

export const GET = withAuth(async (_req, { session }) => {
  const items = await getCart(session.user.id);
  return apiSuccess({ items });
});

export const POST = withAuth(async (req: NextRequest, { session }) => {
  const body = addToCartSchema.parse(await req.json());
  await addToCart(session.user.id, body.itemId, body.quantity);
  return apiSuccess({ success: true });
});
```

**Server** (`src/features/cart/server/cart.server.ts`):

```typescript
import prisma from "@/shared/lib/prisma";

export async function getCart(userId: string) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      cartItems: {
        include: { item: { include: { images: true, options: true } } },
      },
    },
  });

  if (!cart) return [];

  return cart.cartItems.map(({ item, quantity }) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity,
    images: item.images,
    options: item.options,
  }));
}

export async function addToCart(userId: string, itemId: string, quantity: number) {
  const item = await prisma.item.findUnique({ where: { id: itemId } });
  if (!item) throw new NotFoundError("Item not found");

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_itemId: { cartId: cart.id, itemId } },
  });

  if (existing) {
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, itemId, quantity },
    });
  }
}
```

**Client service** (`src/features/cart/services/cart.service.ts`):

```typescript
import { API_BASE_URL } from "@/config/config";

export async function getCart() {
  const res = await fetch(`${API_BASE_URL}/api/cart`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(itemId: string, quantity = 1) {
  const res = await fetch(`${API_BASE_URL}/api/cart`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}
```

---

## Auth Example

Auth configuration lives in `src/shared/lib/auth.ts` (NextAuth v5). Feature-specific auth UI and logic will move to `src/features/auth/`.

**Target page** (`src/app/login/page.tsx`):

```tsx
import type { Metadata } from "next";
import LoginView from "@/features/auth/views/login.view";

export const metadata: Metadata = { title: "Sign In | CrossGuild" };

export default function LoginPage() {
  return <LoginView />;
}
```

**Target server** (`src/features/auth/server/auth.server.ts`):

```typescript
import prisma from "@/shared/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new ConflictError("Email already registered");

  const hashedPassword = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: hashedPassword,
    },
  });
}
```

**Target route** (`src/app/api/auth/register/route.ts`):

```typescript
import { registerSchema } from "@/features/auth/validations/auth.schema";
import { registerUser } from "@/features/auth/server/auth.server";
import { apiSuccess } from "@/shared/lib/api-response";

export async function POST(req: Request) {
  const body = registerSchema.parse(await req.json());
  const user = await registerUser(body);
  return apiSuccess({ user }, 201);
}
```

---

## Import Rules

- Use `@/` alias for all cross-directory imports.
- Features may import from `@/shared/` but **must not** import from other features directly — use shared services or API calls instead.
- `src/app/` imports views from `@/features/X/views/` and nothing else from features when possible.
- `src/shared/` must not import from `src/features/`.

---

## Migration Strategy

Refactoring happens incrementally, one feature at a time:

1. Create the feature folder structure under `src/features/X/`.
2. Extract server logic from route handlers into `server/X.server.ts`.
3. Extract UI into `views/X.view.tsx` and `components/`.
4. Slim down the page in `src/app/` to a thin wrapper.
5. Remove legacy code from `src/shared/components/` once the feature is fully migrated.

See `docs/REFACTOR_PROMPTS.md` for the full phased plan.
