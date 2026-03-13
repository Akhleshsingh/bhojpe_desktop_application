# BhojPe - Restaurant POS System

## Overview
BhojPe is a React + Vite + TypeScript restaurant Point-of-Sale (POS) web application. It provides fast billing and easy management for restaurants, including order management, KOT (Kitchen Order Tickets), tables, waiters, inventory, and more.

## Architecture
- **Frontend**: React 18 + TypeScript + Vite
- **Routing**: React Router v6 (HashRouter) with future flags `v7_startTransition`, `v7_relativeSplatPath`
- **UI Libraries**: MUI v6 (Material UI), React Bootstrap, Bootstrap 5
- **State Management**:
  - **Redux Toolkit** – global app state (auth, offline order queue, cart)
  - **React Query (@tanstack/react-query)** – server state with caching, background refetch, offline sync
  - **React Context** – legacy contexts kept for backward compatibility (Auth, Inventory, KOT, Tables, Customers, Waiters, Orders, OrderType, Network)
- **HTTP Client**: Axios (`src/api/client.ts`) with auth interceptor and 401 redirect
- **API**: REST API proxied via Vite to `http://bhojpe.in/api/v1`

## Project Structure
```
src/
  App.tsx              - Root app with all providers and routes
  main.tsx             - Entry point — wraps with Redux + QueryClient + Auth + Network + Theme
  AuthContext.tsx       - Top-level auth context (token, user, login/logout)

  api/                 - HTTP layer
    client.ts          - Axios instance (auth interceptor, 401 redirect)
    index.ts           - Barrel re-export
    endpoints/
      auth.ts          - login, logout, branchData
      orders.ts        - fetchOrders, saveOrder, updateStatus, applyDiscount
      branch.ts        - branchMaster, dashboard, menuItems, roles
      customers.ts     - fetchCustomers, saveCustomer
      staff.ts         - CRUD staff
      delivery.ts      - delivery executives, waiters, waiter requests, reservations

  store/               - Redux Toolkit
    index.ts           - configureStore (auth, offline, cart)
    hooks.ts           - useAppDispatch, useAppSelector
    slices/
      authSlice.ts     - token, user, role + localStorage sync
      offlineSlice.ts  - offline order queue + retry counter
      cartSlice.ts     - cart items (add/remove/qty/clear)

  hooks/api/           - React Query hooks (coexist with legacy contexts)
    useBranch.ts       - useBranchData, useHomeDashboard, useMenuItems, useRoles
    useOrders.ts       - useOrdersQuery, useUpdateOrderStatus, useUpdateOrderPayment
    useCustomers.ts    - useCustomersQuery, useSaveCustomer
    useStaff.ts        - useStaffQuery, useAddStaff, useUpdateStaff, useDeleteStaff
    useDelivery.ts     - useDeliveryExecutives, useWaitersQuery, useReservationsQuery
    index.ts           - barrel re-export

  utils/
    api.tsx            - BASE_URL (proxied in dev, full URL in prod)
    queryClient.ts     - QueryClient config (staleTime 2 min, gcTime 10 min, retry 2)

  Pages/               - Top-level page components
  components/          - Reusable components (OrderPanel, BillDrawer, etc.)
  CommonPages/         - Shared pages (StaffPage, Reports, etc.)
  context/             - React context providers
  types/               - TypeScript types
  styles/              - CSS files
  Theme/               - Theme context + poppins font config
  assets/              - Images and icons
```

## Key Dependencies
- `@mui/material` + `@mui/icons-material` - UI components
- `react-router-dom` - Routing
- `axios` - HTTP client
- `@reduxjs/toolkit` + `react-redux` - Global state management
- `@tanstack/react-query` + `@tanstack/react-query-devtools` - Server state caching
- `react-bootstrap` + `bootstrap` - Bootstrap components
- `recharts` - Charts for dashboard
- `react-hot-toast` - Toast notifications
- `sweetalert2` - Alert dialogs
- `react-calendar` + `react-datepicker` - Date pickers
- `dayjs` - Date manipulation
- `use-sound` - Sound effects

## React Query Config
- `staleTime`: 2 min (data re-fetched after 2 min of inactivity)
- `gcTime`: 10 min (garbage collected after 10 min off-screen)
- `retry`: 2 with exponential backoff (max 10s)
- `refetchOnReconnect`: true — auto-syncs when internet returns
- `refetchOnWindowFocus`: true — refreshes when tab regains focus

## Offline Order Queue (Redux)
- Offline orders queued in `store.offline.queue` (persisted to `localStorage`)
- On reconnect, `NetworkContext` syncs the queue via `client.post("/saveOrder")`
- Failed orders are retried (retry counter tracked per order)

## Brand Guidelines
- Primary color: `#E8353A`
- Font: Poppins throughout
- Background: `#F8FAFC`
- Card headers: dark gradient `#1F2937 → #374151`

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`

## Deployment
- Type: Static site
- Build command: `npm run build`
- Output directory: `dist`

## Notes
- `BASE_URL` always imported from `src/utils/api.tsx` — never hardcoded
- HashRouter used for static hosting compatibility
- React Query DevTools visible in dev mode (bottom-right corner)
- OrderTypeContext shares order type state between DashboardLayout header and OrderPanel
