# Overview

BDC Coin is a premium cryptocurrency platform with real-world asset backing, featuring a dynamic pricing system and dividend distribution mechanism. The application provides users with token purchase capabilities, real-time statistics, price history tracking, and QR code generation for USDC deposits. The platform emphasizes transparency with live trading status and comprehensive token analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation schemas
- **UI Components**: Comprehensive set of accessible components from Radix UI primitives

## Backend Architecture
- **Express.js Server**: RESTful API with middleware for logging and error handling
- **Storage Layer**: Abstracted storage interface with in-memory implementation (MemStorage)
- **Route Structure**: Modular route organization with dedicated API endpoints
- **Development Integration**: Vite middleware for hot module replacement in development

## Data Storage
- **Database Schema**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: 
  - `purchases`: Transaction records with amount, price, and BDC calculations
  - `priceHistory`: Time-series data for price tracking and analytics
  - `tokenStats`: Real-time token supply and dividend information
- **Migration System**: Drizzle Kit for database schema migrations and management

## Core Features
- **Dynamic Pricing**: Algorithm-based price calculation that adjusts based on purchase volume
- **Purchase System**: USDC-to-BDC conversion with real-time price preview
- **Statistics Dashboard**: Live token metrics including supply, price, and dividend data
- **Price History**: Historical price tracking with configurable time ranges
- **QR Code Generation**: Automated QR code creation for deposit addresses

## Build and Development
- **Monorepo Structure**: Shared schema and types across client and server
- **Build Pipeline**: Vite for frontend bundling, ESBuild for server compilation
- **TypeScript Configuration**: Strict typing with path mapping for clean imports
- **Development Workflow**: Hot reloading with integrated error overlays

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting via `@neondatabase/serverless`
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect

## UI and Styling
- **Radix UI**: Comprehensive set of accessible, unstyled UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Consistent icon library for UI elements

## Development Tools
- **Vite**: Fast build tool with development server and HMR
- **TanStack Query**: Powerful data synchronization for React applications
- **React Hook Form**: Performant forms with validation integration

## Utility Libraries
- **QRCode**: QR code generation for deposit addresses
- **date-fns**: Date manipulation and formatting utilities
- **clsx/tailwind-merge**: Conditional class name composition

## Session Management
- **connect-pg-simple**: PostgreSQL session store for Express sessions