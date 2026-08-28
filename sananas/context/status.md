# Project Status: Calculadora Pediátrica de Urgencias

This document provides a granular overview of the current development status.

## Focus
All core development phases are completed. The application is ready for deployment on Vercel and connection to the production Supabase database.

### Infra Stack
- **Framework**: Next.js 15+ (App Router) + TypeScript + Bun
- **Styling**: Tailwind CSS v4 + Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL) with offline localStorage fallback and Google OAuth + Clinical User Profiles
- **Deployment & Versioning**: Vercel + GitHub

### Status Overview
- **Project Context & Rules**: Initialized.
- **Pure Clinical Formulas Engine**: Fully implemented and typed in `src/lib/formulas.ts`.
- **Supabase Client & Fallback Service**: Configured in `src/lib/supabase.ts` with dynamic redirect helper.
- **Global Patient State Provider**: Implemented in `src/context/PatientContext.tsx`.
- **Patient Header Component**: Implemented with real-time BSA (Mosteller), safety alerts, and dynamic user profile display.
- **Clinical Modules**: Fully implemented (Maintenance, Burns, CAD, EDA/WHO).
- **Consultations History Component**: Implemented with search, date filters, and expandables.
- **Auth Screen**: Fully implemented with email/password login, Google OAuth, and an expanded clinical registration form (Full Name, Specialty, Hospital, Medical License).
- **Main App Shell**: Assembled in `src/app/page.tsx` and `src/app/layout.tsx`.
- **Production Build**: Verified and compiled successfully with zero errors.

### Done
- [x] Initialize Next.js 15+ TypeScript project in workspace.
- [x] Install dependencies (`@supabase/supabase-js`, `lucide-react`, `clsx`, `tailwind-merge`).
- [x] Implement pure clinical formulas in `src/lib/formulas.ts`.
- [x] Configure Supabase client with offline `localStorage` fallback.
- [x] Create Patient global state provider (`PatientContext.tsx`).
- [x] Build Patient Header component with real-time SC Mosteller and dynamic user metadata.
- [x] Implement Clinical Modules (Maintenance, Burns, CAD, EDA/WHO).
- [x] Implement Consultations History component with search and filters.
- [x] Connect all components in the main app page.
- [x] Implement Supabase Authentication (Sign up / Sign in) with email confirmation.
- [x] Add Google OAuth sign-in option.
- [x] Add clinical registration form to collect professional details (Full Name, Specialty, Hospital, Medical License).
- [x] Implement Native Dark Mode with persistent theme selection and high-contrast styling.
- [x] Implement Interactive Burn Selector (Lund-Browder) with clickable SVG body diagrams (Anterior/Posterior).
- [x] Verify production build and compilation.

### To Do Immediately
- Verify that Vercel automatically deploys the latest main branch with dark mode and Lund-Browder selector.
