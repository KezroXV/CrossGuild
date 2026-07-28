# CrossGuild — Prompts de refactoring

> Fichier companion du plan de refactoring. Chaque section = **1 session Cursor en mode Agent**.
> Copie-colle le prompt tel quel dans une **nouvelle conversation**, review le diff, `pnpm build`, commit, passe à la suivante.
>
> Plan détaillé : `.cursor/plans/refactoring_crossguild_senior_bf4c0684.plan.md`
> Architecture cible : inspirée de [OpenSource Together](https://github.com/opensource-together/opensource-together)

---

## Avant chaque session

```bash
git checkout -b refactor/phase-X-nom
pnpm install
pnpm dev   # vérifier que l'app tourne
```

## Après chaque session

```bash
pnpm build          # doit passer sans erreur
# test manuel de la feature touchée
git add -A && git commit -m "refactor(scope): description"
```

## Conventions communes (rappel pour tous les prompts)

- Architecture feature-based sous `src/features/`
- Naming OST : `.view.tsx`, `.component.tsx`, `.service.ts`, `.hook.ts`, `.schema.ts`, `.server.ts`, `.type.ts`
- Pages thin (~15 lignes) → importent une View depuis `features/X/views/`
- Path alias : `@/*` → `./src/*`
- Prisma **jamais** directement dans `route.ts` → toujours via `features/X/server/X.server.ts`
- Ne pas toucher aux domaines pas encore migrés
- Pas de commit sauf si je le demande explicitement

---

# Phase 0 — Fondations et migration `src/`

## 0.1 — Nettoyage deps, lockfiles et code mort

```
Contexte : Refactoring CrossGuild vers architecture feature-based inspirée de OpenSource Together.
Référence : docs/REFACTOR_PROMPTS.md — Phase 0.1
Branche : refactor/phase-0-cleanup

Tâche :
1. Supprimer package-lock.json — garder pnpm comme seul package manager
2. Supprimer tailwind.config.js (garder tailwind.config.ts)
3. Auditer et supprimer les dépendances inutilisées : bcrypt (garder bcryptjs), react-toastify, nodemailer si non utilisés
4. Standardiser sur Sonner comme seul système de toast — retirer les imports shadcn toast / react-toastify si présents
5. Supprimer le code mort :
   - components/ProductReview.tsx
   - components/ProductReview222.tsx
   - app/categories/[slug]/components/CategoryPageClient.tsx
   - components/sections/ (dossier entier si non importé)
   - pages/api/categoriees.ts
   - app/api/reports/page.tsx (UI dans /api/)
   - app/providers.tsx (dead code)
6. Supprimer ou protéger les endpoints dev :
   - app/api/test-email/route.ts
   - app/api/test-cloudinary/route.ts
   - app/api/dev/password-reset-tokens/route.ts

Contraintes :
- pnpm build doit passer à la fin
- Ne pas migrer vers src/ yet — c'est la session suivante
- Pas de commit
```

---

## 0.2 — Migration vers `src/`

```
Contexte : Refactoring CrossGuild — migration structurelle vers src/ (pattern OST).
Référence : docs/REFACTOR_PROMPTS.md — Phase 0.2
Prérequis : Phase 0.1 terminée

Tâche :
1. Créer la structure src/ :
   - app/ → src/app/
   - components/ui/ → src/shared/components/ui/
   - components/ (reste) → src/shared/components/ (navbar, footer, etc.)
   - lib/ → src/shared/lib/
   - hooks/ → src/shared/hooks/
   - types/ → src/shared/types/
2. Mettre à jour tsconfig.json : "@/*": ["./src/*"]
3. Mettre à jour components.json (paths shadcn)
4. Mettre à jour next.config.ts si nécessaire
5. Mettre à jour tous les imports @/ dans le projet
6. Déplacer middleware.ts → src/middleware.ts (créer un stub vide si pas encore existant)
7. Vérifier que pnpm dev et pnpm build passent

Contraintes :
- Mettre à jour TOUS les imports cassés
- Ne pas encore créer features/ — juste la migration src/
- Pas de commit
```

---

## 0.3 — Documentation et Cursor rule

```
Contexte : Refactoring CrossGuild — formaliser les conventions architecture OST.
Référence : docs/REFACTOR_PROMPTS.md — Phase 0.3
Prérequis : Phase 0.2 terminée (src/ en place)

Tâche :
1. Créer docs/ARCHITECTURE.md avec :
   - Structure des dossiers (src/app, src/features, src/shared, src/config)
   - Conventions de nommage (.view, .component, .service, .hook, .schema, .server)
   - Pattern page thin → view
   - Pattern route handler thin → feature server
   - Exemples de code (cart, auth)
2. Créer .cursor/rules/architecture.mdc avec les règles permanentes :
   - Pages must be thin, import from features/X/views/
   - Never put Prisma queries directly in route.ts
   - Feature structure: components, hooks, services, server, validations, views, types
   - Use @/ path alias
3. Mettre à jour README.md avec la stack réelle (Next 15, Prisma, NextAuth v5, pnpm)
4. Créer src/config/config.ts avec API_BASE_URL et constantes de base

Contraintes :
- Documentation en anglais
- Pas de commit
```

---

# Phase 1 — Sécurité et infrastructure API

## 1.1 — Middleware + helpers API

```
Contexte : Refactoring CrossGuild — sécurité et infrastructure API.
Référence : docs/REFACTOR_PROMPTS.md — Phase 1.1
Inspiré de : opensource-together/src/middleware.ts

Tâche :
1. Créer src/middleware.ts :
   - Protéger /admin/* → redirect /login si pas de session
   - Protéger /profile, /settings/* → auth required
   - Redirect /login → / si déjà connecté
   - Matcher excluant api, _next, static assets
2. Créer src/shared/lib/api-response.ts :
   - apiSuccess(data, status?)
   - apiError(code, message, status?)
   - Format uniforme { success, data?, error? }
3. Créer src/shared/lib/handle-api-error.ts :
   - Mappe Prisma P2002 → 409, P2025 → 404
   - AppError class (NotFound, Unauthorized, Forbidden, ValidationError, Conflict)
4. Créer src/shared/lib/with-auth.ts — wrapper route handler avec session NextAuth
5. Créer src/shared/lib/with-admin.ts — wrapper vérifiant session.user.isAdmin
6. Créer src/shared/lib/with-validation.ts — wrapper Zod schema

Contraintes :
- Ne pas encore refactorer toutes les routes — juste créer les helpers
- pnpm build doit passer
- Pas de commit
```

---

## 1.2 — Sécuriser routes admin + fix Prisma

```
Contexte : Refactoring CrossGuild — fermer les failles auth critiques.
Référence : docs/REFACTOR_PROMPTS.md — Phase 1.2
Prérequis : Phase 1.1 terminée (withAuth, withAdmin existent)

Tâche :
1. Appliquer withAdmin à TOUTES les routes /api/admin/* :
   - admin/categories, admin/users, admin/reviews, admin/stats
   - admin/products (POST/PUT/DELETE), admin/orders
   - admin/reports/*
2. Sécuriser les mutations ouvertes :
   - api/upload/route.ts → withAuth minimum, withAdmin pour admin uploads
   - api/content/contact-info PUT, api/content/social-links PUT → withAdmin
   - api/brands POST/PUT/DELETE → withAdmin
3. Fix Prisma singleton :
   - Remplacer tous les new PrismaClient() par import depuis @/shared/lib/prisma
   - Supprimer tous les prisma.$disconnect() dans les route handlers
4. Uniformiser les réponses 401/403 avec apiError()

Routes critiques sans auth actuellement :
- app/api/admin/categories/route.ts
- app/api/admin/users/route.ts
- app/api/admin/reviews/route.ts
- app/api/admin/stats/route.ts
- app/api/admin/products/route.ts (mutations)
- app/api/upload/route.ts

Contraintes :
- pnpm build doit passer
- Tester manuellement qu'un non-admin reçoit 401/403 sur /api/admin/*
- Pas de commit
```

---

# Phase 2 — Backend par feature

> Ordre : auth → cart → orders → products → wishlist → reviews → admin → reports → cms

## 2.1 — Feature auth (server)

```
Contexte : Refactoring CrossGuild — migrer le backend auth vers features/auth/server/.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.1

Tâche :
1. Créer src/features/auth/validations/ :
   - auth.schema.ts (register, login)
   - password-reset.schema.ts (request, verify, reset)
2. Créer src/features/auth/server/auth.server.ts :
   - registerUser, verifyEmail, refreshSession
3. Créer src/features/auth/server/password-reset.server.ts :
   - requestReset, verifyToken, resetPassword
4. Refactorer en thin handlers :
   - api/auth/register/route.ts
   - api/auth/confirm-email/[token]/route.ts
   - api/auth/refresh-session/route.ts
   - api/password-reset/request/route.ts
   - api/password-reset/verify/route.ts
   - api/password-reset/reset/route.ts
5. Déplacer lib/email.ts → src/shared/services/email.service.ts si pertinent

Contraintes :
- Réutiliser les Zod schemas existants ou les migrer vers features/auth/validations/
- Handlers ~20-40 lignes max
- Pas de commit
```

---

## 2.2 — Feature cart (server) — FIX CRITIQUE

```
Contexte : Refactoring CrossGuild — unifier la logique panier (bug clonage items).
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.2

Problème actuel :
- lib/cart-actions.ts clone les Items (nouveau slug/SKU) — INCORRECT
- api/cart/route.ts utilise CartItem correctement
- Deux implémentations incompatibles

Tâche :
1. Créer src/features/cart/validations/cart.schema.ts
2. Créer src/features/cart/server/cart.server.ts avec :
   - getCart(userId)
   - addToCart(userId, itemId, quantity) — via CartItem, PAS de clonage Item
   - updateCartItem(userId, cartItemId, quantity)
   - removeFromCart(userId, cartItemId)
   - clearCart(userId)
   - getCartCount(userId)
3. Refactorer api/cart/route.ts, api/cart/[itemId]/route.ts, api/cart/count/route.ts en thin handlers
4. Refactorer lib/cart-actions.ts pour déléguer à cart.server.ts (ou supprimer si redondant)
5. Mettre à jour tous les imports cart-actions dans le frontend

Contraintes :
- UNE SEULE source de vérité pour la logique panier
- pnpm build + test manuel add/remove cart
- Pas de commit
```

---

## 2.3 — Feature orders (server) — transactions

```
Contexte : Refactoring CrossGuild — migrer orders avec transactions Prisma.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.3
Prérequis : Phase 2.2 terminée (cart.server.ts)

Tâche :
1. Créer src/features/orders/validations/order.schema.ts
2. Créer src/features/orders/server/order.server.ts avec :
   - createOrder(userId, orderData) — prisma.$transaction :
     a. Créer Order + OrderItems
     b. Décrémenter stock Items
     c. Vider cart
   - getOrderById(userId, orderId)
   - getUserOrders(userId)
   - cancelOrder(userId, orderId)
3. Refactorer en thin handlers :
   - api/orders/create/route.ts
   - api/orders/[orderId]/route.ts
   - api/user/orders/route.ts
   - api/user/orders/[id]/route.ts
   - api/user/orders/[id]/cancel/route.ts
4. Refactorer api/admin/orders/route.ts et api/admin/orders/[orderId]/route.ts

Contraintes :
- createOrder DOIT être atomique ($transaction)
- pnpm build doit passer
- Pas de commit
```

---

## 2.4 — Feature products (server)

```
Contexte : Refactoring CrossGuild — migrer products/categories/brands/search.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.4

Tâche :
1. Créer src/features/products/validations/product.schema.ts, category.schema.ts, brand.schema.ts
2. Créer src/features/products/server/ :
   - product.server.ts (CRUD, findBySlug, related, updateStock)
   - category.server.ts
   - brand.server.ts
   - search.server.ts
3. Refactorer thin handlers :
   - api/products/*, api/categories/route.ts, api/brands/*
   - api/search/route.ts
   - api/admin/products/route.ts
   - api/admin/categories/route.ts
4. Remplacer les fetch localhost vers /api/upload par import direct upload.server.ts

Contraintes :
- Handlers thin, logique dans server/
- Pas de commit
```

---

## 2.5 — Feature wishlist (server)

```
Contexte : Refactoring CrossGuild — migrer wishlist.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.5

Tâche :
1. Créer src/features/wishlist/validations/wishlist.schema.ts
2. Créer src/features/wishlist/server/wishlist.server.ts :
   - getWishlist, addItem, removeItem, isInWishlist, getCount
3. Refactorer api/wishlist/route.ts, count/route.ts, check/route.ts
4. Refactorer lib/wishlist-actions.ts → déléguer à wishlist.server.ts

Contraintes :
- Pas de commit
```

---

## 2.6 — Feature reviews (server)

```
Contexte : Refactoring CrossGuild — migrer reviews.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.6

Tâche :
1. Créer src/features/reviews/validations/review.schema.ts
2. Créer src/features/reviews/server/review.server.ts :
   - getReviewsByProduct, createReview, moderateReview, deleteReview
3. Refactorer api/reviews/route.ts
4. Refactorer api/admin/reviews/route.ts (470 lignes → thin handler)

Contraintes :
- Pas de commit
```

---

## 2.7 — Feature admin + user profile (server)

```
Contexte : Refactoring CrossGuild — migrer admin stats, users, profile.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.7

Tâche :
1. Créer src/features/admin/server/ :
   - stats.server.ts
   - user.server.ts (admin CRUD users)
2. Créer src/features/auth/server/profile.server.ts :
   - getProfile, updateProfile, updatePassword, uploadProfileImage
3. Refactorer :
   - api/admin/stats/route.ts
   - api/admin/users/route.ts
   - api/user/profile/route.ts
   - api/user/profile/image/route.ts
   - api/user/password/route.ts

Contraintes :
- Pas de commit
```

---

## 2.8 — Feature reports (server) — consolidation

```
Contexte : Refactoring CrossGuild — consolider les 2 namespaces reports.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.8

Tâche :
1. Créer src/features/reports/server/report.server.ts :
   - getSalesReport, getOrdersReport, getProductsReport
   - getCustomersReport, getCustomReport, getProfitabilityReport
2. Migrer toute la logique de api/reports/* vers api/admin/reports/*
3. Supprimer le namespace api/reports/ (routes dupliquées)
4. Refactorer tous les api/admin/reports/*/route.ts en thin handlers
5. Mettre à jour les imports frontend qui pointent vers /api/reports/

Contraintes :
- UN SEUL namespace : /api/admin/reports/*
- Pas de commit
```

---

## 2.9 — Feature cms + upload + contact (server)

```
Contexte : Refactoring CrossGuild — migrer CMS, upload, contact, offers.
Référence : docs/REFACTOR_PROMPTS.md — Phase 2.9

Tâche :
1. Créer src/features/cms/server/ :
   - hero.server.ts, category-hero.server.ts
   - contact-info.server.ts, social-links.server.ts
   - offers.server.ts
2. Créer src/shared/services/upload.service.ts (Cloudinary — partagé)
3. Créer src/features/contact/server/contact.server.ts
4. Refactorer :
   - api/content/*, api/offers/*, api/upload/route.ts, api/contact/route.ts

Contraintes :
- Upload protégé (withAuth/withAdmin)
- Pas de commit
```

---

# Phase 3 — Frontend OST

## 3.1 — Route groups + providers + layout shared

```
Contexte : Refactoring CrossGuild — infrastructure frontend OST.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.1

Tâche :
1. Créer src/app/(shop)/layout.tsx — Navbar + Footer automatiques
2. Déplacer sous (shop)/ : about, contact, products, product, categories, brands, cart, wishlist, compare, order-confirmation
3. Retirer les imports manuels Navbar/Footer des pages migrées
4. Créer src/app/(auth)/layout.tsx — layout centré
5. Déplacer sous (auth)/ : login, auth/register, password-reset/*
6. Créer src/app/providers.tsx (pattern OST) :
   - ThemeProvider + SessionProvider + QueryClientProvider
   - Utiliser src/shared/lib/query-client.ts (getQueryClient)
7. Refactorer src/app/layout.tsx pour utiliser <Providers>
8. Déplacer navbar → src/shared/components/layout/navbar.component.tsx
9. Déplacer footer → src/shared/components/layout/footer.component.tsx

Contraintes :
- Supprimer la duplication Navbar/Footer sur 12+ pages
- React Query activé globalement
- pnpm build doit passer
- Pas de commit
```

---

## 3.2 — Feature auth (frontend)

```
Contexte : Refactoring CrossGuild — migrer frontend auth vers features/auth/.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.2
Prérequis : Phase 2.1 + 3.1 terminées

Tâche :
1. Créer src/features/auth/views/ :
   - login.view.tsx (extraire de app/login/page.tsx — 492 lignes)
   - register.view.tsx
   - password-reset.view.tsx
2. Créer src/features/auth/forms/ :
   - login-form.component.tsx
   - register-form.component.tsx
   - oauth-buttons.component.tsx
3. Créer src/features/auth/services/auth.service.ts (client fetch)
4. Créer src/features/auth/hooks/use-auth.hook.ts si pertinent
5. Convertir pages en thin :
   - app/(auth)/login/page.tsx → import LoginView
   - app/(auth)/auth/register/page.tsx → import RegisterView
   - app/(auth)/password-reset/page.tsx → import PasswordResetView
6. Supprimer app/auth/signin/ (doublon) — redirect vers /login si nécessaire

Contraintes :
- Pages < 20 lignes
- Pas de commit
```

---

## 3.3 — Feature products (frontend)

```
Contexte : Refactoring CrossGuild — migrer frontend products.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.3

Tâche :
1. Unifier les 3 filtres en un seul composant :
   - src/features/products/components/product-filters.component.tsx
   - Remplacer CategoryFilters, NewCategoryFilters, AllProductsFilters
2. Unifier ClientSideCategoryPage + NewClientSideCategoryPage → category-product-grid.component.tsx
3. Créer src/features/products/views/ :
   - products.view.tsx, product-detail.view.tsx
   - category.view.tsx, brand.view.tsx
4. Créer src/features/products/services/product.service.ts
5. Créer src/features/products/hooks/use-products.hook.ts, use-product-filters.hook.ts
6. Convertir pages thin :
   - app/(shop)/products/page.tsx
   - app/(shop)/product/[slug]/page.tsx
   - app/(shop)/categories/[slug]/page.tsx
   - app/(shop)/brands/[slug]/page.tsx
7. Supprimer les anciens composants dupliqués

Contraintes :
- brands/[slug] doit utiliser le même grid/filters que categories
- Pas de commit
```

---

## 3.4 — Feature cart (frontend)

```
Contexte : Refactoring CrossGuild — migrer frontend cart.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.4
Prérequis : Phase 2.2 + 3.1

Tâche :
1. Créer src/features/cart/views/cart.view.tsx
2. Créer src/features/cart/components/ :
   - cart-items-list.component.tsx
   - cart-summary.component.tsx
   - delivery-form.component.tsx
   - checkout-button.component.tsx
3. Créer src/features/cart/services/cart.service.ts (client)
4. Créer src/features/cart/hooks/use-cart.hook.ts (React Query)
5. Migrer components/cart-new.tsx → feature cart
6. Convertir app/(shop)/cart/page.tsx en thin page
7. Mettre à jour navbar pour utiliser useCart hook (remplacer fetch polling)

Contraintes :
- Utiliser React Query, pas fetch() manuel
- Pas de commit
```

---

## 3.5 — Feature wishlist (frontend)

```
Contexte : Refactoring CrossGuild — migrer frontend wishlist.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.5

Tâche :
1. Créer src/features/wishlist/views/wishlist.view.tsx
2. Créer components : wishlist-grid, add-to-wishlist-button
3. Créer services/wishlist.service.ts + hooks/use-wishlist.hook.ts
4. Convertir app/(shop)/wishlist/page.tsx en thin page
5. Mettre à jour navbar (useWishlist hook)

Contraintes :
- Pas de commit
```

---

## 3.6 — Feature reviews (frontend)

```
Contexte : Refactoring CrossGuild — migrer frontend reviews.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.6

Tâche :
1. Créer src/features/reviews/components/ :
   - review-list.component.tsx
   - review-form.component.tsx
   - review-card.component.tsx
2. Créer services/review.service.ts + hooks/use-reviews.hook.ts
3. Migrer components/ProductReviews.tsx et components/reviews.tsx (homepage testimonials)
4. Intégrer dans product-detail.view.tsx

Contraintes :
- Pas de commit
```

---

## 3.7 — Feature profile (frontend)

```
Contexte : Refactoring CrossGuild — migrer profile (920 lignes).
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.7

Tâche :
1. Créer src/features/auth/views/profile.view.tsx
2. Créer src/features/auth/components/ :
   - profile-info.component.tsx
   - profile-image-upload.component.tsx
   - order-history.component.tsx
   - profile-settings.component.tsx
3. Créer hooks/use-profile.hook.ts, use-orders.hook.ts
4. Convertir app/(shop)/profile/page.tsx en thin page (< 20 lignes)
5. Migrer app/settings/security/page.tsx sous features/auth/

Contraintes :
- profile.view.tsx < 150 lignes (orchestration seulement)
- Pas de commit
```

---

## 3.8 — Feature admin (frontend)

```
Contexte : Refactoring CrossGuild — migrer pages admin vers features/admin/.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.8

Tâche :
1. Créer src/shared/components/layout/admin-sidebar.component.tsx
2. Refactorer src/app/admin/layout.tsx :
   - Utiliser admin-sidebar
   - Supprimer redirect client-side (middleware s'en charge)
3. Créer features/admin/views/ pour chaque page :
   - dashboard.view.tsx, products.view.tsx, categories.view.tsx
   - brands.view.tsx, orders.view.tsx, users.view.tsx
4. Convertir toutes les app/admin/*/page.tsx en thin pages
5. Créer hooks admin : use-admin-stats.hook.ts, use-admin-products.hook.ts, etc.
6. Remplacer axios par services + React Query

Contraintes :
- Admin layout ne doit plus faire window.location.href redirect
- Pas de commit
```

---

## 3.9 — Feature reports (frontend)

```
Contexte : Refactoring CrossGuild — migrer reports frontend.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.9
Prérequis : Phase 2.8 (backend reports consolidé)

Tâche :
1. Supprimer app/reports/ (namespace public dupliqué) ou rediriger vers admin
2. Créer src/features/reports/views/reports.view.tsx
3. Créer src/features/reports/components/ :
   - report-filters.component.tsx
   - report-chart.component.tsx
   - sales-report-tab.component.tsx
   - orders-report-tab.component.tsx
   - products-report-tab.component.tsx
   - customers-report-tab.component.tsx
   - export-button.component.tsx
4. Créer services/report.service.ts + hooks/use-reports.hook.ts
5. Convertir app/admin/reports/page.tsx en thin page

Contraintes :
- admin/reports/page.tsx actuel = 1311 lignes → découper (peut chevaucher Phase 4.1)
- Pas de commit
```

---

## 3.10 — Feature cms (frontend)

```
Contexte : Refactoring CrossGuild — migrer CMS frontend.
Référence : docs/REFACTOR_PROMPTS.md — Phase 3.10

Tâche :
1. Créer src/features/cms/views/content-management.view.tsx
2. Créer src/features/cms/components/ :
   - hero-editor.component.tsx
   - category-hero-editor.component.tsx
   - contact-info-editor.component.tsx
   - social-links-editor.component.tsx
   - offers-manager.component.tsx
3. Créer services/cms.service.ts + hooks
4. Convertir app/admin/content-management/page.tsx en thin page

Contraintes :
- content-management/page.tsx actuel = 960 lignes → découper
- Pas de commit
```

---

# Phase 4 — Décomposition des monolithiques restants

> Si Phase 3 a déjà découpé les gros fichiers, ces sessions servent de raffinement.

## 4.1 — Découper admin/reports (1311L)

```
Contexte : Refactoring CrossGuild — découper le monolithe reports.
Référence : docs/REFACTOR_PROMPTS.md — Phase 4.1
Fichier : src/app/admin/reports/page.tsx (ou features/reports/views/reports.view.tsx)

Tâche :
1. Vérifier que reports.view.tsx < 150 lignes (orchestration tabs seulement)
2. Chaque tab = composant séparé < 150 lignes
3. Extraire la logique charts Recharts dans report-chart.component.tsx
4. Extraire filtres date/export dans report-filters.component.tsx et export-button.component.tsx
5. Supprimer toute data mock/sample — utiliser report.service.ts
6. Lazy load tabs avec dynamic() si pertinent

Contraintes :
- Aucun fichier > 200 lignes dans features/reports/
- Pas de commit
```

---

## 4.2 — Découper admin/reviews (1052L)

```
Contexte : Refactoring CrossGuild — découper admin reviews.
Référence : docs/REFACTOR_PROMPTS.md — Phase 4.2

Tâche :
1. Créer features/admin/components/reviews/ :
   - reviews-table.component.tsx
   - review-moderation-actions.component.tsx
   - review-filters.component.tsx
2. Créer features/admin/hooks/use-admin-reviews.hook.ts
3. reviews.view.tsx = orchestration < 100 lignes
4. Supprimer l'ancien page.tsx monolithique

Contraintes :
- Pas de commit
```

---

## 4.3 — Découper ProductDetails (656L)

```
Contexte : Refactoring CrossGuild — découper ProductDetails.
Référence : docs/REFACTOR_PROMPTS.md — Phase 4.3

Tâche :
1. Créer features/products/components/ :
   - product-gallery.component.tsx
   - product-info.component.tsx
   - product-actions.component.tsx (cart, wishlist, compare)
   - product-reviews-section.component.tsx
2. product-detail.view.tsx = orchestration < 100 lignes
3. Supprimer components/ProductDetails.tsx

Contraintes :
- Pas de commit
```

---

## 4.4 — Nettoyage final doublons et axios

```
Contexte : Refactoring CrossGuild — cleanup final Phase 3/4.
Référence : docs/REFACTOR_PROMPTS.md — Phase 4.4

Tâche :
1. Chercher et supprimer tous les imports axios restants → remplacer par feature services
2. Supprimer axios du package.json si plus utilisé
3. Vérifier qu'aucun fetch() manuel ne reste (sauf dans *.service.ts)
4. Supprimer les anciens fichiers non importés (grep + dead code elimination)
5. Vérifier que toutes les pages app/ sont thin (< 25 lignes)
6. pnpm build + lint

Contraintes :
- Pas de commit
```

---

# Phase 5 — Prisma schema

## 5.1 — Enums et indexes

```
Contexte : Refactoring CrossGuild — améliorer le schema Prisma.
Référence : docs/REFACTOR_PROMPTS.md — Phase 5.1

Tâche :
1. Ajouter enums :
   - OrderStatus { pending, processing, shipped, delivered, cancelled }
   - ReviewStatus { pending, approved, rejected }
2. Migrer Order.status String → OrderStatus
3. Ajouter indexes :
   - Item.slug, Item.categoryId, Item.brandId
   - Order.userId, Order.status
   - Review.itemId, Review.userId
   - CartItem.cartId, CartItem.itemId
4. Créer et appliquer migration Prisma
5. Mettre à jour le code qui utilise des strings hardcodées ("pending", etc.)

Contraintes :
- prisma migrate dev — migration propre
- pnpm build doit passer
- Pas de commit
```

---

## 5.2 — Simplifier RBAC

```
Contexte : Refactoring CrossGuild — simplifier le modèle de rôles.
Référence : docs/REFACTOR_PROMPTS.md — Phase 5.2

Décision : Option A — garder isAdmin boolean, supprimer modèle Role inutilisé.

Tâche :
1. Supprimer model Role et relation User.roleId du schema Prisma
2. Migration Prisma
3. Supprimer toute référence à Role/roleId/permissions dans le code
4. Garder User.isAdmin comme seule source de vérité admin
5. Vérifier withAdmin et middleware utilisent isAdmin

Contraintes :
- Pas de commit
```

---

# Phase 6 — Tests et CI

## 6.1 — Setup Vitest

```
Contexte : Refactoring CrossGuild — setup tests unitaires.
Référence : docs/REFACTOR_PROMPTS.md — Phase 6.1

Tâche :
1. Installer vitest + @testing-library/react si nécessaire
2. Créer vitest.config.ts
3. Ajouter script "test" dans package.json
4. Écrire tests pour :
   - features/cart/server/cart.server.ts (mock Prisma)
   - features/orders/server/order.server.ts (mock Prisma, test transaction)
   - features/auth/validations/*.schema.ts (Zod validation)
   - shared/lib/handle-api-error.ts
5. Tous les tests doivent passer : pnpm test

Contraintes :
- Pas de commit
```

---

## 6.2 — Setup Playwright e2e

```
Contexte : Refactoring CrossGuild — tests e2e critiques.
Référence : docs/REFACTOR_PROMPTS.md — Phase 6.2

Tâche :
1. Installer @playwright/test
2. Créer playwright.config.ts
3. Écrire e2e/ :
   - auth.spec.ts (login, redirect, logout)
   - cart-checkout.spec.ts (add to cart, view cart)
   - admin-access.spec.ts (non-admin blocked from /admin)
4. Ajouter script "test:e2e" dans package.json

Contraintes :
- Tests doivent tourner contre pnpm dev local
- Pas de commit
```

---

## 6.3 — CI GitHub Actions

```
Contexte : Refactoring CrossGuild — pipeline CI.
Référence : docs/REFACTOR_PROMPTS.md — Phase 6.3

Tâche :
1. Créer .github/workflows/ci.yml :
   - Trigger : push + pull_request sur main
   - Steps : pnpm install → lint → typecheck → pnpm test → pnpm build
2. Ajouter script "typecheck": "tsc --noEmit" si absent
3. Vérifier que le workflow passe localement (act ou dry-run)

Contraintes :
- Pas de commit
```

---

# Phase 7 — Optimisation code (ultérieure)

## 7.1 — Performance React

```
Contexte : Refactoring CrossGuild — optimisation performance React.
Référence : docs/REFACTOR_PROMPTS.md — Phase 7.1
Prérequis : Phases 0-6 terminées

Tâche :
1. React.memo sur composants liste : ProductCard, CartItem, ReviewCard
2. useMemo/useCallback sur ProductFilters et calculs de prix
3. dynamic() lazy load tabs admin reports et charts Recharts
4. Auditer next/image — remplacer <img> restants, ajouter sizes/priority
5. Mesurer avant/après (React DevTools Profiler)

Contraintes :
- Pas de sur-optimisation prématurée — mesurer d'abord
- Pas de commit
```

---

## 7.2 — Performance Next.js + cache

```
Contexte : Refactoring CrossGuild — optimisation Next.js.
Référence : docs/REFACTOR_PROMPTS.md — Phase 7.2

Tâche :
1. Auditer RSC vs Client Components — maximiser Server Components sur pages catalogue
2. Ajouter Suspense boundaries sur pages lourdes (products, admin dashboard)
3. Configurer revalidatePath/revalidateTag sur mutations cart/orders/products
4. Streaming sur homepage et product listing

Contraintes :
- Pas de commit
```

---

## 7.3 — Qualité code + linting strict

```
Contexte : Refactoring CrossGuild — qualité et conventions code.
Référence : docs/REFACTOR_PROMPTS.md — Phase 7.3

Tâche :
1. Configurer ESLint rules strictes (no-unused-vars, import/order, @typescript-eslint)
2. Ajouter Prettier + .prettierrc
3. Setup husky + lint-staged (pre-commit : lint + format)
4. Renommer fichiers restants non-conformes vers conventions OST (.component.tsx, etc.)
5. Supprimer commentaires FR obsolètes
6. Ajouter JSDoc sur fonctions publiques des *.server.ts et *.service.ts

Contraintes :
- Pas de commit
```

---

## 7.4 — Bundle optimization

```
Contexte : Refactoring CrossGuild — réduire le bundle.
Référence : docs/REFACTOR_PROMPTS.md — Phase 7.4

Tâche :
1. Installer @next/bundle-analyzer
2. Analyser le bundle — identifier les plus gros modules
3. Tree-shake : lucide-react imports individuels, date-fns functions spécifiques
4. Évaluer Framer Motion — lazy load ou supprimer si usage minimal
5. Vérifier recharts import (import spécifique vs full)

Contraintes :
- Documenter les gains dans docs/ARCHITECTURE.md
- Pas de commit
```

---

# Index rapide — 31 sessions

| # | Phase | Session | Branche suggérée |
|---|-------|---------|------------------|
| 1 | 0.1 | Nettoyage deps + code mort | refactor/phase-0-cleanup |
| 2 | 0.2 | Migration src/ | refactor/phase-0-src |
| 3 | 0.3 | ARCHITECTURE.md + cursor rule | refactor/phase-0-docs |
| 4 | 1.1 | Middleware + helpers API | refactor/phase-1-middleware |
| 5 | 1.2 | Sécuriser routes admin | refactor/phase-1-auth |
| 6 | 2.1 | Backend auth | refactor/phase-2-auth |
| 7 | 2.2 | Backend cart (fix bug) | refactor/phase-2-cart |
| 8 | 2.3 | Backend orders | refactor/phase-2-orders |
| 9 | 2.4 | Backend products | refactor/phase-2-products |
| 10 | 2.5 | Backend wishlist | refactor/phase-2-wishlist |
| 11 | 2.6 | Backend reviews | refactor/phase-2-reviews |
| 12 | 2.7 | Backend admin + profile | refactor/phase-2-admin |
| 13 | 2.8 | Backend reports | refactor/phase-2-reports |
| 14 | 2.9 | Backend cms + upload | refactor/phase-2-cms |
| 15 | 3.1 | Route groups + providers | refactor/phase-3-layout |
| 16 | 3.2 | Frontend auth | refactor/phase-3-auth |
| 17 | 3.3 | Frontend products | refactor/phase-3-products |
| 18 | 3.4 | Frontend cart | refactor/phase-3-cart |
| 19 | 3.5 | Frontend wishlist | refactor/phase-3-wishlist |
| 20 | 3.6 | Frontend reviews | refactor/phase-3-reviews |
| 21 | 3.7 | Frontend profile | refactor/phase-3-profile |
| 22 | 3.8 | Frontend admin | refactor/phase-3-admin |
| 23 | 3.9 | Frontend reports | refactor/phase-3-reports |
| 24 | 3.10 | Frontend cms | refactor/phase-3-cms |
| 25 | 4.1 | Découper reports | refactor/phase-4-reports |
| 26 | 4.2 | Découper admin reviews | refactor/phase-4-reviews |
| 27 | 4.3 | Découper ProductDetails | refactor/phase-4-products |
| 28 | 4.4 | Cleanup axios + doublons | refactor/phase-4-cleanup |
| 29 | 5.1 | Prisma enums + indexes | refactor/phase-5-prisma |
| 30 | 5.2 | Simplifier RBAC | refactor/phase-5-rbac |
| 31 | 6.1-6.3 | Tests + CI | refactor/phase-6-tests |
| 32+ | 7.x | Optimisation (ultérieure) | refactor/phase-7-* |
