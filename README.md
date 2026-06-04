<!-- updated :: 2026-06-04 22:20:00 -->
# GoCart E-Commerce Platform

GoCart is a modern, responsive full-stack e-commerce platform built using Next.js 15, Tailwind CSS, Prisma ORM, and SQLite (LibSQL). It features dedicated administrative controls, live database integrations, dynamic product filters, and fully simulated local and international payment gateways.

---

## 🛠️ Tech Stack

* **Framework**: Next.js 15 (App Router with Server Actions)
* **Database**: SQLite (managed with `@libsql/client` and `@prisma/adapter-libsql` for complete portability)
* **ORM**: Prisma v7.8.0
* **State Management**: Redux Toolkit (fully serialized state transfer)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React

---

## ✨ Features

1. **Portable Zero-Configuration Database**:
   - Automated setup using SQLite.
   - Self-contained database migrations and automated seeder runs upon first startup.
   - Dynamic path resolution converting relative SQLite URLs to absolute references to avoid runtime adapter path mismatches.

2. **Public Storefront & Advanced Filtering**:
   - Interactive shop layout with category check-filtering.
   - Double-bound min/max price range controls.
   - Sorting by newest products, low-to-high/high-to-low pricing, and best sellers (driven by product `salesCount` values).

3. **Secure Dedicated Checkout Flow**:
   - Order creation initializes in a `PENDING_PAYMENT` state.
   - Dedicated checkout workspace displaying payment options, shipping addresses, and pricing details.
   - Completed orders instantly write historical records to a dedicated SQL `Purchase` schema.

4. **Integrated Test Payment Gateways**:
   - **eSewa Sandbox**: Integrated via official epay v2 form redirection with live HMAC-SHA256 signature generation and automatic redirect callback handlers.
   - **Khalti Sandbox**: API-driven checkout portal simulation.
   - **Stripe & PayPal Simulator**: A dedicated interactive playground simulating credit card credentials and PayPal checkout.

5. **Customer Profiles & Order History**:
   - Customer profile dashboard displaying shipping address books.
   - Historic purchase logs loaded from SQLite showing bought items, timestamps, prices, and payment methods.

6. **Admin Control Suite**:
   - Add new products with direct image uploads stored in the local asset directory.
   - Manage product listings (change stock availability, delete products).
   - Promote/demote user accounts between `USER` and `ADMIN` roles.
   - High-level business analytics dashboard reporting revenue, totals, product counts, and customer statistics.

---

## 🚀 Getting Started

### 1. Prerequisites
Before setting up the project, ensure you have the following installed on your machine:
* **Node.js** (v22.0.0 or higher)
* **pnpm** (v9.0.0 or higher)

*Note: This project does not require `bun` or standard `npm`.*

### 2. First-Time Setup
A portable setup script is provided at the root of the project. Run it to install all dependencies, generate the Prisma client library, and build/seed the SQLite database:

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
1. Initialize the `.env` file if it doesn't already exist.
2. Install all node packages using `pnpm`.
3. Auto-generate the Prisma Client client libraries.
4. Execute `pnpx prisma db push` to create the SQLite database at `prisma/dev.db` with correct tables.
5. Seed initial administrative and test customer accounts.

### 3. Running the Server

#### Development Mode
Start the development server with turbopack compiler:
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the store.

#### Production Build & Start
Compile the static and server assets, verify types, and optimize the bundle:
```bash
pnpm build
pnpm start
```

---

## 🔑 Seeded Test Credentials

When you initialize the project, the database is populated with the following seed accounts:

### 1. User Logins
| Account Role | Email Address | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gocart.com` | `admin123` | Access administrative dashboard (`/admin`) to add products, promote users, and view statistics. |
| **Customer** | `user@gocart.com` | `user123` | Shop items, test checkout flow, apply coupons, and check purchase history. |

### 2. Active Promo Coupon Codes
Use these codes during the checkout summary to apply discounts:
* **`NEW20`**: 20% discount on order total.
* **`OFF10`**: 10% discount on order total.
* **`SUPER50`**: 50% discount on order total.

---

## 💳 Sandbox Payment Testing Credentials

For digital payment gateways, the sandbox mode is configured. Use these details to test checkout completions:

### 1. eSewa Portal Testing
* **Test Mobile Number**: `9806800001`
* **Test PIN/OTP**: `987654`
* Verification page will automatically redirect back to the Next.js API handler to complete the purchase.

### 2. Khalti Sandbox Portal
* Enter your own mobile number and use `9876` as the sandbox verification code to complete simulated checkout.

---

## 📁 Project Commands Reference

Manage your development cycle using the following commands:

* `pnpm install` — Download dependencies and run post-install Prisma generator.
* `pnpm dev` — Start Next.js development server.
* `pnpm build` — Generate optimized Next.js production build.
* `pnpm start` — Run production server.
* `pnpm run db:init` — Force check database synchronization status and run seeds.
* `pnpx prisma studio` — Open Prisma's graphical interface to inspect SQLite data rows.
