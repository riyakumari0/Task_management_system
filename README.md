# AstroTask: Gamified LLM Trainee Portal

A modern, role-based web application built to manage large-scale LLM training, data labeling, and AI evaluation teams. 

With a premium "Botanical Green" aesthetic, AstroTask provides a dual-role environment where **Lead Evaluators (Admins)** can seamlessly deploy bulk tasks, and **LLM Trainees (Members)** can complete assignments to earn XP, level up, and climb the leaderboard.

🌍 **Live Demo:** [https://taskmanagementsystem-production-23ea.up.railway.app](https://taskmanagementsystem-production-23ea.up.railway.app)

![AstroTask Dashboard Overview](public/dashboard_banner_green.png)

📖 **Full app guide (roles, features, API, security):** [FEATURES.md](FEATURES.md)

## 🚀 Key Features

### 👑 Lead Evaluator (Admin) Features
* **Dual-Role Dashboard:** Admins receive a high-level birds-eye view of all Active Deployments, project progress percentages, and top performing Trainees.
* **Bulk Task Upload:** Need to import 500 prompts for RLHF? Instantly paste plain text lists or JSON arrays directly into the Kanban board to automatically generate massive task batches.
* **Mass Assignment:** Assign hundreds of tasks to specific Trainees in a single click.
* **Team Management:** Add Trainees manually, securely approve pending registrations, and remove inactive members (tasks are safely preserved and unassigned).
* **Support Ticketing System:** Monitor trainee support chats, see escalated issues, and notify trainees when their tickets are "Processing" or "Solved".
* **Progress Tracker:** See every trainee's level and XP in one table.

### 👨‍💻 LLM Trainee (Member) Features
* **Personalized Workspace:** Trainees get a dedicated view showing only the projects and tasks assigned to them.
* **Gamification:** Completing a task awards 50 XP (once per task). Every 100 XP is a new level, shown on the Track page. Admins see the Top Performers leaderboard.
* **Notifications:** The navigation bell shows updates when an Admin starts on or resolves a support ticket.
* **Focus Mode:** A distraction-free timer built straight into the Kanban board to help Trainees power through deep-work evaluation batches.

## 🛠 Tech Stack

* **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + React 19 + TypeScript
* **Database:** [Prisma ORM](https://www.prisma.io/) + SQLite
* **Auth:** JWT in HTTP-only cookies (jose) + bcrypt password hashing, plus optional Google / X / Facebook login (OAuth 2.0 with PKCE)
* **Styling:** Custom CSS (Botanical Green Theme)
* **Icons:** [Lucide React](https://lucide.dev/)

## ⚙️ Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/riyakumari0/Task_management_system.git
   cd Task_management_system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set the login secret** (required, at least 32 characters)
   ```bash
   echo "JWT_SECRET=$(openssl rand -hex 32)" > .env
   ```

4. **Initialize the Database**
   ```bash
   npx prisma db push
   ```

5. **Start the Development Server**
   ```bash
   npm run dev
   ```

6. **Access the App**
   Open `http://localhost:3000` in your browser and sign up.

7. **Create the first Admin**
   New accounts wait for approval. Make your own account the first admin:
   ```bash
   npm run make-admin -- you@example.com
   ```
   After that, approve everyone else from the Team Management page.
