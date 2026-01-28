# Agentic Guidelines for chileme-app

This document provides essential information and coding standards for AI agents operating in this repository.

## 1. Environment & Commands

The project is built with **React 19** and **Vite 7**. It uses **Tailwind CSS 4** for styling.

### Package Manager
Use `npm` (or `pnpm` if you prefer, as `pnpm-lock.yaml` exists).

### Core Commands
- **Development**: `npm run dev` - Starts the Vite dev server.
- **Build**: `npm run build` - Builds the application for production.
- **Linting**: `npm run lint` - Runs ESLint.
- **Preview**: `npm run preview` - Previews the production build locally.

### Testing
- **Status**: No test runner (Vitest/Jest) is currently configured.
- **Instruction**: If you need to implement tests, favor **Vitest** as it integrates seamlessly with Vite. To run a single test after setup: `npx vitest run path/to/file.test.js`.

---

## 2. Code Style & Conventions

### Language
- This is a **JavaScript** project (ES Modules). No TypeScript is used.

### React Components
- Use **Functional Components** with hooks (`useState`, `useEffect`, `useMemo`).
- Naming: **PascalCase** for component names and filenames (e.g., `src/components/Wheel.jsx`).
- Export: Prefer `export default` for components, or named exports for utilities.

### State Management
- Use `useState` for local component state.
- Use `useMemo` for derived data to avoid unnecessary calculations.

### Styling (Tailwind CSS 4)
- Use utility classes directly in `className`.
- Follow the **Cyberpunk theme** established in the CSS:
  - Colors: `cyber-cyan` (#00f7ff), `cyber-pink` (#ff00ea), `cyber-dark` (#050505), `cyber-yellow` (#fff200).
  - Effects: `neon-text-cyan`, `glitch-text`, `cyber-button`.
- Responsiveness: Use `sm:`, `md:`, `lg:` prefixes.
- **Animations**: The project uses custom animations defined in `index.css`. Proactively use `animate-in`, `fade-in`, `zoom-in` for modal transitions.

### Layout Principles
- Use **Flexbox** and **Grid** for centering components.
- The main app container is a full-height `h-screen` container.
- Ensure all interactive elements have appropriate hover states and active scales (e.g., `active:scale-95`).

### Performance
- Wrap expensive filtering or mapping operations in `useMemo`.
- Avoid re-rendering the `Wheel` component unnecessarily during the spin animation unless items change.

### Naming Conventions
- **Variables / Functions**: `camelCase` (e.g., `isSpinning`, `handleSpin`).
- **Data Constants**: `camelCase` (as seen in `src/data.js`, e.g., `mealTypes`, `foodData`).
- **Boolean Prefixes**: Use `is`, `has`, `should` (e.g., `showModal`, `isSpinning`).

### Imports Order
1. React and hooks: `import React, { useState } from 'react';`
2. External libraries (if any).
3. Internal data/utilities: `import { ... } from './data';`
4. Components: `import ComponentName from './components/ComponentName';`
5. Styles: `import './index.css';`

### Formatting
- **Indentation**: 2 spaces.
- **Quotes**: Single quotes for strings, double quotes for JSX attributes.
- **Semicolons**: Always include them.

### Error Handling
- Use `try/catch` for async operations (like potential future API calls).
- For UI logic, ensure fallback states are handled (e.g., what happens if `mealTypes` is empty).

---

## 3. Repository Specifics

### Data Structure
- All food items and category data are centralized in `src/data.js`. 
- When adding food items, use high-quality Unsplash URLs with `w=400&h=400&fit=crop` parameters.

### UI Architecture
- `App.jsx` handles the main layout and spin logic.
- `Wheel.jsx` is the core visual component using `clip-path` and dynamic rotations.
- `CelebrationModal.jsx` handles the winning result display.

## 4. Rule Files
- No `.cursorrules` or `.github/copilot-instructions.md` detected. Follow the standards in this `AGENTS.md` strictly.
