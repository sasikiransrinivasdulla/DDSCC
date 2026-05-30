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

## 🤝 Connect with the Developer

Built with focus and dedication by **Sasi Kiran Srinivas**. Let's connect and build the next frontier of high-performance SaaS environments together!

🔗 **GitHub Connect**: [sasikiransrinivasdulla](https://github.com/sasikiransrinivasdulla)
