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
4. **Onboarding Wizard** → 6-step form (name, age, measurements, goals, activity, preferences)
5. **Results** → Show calculated macros
6. **Meal Planning Wizard (V3 State Engine)** → Backend-driven UI through single endpoint:
   - `supplement_ask` → **NEW V3** - Ask about protein supplements first
   - `budget_setup` → Distribution selection (shows protein deduction math)
   - `source_select` → Choose protein sources (max 3) with carried portions info
   - `cut_select` → Cut preference selection (skipped for eggs)
   - `product_select` → **GROUPED BY SOURCE** - Select products with "Pick 1" per category
   - `portion_confirm` → Confirm portions + **utilization options** for leftover packs
   - `meal_confirmed` → Meal locked badge with **Edit button** + running cost
   - `consolidation` → **NEW V3** - Summary of all meals with Edit menu + cost summary
   - `weekly_summary` → **OVERHAULED** - 7-day plan (accordion) + Shopping Cart (tabs) with Edit
   - `delivery_frequency` → **NEW V3** - How often user wants deliveries
   - `delivery_select` → Time slot selection
   - `order_confirmed` → Final confirmation screen
7. **Final Cart** → Weekly supply summary with Licious links

## V3 Structured JSON Payloads
All frontend sends structured JSON payloads:
- Supplement: `{"supplement_grams": 25}`
- Distribution: `{"distribution": "Equal"}`
- Sources: `{"sources": ["eggs", "chicken"]}`
- Cut: `{"cut": "Boneless"}`
- Products: `{"products": ["Chicken Breast Boneless 450g", "Farm Eggs 6 pack"]}`
- Utilization: `{"utilization": {"Eggs Pack of 6": "same_meal_multi_day"}}`
- Consolidation: `{"confirm": true}` or `{"edit_meal": "breakfast"}`
- Weekly Summary: `{"confirm": true}` or `{"edit_meal": "lunch"}`
- Frequency: `{"frequency": "every_2_days"}`
- Time slot: `{"time_slot": "morning"}`

## V3 Key UX Features
1. **Running Cost Banner** - Persistent display of daily + weekly cost estimates
2. **Edit Functionality** - Available at meal_confirmed, consolidation, weekly_summary stages
3. **Product Grouping** - Products grouped by source category with "Pick 1" label
4. **Utilization Options** - For leftover pack portions: same_meal_multi_day, other_meal, smaller_pack
5. **CTA Buttons** - No text input required; all confirmations via button clicks

## Key Business Rules
- Single `session_id` persists across all API calls
- Max 1 product per source category (swap logic)
- Supplement protein is deducted before distribution
- UI components collapse into summary badges after use
- No demo/fallback modes - show error on API failure

---

## What's Been Implemented (Dec 2025)

### State Engine V3 Implementation ✅ (Latest Update)
Complete frontend overhaul to support V3 backend state engine:

**New V3 Components:**
1. `SupplementAsk` - First screen asking about protein supplements with predefined options + custom input
2. `DeliveryFrequency` - Select delivery frequency (daily, every_2_days, every_3_days, weekly)
3. `Consolidation` - Summary of all meals with Edit menu and cost summary
4. `RunningCostBanner` - Persistent daily/weekly cost display

**Overhauled Components:**
1. `DistributionSetup` - Shows protein deduction math (original - supplements = food target)
2. `SourceChips` - Multi-select with carried portions info from leftover packs
3. `CutChips` - Single-select, skipped for eggs, shows category icon
4. `ProductCardGrid` - **GROUP BY SOURCE** with "Pick 1" per category, shows protein_per_pack
5. `PortionConfirmCard` - Two sections: portions summary + utilization options per product
6. `MealBadge` - Shows locked meal + running cost banner + **Edit button**
7. `WeeklySummary` - **Two tabs**: 7-Day Plan (accordion) + Shopping Cart with Change/Edit buttons
8. `TimeSlotSelect` - Updated styling
9. `OrderConfirmed` - Shows frequency + slot + detailed cart

**CollapsedBadge V3 Updates:**
- Handles all 12 V3 ui_types with appropriate summary text

**Edit Functionality:**
- `MealBadge`: `{"edit_meal": "breakfast"}`
- `Consolidation`: Edit dropdown + "Build My Weekly Plan" CTA
- `WeeklySummary`: Edit dropdown + "Confirm & Choose Delivery" CTA

### Core Features ✅
- Homepage with branding and CTA
- Macro Fork screen (know macros vs calculate)
- Calculator disclaimer screen
- 6-step onboarding wizard with form validation
- Results screen showing calculated macros
- Dynamic meal planning UI driven by `ui_type` from API
- CollapsedBadge for completed steps
- Final cart summary screen
- Journey tracker (progress indicator)

### Defensive Programming ✅
- **51 Array.isArray() guards** for all .map() calls
- Type checking before .trim() and .length calls
- Safe property access with optional chaining

---

## Prioritized Backlog

### P0 - Critical
- ✅ State Engine V3 implementation complete

### P1 - High Priority
- Full E2E testing when n8n webhook API is operational
- "Remove" button functionality in final cart (deferred per spec)

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
├── App.js          # All components, state, API calls, styles (~2100 lines)
└── index.js        # React entry point
```

**Note:** Do NOT refactor App.js into multiple files per user requirement.

---

## Testing Status
- **Frontend Build:** ✅ Compiles successfully
- **Code Review:** All V3 components verified ✅
- **Defensive Guards:** 51 Array.isArray() guards verified ✅
- **Frontend Success Rate:** 100% - All screens load correctly, no crashes
- **External API:** n8n webhook returns empty responses (not under our control)
- **Test Reports:** `/app/test_reports/iteration_1.json`, `/app/test_reports/iteration_4.json`

---

## V3 Component Line References
| Component | Line | Description |
|-----------|------|-------------|
| RunningCostBanner | ~123 | Sticky banner for daily/weekly costs |
| SupplementAsk | ~152 | NEW - First screen asking about supplements |
| DistributionSetup | ~705 | Budget setup with distribution patterns |
| SourceChips | ~826 | Multi-select with carried portions |
| CutChips | ~944 | Cut type selection |
| ProductCardGrid | ~1032 | GROUP BY SOURCE with "Pick 1" |
| PortionConfirmCard | ~1223 | Portions + utilization options |
| MealBadge | ~1435 | Meal locked with Edit button |
| Consolidation | ~1517 | NEW - Summary with Edit menu |
| WeeklySummary | ~1652 | 7-day plan tabs + edit |
| DeliveryFrequency | ~1824 | NEW - Frequency selection |
| TimeSlotSelect | ~1898 | Time slot selection |
| OrderConfirmed | ~1960 | Final confirmation |
| CollapsedBadge | ~612 | V3 summary badges |
| knownUiTypes | ~2180 | All 12 V3 ui_types |
