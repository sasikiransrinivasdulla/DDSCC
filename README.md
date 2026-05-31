# DDSCC — Strengthening Your Placement Journey
> **DSA + Development + Skills + Core + Communication (+ Aptitude)**
> *A premium, strictly personal placement accountability system for computer science engineers.*

DDSCC is a **premium placement discipline operating system** designed to build ironclad consistency, focus, and readiness. Based on the philosophy of **"No comparison. No leaderboards. Only self-growth,"** this platform provides computer science graduates and aspiring software engineers a private environment to prepare for placements without the anxiety of public ranking comparisons.

---

## 💎 Product Philosophy

1. **Strictly Personal**: No comparison rings. No public competitive pressure. Your prep progress metrics are kept private and confidential.
2. **Ironclad Discipline**: Compounding streaks are established daily. A decay-protected daily oath keeps you consistent day in, day out.
3. **Pillar Capacities**: Track readiness metrics in real-time across six core dimensions of engineering excellence.

---

## 🔒 First-Time Onboarding & Oath System

When a user logs in for the very first time, instead of directly entering the dashboard, they are guided through a calm, high-end, and deeply personal **Onboarding Oath wizard** (`/onboarding`):

- **Welcome Mindset Seeding**: Establishes the DDSCC self-growth standard and filters out distracting noise.
- **Your Why (Motivation Logs)**: Prompts the user to define their personal anchor (why they are here). This is stored strictly privately as `motivationText` in MongoDB.
- **Target Role Mapping**: Selectable glassmorphic grids detailing engineering paths (Software Engineer, AI Engineer, Agentic AI Engineer, DevOps, etc.) with custom path text fields, mapped as `targetRole` in MongoDB.
- **Commitment Seal**: Enforces a required signature on their personal oath, initializing their custom discipline chamber.
- **Dashboard Personalization**:
  - Main welcome header dynamically renders `"Future [TargetRole] 🚀"` beneath their greeting.
  - Sidebar dynamically renders a premium **"Your Anchor"** box displaying their exact, non-placeholder onboarding motivation quote.

---

## 🌅 Daily Mission & Morning Oath Engine

To prevent mindless tracking or chaotic preparation sessions, DDSCC enforces a **Day-Start Intentions Gate** using a dedicated `/daily-oath` wizard:
- **Intention Interception Middleware**: Authenticated users who attempt to access `/dashboard` are intercepted on mount. If no daily commitment exists in MongoDB for the current calendar date (`YYYY-MM-DD`), they are instantly routed to `/daily-oath`.
- **8-Step Glassmorphic Oath Wizard**:
  1. **Daily Commitment** — The ultimate reminder: *"Today matters. What are you building?"*
  2. **DSA Counts** — Inputs for Easy, Medium, and Hard target volumes, auto-calculating total targets.
  3. **Development Building** — Toggles planning detail fields (Project Name, planned hours slider, GitHub push check, technology learning scopes).
  4. **Dynamic Skills** — Interactive tags lists with `+ Add Skill` enabling registration of frameworks (e.g. Agentic AI, System Design).
  5. **CS Fundamentals** — Subject toggles (OOPS, OS, CN, DBMS, CO, SE) with slide effort percentages (`0% -> 100%`).
  6. **Communication Prep** — Checkboxes for English, Mock interviews, LinkedIn activity, and a confidence level indicator (`1 -> 5`).
  7. **Aptitude Focus** — Specific reasoning/quant topics and planned questions, featuring quick practice external anchors for IndiaBix.
  8. **The Oath Seal** — Emotional commitment checkboxes and signatures physically required to enter their workspace.
- **Dynamic Live Dashboard Rendering**: Once sealed, the dashboard queries Mongoose to render a clean, high-fidelity **"Morning Commitment Summary"** matching their active database inputs.
- **Unique Day Constraints**: Features a composite unique index on `{ userId: 1, dateString: 1 }` preventing accidental duplicate mission creations per day.

---

## 🎨 Premium UI & Readability Refinements

DDSCC operates under a high-contrast, elite digital design system blending custom **matte black backdrops** (`#050505`) with **vibrant emerald styling** (`#10B981`):
- **Contrast Optimization**: Balanced the global muted text variable from `#8A8A8A` to a lighter `#9E9E9E`, optimizing dark-mode contrast ratios and ensuring zero screen fatigue during high-intensity revision sessions.
- **Typography Scale Scale-Up**: Scaled up font-size ratios throughout onboarding questions, hero captions, dashboard stats cards, section labels, action button items, and input textboxes.
- **Confident Layout Proportions**: Enforced comfortable padding and spacing boundaries, offering a highly readable, responsive, and bold academic experience.

