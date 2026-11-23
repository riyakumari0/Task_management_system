# AstroTask: App Guide

What the app does, who can do what, and where the code lives. To install and run it, see [README.md](README.md).

AstroTask manages teams that do LLM training and evaluation work. Lead Evaluators create projects and tasks. LLM Trainees complete them and earn XP.

## Roles

| Action | Lead Evaluator (`ADMIN`) | LLM Trainee (`MEMBER`) |
|---|---|---|
| See projects and tasks | All | Only projects they belong to |
| Create projects and tasks | Yes | No |
| Change a task's status | Any task | Only tasks assigned to them |
| Delete a task (API only) | Yes | No |
| Add, approve or remove members | Yes | No |
| See trainees' emails and the leaderboard | Yes | No |
| Support chat | Monitors all chats, marks issues | Their own chat only |

## Accounts

1. A person signs up and picks a role. Passwords need at least 8 characters.
2. The account waits for approval, whichever role was picked.
3. An admin approves it under **Team Management**, and the person can log in.

Admins can also add accounts directly. These are approved at once.

The first admin is made from the terminal, after signing up:

```bash
npm run make-admin -- you@example.com
```

## Features

### Projects and task board
- Each project has a board with four columns: To do, In progress, Review and Done.
- Tasks can be added one at a time, or pasted in bulk as plain text (one task per line) or a JSON array.
- Progress is the share of a project's tasks that are Done.

### XP and levels
- A trainee earns **50 XP** for moving a task assigned to them to Done.
- XP is given **once per task**. Moving it back and finishing it again earns nothing.
- Level = XP ÷ 100, rounded down, plus 1.
- Admins see the five trainees with the most XP.

### Focus mode
A 25-minute timer, available on a trainee's own tasks that are In progress.

### Support chat
- The bot uses simple rules, not an AI model. It asks for details when a message is short and general, and otherwise escalates it to admins.
- Admins mark an escalated issue as Processing or Solved, and the trainee gets a notification.
- Messages can be up to 2,000 characters.

## Security

- Passwords are stored as bcrypt hashes, and no API returns them.
- Logins use a signed, HTTP-only cookie that lasts 24 hours.
- Every protected request checks the user in the database, so removing someone ends their access at once.
- `JWT_SECRET` (at least 32 characters) is required. There is no default.
- Roles are checked on the server, not just hidden on screen.
- Database files and `.env` are kept out of Git.

## API

| Route | Method | Who | Purpose |
|---|---|---|---|
| `/api/auth/register` | POST | Anyone | Request an account |
| `/api/auth/login`, `/api/auth/logout` | POST | Anyone | Log in or out |
| `/api/auth/me` | GET | Logged in | Current user |
| `/api/projects` | GET | Logged in | Projects the user can see |
| `/api/projects` | POST | Admin | Create a project |
| `/api/tasks` | GET | Logged in | Tasks the user can see |
| `/api/tasks` | POST | Admin | Create one task or many |
| `/api/tasks/[id]` | PATCH | Admin or assignee | Change status |
| `/api/tasks/[id]` | DELETE | Admin | Delete a task |
| `/api/users` | GET | Logged in | Trainees (emails for admins only) |
| `/api/users/add` | POST | Admin | Add members |
| `/api/users/pending` | GET | Admin | Accounts waiting for approval |
| `/api/users/leaderboard` | GET | Admin | Top five trainees by XP |
| `/api/users/[id]/approve` | PATCH | Admin | Approve an account |
| `/api/users/[id]` | DELETE | Admin | Remove a member |
| `/api/support` | GET, POST | Logged in | Read or send support messages |
| `/api/support/action` | POST | Admin | Mark an issue Processing or Solved |
| `/api/notifications` | GET | Logged in | Latest 20 notifications |
| `/api/notifications/read` | PATCH | Logged in | Mark all as read |

## Data

Defined in [prisma/schema.prisma](prisma/schema.prisma): `User`, `Project`, `ProjectMember`, `Task`, `SupportMessage` and `Notification`.

Removing a user deletes their memberships, messages and notifications. Their tasks stay and become unassigned.

## Where the code lives

| Part | Location |
|---|---|
| Login and sign-up screen | `src/app/page.tsx` |
| Dashboard screens | `src/app/dashboard/` |
| API routes | `src/app/api/` |
| Sessions and login checks | `src/lib/auth.ts` |
| Database client | `src/lib/prisma.ts` |
| First-admin script | `scripts/make-admin.mjs` |

## Current limits

- Some screens show sample data: the trainee dashboard's progress chart and evaluation batches, the calendar panel, and the Reports numbers. The report download buttons aren't connected yet.
- The Google, X and Facebook icons and "Forgot password?" aren't connected yet.
- The Track page doesn't list trainees for admins yet, and project cards show 0 tasks.
- SQLite needs permanent storage when hosted, or data can be lost on each deploy.
- There are no automated tests yet.
