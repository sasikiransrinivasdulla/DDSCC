# DDSCC — Strengthening Your Placement Journey
> **DSA • Development • Technical Skills • Computer Science Core • Speaking & Verbal • Quantitative Aptitude**
> *A premium, strictly personal placement accountability and consistency engine for computer science graduates.*

---

## 💎 Project Vision & Product Philosophy

DDSCC is a **high-end placement discipline operating system** designed to build ironclad consistency, focus, and readiness. Inspired by modern productivity suites, it rejects competitive stress and toxic benchmarking in favor of pure, private self-improvement.

1. **Strictly Personal**: No public comparison rings, no anxiety-inducing leaderboards. Your data belongs entirely to you.
2. **Compounding Consistency**: Harnesses the power of daily habits, tracking consecutive placement-readiness streaks and penalizing decay honestly.
3. **Pillar Capacities**: Automatically computes a moving 30-day index of your preparation mastery across six core dimensions of engineering excellence.
4. **Behavioral Gatekeeping**: Employs morning commitment requirements and evening self-reflections to enforce absolute honesty with your progress.

---

## 🏗️ Folder Architecture & Directory Structure

DDSCC is built on a clean, scalable **Next.js 15 App Router** architecture integrated with a robust serverless MongoDB tier:

```text
├── app/
│   ├── api/
│   │   ├── analytics/       # Live O(1) aggregates, achievements, and slogans
│   │   ├── auth/            # JWT authentication, session registration & logout
│   │   ├── daily-oath/      # Morning targets and commitment schema bindings
│   │   ├── daily-review/    # Evening actuals, reflection note, and scoring
│   │   └── sync-streaks/    # Cron-ready streak integrity sweeps
│   ├── auth/                # Glassmorphic Login/Register gate
│   ├── dashboard/           # Master Control Panel (Heatmap HUD, timeline logs, trends)
│   ├── history/             # Chronological logs explorer and date-specific audits
│   ├── onboarding/          # Personal Why anchor mapping and Target Role wizard
│   ├── profile/             # Dynamic achievements gallery, records & timeline
│   ├── favicon.ico
│   ├── globals.css          # Core dark/matte HSL variables & typography overrides
│   ├── layout.tsx           # Global provider wraps and frame bounds
│   └── page.tsx             # Landing hero and onboarding redirection gate
├── components/
│   ├── layout/
│   │   ├── footer.tsx       # Safe links team attribution footer
│   │   └── navbar.tsx       # Active-path highlighted headers
│   └── ui/
│       ├── button.tsx       # Reusable responsive actions
│       ├── card.tsx         # Unified glassmorphic containers
│       └── progress.tsx     # Perfect-centered custom SVGs
├── lib/
│   ├── db.ts                # Mongoose connection pooling
│   └── models/
│       ├── DailyMission.ts  # Unique-index composite daily schema
│       └── User.ts          # Encrypted credentials & streak trackers
├── middleware.ts            # Edge unauthenticated redirection middleware
├── package.json
└── README.md
```

---

## 🎯 Core Features & Live Dashboards

### 🌅 1. Morning Mission Oath Interception Gate
*   **Intent Middleware**: Authenticated users seeking `/dashboard` are dynamically intercepted. If no daily commitments are logged for the current calendar date (`YYYY-MM-DD` in IST), they are instantly routed to the `/daily-oath` wizard.
*   **Intention Oath**: A beautiful, 8-step glassmorphic wizard requesting targeted DSA counts, development project goals, planned hours, CS core subjects, verbal communication milestones, and quantitative aptitude topics.

### 🌙 2. Evening Reflection & Scoring Engine
*   **Reflection Seal**: At evening, students seal their daily ledger, recording actual problems solved, GitHub commits pushed, and speaking tasks accomplished.
*   **Dynamic Scoring Math**: The DDSCC scoring engine evaluates preparation quality through a strictly weighted, bias-proof algorithm:
    $$\text{DDSCC Score} = (0.30 \times \text{DSA}) + (0.20 \times \text{Development}) + (0.15 \times \text{Skills}) + (0.15 \times \text{CS Core}) + (0.10 \times \text{Comm}) + (0.10 \times \text{Aptitude})$$
    *   *Anti-Bias Feature*: Any category with `0` target in the morning is automatically weighted as `100%` completed, preventing customization penalties.

### 📊 3. High-Fidelity Dashboard Restructure & Live Analytics
*   **Primary 90-Day Interactive Consistency Matrix**: Merges all heatmaps into a single, definitive 90-day contribution grid directly in the left column. Features a custom **Live HUD overlay** which displays the hovered cell's date and prep score instantly.
*   **Placement Readiness Cycle Trends**: Matte-emerald Recharts Area Charts showing your weekly prep averages.
*   **Spacious Activity Timeline**: A horizontal-padded, vertically-tracked milestone log. Each log item receives unique color highlights, status node glows, and clear time indicators.
*   **Monthly Index MoM Growth**: Compares current average score with previous month averages alongside a dynamic positive/negative growth badge.
*   **Personal Growth Insights**: Computes weekday vs weekend productivity biases, warning warnings or consistency boosts on the fly.

### 🏆 4. Delight and Engagement Engine (`/profile`)
*   **Achievements Gallery**: Beautiful emerald badges for milestones (e.g. `First Step`, `Consistency Starter`, `Discipline Builder`, `Momentum Engine`, `Relentless`, and `Unstoppable`) with locked states in subtle translucent dark tones.
*   **Personal Bests Grid**: Cards recording maximum DSA solved in one day, highest DDSCC score, and maximum skills completed.
*   **Journey Progression Timeline**: Chronological records of join dates, milestones unlocked, and peaks.

---

## 🔒 Session Security & Scalability Optimizations

*   **HTTP-Only Secure Cookies**: Sessions are encrypted in JSON Web Tokens (JWT) with automatic persistence.
*   **Edge Routing Middleware**: Fully guards `/profile`, `/history`, and `/dashboard` against unauthorized access.
*   **Sanitization Safeguards**: Payload limits clamped via `Math.min` and defensive sanitization logic.
*   **Constant-Time Timeline Compiler ($O(1)$)**: The chronological activity scanner exits early as soon as the display limit (12 events) is satisfied, reducing computational cost in serverless deployments.

---

## 🛠️ The Technology Stack

*   **Core**: Next.js App Router, React, and Node.js
*   **Styling**: Vanilla HSL CSS variables, custom emerald glows, and Framer Motion micro-animations
*   **Database**: MongoDB via Mongoose connection pooling
*   **State Management**: Zustand
*   **Icons & Assets**: Lucide Icons

---

## 🧑‍💻 Setup & Local Development

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sasikiransrinivasdulla/DDSCC.git
    cd DDSCC
    ```

2.  **Configure Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_secure_jwt_secret_phrase
    ```

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Launch Local Server**:
    ```bash
    npm run dev
    ```

5.  **Compile & Audit Production Bundle**:
    ```bash
    npm run build
    npm run lint
    ```

---

## 👥 Built by the Team

*   **Sasi**
    [GitHub Profile](https://github.com/sasikiransrinivasdulla)
*   **Roshini**
    [GitHub Profile](https://github.com/roshinichelluri)

---

## 🧭 Live Repository
https://github.com/sasikiransrinivasdulla/DDSCC
