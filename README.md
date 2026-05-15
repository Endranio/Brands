# ANPM Clothing Brand MVP

This is the official web application for the ANPM Clothing Brand MVP.
It serves as the main online catalog and checkout platform, built specifically to reduce dependency on traditional marketplaces.

## Architecture & Tech Stack

This project is built using:
- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **PostgreSQL** (via Neon)
- **Drizzle ORM**
- **Clerk Auth** (for Admin)
- **ImageKit.io** (for Image Storage & Optimization)

## Features

- **Public Landing Page:** Configurable hero section, dynamic product catalog.
- **Admin Dashboard:** Manage products, variants, images, and orders.
- **Order Management:** Collect customer orders safely, tracking status from pending to shipped.
- **WhatsApp Checkout:** Direct customers to WhatsApp seamlessly upon order submission.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment file and set up your variables:
   ```bash
   cp .env .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Database Setup:
   Generate and run database migrations using Drizzle ORM:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Requirements

- Node.js >= 20

---
*Based on the ixartz/Next-js-Boilerplate framework.*
