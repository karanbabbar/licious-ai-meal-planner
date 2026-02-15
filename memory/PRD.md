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
   - `weekly_summary` → **Horizontal scrollable calendar** + Cart + CartEditor
   - `delivery_frequency` → Delivery frequency selection
   - `delivery_select` → Time slot selection
   - `order_confirmed` → Final confirmation

---

## What's Been Implemented (Dec 2025)

### Round 2 Quick Fixes - All 4 Addressed ✅ (Latest)

| Issue | Priority | Status | Notes |
|-------|----------|--------|-------|
| 1 | P0 | ALREADY DONE | "← Change Products" button on PortionConfirmCard (BUG 5 fix) |
| 2 | P0 | VERIFIED | Edit buttons send `{edit_meal: 'meal_name'}` correctly |
| 3 | P1 | ALREADY DONE | CartEditor allows product swapping (BUG 7 fix) |
| 4 | P1 | NEW ✅ | WeeklySummary redesigned to horizontal scrollable calendar |

### Bug Fixes R1 - All 8 Fixed ✅

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
- ✅ All P0 issues resolved

### P1 - High Priority
- ✅ All P1 issues resolved
- Full E2E testing when n8n webhook API is operational

### P2 - Medium Priority
- ✅ CartEditor implemented with product swapping
- "Remove" button in final cart (deferred)

---

## File Structure
```
/app/frontend/src/
├── App.js          # All components (~2700 lines)
└── index.js        # React entry point
```

---

## Testing Status
- **Frontend Build:** ✅ Compiles successfully
- **Round 2 Fixes Verified:** All 4 via code review ✅
- **External API:** n8n webhook returns empty responses (not our bug)
- **Test Reports:** `/app/test_reports/iteration_6.json`

---

## Key Code Locations

| Component | Line Range | Notes |
|-----------|------------|-------|
| CollapsedBadge | ~612-723 | BUG 8 fix - actual product count |
| DistributionSetup | ~727-849 | BUG 1 fix - backend values |
| ProductCardGrid | ~1060-1276 | BUG 2 fix - group by source |
| PortionConfirmCard | ~1278-1513 | BUG 4,5 fix - utilization + change products |
| MealBadge | ~1516-1595 | BUG 3 fix - edit button |
| Consolidation | ~1597-1730 | BUG 3 fix - edit menu |
| WeeklySummary | ~1733-1939 | **ISSUE 4 - Horizontal calendar** |
| CartEditor | ~1941-2052 | BUG 7 fix - overlay with swapping |
| MealPlanningWizard | ~2337+ | productsCatalog state |
