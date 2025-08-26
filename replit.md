# Overview

TechStore is a full-stack e-commerce web application for selling electronics and gadgets. Built with React, Express.js, and PostgreSQL, it provides a comprehensive platform for browsing products, managing inventory, and handling cart operations. The application features both customer-facing store functionality and administrative tools for product management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Single-page application using React 18 with TypeScript
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **State Management**: React Query for server state, local React state for client state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Styling**: Tailwind CSS with CSS custom properties for theming

## Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **API Routes**: Full CRUD operations for products (`/api/products`)
- **Validation**: Zod schemas for request/response validation
- **Development**: Vite integration for hot module replacement and development server

## Database Schema
- **Products Table**: Core entity with fields for name, description, price, image URL, stock quantity, specifications, and category
- **Schema Management**: Drizzle ORM for type-safe database operations and migrations
- **Database**: PostgreSQL configured via environment variables

## Key Features
- **Product Catalog**: Browse products with filtering by category
- **Product Management**: Admin interface for CRUD operations on products
- **Shopping Cart**: Add/remove items, quantity management, cart persistence
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Form Validation**: Type-safe forms with real-time validation feedback

## Development Workflow
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **TypeScript**: Strict type checking across frontend and backend
- **Code Organization**: Shared types and schemas between client and server
- **Development Server**: Integrated development experience with HMR

# External Dependencies

- **Database**: PostgreSQL via Neon Database (@neondatabase/serverless)
- **ORM**: Drizzle ORM for database operations and schema management
- **UI Components**: Radix UI primitives for accessible component foundation
- **Styling**: Tailwind CSS for utility-first styling approach
- **State Management**: TanStack React Query for server state synchronization
- **Form Handling**: React Hook Form with Hookform/resolvers for validation
- **Validation**: Zod for runtime type checking and schema validation
- **Icons**: Lucide React for consistent icon library
- **Development**: Replit-specific plugins for development environment integration
- **Fonts**: Google Fonts (Inter) for typography
- **Image Hosting**: Unsplash for product images (placeholder implementation)