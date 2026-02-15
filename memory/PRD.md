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

## User Flow (State Engine V3)
1. **Homepage** → "Plan & Pre-Order Protein"
2. **Macro Fork** → Enter macros OR use calculator
3. **Calculator Disclaimer** → (if calculator path)
4. **Onboarding Wizard** → 6-step form
5. **Results** → Show calculated macros
6. **Meal Planning Wizard (V3)** → Backend-driven UI:
   - `supplement_ask` → Ask about protein supplements
   - `budget_setup` → Distribution selection (shows protein deduction math)
   - `source_select` → Choose protein sources (max 3)
   - `cut_select` → Cut preference (skipped for eggs)
   - `product_select` → **GROUPED BY SOURCE** - Select products
   - `portion_confirm` → Confirm portions + **utilization options** + **Change Products button**
   - `meal_confirmed` → Meal locked badge + **Edit button**
   - `consolidation` → Summary + **Edit menu** + cost summary
   - `weekly_summary` → **7-day accordion** + **Cart with Change buttons** + **CartEditor overlay**
   - `delivery_frequency` → Delivery frequency selection
   - `delivery_select` → Time slot selection
   - `order_confirmed` → Final confirmation

---

## What's Been Implemented (Dec 2025)

### Bug Fixes R1 - All 8 Fixed ✅ (Latest)

| Bug | Priority | Component | Fix |
|-----|----------|-----------|-----|
| 1 | P0 | `budget_setup` | Use `protein_target` (already deducted), display distribution values from backend's `values` field |
| 2 | P0 | `product_select` | Group by `products_by_source`, show up to 4 products per source section |
| 3 | P0 | `meal_confirmed`/`consolidation` | Edit buttons send `{edit_meal: "breakfast"}` correctly |
| 4 | P1 | `portion_confirm` | Always show utilization options if present (including dinner) |
| 5 | P1 | `portion_confirm` | Added "← Change Products" button sending `{edit_meal: "<meal>"}` |
| 6 | P1 | `weekly_summary` | Fixed day dropdowns to render `meals[].products[]` nested structure |
| 7 | P2 | `weekly_summary` | **CartEditor overlay** - Shows alternatives from stored `productsCatalog` filtered by category |
| 8 | P2 | `CollapsedBadge` | Count actual products from user's JSON selection |

### State Engine V3 Implementation ✅
- All 12 V3 ui_types implemented
- New components: `SupplementAsk`, `DeliveryFrequency`, `Consolidation`, `RunningCostBanner`, `CartEditor`
- Overhauled: `DistributionSetup`, `SourceChips`, `CutChips`, `ProductCardGrid`, `PortionConfirmCard`, `MealBadge`, `WeeklySummary`, `OrderConfirmed`

### Core Features ✅
- Homepage with branding and CTA
- Macro Fork screen
- 6-step onboarding wizard
- Results screen
- Dynamic meal planning UI
- CollapsedBadge for completed steps
- Final cart summary

### Defensive Programming ✅
- 51+ Array.isArray() guards for all .map() calls
- Safe property access with optional chaining

---

## Prioritized Backlog

### P0 - Critical
- ✅ All P0 bugs fixed

### P1 - High Priority
- ✅ All P1 bugs fixed
- Full E2E testing when n8n webhook API is operational

### P2 - Medium Priority
- ✅ CartEditor implemented (local only v1)
- "Remove" button in final cart (deferred)

---

## File Structure
```
/app/frontend/src/
├── App.js          # All components (~2600 lines)
└── index.js        # React entry point
```

---

## Testing Status
- **Frontend Build:** ✅ Compiles successfully
- **Bug Fixes Verified:** All 8 via code review ✅
- **External API:** n8n webhook returns empty responses (not our bug)
- **Test Reports:** `/app/test_reports/iteration_5.json`

---

## Key Code Locations
| Component | Line | Notes |
|-----------|------|-------|
| CollapsedBadge | ~612 | BUG 8 fix - actual product count |
| DistributionSetup | ~710 | BUG 1 fix - backend values |
| ProductCardGrid | ~850 | BUG 2 fix - group by source |
| PortionConfirmCard | ~1260 | BUG 4,5 fix - utilization + change products |
| MealBadge | ~1480 | BUG 3 fix - edit button |
| Consolidation | ~1550 | BUG 3 fix - edit menu |
| WeeklySummary | ~1700 | BUG 6 fix - nested products |
| CartEditor | ~1900 | BUG 7 fix - overlay |
| MealPlanningWizard | ~2340 | productsCatalog state |
