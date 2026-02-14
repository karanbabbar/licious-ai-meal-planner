# Protein Planner v2 - Product Requirements Document

## Original Problem Statement
Build a React mobile-first web app called "Protein Planner v2" - a guided wizard to help users calculate protein needs, plan meals with Licious products, and pre-order supplies.

## Tech Stack
- **Frontend:** React 18 (hooks only), Inline CSS-in-JS styles
- **Fonts:** Google Fonts (`Plus Jakarta Sans`, `JetBrains Mono`)
- **Backend:** External n8n webhook APIs (no local backend)
- **Architecture:** Single-file monolithic component (`App.js`)

## API Endpoints
- Onboarding: `https://karanbabbar.app.n8n.cloud/webhook/v2/onboarding`
- Meal Planning: `https://karanbabbar.app.n8n.cloud/webhook/v2/meal-planning`
- Weekly Cart: `https://karanbabbar.app.n8n.cloud/webhook/v2/weekly-cart`

## User Flow
1. **Homepage** → "Plan & Pre-Order Protein"
2. **Macro Fork** → Enter macros OR use calculator
3. **Calculator Disclaimer** → (if calculator path)
4. **Onboarding Wizard** → 6-step form (name, age, measurements, goals, activity, preferences)
5. **Results** → Show calculated macros
6. **Meal Planning Wizard (Agent 2)** → Backend-driven UI:
   - `budget_setup` → Distribution selection + supplements
   - `source_select` → Choose protein sources (max 3)
   - `cut_select` → Cut preference selection
   - `product_select` → Select products (max 1 per category)
   - `portion_confirm` → Confirm portions and utilization
   - `meal_confirmed` → Meal locked badge
7. **Weekly Order Wizard (Agent 3)** → Build weekly order:
   - `delivery_select` → Delivery preference
   - `weekly_plan` → Review weekly plan
   - `cart_display` → Preview cart before finalizing
8. **Final Cart** → Weekly supply summary with Licious links

## Key Business Rules
- Single `session_id` persists across all API calls
- Max 1 product per source category (swap logic)
- Supplement protein is deducted before distribution
- UI components collapse into summary badges after use
- No demo/fallback modes - show error on API failure

---

## What's Been Implemented (Dec 2025)

### Core Features ✅
- Homepage with branding and CTA
- Macro Fork screen (know macros vs calculate)
- Calculator disclaimer screen
- 6-step onboarding wizard with form validation
- Results screen showing calculated macros
- Dynamic meal planning UI driven by `ui_type` from API
- Visual components: DistributionSetup, SourceChips, CutChips, ProductCardGrid, PortionConfirmCard, MealBadge
- CollapsedBadge for completed steps
- Final cart summary screen
- Journey tracker (progress indicator)

### Bug Fixes Applied (Dec 2025) ✅
1. **P0 - msg.trim error** - Type checking before trim() in send function
2. **P1 - Budget badge undefined** - Added fullData prop to CollapsedBadge
3. **P1 - Product selection** - SWAP logic (max 1 per category) + "Pick 1" labels
4. **P2 - Select button** - Disabled after submission with loading state
5. **P2 - Floating-point** - All protein displays use Math.round(value * 10) / 10
6. **P2 - Lock Meal button** - Disabled after submission with loading state
7. **Retry mechanism** - ErrorRetry component shows "Something went wrong. Tap to retry" on API failures

### Bug Fixes - Round 3 (Dec 2025) ✅
1. **CRITICAL - Agent 3 not triggered** - Created WeeklyOrderWizard component, flow now: meals → weekly → cart
2. **Distribution badge 0g values** - Added calculateDistribution() fallback when API returns zeros
3. **₹0 products selectable** - Filter out already-purchased products, show "Already in your order" section
4. **CTAs not disabling** - Added isSubmitting state to: DistributionSetup, SourceChips, CutChips, DeliverySelect, WeeklyPlanReview, CartPreview
5. **Distribution fallback calc** - Helper function calculates Equal/Heavy Breakfast/Lunch/Dinner splits locally

### Bug Fixes - Complete Fix Round (Dec 2025) ✅
1. **FIX 1 (CRITICAL) - Text input fallback** - Added FormattedText and ChatInput components. When backend returns no ui_type, shows formatted message + text input so user can always respond
2. **FIX 2 - Defensive data parsing** - All components handle alternate field names (meal/meal_label, sources/available_sources, cuts/cut_options, etc.)
3. **FIX 3 - Protein badge on cards** - Already implemented with 6.5g/egg and Xg/100g displays
4. **FIX 4 - Distribution badge stale values** - CollapsedBadge now accepts msgs array to find latest confirmed budget from subsequent messages
5. **FIX 5 - Edit button on meal badges** - MealBadge now has optional "Edit" link to change locked meal
6. **FIX 6 - send() safety** - All send functions now safely handle string, object, or other input types
7. **FIX 7 - CTA disable after click** - All interactive components have isSubmitting/locked state with loading indicators

---

## Prioritized Backlog

### P0 - Critical
- None currently (all P0 bugs fixed)

### P1 - High Priority
- Full E2E testing when n8n API is functional

### P2 - Medium Priority
- None currently

### P3 - Future/Backlog
- Offline support / graceful degradation
- Analytics integration
- Performance optimization for large product lists

---

## File Structure
```
/app/frontend/src/
├── App.js          # All components, state, API calls, styles (~900 lines)
└── index.js        # React entry point
```

**Note:** Do NOT refactor App.js into multiple files per user requirement.

---

## Testing Status
- **Code Review:** All 6 bug fixes verified ✅
- **Functional Testing:** Blocked by n8n API empty responses
- **Test Reports:** `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_2.json`
