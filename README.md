# Content Approval Hub

A clickable prototype of a shared content calendar for an agency's social media team and
their clients. The social team builds and schedules content in one place; the moment a
post is marked **In Review**, it shows up on the client's own portal in real time, where
the client can comment, approve, or request changes — no more email attachments or
scattered Slack threads.

This is a **front-end prototype**: there's no backend or login yet. Data is seeded with
sample clients/posts and persisted to your browser's `localStorage`, so it survives page
reloads and — because of how `localStorage` events work — syncs live across browser tabs
on the same machine. It's meant for validating the workflow and UX with stakeholders
before investing in a full build (real auth, a database, file storage, notifications).

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL (e.g. `http://localhost:5173`).

## Try the live-sync demo

1. Open the app and click **Open agency dashboard**.
2. In a second browser tab, open the same URL and click into a **client's** view from
   the landing page (or click "Preview as \<Client\>" from inside the agency dashboard).
3. In the agency tab, create a new post and set its status to **In Review**.
4. Watch it appear instantly in the client tab — no refresh needed.
5. In the client tab, leave a comment or click **Approve** / **Request changes** — flip
   back to the agency tab and open that post to see the feedback land in real time.

## How it's organized

- **Agency dashboard** (`/agency/:clientId`) — switch between client workspaces, see the
  full content calendar (including drafts), create/edit posts with an image upload,
  caption, platform, and scheduled date, and read client feedback inline while editing.
- **Client portal** (`/client/:clientId`) — a clean, read-first view scoped to one
  client, showing only posts that are `In Review` or further along, with a feedback
  thread and Approve / Request changes actions per post.
- **Post statuses**: `Draft → In Review → Approved`, with `Changes Requested` as a
  client-triggered detour back to the team. Only `Draft` is hidden from the client.

## What a real build would add

- Accounts and role-based auth (agency staff vs. named client users) instead of the
  role-switcher landing page.
- A real database and file storage in place of `localStorage`, so data is shared across
  devices and people, not just browser tabs.
- Notifications (email/Slack) when a client comments or a post's status changes.
- A true calendar/scheduling view, approval history, and export to the actual
  publishing tools your team uses.

## Tech stack

React + TypeScript + Vite + Tailwind CSS + React Router. No backend dependency, so it
runs anywhere `npm` does.
