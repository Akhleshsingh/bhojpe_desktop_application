# BhojPe - Restaurant POS System

## Overview
BhojPe is a React + Vite + TypeScript restaurant Point-of-Sale (POS) web application. It provides fast billing and easy management for restaurants, including order management, KOT (Kitchen Order Tickets), tables, waiters, inventory, and more.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 (HashRouter)
- **UI Libraries**: MUI (Material UI), React Bootstrap, Bootstrap 5
- **State Management**: React Context API (multiple providers)
- **API**: REST API calls to `http://bhojpe.in/api/v1`

## Project Structure
```
src/
  App.tsx              - Root app with all providers and routes
  main.tsx             - Entry point
  Pages/               - Top-level page components (Login, Dashboard, etc.)
  components/          - Reusable components (OrderPanel, BillDrawer, etc.)
  CommonPages/         - Shared pages (header, footer, Reports, etc.)
  context/             - React context providers
  hooks/               - Custom hooks
  utils/               - API utilities
  types/               - TypeScript types
  styles/              - CSS files
  Theme/               - Theme context and configuration
  assets/              - Images and icons
```

## Key Dependencies
- `@mui/material` + `@mui/icons-material` - UI components
- `react-router-dom` - Routing
- `react-bootstrap` + `bootstrap` - Bootstrap components
- `recharts` - Charts for dashboard
- `react-hot-toast` - Toast notifications
- `sweetalert2` - Alert dialogs
- `react-calendar` + `react-datepicker` - Date pickers
- `dayjs` - Date manipulation
- `use-sound` - Sound effects

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`

## Deployment
- Type: Static site
- Build command: `npm run build`
- Output directory: `dist`

## Notes
- App connects to external API at `http://bhojpe.in/api/v1`
- Uses HashRouter for compatibility with static hosting
- Assets (images, icons) are stored in `src/assets/`
- Fixed syntax errors in `OrderPanel.tsx` (duplicate `|` in union type) and `CheckoutModal.tsx` (duplicate `Split` type declaration)
