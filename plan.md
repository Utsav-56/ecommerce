
# GoCart Architecture Transition Plan

## Decision summary

Moving from the current Next.js + Prisma application to Nuxt + Elysia + Drizzle **can** make the project more maintainable, but only if the main problem is architectural separation. Changing frameworks alone will not solve duplicated business rules, oversized components, weak validation, or inconsistent payment handling.

For this school project, there are two reasonable choices:

### Option A: stay with Next.js and finish the refactor

This is the lowest-risk option. The current code already has the important foundations: App Router, server actions, Prisma relations, shared category constants, domain payment modules, focused hooks, and component extraction. Completing the remaining critique items would likely provide the best maintainability-to-effort ratio.

### Option B: transition to Nuxt + Elysia + Drizzle

This is a good option if the project should demonstrate a clearly separated frontend and backend, or if learning Vue, Elysia, and Drizzle is itself a requirement. Nuxt would own pages and UI, Elysia would own the HTTP API and server rules, and Drizzle would own typed database access. The separation can make ownership clearer:

```text
Nuxt client
	pages, components, composables, stores
					|
					| HTTP / JSON API
					v
Elysia backend
	routes, auth, validation, services, payment adapters
					|
					v
Drizzle
	schema, migrations, queries
					|
					v
SQLite or libSQL
```

## Recommendation

Do not migrate only to escape maintainability problems. First define the domain contracts that must remain stable, then decide whether the educational value of a separated stack justifies the rewrite.

Given the current scope, I recommend **staying with Next.js unless a separate API is explicitly desired**. The migration would replace working framework integrations, require rewriting every page and client hook, and introduce two applications to run and deploy. That creates new operational complexity for a small ecommerce project.

If a separate backend is desired, use Nuxt + Elysia + Drizzle as a deliberate architecture exercise. Do not run both Prisma and Drizzle against the same schema for a long period, and do not copy the current server actions directly into Elysia routes. Rebuild the boundaries around domain services and shared contracts.

## What becomes more maintainable

### Nuxt frontend

- Vue components can remain focused on presentation.
- Nuxt pages handle route composition and page-level data loading.
- Composables are organized by domain: `useAuth`, `useCart`, `useOrders`, `useCheckout`, and separate payment composables.
- Pinia can replace Redux for small client state such as the cart, current user, and products.
- API calls are centralized in a typed client instead of being imported directly from server actions.

### Elysia backend

- Routes define transport concerns only: parsing requests, calling a service, and returning a response.
- Elysia schemas validate body, params, query, and response data at the API boundary.
- Authentication and admin authorization can be implemented as reusable middleware or guards.
- Payment providers can be isolated behind adapters such as `esewaGateway` and `khaltiGateway`.
- The backend can be tested independently from the Nuxt UI.

### Drizzle database layer

- The schema and migrations live in one explicit TypeScript location.
- Queries can be separated from services and routes.
- Relations, indexes, unique constraints, and status fields can be reviewed as database code.
- Order/payment idempotency can be enforced with database constraints instead of time-based checks.

## What becomes harder

- There are now two projects, two dev processes, and two deployment configurations.
- Authentication requires an explicit cookie or token contract between Nuxt and Elysia.
- CORS, CSRF, API error formats, and environment variables need deliberate handling.
- Shared types require a package, generated OpenAPI types, or a carefully maintained contract.
- Payment redirects and callbacks cross an API boundary instead of calling a server action directly.
- The existing Next.js pages, server actions, Prisma queries, and React hooks must be rewritten rather than moved.

The separation is valuable only when these costs are accepted and documented. For a small application, a badly separated two-app system is less maintainable than a well-structured single Next.js app.

## Target repository structure

```text
gocart/
	apps/
		web/                         # Nuxt frontend
			pages/
			components/
			composables/
				useAuth.ts
				useCart.ts
				useCheckout.ts
				useOrders.ts
				useEsewaPayment.ts
				useKhaltiPayment.ts
			stores/
			lib/api-client.ts

		api/                         # Elysia backend
			src/
				index.ts
				config/
					env.ts
				db/
					client.ts
					schema.ts
					migrations/
				middleware/
					auth.ts
					admin.ts
				routes/
					auth.ts
					products.ts
					cart.ts
					addresses.ts
					orders.ts
					payments.ts
					ratings.ts
				services/
					auth-service.ts
					catalog-service.ts
					cart-service.ts
					checkout-service.ts
					order-service.ts
				payments/
					esewa.ts
					khalti.ts
					payment-service.ts
				validators/
					categories.ts
					checkout.ts
					address.ts

	packages/
		contract/                     # Shared request/response types and constants
			categories.ts
			payment.ts
			order.ts
			api-errors.ts
```

