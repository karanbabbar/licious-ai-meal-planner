# Licious AI Protein Meal Planner

An AI-powered full-stack meal planning app built for [Licious](https://www.licious.in/) — India's leading meat and seafood brand. The app personalises weekly protein intake based on the user's health goals and generates an optimised grocery list — built for zero wastage, cost efficiency, and minimal variety complexity.

**Live App:** [meal-prep-guide-3.preview.emergentagent.com](https://meal-prep-guide-3.preview.emergentagent.com)

**Build story & n8n workflows:** [ai-automation-portfolio](https://github.com/karanbabbar/ai-automation-portfolio)

---

## Full Stack Architecture

```
User (Web App)
     │
     ▼
Frontend — React + Tailwind CSS
     │  Structured multi-step form
     │  Calls n8n webhook at each stage
     ▼
n8n Workflow — Meal Planner State Engine (backend)
     │
     ├── Stage 1: Calorie & macro calculator
     ├── Stage 2: Meal distribution engine
     ├── Stage 3: Portion optimisation algorithm
     ├── Stage 4: Pack selection & grocery list builder
     └── Claude API — edge case handling
          │
          ▼
     Supabase (PostgreSQL)
     └── Licious product catalogue (scraped via Apify)
          │
          ▼
     Weekly plan + grocery list → back to Frontend
```

---

## Tech Stack

| Layer | Tool | Purpose |
|---|---|---|
| Frontend | React + Tailwind CSS | Multi-step onboarding UI, weekly plan display |
| Backend | n8n workflow | All business logic, algorithm execution, AI calls |
| API Server | Python (FastAPI) | Middleware between frontend and n8n |
| Database | Supabase (PostgreSQL) | Licious product catalogue + user data |
| AI | Claude API (Anthropic) | Edge case handling, ambiguous input resolution |
| Data scraping | Apify | Licious product data collection |
| Hosting | Emergent | Frontend deployment |

---

## How the Frontend Works

The frontend is a structured multi-step app — not a chatbot. Each step collects specific user inputs through form controls (dropdowns, sliders, radio buttons) rather than freeform text. This was a deliberate design decision to ensure clean, structured data flows into the backend.

**Onboarding steps:**
1. Age, gender, height, weight
2. Goal — weight loss, weight gain, or muscle gain
3. Meals per day preference — 3 or 4
4. Protein preferences — meat, chicken, eggs (multi-select)
5. Cut preferences per protein source

At each step completion, the frontend calls the n8n webhook with the collected data. The workflow processes it and returns the next stage's output back to the frontend for display.

**Output screens:**
- Daily calorie and macro targets
- Weekly meal plan with protein distribution per meal
- Grocery list with product name, cut, pack size, quantity, and estimated cost

---

## How the n8n Workflow Works (the Backend)

The n8n workflow is the entire backend. It handles all computation, algorithm execution, database queries, and AI calls. The frontend never talks directly to Supabase — everything goes through n8n.

### Stage 1: Calorie & Macro Calculation
Using the user's age, gender, height, weight, and goal — the workflow calculates:
- Total Daily Energy Expenditure (TDEE)
- Daily calorie target (deficit or surplus based on goal)
- Daily protein target in grams
- Carb and fat targets

This is fully deterministic — no AI involved.

### Stage 2: Meal Distribution
Protein is not split equally across meals. The workflow weights meals from heaviest to lightest based on the user's meal frequency preference (3 or 4 meals). Each meal slot gets a protein allocation in grams.

### Stage 3: Portion Optimisation Algorithm
This is the core of the planner. The algorithm solves the real meal planning problem: given a weekly protein target, a set of cuts, and fixed Licious pack sizes — how do you buy and distribute protein with zero wastage and minimum cost?

**Rules the algorithm follows:**

**Protein source and cut assignment**
- User selects which protein source goes in which meal slot
- Maximum 4 SKU options shown per cut per protein source — keeps choices manageable

**Same-day distribution**
- If the same protein source appears in 2+ meals in a day (e.g. eggs at breakfast and lunch), the user is prompted to select a cut for each slot

**Cross-meal cut nudging**
- If a user selects different cuts of the same protein for the same day (e.g. chicken breast at lunch, chicken keema at dinner), the algorithm nudges leftover portions to be utilised the next day rather than buying two smaller packs

**Bulk-first pack selection**
- Weekly volume required for each protein source is calculated first
- The largest available pack size that covers the requirement is selected
- Smaller packs are only used to top up the remainder

**Shortage handling**
- If a shortage of 50g or more exists after pack selection, the algorithm automatically increases the preferred protein source to cover the gap

**Surplus handling**
- If a surplus of 50g or more exists, the algorithm increases that meal's portion slightly and reduces other sources proportionally — keeping daily and weekly macros on target

### Stage 4: Grocery List Generation
Since Licious has not published a public cart API, the workflow generates a structured grocery list:
- Protein source
- Cut type
- Pack size
- Quantity to order
- Estimated cost

The list is optimised by the same rules: large portions first, limited cut variety, macros accurate.

### Claude API — Edge Case Handling
Claude is only invoked when user input is genuinely ambiguous — for example, unusual dietary combinations, conflicting preferences, or inputs that fall outside the algorithm's expected ranges. For all standard inputs, the workflow runs entirely without AI.

---

## Supabase Database

### Tables

**`licious_products`** — scraped Licious catalogue
- Product name, cut type, protein source category
- Pack sizes available (200g, 500g, 1kg etc.)
- Price per pack
- Protein content per 100g

**`users`** — onboarding data
- Age, gender, height, weight, goal
- Meal frequency preference
- Protein and cut preferences

### Data Collection
Product data was scraped from the Licious website using **Apify** and loaded into Supabase. The scraper captured product names, categories, pack sizes, and prices. This catalogue is what the algorithm queries when selecting SKUs and pack sizes for the grocery list.

---

## How Frontend and Backend Connect

The frontend calls the n8n webhook URL at specific points in the user journey:

| Trigger | Data sent | Data returned |
|---|---|---|
| Onboarding complete | Age, weight, height, gender, goal | Calorie + macro targets |
| Meal preferences set | Meal frequency, protein preferences | Protein distribution per meal |
| Cut selection complete | Cut choices per meal slot | Weekly meal plan |
| Plan confirmed | Full plan data | Optimised grocery list |

Each webhook call is a POST request with JSON. The n8n workflow processes the data, queries Supabase where needed, runs the algorithm, and returns the result as JSON to the frontend.

---

## Why n8n as the Backend

Most apps use a traditional API server as the backend. This app uses n8n — a workflow automation tool — as the primary backend engine. This was a deliberate architectural choice:

- **Visual logic** — the entire business logic is visible and editable as a workflow diagram
- **Built-in integrations** — Supabase, Claude API, and HTTP endpoints are native n8n nodes
- **Fast iteration** — changing algorithm rules or adding new steps takes minutes, not hours
- **No infrastructure** — no server to manage, deploy, or scale

The Python FastAPI server acts as a lightweight middleware layer — it receives requests from the frontend, forwards them to n8n, and returns the response.

---

## Repository Structure

```
frontend/          React + Tailwind frontend
backend/           Python FastAPI middleware server
  └── server.py    Main server file
  └── requirements.txt
.emergent/         Emergent platform config
  └── emergent.yml
  └── summary.txt
```

---

## Build Journey

This app went through two major architectural iterations. The first version used a multi-agent chatbot approach which failed due to unstructured inputs, broken handoffs, and an agent that couldn't reliably solve the portion optimisation problem.

The current version replaced the chatbot with a structured form UI and replaced the agents with a deterministic algorithm — using Claude only for genuine edge cases.

Full build story: [ai-automation-portfolio/n8n-workflows/Licious - Pre-order Planner](https://github.com/karanbabbar/ai-automation-portfolio/tree/main/n8n-workflows/Licious%20-%20Pre-order%20Planner)

---

*Built by [Karan Babbar](https://github.com/karanbabbar)*
