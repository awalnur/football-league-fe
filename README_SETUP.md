# Setup Instructions

## Prerequisites
- Node.js 20.x or higher
- npm 9.x or higher
- Supabase account and project

## Environment Setup

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Installation

Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

Build for production:
```bash
npm run build
```

## Linting

Run ESLint:
```bash
npm run lint
```

## Project Structure

- `/src/app` - Next.js App Router pages
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and Supabase client
- `/src/types` - TypeScript type definitions
- `/src/context` - React Context providers
- `/public` - Static assets

## Code Quality

This project follows strict code quality standards:
- ✅ TypeScript strict mode
- ✅ ESLint with Next.js and React Hooks rules
- ✅ All components use React Hooks (no class components)
- ✅ Next.js Image optimization for all images
- ✅ Proper dependency management in useEffect hooks

## Notes

- The build may fail in CI environments without Supabase credentials
- For local development, ensure `.env.local` is properly configured
- The project uses Next.js 16 with Turbopack for faster builds