The shared contract package is important. Categories, payment methods, order statuses, and response shapes must not be independently recreated in Nuxt and Elysia.

## Non-negotiable domain rules

### Electronics categories

Keep one canonical definition in `packages/contract/categories.ts`:

```ts
export const ELECTRONICS_CATEGORIES = [
	'Audio',
	'Computers',
	'Mobile Devices',
	'Cameras',
	'Wearables',
	'Accessories',
] as const

export type ElectronicsCategory = (typeof ELECTRONICS_CATEGORIES)[number]
```

The Nuxt select, Elysia request schema, seed data, and Drizzle-facing service must all use this contract. The backend must normalize and validate the category even when no browser is involved.

### Payment methods and statuses

Define internal values once in the contract package. Provider-specific values such as eSewa `COMPLETE` and Khalti `Completed` should be translated at the provider adapter boundary into one internal payment status.

The backend must:

- recalculate order totals from current database prices;
- validate quantities as positive integers;
- verify coupon rules server-side only, or remove coupons entirely if they are out of scope;
- require provider verification before completing an order;
- make payment completion idempotent by `orderId` and provider transaction ID;
- keep payment secrets in server-only environment variables.

## Migration strategy

### Phase 0: freeze the domain contract

Before changing frameworks, document the current API behavior and create shared constants for categories, roles, payment methods, order statuses, and error codes. Decide whether coupons remain in scope. Do not carry the current coupon placeholder into the new system.

### Phase 1: design the Drizzle schema

Translate the Prisma schema into Drizzle schema and migrations. Improve it during translation:

- use explicit status values or lookup tables;
- add `orderId` to `Purchase` as required where appropriate;
- add a unique constraint for one purchase per order/product;
- add indexes for user orders, cart ownership, payment order IDs, and webhook lookup;
- decide whether images remain a delimited string or become a separate `product_images` table.

Run Drizzle against a separate development database first. Verify row counts and representative relations before touching the current database.

### Phase 2: build the Elysia backend independently

Implement and test the API in this order:

1. health check and environment validation;
2. authentication and session cookie handling;
3. products and centralized categories;
4. cart and addresses;
5. order creation with server-side total calculation;
6. payment initiation and provider callbacks;
7. ratings and admin operations.

Each route should be thin. Put business calculations in pure services and database access in query modules. Return one consistent error shape, for example `{ error: { code, message, fields } }`.

### Phase 3: build the Nuxt frontend by vertical slice

Do not rewrite every page in one burst. Migrate one complete feature at a time:

1. product list and product details;
2. authentication;
3. cart;
4. address and checkout;
5. eSewa and Khalti payments;
6. orders and profile;
7. admin products and users.

Every Nuxt page should consume the API client, never database code. Keep eSewa and Khalti composables separate even if they share a small payment-status helper.

### Phase 4: verify and cut over

Run both applications against a migration database until the new vertical slice has been checked. Compare product counts, category values, user ownership, order totals, and payment states. Once all routes are migrated, remove Prisma, Next.js server actions, and the old duplicate pages together rather than keeping two competing implementations.

## Definition of done

- `pnpm dev` starts the Nuxt web app and Elysia API with documented commands.
- One shared contract defines electronics categories and payment/order constants.
- A category change updates the admin form, shop filter, seed data, and backend validation from one source.
- No Nuxt component imports Drizzle or server-only payment code.
- No Elysia route contains a large database transaction or duplicated business calculation.
- Login, cart, checkout, and payment callbacks have independent API tests.
- Failed provider verification cannot complete an order.
- Repeated callbacks cannot create duplicate purchases.
- Environment validation fails clearly when required secrets are absent.
- Coupons are either fully implemented or removed from the schema, routes, UI, and seed data.

## Final recommendation

Nuxt + Elysia + Drizzle is a sound stack for a separated architecture and can improve maintainability through clear frontend/API/database ownership. It is not a shortcut for DRY design. For the current school project, finishing the existing Next.js refactor is the pragmatic choice. Choose the migration only when the separate backend is a learning or project requirement, and then treat it as a staged rewrite around shared contracts, strict server validation, and independently testable domain services.

## Rules need

1. Dry principle where the single component is only there to do a single task,
2. Single hooks, one hook per feature domain, (even in payment 2 types needs 2 different hooks)
3. Category to be just for the Electronics products, no ambigious or non electronic category, there must be a central place where change makes all category update

THis is not a production grade website, just a simple school project but the maintainability and working of the project is must,  if they tell me to change something then i should not be messing around 4 files while one single one can do the update.

Analyze the files and prepare the Critique.md file to include mistakes, anti pattern and how to solve them being a senior developer