---

## 🛠️ The Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) App Router (leveraging Turbopack, edge routing middleware, and dynamic API endpoints).
- **Styling**: Vanilla HSL custom CSS system combined with custom dynamic micro-animations (powered by Framer Motion).
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose connection pooling for high-performance serverless environments.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for frictionless frontend checklist and tracking updates.
- **UI Components**: Radix UI primitives and Lucide icons.

---

## 🔒 Security & Session Architecture

DDSCC employs a premium, security-conscious authentication system:

- **Bcrypt Password Hashing**: Passwords are never stored raw, using standard `bcryptjs` salt cycles on the database layer.
- **Frictionless Auth Rules**: Supports fully minimal usernames and passwords (with zero arbitrary length or complexity restrictions) for rapid onboarding.
- **Persistent HTTP Handshake**: Decrypts and processes secure JWT signatures with a **7-day automatic persistence** window.
- **Edge Route Protection**: Next.js Edge Middleware inspects sessions at the routing layer, avoiding screen flashes and redirecting unauthenticated traffic instantly.

---

## 🧑‍💻 Get Started Locally

1. **Clone the Repository**:
   ```bash
   git clone <repository_url>
   cd DDSCC
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (already configured in production) containing:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Boot Development Chamber**:
   ```bash
   npm run dev
   ```

5. **Build and Lint Check**:
   ```bash
   npm run build
   npm run lint
   ```


---

## 🌙 EOD Reflection & Weighted DDSCC Scoring Engine

DDSCC implements a complete, personal daily accountability workflow:

- **EOD Reflection Wizard (`/daily-review`)**: Intercepts return visits to `/dashboard` in the evening or via active commitment cards, guiding users through an 8-step glassmorphic wizard:
  1. *Mindset Reflection*: "Let's reflect on today. Progress isn't perfection. Honesty matters."
  2. *DSA Actuals*: Inputs actual Easy, Medium, Hard problems completed. Computes completion ratios vs target commitments.
  3. *Development Actuals*: Detailed logs of active coding (Textarea), GitHub commits pushed, technologies explored, and a 1-5 satisfaction index.
  4. *Skills Checklist*: Check off target skills practiced during the day.
  5. *CS Fundamentals Sliders*: Slides actual effort (`0% -> 100%`) against targets.
  6. *Communication actuals*: Proportional score calculations (80% tasks completion, 20% confidence levels 1-5).
  7. *Aptitude actuals*: Questions completed vs planned counts.
  8. *Pride & Learn Seal*: Log pride ratings (1-5) and technical takeaways.
- **Weighted Scoring Engine**: Calculates absolute daily discipline metrics based on fixed ratios:
  - **DSA**: `30%` (prorated by planned vs completed problems)
  - **Development**: `20%` (`(Satisfaction / 5) * 50 + 25 (if pushed) + 25 (if explored)`)
  - **Skills**: `15%` (completed vs planned tags list)
  - **CS Fundamentals**: `15%` (average actual vs planned slider intensities)
  - **Communication**: `10%` (`(completed / planned) * 80 + (confidence / 5) * 20`)
  - **Aptitude**: `10%` (actual vs planned questions)
  - *Bias avoidance*: Any component with 0 target in the morning auto-credits to `100%` of its respective component weight.
- **Discipline Performance Badges**: Displays dynamic indices matching achievement score ratios:
  - `🟢 Beast Mode`: **90 - 100** (*"You're becoming harder to stop."*)
  - `🟢 Strong Day`: **75 - 89** (*"You're becoming harder to stop."*)
  - `🟡 Consistent`: **60 - 74** (*"Consistency compiles progress."*)
  - `🟠 Could Be Better`: **40 - 59** (*"Tomorrow is another chance to show up."*)
  - `🔴 Show Up Tomorrow`: **< 40** (*"Consistency resets. Growth doesn't."*)
- **Streaks & Calendar Synchronization**: Active synchronizer endpoints `/api/sync-streaks` sweep registration dates to yesterday. Any days where users did not commit to an oath are auto-inserted as missed records (`{ isMissed: true, ddsccScore: 0 }`), decaying their streak counter to `0`. Chronological scans trace consecutive days to calculate both active `currentStreak` and historical maximum `longestStreak` counters on MongoDB.
- **Placement Behavioral Analytics & Heatmaps**:
  - *Recharts Cycle Trends*: Plots dynamic AreaCharts of the last 7 preparation days using high-fidelity matte-emerald styling.
  - *90-Day Contribution Heatmap*: A contribution-style consistency grid indicating active day scores using vibrant emerald opacities.
  - *MoM Performance Growth*: Compares the average ddscc score of the current calendar month against the previous month, illustrating active growth gains or decays.
  - *Progressive Category Analytics*: Aggregates lifetime averages across all 6 placement categories, visualizing areas of weakness with color-coded progressive indicator bars.
  - *Data-Driven Behavioral Insights*: Computes automated insights highlighting weekday vs weekend patterns, strongest pillars, and maximum streaks on the fly.
- **Chronological History Logs & Outcomes Viewer**:
  - `/history`: A sleek chronological list of all completed and missed daily logs sorted newest first with performance badge identifiers.
  - `/history/[date]`: Dynamic date-specific detail views breaking down exact morning intentions and evening reflections alongside self-pride ratings.

---

## 📊 Phase 7 — Real Data Audit, Live Analytics & Dashboard Evolution

DDSCC has undergone a **complete, production-grade visual and architectural audit** to eliminate all remaining simulated and placeholder elements, linking every single widget directly to live MongoDB aggregate datasets:

1. **Today's Status Engine**: A premium state evaluator tracking the student's progress for the active calendar date:
   - `🟢 On Track` (Reflection sealed & score computed)
   - `🟡 Mission Created — Reflection Pending` (Commitments made in the morning, night reflection pending)
   - `🔴 No Mission Created` (No commitments made yet today)
2. **Today's Reflection Deadline Countdown**: Renders a premium, real-time ticking clock tracking hours, minutes, and seconds remaining until `11:59:59 PM` local time, prompting consistency compliance. Upon successful EOD submission, it locks into `Reflection Submitted ✅` with the exact sealed time.
3. **Pillar Capacities MongoDB Bindings**: Stripped all simulation panels. Pillar scores (DSA, Dev, Skills, Core, Comm, Aptitude) represent genuine 30-day historical averages computed from real database logs.
4. **Real Chronological Activity Timeline**: Renders a premium, vertical chronological timeline tracking actual database-registered milestones (e.g. `Mission Created`, `EOD Submitted`, etc.) with distinctive color codes.
5. **Contributions Heatmap Matrix Rework**: Fully calendar-integrated contrib blocks. Each cell corresponds to a specific date, mapping to the authentic DDSCC daily score ranges:
   - `0–20%` (Very dark green/black block)
   - `20–40%` (Low green)
   - `40–60%` (Medium green)
   - `60–80%` (Strong green)
   - `80–100%` (Bright emerald block with subtle glow)
   - *Missing day*: Dark cell

---

## 💎 Phase 8 — Visual Spacing Audit, Card Density & Mobile Refinements

DDSCC has underwent a **complete visual sweep and mobile layout audit** to optimize space usage, readability contrast, visual grouping, and interactive behaviors:

1. **Card Density & Padding Audit**:
   - Reduced dashboard metric cards padding from `p-5` to `p-4` and heights from `min-h-[148px]` to `min-h-[112px]`, creating a highly information-dense, compact header section.
   - Brought streak Flame/Award icons, streak numbers, and active/record labels into ultra-cohesive compact visual groups (e.g. `🔥 0 Days` on one line with `Active Streak` underneath).
2. **Dynamic Mission Status Indicator**:
   - Integrated an informational, read-only **Mission Status** badge (`🟢 Completed` | `🟡 In Progress` | `🔴 Not Started`) directly computed dynamically from Mongoose documents without affecting scoring rules.
3. **Intentions Visual Grouping Rework**:
   - Added elegant, color-coded left-accent borders (`border-l-2`) for each daily category (DSA: Blue, Dev: Purple, Skills: Amber, CS Core: Cyan, Comm: Pink, Aptitude: Indigo).
   - Unified margins and padding ratios for a beautiful, instantly scannable card layout.
4. **Consistency Matrix Interactive HUD Tooltips**:
   - Replaced browser-default raw HTML tooltip overlays on the History Consistency Heatmap with a custom **Live HUD overlay indicator**.
   - Hovering or touching heatmap squares renders the precise date and discipline coefficient directly inside a dedicated animated line, creating a premium visual feel.
5. **Mobile Responsiveness Sweep**:
   - Audited the entire grid on small viewports (320px–480px) to prevent clipped text, layout overlays, or side-scroll overflows.

---

## 🧭 Phase 9 — Navigation, Profile & History Explorer

DDSCC has introduced premium profile systems, interactive past daily ledger selectors, perfect vector ring centering, audited top navigation, and comprehensive click-through external footers:

1. **Perfect Centering of Score Rings**:
   - Modified `ProgressCircle` element text ratios, absolute boundaries, and responsive scale sizes dynamically (`size * 0.22` for score, `size * 0.09` for label), achieving perfect visual vertical and horizontal alignment on all browsers and sizes (e.g. 64px, 80px, 120px).
2. **Interactive MongoDB History Explorer (`/profile`)**:
   - Constructed a dual-pane explorer:
     - **Left Scroll Ledger List**: Lists chronological daily reviews with their exact DDSCC score and performance badge. Selecting a date executes a live MongoDB query.
     - **Right Detailed Report Card**: Visualizes comprehensive preparation telemetry for the selected date (DSA solved ratios, Dev satisfaction indices, target skills checked off, CS slide effort intensities, speaking mock tasks, quant questions resolved, pride rating, and takeaway notes).
3. **Comprehensive Profile Statistics Dashboard**:
   - Integrates user registration dates (Join Date) loaded dynamically from database timestamps along with current streaks, lifetime best streaks, and average discipline scores.
4. **Top Navigation Cleanup & Interactive Clickable Avatar**:
   - Refactored top nav by replacing the duplicated "Philosophy" link with a dynamic `/profile` route, styled with border highlights matching active path states.
   - Wrapped the initial initials avatar box (`SS`) inside a fast-loading Link pointing directly to the profile view, accented with premium border glows.
5. **Verified Premium Footers & Team attributions**:
   - Swapped generic placeholders in "Core Guidelines" to point to the live repository onboarding guidelines.
   - Changed default GitHub links to the authentic DDSCC Repository (`https://github.com/sasikiransrinivasdulla/DDSCC`).
   - Integrated click-through URL redirects for Sasi and Roshini in the team attribution string, styled with emerald glow hover accents.

