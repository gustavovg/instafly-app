# Project Structure

## Root Directory
```
├── src/                    # Source code
├── .kiro/                  # Kiro configuration and steering
├── .vscode/                # VS Code settings
├── node_modules/           # Dependencies
├── package.json            # Project configuration
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── components.json         # shadcn/ui configuration
└── README.md               # Project documentation
```

## Source Structure (`src/`)
```
├── api/                    # Base44 SDK integration
│   ├── base44Client.js     # Main API client setup
│   ├── entities.js         # Data entities
│   ├── functions.js        # API functions
│   └── integrations.js     # Third-party integrations
├── components/             # Reusable React components
│   ├── ui/                 # shadcn/ui components
│   └── *.jsx               # Custom components
├── hooks/                  # Custom React hooks
├── lib/                    # Utility libraries
│   └── utils.js            # Common utilities
├── pages/                  # Route components
│   ├── index.jsx           # Main router configuration
│   ├── Layout.jsx          # Common layout wrapper
│   └── *.jsx               # Individual page components
├── utils/                  # Helper utilities
├── App.jsx                 # Root application component
├── main.jsx                # Application entry point
├── App.css                 # Component-specific styles
└── index.css               # Global styles and Tailwind imports
```

## Naming Conventions
- **Files**: PascalCase for components (`AdminDashboard.jsx`)
- **Directories**: camelCase (`src/api/`, `src/components/`)
- **Components**: PascalCase class/function names
- **Variables**: camelCase

## Import Patterns
- Use `@/` alias for src imports: `import Layout from "@/pages/Layout.jsx"`
- Relative imports for same directory: `import "./App.css"`
- External packages: `import React from 'react'`

## Page Organization
- All pages in `src/pages/` directory
- Main router in `src/pages/index.jsx`
- Layout wrapper in `src/pages/Layout.jsx`
- Page naming follows route paths (e.g., `/AdminDashboard` → `AdminDashboard.jsx`)