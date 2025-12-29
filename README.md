# Neon Bites - Restaurant Ordering System

Neon Bites is a modern restaurant ordering application designed to streamline the dining experience. It features a digital menu, QR code-based ordering, table tracking, and a comprehensive admin dashboard for managing orders and kitchen workflow.

## Features

### Customer Features
- **QR Code Entry**: Customers scan a QR code to access the menu for their specific table.
- **Digital Menu**: Browse categories, view item details, and search for specific dishes.
- **Customization**: Customize menu items with sizes, extras, and special instructions.
- **Cart Management**: Add items to the cart, adjust quantities, and review orders.
- **Payment Integration**: Select from multiple payment methods (EasyPaisa, JazzCash, Bank Transfer, Cash on Delivery) before placing an order.
- **Order Tracking**: Real-time status updates (Pending, Preparing, Ready, Served).

### Admin Features
- **Dashboard**: Overview of restaurant performance.
- **Order Management**: Kanban-style board to track and update order statuses.
- **Table Management**: View table occupancy and status.
- **Menu Management**: Manage items, categories, and availability.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: CSS Modules with custom properties (CSS Variables)
- **State Management**: React Context API
- **Persistence**: LocalStorage (simulating backend)

## Getting Started

1. Clone the repository.
2. Install dependencies:
   npm install

3. Run the development server:
   npm run dev

4. Open http://localhost:3000 in your browser.

## Project Structure
- src/app: Application routes and pages.
- src/app/customer: Customer-facing booking and ordering flow.
- src/app/admin: Admin dashboard and management tools.
- src/context: Global state management (CartContext).
- src/lib: Utility functions, types, and mock data storage.
