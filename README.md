# AstroTask: Gamified LLM Trainee Portal

A modern, role-based web application built to manage large-scale LLM training, data labeling, and AI evaluation teams. 

With a premium "Botanical Green" aesthetic, AstroTask provides a dual-role environment where **Lead Evaluators (Admins)** can seamlessly deploy bulk tasks, and **LLM Trainees (Members)** can complete assignments to earn XP, level up, and climb the leaderboard.

🌍 **Live Demo:** [https://taskmanagementsystem-production-23ea.up.railway.app](https://taskmanagementsystem-production-23ea.up.railway.app)

![AstroTask Dashboard Overview](/dashboard_banner_green.png)

## 🚀 Key Features

### 👑 Lead Evaluator (Admin) Features
* **Dual-Role Dashboard:** Admins receive a high-level birds-eye view of all Active Deployments, project progress percentages, and top performing Trainees.
* **Bulk Task Upload:** Need to import 500 prompts for RLHF? Instantly paste plain text lists or JSON arrays directly into the Kanban board to automatically generate massive task batches.
* **Mass Assignment:** Assign hundreds of tasks to specific Trainees in a single click.
* **Team Management:** Add Trainees manually, securely approve pending registrations, and remove inactive members (tasks are safely preserved and unassigned).
* **Support Ticketing System:** Monitor trainee chats with the AI support bot, intervene when escalations occur, and automatically notify trainees when their tickets are "Processing" or "Solved".

### 👨‍💻 LLM Trainee (Member) Features
* **Personalized Workspace:** Trainees get a dedicated view showing only the projects and tasks assigned to them.
* **Gamification & Leaderboard:** Completing tasks awards XP. Earn enough XP to Level Up! Trainees can track their standing on the global Top Performers Leaderboard.
* **Real-time Notifications:** Receive instant alerts via the navigation bell when Admins approve work or resolve support tickets.
* **Focus Mode:** A distraction-free timer built straight into the Kanban board to help Trainees power through deep-work evaluation batches.

## 🛠 Tech Stack

* **Framework:** [Next.js 16.2.6 (App Router)](https://nextjs.org/)
* **Database:** [Prisma ORM](https://www.prisma.io/) + SQLite
* **Styling:** Custom CSS Modules (Premium Botanical Green Theme)
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

3. **Initialize the Database**
   ```bash
   npx prisma db push
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **Access the App**
   Open `http://localhost:3000` in your browser. 
   
   *Tip: You can use the built-in Admin account (`admin3@astrotask.com` / `password`) to access the Lead Evaluator dashboard and start managing your team!*
