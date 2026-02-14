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
- Meal Planning (merged with weekly): `https://karanbabbar.app.n8n.cloud/webhook/v2/meal-planning`

## User Flow
1. **Homepage** → "Plan & Pre-Order Protein"
2. **Macro Fork** → Enter macros OR use calculator
3. **Calculator Disclaimer** → (if calculator path)
4. **Onboarding Wizard** → 6-step form (name, age, measurements, goals, activity, preferences)
5. **Results** → Show calculated macros
6. **Meal Planning Wizard (Merged Agent 2+3)** → Backend-driven UI through single endpoint:
   - `budget_setup` → Distribution selection + supplements
   - `source_select` → Choose protein sources (max 3)
   - `cut_select` → Cut preference selection
   - `product_select` → Select products (max 1 per category)
   - `portion_confirm` → Confirm portions and utilization
   - `meal_confirmed` → Meal locked badge
   - `weekly_summary` → 7-day plan + cart preview
   - `delivery_select` → Time slot selection
   - `order_confirmed` → Final confirmation screen
7. **Final Cart** → Weekly supply summary with Licious links

## Structured JSON Selections
The frontend sends structured JSON instead of plain text for backend reliability:
- Distribution tap → `{"distribution": "Equal", "supplement_grams": 0}`
- Source select → `{"sources": ["eggs", "chicken"]}`
- Cut select → `{"cut": "Boneless"}`
- Product select → `{"products": ["Chicken Breast Boneless 450g"]}`
- Utilization → `{"utilization": {"Eggs Pack of 6": "same_meal_multi_day"}}`
- Time slot → `{"time_slot": "morning"}`

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

### Bug Fixes - Comprehensive Defensive Programming Audit (Dec 2025) ✅
**P0 CRITICAL - All `.map()` crashes fixed with Array.isArray() guards:**
1. **PillSelect** (Line 51) - Guard on options.map()
2. **DistributionSetup** (Lines 536-554, 594) - rawDistributions normalization + distributions.map() guard
3. **SourceChips** (Lines 651-659, 662, 678) - rawSources normalization + sources.map() guard
4. **CutChips** (Lines 727-738, 761) - rawCuts normalization + cuts.map() guard
5. **ProductCardGrid** (Lines 799-807, 810-811, 880, 934, 938, 949) - rawProducts normalization + all .map() guards
6. **PortionConfirmCard** (Lines 972-988, 990, 1011, 1037, 1041, 1044, 1047, 1053) - portions & utilizationOptions normalization + all .map() guards
7. **MealPlanningWizard msgs** (Line 1240) - msgs.map() guard
8. **WeeklyOrderWizard msgs** (Line 1377) - msgs.map() guard
9. **DeliverySelect** (Lines 1419-1429, 1435) - options normalization + .map() guard
10. **WeeklyPlanReview** (Lines 1463-1481) - days normalization + .map() guards
11. **CartPreview** (Lines 1500-1524) - cart normalization + .map() guards
12. **FinalCart** (Lines 1548-1566) - cart normalization + .map() guard

**P1 - CTA Button Disable After Click:**
- All submit buttons have isSubmitting/submitted state preventing double submissions
- Loading spinners shown during API calls

**P1 - Agent 2 → Agent 3 Transition:**
- Code verified: When meal planning API returns stage_complete=true, goes to 'weekly' screen (WeeklyOrderWizard), NOT directly to 'cart'

**P2 - Fallback Text Input:**
- ChatInput component renders when ui_type is not recognized or missing
- Allows users to always respond with text

### Previous Bug Fixes Applied (Dec 2025) ✅
1. **P0 - msg.trim error** - Type checking before trim() in send function
2. **P1 - Budget badge undefined** - Added fullData prop to CollapsedBadge
3. **P1 - Product selection** - SWAP logic (max 1 per category) + "Pick 1" labels
4. **P2 - Select button** - Disabled after submission with loading state
5. **P2 - Floating-point** - All protein displays use Math.round(value * 10) / 10
6. **P2 - Lock Meal button** - Disabled after submission with loading state
7. **Retry mechanism** - ErrorRetry component shows "Something went wrong. Tap to retry" on API failures

---

## Prioritized Backlog

### P0 - Critical
- ✅ All P0 bugs fixed - no crashes from .map() calls

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
├── App.js          # All components, state, API calls, styles (~1600 lines)
└── index.js        # React entry point
```

**Note:** Do NOT refactor App.js into multiple files per user requirement.

---

## Testing Status
- **Code Review:** All defensive Array.isArray() guards verified ✅
- **CTA Button Disable:** Double-click blocking verified ✅
- **Agent 2 → Agent 3 Transition:** Code logic verified ✅
- **Fallback Text Input:** ChatInput component verified ✅
- **Functional Testing:** Frontend success rate 100%, external n8n API returns empty responses
- **Test Reports:** `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_2.json`, `/app/test_reports/iteration_3.json`
