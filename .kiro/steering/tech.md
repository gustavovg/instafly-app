# Technology Stack

## Frontend Framework
- **React 18** with JSX (no TypeScript)
- **Vite** as build tool and dev server
- **React Router DOM v7** for client-side routing

## UI Framework & Styling
- **Tailwind CSS** for styling with custom design system
- **shadcn/ui** components (New York style, no RSC/TSX)
- **Radix UI** primitives for accessible components
- **Framer Motion** for animations
- **Lucide React** for icons

## Key Libraries
- **@base44/sdk** - Core platform integration
- **React Hook Form** with Zod validation
- **date-fns** for date manipulation
- **Recharts** for data visualization
- **Sonner** for toast notifications

## Development Tools
- **ESLint** for code linting
- **PostCSS** with Autoprefixer
- **Path aliases** configured (`@/` points to `src/`)

## Common Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Installation
npm install          # Install dependencies
```

## Build Configuration
- Vite with React plugin
- Path resolution for `@/` alias
- JSX loader for `.js` files
- Server allows all hosts for deployment flexibility