---

## 🔒 Phase 8 — Security, Performance & Production Readiness

DDSCC has undergone an extensive **security hardening, performance optimization, and production-readiness sweep** across all application contexts:

1. **Robust Route Protection & Session Security**:
   - Hardened `middleware.ts` by adding route protection for `/profile` and `/history` routes.
   - Any unauthenticated request attempting to directly hit these sub-routes is immediately routed to the `/auth` signup/login gate.
2. **Defensive Input Validation & Sanitization**:
   - Audited API handlers `/api/daily-oath` and `/api/daily-review` to defensively sanitize client payloads.
   - Enforced sanitization using `Math.max` and clamp boundaries (e.g. `Math.min(100, Math.max(0, effort))`, clamped ratings to `[1, 5]`, and verified positive integer conversions) to protect Mongoose records from corrupt or malicious values.
3. **High-Growth Scalability Optimizations ($O(1)$ Timeline compiler)**:
   - Optimized `/api/analytics` endpoint's backwards loop. As chronological ledger logs grow beyond 100+ or 500+ records, the compiler now exits early as soon as the visual timeline is satisfied (12 action logs limit).
   - This prevents unnecessary memory allocation and CPU cycles, cutting analytics aggregation time from $O(N)$ to $O(1)$ constant time.
4. **Enhanced Accessibility (A11y)**:
   - Polished standard custom button and input component focus borders (`focus:ring-2 focus:ring-primary-accent/60`) to maximize keyboard outline legibility.
5. **Polished Graceful Logout Experience**:
   - Audited and verified `/api/auth/logout` API to securely clear dynamic sessions by forcing HTTP-only cookies to instantly expire (`expires: new Date(0)`).

---

## DDSCC Repository
https://github.com/sasikiransrinivasdulla/DDSCC

## Built By

Sasi:
https://github.com/sasikiransrinivasdulla

Roshini:
https://github.com/roshinichelluri
