# DigitX Content

A clickable prototype of a shared content calendar for an agency's social media team and
their clients. The creative team builds and schedules content in one place; the moment a
post is marked **In Review**, it shows up on the client's own portal in real time, where
the client can comment, approve, or request changes — no more email attachments or
scattered Slack threads.

This is a **front-end prototype**: there's no real backend or accounts yet. Instead,
entry is a lightweight "log in with your brand name" screen — pick **Agency creative** or
**Client**, type (or pick) the brand, and you land straight in that brand's workspace in
the right mode. Data is seeded with sample Nigerian brands/posts and persisted to your
browser's `localStorage`, so it survives page reloads and — because of how `localStorage`
events work — syncs live across browser tabs on the same machine. It's meant for
validating the workflow and UX with stakeholders before investing in a full build (real
auth, a database, file storage, notifications).

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL (e.g. `http://localhost:5173`).

## Sample brands

The prototype ships with four seeded workspaces: **Firstbank**, **Kivo**, **Ariston**,
and **Crown Premium Pasta**, each with Nigerian-flavored sample content and creative
mock-ups.

## Try the live-sync demo

1. Open the app, choose **Agency creative**, type a brand name (e.g. `Firstbank`), and
   press Enter.
2. In a second browser tab, open the same URL, choose **Client**, and enter the same
   brand name (or click "Preview as \<Client\>" from inside the agency dashboard).
3. In the agency tab, create a new post and set its status to **In Review**.
4. Watch it appear instantly in the client tab — no refresh needed.
5. In the client tab, leave a comment or click **Approve** / **Request changes** — flip
   back to the agency tab and open that post to see the feedback land in real time.

## How it's organized

- **Login** (`/`) — role toggle (Agency creative / Client) plus a brand-name field with
  suggestions; submitting routes straight into that brand's workspace.
- **Agency dashboard** (`/agency/:clientId`) — switch between client workspaces, see the
  full content calendar (including drafts), create/edit posts with an image upload,
  caption, platform, and scheduled date, and read client feedback inline while editing.
- **Client portal** (`/client/:clientId`) — a clean, read-first view scoped to one
  client, showing only posts that are `In Review` or further along, with a feedback
  thread and Approve / Request changes actions per post.
- **Post statuses**: `Draft → In Review → Approved`, with `Changes Requested` as a
  client-triggered detour back to the team. Only `Draft` is hidden from the client.

## What a real build would add

- Real accounts and role-based auth (agency staff vs. named client users) instead of the
  brand-name login screen.
- A real database and file storage in place of `localStorage`, so data is shared across
  devices and people, not just browser tabs.
- Notifications (email/Slack/WhatsApp) when a client comments or a post's status changes.
- A true calendar/scheduling view, approval history, and export to the actual
  publishing tools your team uses.

## Tech stack

React + TypeScript + Vite + Tailwind CSS + React Router. No backend dependency, so it
runs anywhere `npm` does.
